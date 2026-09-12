/* Correct the New Client form: client contact details belong here; case parties belong in New Case. */
(function(){
  'use strict';
  var installed=false;
  function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();}
  function groupFor(el){return el.closest('.form-group,.field,.form-row,.modal-field,.form-control-wrap,.input-group')||el.parentElement;}
  function clean(){
    var headings=[].slice.call(document.querySelectorAll('.modal h1,.modal h2,.modal h3,.modal-title,.modal-header'));
    var modal=headings.find(function(el){return text(el).indexOf('new client')!==-1;});
    if(!modal)return;
    var root=modal.closest('.modal,.modal-overlay,.dialog')||document;
    var labels=[].slice.call(root.querySelectorAll('label,.field-label,.form-label,strong'));
    labels.forEach(function(label){
      var t=text(label);
      if(t==='case title'||t==='petitioner'||t==='respondent'||t.indexOf('select petitioner')!==-1||t.indexOf('select respondent')!==-1){
        var group=groupFor(label);
        if(group)group.style.display='none';
      }
    });
    var inputs=[].slice.call(root.querySelectorAll('input,textarea,select'));
    var hasPhone=inputs.some(function(i){return /phone|mobile|whatsapp|tel/i.test((i.name||'')+' '+(i.id||'')+' '+(i.placeholder||'')+' '+(i.getAttribute('aria-label')||'')+' '+(i.previousElementSibling&&i.previousElementSibling.textContent||''));});
    if(!hasPhone){
      var email=inputs.find(function(i){return /email/i.test((i.name||'')+' '+(i.id||'')+' '+(i.placeholder||''));});
      if(email){
        var wrap=groupFor(email)||email.parentElement;
        var phone=document.createElement('div');
        phone.className=wrap.className||'form-group';
        phone.innerHTML='<label for="clientWhatsAppPhone">WhatsApp / Mobile Number</label><input id="clientWhatsAppPhone" name="phone" type="tel" inputmode="tel" placeholder="9876543210" autocomplete="tel">';
        wrap.parentNode.insertBefore(phone,wrap);
      }
    }
    if(!installed){
      installed=true;
      var save=root.querySelector('button.primary,button[type="submit"]');
      if(save)save.title='Save client contact details';
    }
  }
  var observer=new MutationObserver(clean);
  function start(){clean();observer.observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
