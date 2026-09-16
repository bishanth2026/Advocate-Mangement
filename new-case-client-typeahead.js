(function(){
  'use strict';

  function readClients(){
    try{
      var data=JSON.parse(localStorage.getItem('advocateDeskData')||'null')||{};
      return Array.isArray(data.clients)?data.clients:[];
    }catch(e){return [];}
  }

  function label(client){
    return client.name||client.clientName||client.title||client.id||'';
  }

  function enhance(){
    var modal=document.getElementById('modal');
    var title=document.getElementById('modalTitle');
    var body=document.getElementById('modalBody');
    if(!modal||!title||!body||modal.classList.contains('hidden')) return;
    if(!/new case|create new case/i.test((title.textContent||'').trim())) return;
    if(body.querySelector('[data-new-case-client-typeahead]')) return;

    var groups=Array.prototype.slice.call(body.querySelectorAll('.field,.form-group,.form-field,.input-group'));
    var group=groups.find(function(el){
      var text=(el.textContent||'').replace(/\s+/g,' ').trim();
      return /client\s*\/\s*party|clients\s*\/\s*parties|select client|select party/i.test(text);
    });
    if(!group) return;

    var original=group.querySelector('select');
    if(!original) return;

    var input=document.createElement('input');
    input.type='text';
    input.autocomplete='off';
    input.placeholder='Type client / party name...';
    input.setAttribute('data-new-case-client-typeahead','true');
    input.setAttribute('list','newCaseClientOptions');
    input.className=original.className||'';

    var datalist=document.createElement('datalist');
    datalist.id='newCaseClientOptions';
    readClients().forEach(function(client){
      var option=document.createElement('option');
      option.value=label(client);
      datalist.appendChild(option);
    });

    original.style.display='none';
    original.insertAdjacentElement('afterend',input);
    input.insertAdjacentElement('afterend',datalist);

    function sync(){
      var query=input.value.trim().toLowerCase();
      var clients=readClients();
      var found=clients.find(function(client){
        return label(client).toLowerCase()===query || String(client.id||'').toLowerCase()===query;
      });
      if(found){
        var wanted=String(found.id||'');
        var option=Array.prototype.find.call(original.options,function(opt){
          return String(opt.value)===wanted || String(opt.textContent||'').trim().toLowerCase()===label(found).toLowerCase();
        });
        if(option) original.value=option.value;
        else original.value=wanted;
      }else if(!query){
        original.value='';
      }else{
        original.value='';
      }
      original.dispatchEvent(new Event('change',{bubbles:true}));
    }

    input.addEventListener('input',sync);
    input.addEventListener('change',function(){
      sync();
      var selected=Array.prototype.find.call(readClients(),function(client){return label(client).toLowerCase()===input.value.trim().toLowerCase();});
      if(selected) input.value=label(selected);
    });
  }

  function start(){
    enhance();
    [50,150,300,600,1000].forEach(function(ms){setTimeout(enhance,ms);});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
  document.addEventListener('click',function(e){
    if(e.target.closest&&e.target.closest('[onclick*="openModal"]')) setTimeout(start,50);
  },true);
  if(window.MutationObserver){
    var observer=new MutationObserver(function(){enhance();});
    var modalBody=document.getElementById('modalBody');
    if(modalBody) observer.observe(modalBody,{childList:true,subtree:true});
  }
})();
