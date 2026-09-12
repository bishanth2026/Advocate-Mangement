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
    var payload={name:String(client.name||'').trim(),phone:String(client.phone||'').trim(),email:String(client.email||'').trim(),address:String(client.address||'').trim(),notes:String(client.notes||'').trim(),status:String(client.status||'Active')};
    if(!payload.name)throw new Error('Client name is required');
    return id?window.ADCloudCRUD.update('clients',id,payload):window.ADCloudCRUD.insert('clients',payload);
  }
  async function remove(id){if(!ready())throw new Error('Cloud session is not ready');if(!id)throw new Error('Client id is required');return window.ADCloudCRUD.remove('clients',id);}
  window.ADClientCloud={list:list,save:save,remove:remove,ready:ready};
  function hook(){var m=document.querySelector('.modal');if(!m)return;var h=m.querySelector('h1,h2,h3,.modal-title,.modal-header strong');if(!h||!/client/i.test(h.textContent||''))return;var bs=m.querySelectorAll('button');for(var i=0;i<bs.length;i++){var b=bs[i],t=(b.textContent||'').trim().toLowerCase();if(/^(save client|save|update client|update)$/.test(t)&&!b.dataset.cloudClientHook){b.dataset.cloudClientHook='1';b.addEventListener('click',function(ev){ev.preventDefault();ev.stopImmediatePropagation();var e=m.querySelector('[data-client-id],input[name="client_id"],input[name="id"]');var id=e&&(e.dataset.clientId||e.value)||null;var c={name:(m.querySelector('[name="name"],input[placeholder*="name" i]')||{}).value||'',phone:(m.querySelector('[name="phone"],input[type="tel"]')||{}).value||'',email:(m.querySelector('[name="email"],input[type="email"]')||{}).value||'',address:(m.querySelector('[name="address"]')||{}).value||'',notes:(m.querySelector('[name="notes"],textarea')||{}).value||'',status:(m.querySelector('[name="status"]')||{}).value||'Active'};window.ADClientCloud.save(c,id).then(function(){alert('Client saved securely to Supabase.');location.reload();}).catch(function(err){alert('Could not save client: '+(err.message||err));});},true);break;}}}
  function run(){if(started||!ready())return;started=true;list().then(function(rows){var current=readState();current.clients=rows;writeState(current);if(window.navigate)window.navigate('clients');}).catch(function(err){console.warn('[AdvocateDesk] Client cloud sync failed',err);});}
  function wait(){run();hook();if(!started)setTimeout(run,1000);setTimeout(hook,200);setTimeout(hook,700);}
  document.addEventListener('click',function(){setTimeout(hook,0)},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wait);else wait();
})();
