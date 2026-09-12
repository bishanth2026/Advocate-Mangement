/* Secure Supabase session/role guard and organization-scoped workspace hydration. */
(function(){
  'use strict';
  const DATA_KEY='advocateDeskData';
  const ORG_KEY='advocateDeskCurrentOrganization';
  const HYDRATED_KEY='advocateDeskCloudHydrated';

  function clearLocalWorkspace(){
    localStorage.removeItem(DATA_KEY);
    localStorage.removeItem(HYDRATED_KEY);
  }

  async function hydrateWorkspace(session){
    if(!window.ADsupabase||!session||!session.userId||!session.organizationId)return;
    try{
      const result=await window.ADsupabase
        .from('workspace_data')
        .select('data,updated_at')
        .eq('organization_id',session.organizationId)
        .eq('user_id',session.userId)
        .order('updated_at',{ascending:false})
        .limit(1)
        .maybeSingle();
      if(result.error){
        console.error('Workspace cloud load failed',result.error);
        return;
      }
      if(result.data&&result.data.data&&typeof result.data.data==='object'){
        localStorage.setItem(DATA_KEY,JSON.stringify(result.data.data));
        localStorage.setItem(HYDRATED_KEY,'1');
        window.dispatchEvent(new CustomEvent('ad-cloud-workspace-ready',{detail:{updatedAt:result.data.updated_at||null}}));
      }else{
        clearLocalWorkspace();
        window.dispatchEvent(new CustomEvent('ad-cloud-workspace-empty'));
      }
    }catch(error){
      console.error('Workspace hydration failed',error);
    }
  }

  async function boot(){
    if(!window.ADsupabase)return;
    try{
      const { data } = await window.ADsupabase.auth.getSession();
      const s=data&&data.session;
      if(!s){ clearLocalWorkspace(); localStorage.removeItem('advocateDeskAuth'); window.location.replace('admin-login.html'); return; }
      const user=s.user;
      const m=await window.ADsupabase.from('memberships').select('organization_id,role,is_active').eq('user_id',user.id).eq('is_active',true).order('created_at',{ascending:true}).limit(1).maybeSingle();
      if(m.error||!m.data){ await window.ADsupabase.auth.signOut(); clearLocalWorkspace(); localStorage.removeItem('advocateDeskAuth'); window.location.replace('admin-login.html'); return; }
      const p=await window.ADsupabase.from('profiles').select('full_name').eq('id',user.id).maybeSingle();
      const session={role:m.data.role,name:(p.data&&p.data.full_name)||user.user_metadata?.full_name||user.email,email:user.email,userId:user.id,organizationId:m.data.organization_id,loginAt:new Date().toISOString()};
      localStorage.setItem('advocateDeskAuth',JSON.stringify(session));
      localStorage.setItem(ORG_KEY,m.data.organization_id);
      window.AD_ACTIVE_SESSION=session;
      await hydrateWorkspace(session);
      window.ADsupabase.auth.onAuthStateChange(function(_event,newSession){
        if(!newSession){ clearLocalWorkspace(); localStorage.removeItem('advocateDeskAuth'); localStorage.removeItem(ORG_KEY); window.location.replace('admin-login.html'); }
      });
    }catch(e){ console.error('Secure session check failed',e); }
  }
  function start(){ if(window.ADsupabase)boot(); else window.addEventListener('ad-supabase-ready',boot,{once:true}); }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
