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
  function labelText(m,n){
    var parts=[];
    if(n.id){var linked=m.querySelector('label[for="'+CSS.escape(n.id)+'"]');if(linked)parts.push(linked.innerText||'');}
    var p=n.parentElement;
    for(var i=0;p&&i<3;i++,p=p.parentElement)parts.push(p.innerText||'');
    parts.push(n.getAttribute('aria-label')||'',n.getAttribute('placeholder')||'',n.getAttribute('name')||'',n.id||'');
    return parts.join(' ').replace(/\s+/g,' ').toLowerCase();
  }
  function field(m,words,index){
    var nodes=Array.prototype.slice.call(m.querySelectorAll('input:not([type="hidden"]),select,textarea'));
    var hit=nodes.find(function(n){var text=labelText(m,n);return words.some(function(w){return text.indexOf(w)>=0;});});
    return hit||nodes[index]||null;
  }
  function value(m,words,index){var n=field(m,words,index);return n?String(n.value==null?'':n.value).trim():'';}
  function collect(m){
    return {name:value(m,['client name','full name','name'],0),phone:value(m,['phone','whatsapp','mobile'],1),email:value(m,['email','e-mail'],2),address:value(m,['address'],3),notes:value(m,['notes','remark'],4),status:value(m,['status'],3)||'Active'};
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
    var data=collect(m);if(!data.name){alert('Client name is required. Please enter the name in the Client Name field.');return;}
    var editing=m.getAttribute('data-client-id')||'';
    try{
      var result=editing?await window.ADCloudCRUD.update('clients',await resolveCloudId(editing)||editing,data):await window.ADCloudCRUD.insert('clients',data);
      if(!result||result.error)throw (result&&result.error)||new Error('Client save failed');
      var local=read();local.clients=Array.isArray(local.clients)?local.clients:[];
      var row=Object.assign({},data,{id:editing||result.id||('CL-'+Date.now()),cases:0});
      var ix=local.clients.findIndex(function(c){return String(c.id)===String(row.id);});
      if(ix>=0)local.clients[ix]=Object.assign({},local.clients[ix],row);else local.clients.unshift(row);
      write(local);alert(editing?'Client updated and saved to Supabase.':'Client created and saved to Supabase.');close(m);if(window.navigate)window.navigate('clients');
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
  function decorate(){var m=modal();if(!m)return;var t=title(m);if(t.indexOf('new client')<0&&t.indexOf('edit client')<0)return;var edit=m.querySelector('[data-client-id]');if(!edit){var buttons=Array.prototype.slice.call(m.querySelectorAll('button'));var editButton=buttons.find(function(b){return /save|update/i.test(b.innerText||'');});if(editButton&&editButton.dataset.clientId)m.setAttribute('data-client-id',editButton.dataset.clientId);}if(t.indexOf('edit client')>=0&&!m.querySelector('[data-client-delete]')){var footer=m.querySelector('.modal-footer,.modal-actions,footer')||m;var b=document.createElement('button');b.type='button';b.className='secondary';b.textContent='Delete';b.setAttribute('data-client-delete','1');footer.insertBefore(b,footer.firstChild);}}
  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button');if(!b)return;var m=modal();if(!m)return;var t=title(m);if(t.indexOf('new client')<0&&t.indexOf('edit client')<0)return;if(b.hasAttribute('data-client-delete')){e.preventDefault();e.stopImmediatePropagation();deleteClient(m);return;}if(/^(save|update)$/i.test((b.innerText||'').trim())){e.preventDefault();e.stopImmediatePropagation();saveClient(m);}},true);
  new MutationObserver(decorate).observe(document.body,{childList:true,subtree:true});
})();
