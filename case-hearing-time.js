/* Adds optional hearing time to New/Edit Case and keeps linked next-hearing records aligned. */
(function(){
  'use strict';
  var currentModal=null;
  function text(el){return String(el&&el.textContent||'').trim()}
  function isCaseModal(){
    var root=document.querySelector('.modal, .modal-overlay, [role="dialog"]');
    if(!root)return null;
    var heading=text(root.querySelector('h2,h3,h1,.modal-title'));
    if(!/new case|edit case/i.test(heading))return null;
    return root;
  }
  function findField(root,label){
    var labels=Array.prototype.slice.call(root.querySelectorAll('label'));
    var l=labels.find(function(x){return text(x).toLowerCase().indexOf(label.toLowerCase())>=0});
    if(!l)return null;
    var id=l.getAttribute('for');
    return id?root.querySelector('#'+CSS.escape(id)):l.parentElement&&l.parentElement.querySelector('input,select,textarea');
  }
  function add(){
    var root=isCaseModal();
    if(!root||root===currentModal)return;
    currentModal=root;
    if(root.querySelector('[data-case-hearing-time]'))return;
    var date=findField(root,'next hearing');
    if(!date)return;
    var wrap=date.closest('.field,.form-group,.form-field')||date.parentElement;
    var box=document.createElement('div');
    box.className=wrap&&wrap.className?wrap.className:'field';
    box.setAttribute('data-case-hearing-time','1');
    box.innerHTML='<label for="caseNextHearingTime">Hearing Time <span style="font-weight:400;color:#64748b">(optional)</span></label><input id="caseNextHearingTime" type="time" name="nextHearingTime" aria-label="Next hearing time">';
    if(wrap&&wrap.parentElement)wrap.parentElement.appendChild(box);else root.appendChild(box);
    var time=root.querySelector('#caseNextHearingTime');
    var title=findField(root,'case title');
    var caseNo=findField(root,'case number');
    var s=read();
    var item=(s&&s.cases||[]).find(function(c){return (title&&title.value&&c.title===title.value)||(caseNo&&caseNo.value&&c.number===caseNo.value)});
    if(item&&item.nextTime)time.value=item.nextTime;
  }
  function read(){try{return JSON.parse(localStorage.getItem('advocateDeskData')||'null')}catch(e){return null}}
  function write(s){localStorage.setItem('advocateDeskData',JSON.stringify(s))}
  function syncTime(){
    var root=currentModal;if(!root)return;
    var time=root.querySelector('#caseNextHearingTime');if(!time)return;
    var value=time.value||'';
    var title=findField(root,'case title'),caseNo=findField(root,'case number');
    var s=read();if(!s||!Array.isArray(s.cases))return;
    var item=(s.cases||[]).find(function(c){return (caseNo&&caseNo.value&&c.number===caseNo.value)||(title&&title.value&&c.title===title.value)});
    if(!item)return;
    item.nextTime=value;
    (s.hearings||[]).forEach(function(h){if(h.caseId===item.id||(h.case===item.number&&h.date===item.next)){h.time=value}});
    write(s);
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('button');
    if(!b||!/save/i.test(text(b)))return;
    if(isCaseModal())setTimeout(syncTime,250);
  },true);
  new MutationObserver(add).observe(document.body,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add();
})();
