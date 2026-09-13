/* Adds a real status dropdown to Client modals only. */
(function(){
  'use strict';
  var options=['Active','Inactive','Archived'];
  function isClientModal(modal){
    var text=(modal.innerText||modal.textContent||'').replace(/\s+/g,' ').toLowerCase();
    return /new client|edit client/.test(text);
  }
  function enhance(modal){
    if(!modal||!isClientModal(modal))return;
    var labels=Array.from(modal.querySelectorAll('label'));
    var label=labels.find(function(el){return /^status\b/i.test((el.textContent||'').trim());});
    if(!label)return;
    var field=null;
    if(label.htmlFor)field=document.getElementById(label.htmlFor);
    if(!field)field=label.querySelector('input,textarea,select');
    if(!field){
      var parent=label.parentElement;
      field=parent&&parent.querySelector('input,textarea,select');
    }
    if(!field){
      var next=label.nextElementSibling;
      field=next&&next.querySelector('input,textarea,select');
    }
    if(!field||field.dataset.clientStatusDropdown==='1')return;
    var select=field;
    if(field.tagName.toLowerCase()!=='select'){
      select=document.createElement('select');
      Array.from(field.attributes).forEach(function(attr){
        if(attr.name!=='type'&&attr.name!=='value')select.setAttribute(attr.name,attr.value);
      });
      select.value=field.value||'Active';
      field.replaceWith(select);
    }
    select.dataset.clientStatusDropdown='1';
    var current=select.value||'Active';
    select.innerHTML='';
    options.forEach(function(value){
      var option=document.createElement('option');
      option.value=value;option.textContent=value;option.selected=value===current;
      select.appendChild(option);
    });
    if(!options.includes(current))select.value='Active';
  }
  function scan(){
    document.querySelectorAll('.modal,[role="dialog"],.modal-content').forEach(enhance);
  }
  function boot(){
    scan();
    new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
