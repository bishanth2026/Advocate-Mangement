/* Loads organization clients from Supabase into the existing UI state. */
(function(){
  'use strict';
  var KEY='advocateDeskData';
  var started=false;
  function run(){
    if(started||!window.ADCloudCRUD||!window.ADCloudCRUD.ready())return;
    started=true;
    window.ADCloudCRUD.list('clients',{order:'created_at',ascending:false}).then(function(rows){
      var current={};
      try{current=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){current={};}
      current.clients=(rows||[]).map(function(c){return {
        id:c.id,name:c.name||'',phone:c.phone||'',email:c.email||'',address:c.address||'',notes:c.notes||'',cases:0,status:'Active'
      };});
      localStorage.setItem(KEY,JSON.stringify(current));
      if(window.navigate)window.navigate('clients');
    }).catch(function(err){
      console.warn('[AdvocateDesk] Client cloud sync failed',err);
    });
  }
  function wait(){run();if(!started)setTimeout(run,1000);if(!started)setTimeout(run,3000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wait);else wait();
})();
