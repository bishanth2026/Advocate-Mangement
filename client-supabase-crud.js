/* Direct Supabase CRUD for Clients: create, edit and delete. */
(function(){
  'use strict';
  var KEY='advocateDeskData';
  function ready(){return !!(window.ADCloudCRUD&&window.ADCloudCRUD.ready&&window.ADCloudCRUD.ready());}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return {};}}
  function write(s){localStorage.setItem(KEY,JSON.stringify(s));}
  function modal(){return document.querySelector('.modal,.modal-overlay,[role="dialog"]');}
  function title(m){return ((m&&m.innerText)||'').toLowerCase();}
  /* Client forms created by app.js use stable IDs f1..f4. */
  function byId(m,id){return m&&m.querySelector('#'+id);}
  function value(m,id){var n=byId(m,id);return n?String(n.value==null?'':n.value).trim():'';}
  function collect(m){
    return {name:value(m,'f1'),phone:value(m,'f2'),email:value(m,'f3'),address:'',notes:'',status:value(m,'f4')||'Active'};
  }
  function close(m){var x=m&&m.querySelector('[aria-label="Close"],.close,[data-close],button');if(x&&/×|x|close/i.test(x.innerText||x.getAttribute('aria-label')||''))x.click();else if(window.navigate)window.navigate('clients');}
  function isUuid(value){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value||''));}
  async function resolveCloudId(id){
    if(isUuid(id))return id;
    var local=read().clients||[];
    var source=local.find(function(c){return String(c.id)===String(id);});
    if(!source||!window.ADCloudCRUD.list)return null;
    var rows=await window.ADCloudCRUD.list('clients',{select:'id,name,phone,email'});
    var match=(rows||[]).find(function(c){return (source.name&&c.name===source.name)||(source.phone&&c.phone===source.phone)||(source.email&&c.email===source.email);});
    return match&&match.id?match.id:null;
  }
  async function saveClient(m){
    if(!ready()){alert('Cloud connection is not ready. Please try again.');return;}
    var data=collect(m);
    if(!data.name){alert('Client name is required. Please enter the name in the Client Name field.');return;}
    var editingId=m.getAttribute('data-client-id')||'';
    var editingMode=!!editingId||/edit\s+client/i.test(title(m));
    try{
      var result=editingId?await window.ADCloudCRUD.update('clients',await resolveCloudId(editingId)||editingId,data):await window.ADCloudCRUD.insert('clients',data);
      if(!result||result.error)throw (result&&result.error)||new Error('Client save failed');
      var local=read();local.clients=Array.isArray(local.clients)?local.clients:[];
      var row=Object.assign({},data,{id:editingId||result.id||('CL-'+Date.now()),cases:editingId?(local.clients.find(function(c){return String(c.id)===String(editingId);})||{}).cases||0:0});
      var ix=local.clients.findIndex(function(c){return String(c.id)===String(row.id);});
      if(ix>=0)local.clients[ix]=Object.assign({},local.clients[ix],row);else local.clients.unshift(row);
      write(local);
      alert(editingMode?'Client updated successfully.':'Client created and saved to Supabase.');
      close(m);
      if(window.navigate)window.navigate('clients');
    }catch(e){console.error(e);alert('Could not save client to Supabase: '+(e.message||e));}
  }
  async function deleteClient(m){
    var id=m.getAttribute('data-client-id');if(!id||!ready())return;
    if(!confirm('Delete this client permanently?'))return;
    try{
      var cloudId=await resolveCloudId(id);
      if(cloudId)await window.ADCloudCRUD.remove('clients',cloudId);
      var s=read();s.clients=(s.clients||[]).filter(function(c){return String(c.id)!==String(id);});write(s);
      alert('Client deleted successfully.');close(m);if(window.navigate)window.navigate('clients');
    }catch(e){console.error(e);alert('Could not delete client: '+(e.message||e));}
  }
  function decorate(){
    var m=modal();if(!m)return;var t=title(m);
    if(t.indexOf('new client')<0&&t.indexOf('edit client')<0)return;
    var edit=m.querySelector('[data-client-id]');
    if(!edit){
      var buttons=Array.prototype.slice.call(m.querySelectorAll('button'));
      var editButton=buttons.find(function(b){return /save|update/i.test(b.innerText||'');});
      if(editButton&&editButton.dataset.clientId)m.setAttribute('data-client-id',editButton.dataset.clientId);
    }
    if(t.indexOf('edit client')>=0&&!m.querySelector('[data-client-delete]')){
      var footer=m.querySelector('.modal-footer,.modal-actions,footer')||m;
      var b=document.createElement('button');b.type='button';b.className='secondary';b.textContent='Delete';b.setAttribute('data-client-delete','1');footer.insertBefore(b,footer.firstChild);
    }
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('button');if(!b)return;
    var m=modal();if(!m)return;var t=title(m);
    if(t.indexOf('new client')<0&&t.indexOf('edit client')<0)return;
    if(b.hasAttribute('data-client-delete')){e.preventDefault();e.stopImmediatePropagation();deleteClient(m);return;}
    if(/^(save|update)$/i.test((b.innerText||'').trim())){e.preventDefault();e.stopImmediatePropagation();saveClient(m);}
  },true);
  new MutationObserver(decorate).observe(document.body,{childList:true,subtree:true});
})();
