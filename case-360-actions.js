/* Quick actions inside Case 360. */
(function(){
  'use strict';
  var activeCase=null;
  function read(){try{return JSON.parse(localStorage.getItem('advocateDeskData')||'{}')||{};}catch(e){return {};}}
  function esc(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m];});}
  function findCase(){
    var s=read(),heading=document.querySelector('#content h1');
    if(!heading||heading.textContent.trim()!=='Case 360')return null;
    var text=document.querySelector('#content .page-title p');
    var number=text?text.textContent.replace(/.*—\s*/,'').trim():'';
    return (s.cases||[]).find(function(c){return String(c.number||'').trim()===number||String(c.id||'').trim()===number;})||null;
  }
  function action(label,fn){var b=document.createElement('button');b.type='button';b.className='secondary';b.textContent=label;b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();fn();});return b;}
  function open(type){if(typeof window.openModal==='function')window.openModal(type);else if(typeof window.navigate==='function')window.navigate(type==='hearing'?'hearings':type==='task'?'tasks':type==='document'?'documents':'client-management');}
  function add(){
    var content=document.getElementById('content');if(!content)return;
    var heading=content.querySelector('h1');if(!heading||heading.textContent.trim()!=='Case 360')return;
    if(content.querySelector('[data-case360-actions]'))return;
    activeCase=findCase();if(!activeCase)return;
    window.ADCase360ActiveCase=activeCase;
    var title=content.querySelector('.page-title');if(!title)return;
    var bar=document.createElement('div');bar.setAttribute('data-case360-actions','1');bar.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin:0 0 16px;padding:12px;background:var(--panel,#fff);border:1px solid var(--border,#e5e7eb);border-radius:12px;';
    bar.appendChild(action('＋ Hearing',function(){open('hearing');}));
    bar.appendChild(action('＋ Meeting',function(){open('meeting');}));
    bar.appendChild(action('＋ Task',function(){open('task');}));
    bar.appendChild(action('＋ Document',function(){open('document');}));
    bar.appendChild(action('＋ Payment',function(){if(typeof window.p1TransactionModal==='function')window.p1TransactionModal('payment',activeCase.id);else open('finance');}));
    bar.appendChild(action('＋ Case Fee',function(){if(typeof window.p1FeeSetup==='function')window.p1FeeSetup(activeCase.id);else open('finance');}));
    title.insertAdjacentElement('afterend',bar);
  }
  function boot(){
    var root=document.getElementById('content');if(!root)return;
    new MutationObserver(add).observe(root,{childList:true,subtree:true});
    add();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
