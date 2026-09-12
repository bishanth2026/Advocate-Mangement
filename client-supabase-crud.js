/* Direct Supabase CRUD for Clients: create, edit and delete. */
(function(){
  'use strict';
  var KEY='advocateDeskData';
  function session(){return window.AD_ACTIVE_SESSION||null;}
  function ready(){return !!(window.ADCloudCRUD&&window.ADCloudCRUD.ready&&window.ADCloudCRUD.ready());}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return {};}}
  function write(s){localStorage.setItem(KEY,JSON.stringify(s));}
  function modal(){return document.querySelector('.modal,.modal-overlay,[role="dialog"]');}
  function title(m){return ((m&&m.innerText)||'').toLowerCase();}
  function field(m,words,index){
    var nodes=Array.prototype.slice.call(m.querySelectorAll('input,select,textarea'));
    var hit=nodes.find(function(n){var p=n.parentElement;return words.some(function(w){return ((p&&p.innerText)||'').toLowerCase().indexOf(w)>=0;});});
    return hit||nodes[index]||null;
  }
  function value(m,words,index){var n=field(m,words,index);return n?String(n.value||'').trim():'';}
  function collect(m){return {
    name:value(m,['client name','name'],0),
    phone:value(m,['phone','whatsapp','mobile'],1),
    email:value(m,['email'],2),
    address:value(m,['address'],3),
    notes:value(m,['notes'],4),
    status:value(m,['status'],3)||'Active'
  };}
  function close(m){var x=m&&m.querySelector('[aria-label="Close"],.close,[data-close],button');if(x&&/×|x|close/i.test(x.innerText||x.getAttribute('aria-label')||''))x.click();else if(window.navigate)window.navigate('clients');}
  async function saveClient(m){
    if(!ready()){alert('Cloud connection is not ready. Please try again.');return;}
    var data=collect(m);if(!data.name){alert('Client name is required.');return;}
    var s=session();var editing=m.getAttribute('data-client-id')||'';var result;
    try{
      if(editing)result=await window.ADCloudCRUD.update('clients',editing,data);
      else result=await window.ADCloudCRUD.insert('clients',data);
      if(!result||result.error)throw (result&&result.error)||new Error('Client save failed');
      var local=read();local.clients=Array.isArray(local.clients)?local.clients:[];
      var row=Object.assign({},data,{id:editing||result.id||('CL-'+Date.now()),cases:0});
      var ix=local.clients.findIndex(function(c){return String(c.id)===String(row.id);});
      if(ix>=0)local.clients[ix]=Object.assign({},local.clients[ix],row);else local.clients.unshift(row);
      write(local);alert(editing?'Client updated and saved to Supabase.':'Client created and saved to Supabase.');
      close(m);if(window.navigate)window.navigate('clients');
    }catch(e){console.error(e);alert('Could not save client to Supabase: '+(e.message||e));}
  }
  async function deleteClient(m){
    var id=m.getAttribute('data-client-id');if(!id||!ready())return;
    if(!confirm('Delete this client permanently?'))return;
    try{var r=await window.ADCloudCRUD.remove('clients',id);if(r&&r.error)throw r.error;var s=read();s.clients=(s.clients||[]).filter(function(c){return String(c.id)!==String(id);});write(s);alert('Client deleted from Supabase.');close(m);if(window.navigate)window.navigate('clients');}
    catch(e){console.error(e);alert('Could not delete client: '+(e.message||e));}
  }
  function decorate(){var m=modal();if(!m)return;var t=title(m);if(t.indexOf('new client')<0&&t.indexOf('edit client')<0)return;
    var edit=m.querySelector('[data-client-id]');if(!edit){var buttons=Array.prototype.slice.call(m.querySelectorAll('button'));var editButton=buttons.find(function(b){return /save|update/i.test(b.innerText||'');});if(editButton&&editButton.dataset.clientId)m.setAttribute('data-client-id',editButton.dataset.clientId);}
    if(t.indexOf('edit client')>=0&&!m.querySelector('[data-client-delete]')){var footer=m.querySelector('.modal-footer,.modal-actions,footer')||m;var b=document.createElement('button');b.type='button';b.className='secondary';b.textContent='Delete';b.setAttribute('data-client-delete','1');footer.insertBefore(b,footer.firstChild);}
  }
  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button');if(!b)return;var m=modal();if(!m)return;var t=title(m);if(t.indexOf('new client')<0&&t.indexOf('edit client')<0)return;
    if(b.hasAttribute('data-client-delete')){e.preventDefault();e.stopImmediatePropagation();deleteClient(m);return;}
    if(/^(save|update)$/i.test((b.innerText||'').trim())){e.preventDefault();e.stopImmediatePropagation();saveClient(m);}
  },true);
  new MutationObserver(decorate).observe(document.body,{childList:true,subtree:true});
})();
