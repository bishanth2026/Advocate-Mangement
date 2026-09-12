/* Secure Supabase session/role guard for AdvocateDesk. */
(function(){
  'use strict';
  async function boot(){
    if(!window.ADsupabase)return;
    try{
      const { data } = await window.ADsupabase.auth.getSession();
      const s=data&&data.session;
      if(!s){ localStorage.removeItem('advocateDeskAuth'); window.location.replace('admin-login.html'); return; }
      const user=s.user;
      const m=await window.ADsupabase.from('memberships').select('organization_id,role,is_active').eq('user_id',user.id).eq('is_active',true).order('created_at',{ascending:true}).limit(1).maybeSingle();
      if(m.error||!m.data){ await window.ADsupabase.auth.signOut(); localStorage.removeItem('advocateDeskAuth'); window.location.replace('admin-login.html'); return; }
      const p=await window.ADsupabase.from('profiles').select('full_name').eq('id',user.id).maybeSingle();
      const session={role:m.data.role,name:(p.data&&p.data.full_name)||user.user_metadata?.full_name||user.email,email:user.email,userId:user.id,organizationId:m.data.organization_id,loginAt:new Date().toISOString()};
      localStorage.setItem('advocateDeskAuth',JSON.stringify(session));
      localStorage.setItem('advocateDeskCurrentOrganization',m.data.organization_id);
      window.AD_ACTIVE_SESSION=session;
      window.ADsupabase.auth.onAuthStateChange(function(_event,newSession){ if(!newSession) { localStorage.removeItem('advocateDeskAuth'); window.location.replace('admin-login.html'); } });
    }catch(e){ console.error('Secure session check failed',e); }
  }
  function start(){ if(window.ADsupabase)boot(); else window.addEventListener('ad-supabase-ready',boot,{once:true}); }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
