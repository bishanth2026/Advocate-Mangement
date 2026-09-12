/* Secure Supabase session/role guard and organization-scoped workspace hydration. */
(function(){
  'use strict';
  const DATA_KEY='advocateDeskData';
  const ORG_KEY='advocateDeskCurrentOrganization';
  const HYDRATED_KEY='advocateDeskCloudHydrated';
  const RELOAD_KEY='advocateDeskCloudReloaded';
  let activeSession=null;
  let originalSetItem=null;
  let persistTimer=null;
  let persisting=false;
  let hydrating=false;
  function emptyWorkspace(){return {cases:[],clients:[],hearings:[],tasks:[],meetings:[],documents:[],payments:[],expenses:[],notes:[],settings:{}};}
  function clearLocalWorkspace(){localStorage.removeItem(DATA_KEY);localStorage.removeItem(HYDRATED_KEY);}
  function prepareEmptyWorkspace(){if(originalSetItem)originalSetItem(DATA_KEY,JSON.stringify(emptyWorkspace()));else localStorage.setItem(DATA_KEY,JSON.stringify(emptyWorkspace()));}
  function cleanDemoLabels(){
    document.querySelectorAll('p,.notice,.empty,.stat-foot').forEach(node=>{
      const text=node.textContent||'';
      if(/demo mode|supabase will be connected|stored in this browser|demo workspace|demo data/i.test(text)){
        node.textContent=text.replace(/Demo mode is active\. Records are stored in this browser for now\. Supabase will be connected in the next phase\.?/gi,'Cloud workspace connected. Your records are stored securely for your organization.').replace(/Demo Workspace/gi,'Cloud Workspace').replace(/No documents in demo mode yet\.?/gi,'No documents have been added yet.').replace(/Demo data/gi,'Workspace data');
      }
    });
  }
  function schedulePersist(value){
    if(hydrating||!activeSession||!window.ADsupabase||!value)return;
    clearTimeout(persistTimer);
    persistTimer=setTimeout(function(){persistWorkspace(value);},300);
  }
  async function persistWorkspace(value){
    if(persisting||!activeSession||!window.ADsupabase||!value)return;
    persisting=true;
    try{
      const payload={user_id:activeSession.userId,organization_id:activeSession.organizationId,data:value,updated_at:new Date().toISOString()};
      const existing=await window.ADsupabase.from('workspace_data').select('id').eq('organization_id',activeSession.organizationId).eq('user_id',activeSession.userId).limit(1).maybeSingle();
      if(existing.error)throw existing.error;
      const result=existing.data&&existing.data.id
        ?await window.ADsupabase.from('workspace_data').update(payload).eq('id',existing.data.id)
        :await window.ADsupabase.from('workspace_data').insert(payload);
      if(result.error)throw result.error;
      originalSetItem(HYDRATED_KEY,'1');
      window.dispatchEvent(new CustomEvent('ad-cloud-workspace-saved'));
    }catch(error){console.error('Workspace cloud save failed',error);}
    finally{persisting=false;}
  }
  function installPersistence(){
    if(originalSetItem)return;
    originalSetItem=localStorage.setItem.bind(localStorage);
    localStorage.setItem=function(key,value){
      originalSetItem(key,value);
      if(key===DATA_KEY){try{schedulePersist(JSON.parse(value));}catch(error){console.error('Workspace data format error',error);}}
    };
  }
  function reloadOnceAfterHydration(){
    if(!document.getElementById('content'))return;
    try{
      if(sessionStorage.getItem(RELOAD_KEY)==='1'){sessionStorage.removeItem(RELOAD_KEY);return;}
      sessionStorage.setItem(RELOAD_KEY,'1');
      window.location.reload();
    }catch(error){console.warn('Cloud hydration reload skipped',error);}
  }
  async function hydrateWorkspace(session){
    if(!window.ADsupabase||!session||!session.userId||!session.organizationId)return;
    hydrating=true;
    try{
      const result=await window.ADsupabase.from('workspace_data').select('data,updated_at').eq('organization_id',session.organizationId).eq('user_id',session.userId).order('updated_at',{ascending:false}).limit(1).maybeSingle();
      if(result.error){console.error('Workspace cloud load failed',result.error);prepareEmptyWorkspace();return;}
      if(result.data&&result.data.data&&typeof result.data.data==='object'){
        originalSetItem(DATA_KEY,JSON.stringify(result.data.data));
        originalSetItem(HYDRATED_KEY,'1');
        window.dispatchEvent(new CustomEvent('ad-cloud-workspace-ready',{detail:{updatedAt:result.data.updated_at||null}}));
      }else{
        prepareEmptyWorkspace();
        window.dispatchEvent(new CustomEvent('ad-cloud-workspace-empty'));
      }
      cleanDemoLabels();
      window.setTimeout(cleanDemoLabels,250);
    }catch(error){console.error('Workspace hydration failed',error);prepareEmptyWorkspace();}
    finally{hydrating=false;reloadOnceAfterHydration();}
  }
  async function boot(){
    if(!window.ADsupabase)return;
    try{
      const {data}=await window.ADsupabase.auth.getSession();
      const s=data&&data.session;
      if(!s){clearLocalWorkspace();localStorage.removeItem('advocateDeskAuth');window.location.replace('admin-login.html');return;}
      const user=s.user;
      const m=await window.ADsupabase.from('memberships').select('organization_id,role,is_active').eq('user_id',user.id).eq('is_active',true).order('created_at',{ascending:true}).limit(1).maybeSingle();
      if(m.error||!m.data){await window.ADsupabase.auth.signOut();clearLocalWorkspace();localStorage.removeItem('advocateDeskAuth');window.location.replace('admin-login.html');return;}
      const p=await window.ADsupabase.from('profiles').select('full_name').eq('id',user.id).maybeSingle();
      activeSession={role:m.data.role,name:(p.data&&p.data.full_name)||user.user_metadata?.full_name||user.email,email:user.email,userId:user.id,organizationId:m.data.organization_id,loginAt:new Date().toISOString()};
      localStorage.setItem('advocateDeskAuth',JSON.stringify(activeSession));
      localStorage.setItem(ORG_KEY,m.data.organization_id);
      window.AD_ACTIVE_SESSION=activeSession;
      installPersistence();
      await hydrateWorkspace(activeSession);
      window.ADsupabase.auth.onAuthStateChange(function(_event,newSession){if(!newSession){clearLocalWorkspace();localStorage.removeItem('advocateDeskAuth');localStorage.removeItem(ORG_KEY);window.location.replace('admin-login.html');}});
    }catch(e){console.error('Secure session check failed',e);}
  }
  function start(){if(window.ADsupabase)boot();else window.addEventListener('ad-supabase-ready',boot,{once:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
