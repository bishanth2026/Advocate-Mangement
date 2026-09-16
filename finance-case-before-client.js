(function(){
'use strict';
function text(v){return String(v||'').replace(/\s+/g,' ').trim().toLowerCase();}
function isLabel(el,name){return text(el.textContent||'')===name;}
function findField(body,name){
  var labels=[].slice.call(body.querySelectorAll('label'));
  for(var i=0;i<labels.length;i++){
    if(!isLabel(labels[i],name)) continue;
    var p=labels[i].parentElement;
    if(!p) continue;
    var control=p.querySelector('select,input,textarea');
    if(control) return {label:labels[i],control:control,wrapper:p};
  }
  return null;
}
function move(){
  var modal=document.getElementById('modal');
  var body=document.getElementById('modalBody');
  var title=document.getElementById('modalTitle');
  if(!modal||modal.classList.contains('hidden')||!body||!title) return;
  if(!/invoice|finance|payment/i.test(title.textContent||'')) return;
  var client=findField(body,'client');
  var kase=findField(body,'case');
  if(!client||!kase||!client.wrapper||!kase.wrapper||client.wrapper===kase.wrapper) return;
  var parent=client.wrapper.parentElement;
  if(!parent||kase.wrapper.parentElement!==parent) return;
  if(kase.wrapper.compareDocumentPosition(client.wrapper)&Node.DOCUMENT_POSITION_FOLLOWING) return;
  parent.insertBefore(kase.wrapper,client.wrapper);
}
function init(){
  var body=document.getElementById('modalBody');
  if(!body) return;
  var observer=new MutationObserver(function(){setTimeout(move,0);setTimeout(move,80);});
  observer.observe(body,{childList:true,subtree:true});
  document.addEventListener('click',function(){setTimeout(move,0);setTimeout(move,100);},true);
  document.addEventListener('input',function(){setTimeout(move,0);},true);
  move();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
