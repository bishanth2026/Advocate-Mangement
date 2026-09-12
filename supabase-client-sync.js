/* Supabase persistence helpers for Clients. */
(function(){
  'use strict';
  var KEY='advocateDeskData';
  var started=false;
  function ready(){return !!(window.ADCloudCRUD&&window.ADCloudCRUD.ready&&window.ADCloudCRUD.ready());}
  function readState(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return {};}}
  function writeState(state){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){console.warn('[AdvocateDesk] Could not update local client cache',e);}}
  function normalize(c){return {id:c.id,name:c.name||'',phone:c.phone||'',email:c.email||'',address:c.address||'',notes:c.notes||'',cases:Number(c.cases||0),status:c.status||'Active'};}
  async function list(){if(!ready())throw new Error('Cloud session is not ready');return (await window.ADCloudCRUD.list('clients',{order:'created_at',ascending:false})).map(normalize);}
  async function save(client,id){
    if(!ready())throw new Error('Cloud session is not ready');
    var payload={name:String(client.name||'').trim(),phone:String(client.phone||'').trim(),email:String(client.email||'').trim(),address:String(client.address||'').trim(),notes:String(client.notes||'').trim()};
    if(!payload.name)throw new Error('Client name is required');
    return id?window.ADCloudCRUD.update('clients',id,payload):window.ADCloudCRUD.insert('clients',payload);
  }
  async function remove(id){if(!ready())throw new Error('Cloud session is not ready');if(!id)throw new Error('Client id is required');return window.ADCloudCRUD.remove('clients',id);}
  window.ADClientCloud={list:list,save:save,remove:remove,ready:ready};
  function run(){
    if(started||!ready())return;
    started=true;
    list().then(function(rows){
      var current=readState();
      current.clients=rows;
      writeState(current);
      if(window.navigate)window.navigate('clients');
    }).catch(function(err){console.warn('[AdvocateDesk] Client cloud sync failed',err);});
  }
  function wait(){run();if(!started){setTimeout(run,1000);setTimeout(run,3000);}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wait);else wait();
})();
