/* Safe cloud bridge for the existing AdvocateDesk UI. */
(function(){
  'use strict';
  var started=false;
  function ready(){return !!(window.ADsupabase&&window.AD_ACTIVE_SESSION&&window.AD_ACTIVE_SESSION.organizationId);}
  async function health(){
    if(!ready())return;
    try{
      var s=window.AD_ACTIVE_SESSION;
      var r=await window.ADsupabase.from('workspace_data').select('id').eq('organization_id',s.organizationId).eq('user_id',s.userId).limit(1);
      if(r.error)throw r.error;
      document.querySelectorAll('.notice').forEach(function(el){
        el.textContent='Cloud workspace connected. Your records are protected by your organization login and Supabase access rules.';
        el.classList.add('cloud-connected');
      });
    }catch(e){
      console.warn('[AdvocateDesk] Cloud health check failed',e);
    }
  }
  function start(){
    if(started)return;started=true;
    health();
    setTimeout(health,1500);
    setTimeout(health,4000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
  window.ADCloudBridge={health:health};
})();
