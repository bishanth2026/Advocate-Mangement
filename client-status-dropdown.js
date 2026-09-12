/* Adds a real status dropdown to Client modals only and loads client CRUD. */
(function(){
  'use strict';
  var options=['Active','Inactive','Archived'];
  function isClientModal(modal){
    var heading=modal.querySelector('h1,h2,h3,.modal-title,.modal-header strong');
    var text=(heading&&heading.textContent||modal.textContent||'').replace(/\s+/g,' ').toLowerCase();
    return text.indexOf('new client')>=0 || text.indexOf('edit client')>=0;
  }
  function enhance(){
    var modal=document.querySelector('.modal');
    if(!modal||!isClientModal(modal))return;
    var labels=modal.querySelectorAll('label');
    for(var i=0;i<labels.length;i++){
      var label=labels[i];
      var text=(label.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(text!=='status'&&!text.startsWith('status '))continue;
      if(label.querySelector('select[data-client-status]'))return;
      var field=label.querySelector('input,textarea,select');
      if(!field)return;
      var select=document.createElement('select');
      select.id=field.id;
      select.name=field.name||field.id;
      select.className=field.className;
      select.style.cssText=field.style.cssText||'width:100%;height:42px;box-sizing:border-box;border:1px solid #d7dee9;border-radius:8px;padding:10px 11px;background:#fff;color:var(--ink);font-size:13px;line-height:20px;outline:none;';
      select.setAttribute('data-client-status','1');
      var current=String(field.value||'Active');
      options.forEach(function(value){
        var option=document.createElement('option');
        option.value=value;option.textContent=value;
        if(value===current)option.selected=true;
        select.appendChild(option);
      });
      field.replaceWith(select);
      return;
    }
  }
  function loadCrud(){
    if(document.querySelector('script[data-client-crud]'))return;
    var s=document.createElement('script');s.src='client-supabase-crud.js?v=20260912-1';s.async=false;s.setAttribute('data-client-crud','1');document.head.appendChild(s);
  }
  function boot(){
    loadCrud();enhance();
    new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
