(function(){
  'use strict';

  function clients(){
    try{
      var data=JSON.parse(localStorage.getItem('advocateDeskData')||'null')||{};
      return Array.isArray(data.clients)?data.clients:[];
    }catch(e){return [];}
  }
  function name(c){return String(c.name||c.clientName||c.title||c.id||'');}
  function id(c){return String(c.id||c.clientId||'');}

  function enhance(){
    var modal=document.getElementById('modal'),title=document.getElementById('modalTitle'),body=document.getElementById('modalBody');
    if(!modal||!title||!body||modal.classList.contains('hidden')) return;
    if(!/new case|create new case/i.test(title.textContent||'')) return;

    var labels=Array.prototype.slice.call(body.querySelectorAll('label'));
    var label=labels.find(function(l){return /client\s*\/\s*party|clients\s*\/\s*parties|select client|select party/i.test((l.textContent||'').trim());});
    if(!label) return;
    var field=label.closest('.field,.form-group,.form-field,.input-group')||label.parentElement;
    if(!field||field.querySelector('[data-client-typeahead]')) return;

    var control=field.querySelector('select,input:not([type="hidden"]),textarea');
    if(!control) return;

    var input=control;
    var originalSelect=null;
    if(control.tagName.toLowerCase()==='select'){
      originalSelect=control;
      input=document.createElement('input');
      input.type='text';
      input.className=control.className||'';
      input.placeholder='Type client / party name...';
      input.autocomplete='off';
      control.style.display='none';
      control.insertAdjacentElement('afterend',input);
    }else{
      input.placeholder=input.placeholder||'Type client / party name...';
      input.autocomplete='off';
    }
    input.setAttribute('data-client-typeahead','true');
    input.setAttribute('list','new-case-client-list');

    var list=document.getElementById('new-case-client-list');
    if(!list){
      list=document.createElement('datalist');
      list.id='new-case-client-list';
      document.body.appendChild(list);
    }
    list.innerHTML='';
    clients().forEach(function(c){
      var o=document.createElement('option');o.value=name(c);o.label=id(c)+' — '+name(c);list.appendChild(o);
    });

    var suggestions=document.createElement('div');
    suggestions.setAttribute('data-client-suggestions','true');
    suggestions.style.cssText='display:none;position:absolute;left:0;right:0;top:100%;z-index:99999;background:#fff;border:1px solid #cbd5e1;border-radius:10px;box-shadow:0 8px 24px rgba(15,23,42,.16);max-height:220px;overflow:auto;';
    field.style.position='relative';
    field.appendChild(suggestions);

    function choose(c){
      input.value=name(c);
      if(originalSelect){
        var opt=Array.prototype.find.call(originalSelect.options,function(o){return String(o.value)===id(c)||String(o.textContent||'').trim()===name(c);});
        if(opt) originalSelect.value=opt.value;
        else originalSelect.value=id(c);
        originalSelect.dispatchEvent(new Event('change',{bubbles:true}));
      }else{
        input.dispatchEvent(new Event('change',{bubbles:true}));
      }
      suggestions.style.display='none';
    }
    function render(){
      var q=input.value.trim().toLowerCase();
      var matches=clients().filter(function(c){return !q||name(c).toLowerCase().indexOf(q)!==-1||id(c).toLowerCase().indexOf(q)!==-1;}).slice(0,20);
      suggestions.innerHTML='';
      if(!q||!matches.length){suggestions.style.display='none';return;}
      matches.forEach(function(c){
        var b=document.createElement('button');
        b.type='button';
        b.textContent=name(c)+(id(c)?' ('+id(c)+')':'');
        b.style.cssText='display:block;width:100%;text-align:left;padding:10px 12px;border:0;background:#fff;color:#172554;cursor:pointer;font:inherit;';
        b.addEventListener('mousedown',function(e){e.preventDefault();choose(c);});
        b.addEventListener('click',function(){choose(c);});
        suggestions.appendChild(b);
      });
      suggestions.style.display='block';
    }
    input.addEventListener('input',render);
    input.addEventListener('focus',function(){if(input.value.trim())render();});
    input.addEventListener('blur',function(){setTimeout(function(){suggestions.style.display='none';},180);});
  }

  function start(){
    [0,80,200,450,900,1500].forEach(function(ms){setTimeout(enhance,ms);});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
  document.addEventListener('click',function(e){
    if(e.target.closest&&e.target.closest('[onclick*="openModal"]')) setTimeout(start,60);
  },true);
  if(window.MutationObserver){
    new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true});
  }
})();
