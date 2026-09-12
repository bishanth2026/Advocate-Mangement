/* Supabase persistence helpers for Clients. */
(function(){
  'use strict';
  var KEY='advocateDeskData';
  function ready(){return !!(window.ADCloudCRUD&&window.ADCloudCRUD.ready&&window.ADCloudCRUD.ready());}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return {};}}
  function write(s){try{localStorage.setItem(KEY,JSON.stringify(s));}catch(e){console.warn('[AdvocateDesk] client cache write failed',e);}}
  function validId(id){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id||''));}
  function normalize(c){return {id:c.id,name:c.name||'',phone:c.phone||'',email:c.email||'',address:c.address||'',notes:c.notes||'',cases:Number(c.cases||0),status:c.status||'Active',_cloud:true};}
  async function list(){if(!ready())throw new Error('Cloud session is not ready');return (await window.ADCloudCRUD.list('clients',{order:'created_at',ascending:false})).map(normalize);}
  async function save(client,id){
    if(!ready())throw new Error('Cloud session is not ready');
    var p={name:String(client.name||'').trim(),phone:String(client.phone||'').trim(),email:String(client.email||'').trim(),address:String(client.address||'').trim(),notes:String(client.notes||'').trim(),status:String(client.status||'Active')};
    if(!p.name)throw new Error('Client name is required');
    return validId(id)?window.ADCloudCRUD.update('clients',id,p):window.ADCloudCRUD.insert('clients',p);
  }
  async function remove(id){
    if(!ready())throw new Error('Cloud session is not ready');
    if(!validId(id))return null;

    /* Remove only cases explicitly linked to this client. Unlinked cases are
       preserved, so deleting a client cannot accidentally delete unrelated cases. */
    var linkedCases=[];
    try{
      linkedCases=await window.ADCloudCRUD.list('cases',{filters:{client_id:id}});
    }catch(e){
      console.warn('[AdvocateDesk] linked case lookup skipped:',e.message||e);
    }
    for(var i=0;i<linkedCases.length;i++){
      if(linkedCases[i]&&validId(linkedCases[i].id)){
        await window.ADCloudCRUD.remove('cases',linkedCases[i].id);
      }
    }
    var result=await window.ADCloudCRUD.remove('clients',id);

    /* Keep the offline cache consistent with the cloud delete. */
    var s=read();
    s.clients=(s.clients||[]).filter(function(x){return String(x.id)!==String(id);});
    var deletedIds=linkedCases.map(function(x){return String(x.id);});
    s.cases=(s.cases||[]).filter(function(x){return deletedIds.indexOf(String(x.id))<0&&String(x.clientId||x.client_id||'')!==String(id);});
    write(s);
    return result;
  }
  window.ADClientCloud={list:list,save:save,remove:remove,ready:ready};

  function modal(){return document.querySelector('#modal:not(.hidden),.modal:not(.hidden)');}
  function value(m,selectors){for(var i=0;i<selectors.length;i++){var e=m.querySelector(selectors[i]);if(e&&e.value!=null)return e.value;}return '';}
  function clientId(m){var e=m.querySelector('[data-client-id],input[name="client_id"],input[name="id"]');return e?(e.dataset.clientId||e.value||null):null;}

  /* Only identify a modal as a client modal when its heading explicitly says
     New/Edit Client. The old text-only check incorrectly matched case forms
     because case forms contain a "Clients" field. */
  function isClient(m){
    if(!m)return false;
    var heading=m.querySelector('h1,h2,h3,.modal-title,.modal-header strong');
    var title=((heading&&heading.textContent)||'').replace(/\s+/g,' ').trim().toLowerCase();
    if(!/^(new|edit|update)\s+client(?:\b|\s)/.test(title))return false;
    if(/case|hearing|meeting|task|document/.test(title))return false;
    return true;
  }
  function hook(){
    var m=modal();if(!m||!isClient(m)||m.dataset.clientCloudHook==='1')return;
    var buttons=m.querySelectorAll('button');
    for(var i=0;i<buttons.length;i++){
      (function(b){var t=(b.textContent||'').trim().toLowerCase();
        if(/^(save client|save|update client|update)$/.test(t)){
          b.dataset.clientCloudHook='1';b.addEventListener('click',function(){
            if(!ready())return;
            var c={name:value(m,['[name="name"]','input[placeholder*="name" i]']),phone:value(m,['[name="phone"]','input[type="tel"]']),email:value(m,['[name="email"]','input[type="email"]']),address:value(m,['[name="address"]']),notes:value(m,['[name="notes"]','textarea']),status:value(m,['[name="status"]'])||'Active'};
            var id=clientId(m);save(c,id).then(function(row){var s=read();s.clients=Array.isArray(s.clients)?s.clients:[];var n=normalize(Object.assign({},c,row||{}, {id:(row&&row.id)||id||('cloud-'+Date.now())}));var ix=s.clients.findIndex(function(x){return String(x.id)===String(n.id);});if(ix>=0)s.clients[ix]=n;else s.clients.unshift(n);write(s);alert('Client saved to Supabase.');location.reload();}).catch(function(e){alert('Could not save client: '+(e.message||e));});
          },true);
        }
        if(/^(delete client|delete|remove client|remove)$/.test(t)){
          b.dataset.clientCloudHook='1';b.addEventListener('click',function(){
            var id=clientId(m);if(!validId(id)||!ready())return;
            if(!confirm('Delete this client and its linked cases from Supabase? Unlinked cases will be preserved.'))return;
            remove(id).then(function(){alert('Client deleted. Linked cases were also removed.');location.reload();}).catch(function(e){alert('Could not delete client: '+(e.message||e));});
          },true);
        }
      })(buttons[i]);
    }
    m.dataset.clientCloudHook='1';
  }
  function sync(){if(!ready())return;list().then(function(rows){var s=read();s.clients=rows;write(s);}).catch(function(e){console.warn('[AdvocateDesk] client sync skipped',e.message);});}
  var tries=0;function boot(){hook();if(ready())sync();else if(tries++<20)setTimeout(boot,500);setTimeout(hook,250);setTimeout(hook,800);}
  document.addEventListener('click',function(){setTimeout(hook,0)},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();