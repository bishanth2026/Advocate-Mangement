/* Organization-scoped workspace persistence bridge. */
(function(){
  'use strict';
  var KEY='advocateDeskData';
  var LOADED='advocateDeskCloudLoaded';
  function wait(){
    if(window.ADsupabase&&window.AD_ACTIVE_SESSION)return Promise.resolve();
    return new Promise(function(resolve){
      var done=false;
      function finish(){if(done)return;done=true;window.removeEventListener('ad-supabase-ready',finish);setTimeout(resolve,0)}
      window.addEventListener('ad-supabase-ready',finish,{once:true});
      var timer=setInterval(function(){if(window.ADsupabase&&window.AD_ACTIVE_SESSION){clearInterval(timer);finish()}},100);
      setTimeout(function(){clearInterval(timer);finish()},10000);
    });
  }
  async function sync(){
    await wait();
    var client=window.ADsupabase, session=window.AD_ACTIVE_SESSION;
    if(!client||!session||!session.organizationId||!session.userId)return;
    try{
      var res=await client.from('workspace_data').select('data').eq('organization_id',session.organizationId).eq('user_id',session.userId).maybeSingle();
      if(res.error)throw res.error;
      var local=localStorage.getItem(KEY);
      if(res.data&&res.data.data&&Object.keys(res.data.data).length){
        if(sessionStorage.getItem(LOADED)!=='1'){
          localStorage.setItem(KEY,JSON.stringify(res.data.data));
          sessionStorage.setItem(LOADED,'1');
          window.location.reload();
          return;
        }
      }else if(local){
        var payload={organization_id:session.organizationId,user_id:session.userId,data:JSON.parse(local),updated_at:new Date().toISOString()};
        var up=await client.from('workspace_data').upsert(payload,{onConflict:'organization_id,user_id'});
        if(up.error)throw up.error;
      }
      window.ADCloudWorkspace={
        save:async function(data){
          var result=await client.from('workspace_data').upsert({organization_id:session.organizationId,user_id:session.userId,data:data,updated_at:new Date().toISOString()},{onConflict:'organization_id,user_id'});
          if(result.error)console.warn('Cloud workspace save failed',result.error);
        }
      };
    }catch(err){console.warn('Cloud workspace sync unavailable; local mode retained.',err)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
})();
