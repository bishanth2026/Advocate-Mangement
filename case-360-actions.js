/* Quick actions inside Case 360. */
(function(){
  'use strict';
  var activeCase=null;
  function read(){try{return JSON.parse(localStorage.getItem('advocateDeskData')||'{}')||{};}catch(e){return {};}}
  function findCase(){
    var s=read(),heading=document.querySelector('#content h1');
    if(!heading||heading.textContent.trim()!=='Case 360')return null;
    var text=document.querySelector('#content .page-title p');
    var number=text?text.textContent.replace(/.*—\s*/,'').trim():'';
    return (s.cases||[]).find(function(c){return String(c.number||'').trim()===number||String(c.id||'').trim()===number;})||null;
  }
  function action(label,fn){var b=document.createElement('button');b.type='button';b.className='secondary';b.textContent=label;b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();fn();});return b;}
  function visibleModal(){
    var nodes=document.querySelectorAll('#modal,[role="dialog"],.modal,.dialog');
    for(var i=nodes.length-1;i>=0;i--){var n=nodes[i];if(n&&n.offsetParent!==null)return n;}
    return document.getElementById('modal')||document.body;
  }
  function fieldMatches(el,words){
    var text=((el.name||'')+' '+(el.id||'')+' '+(el.placeholder||'')+' '+(el.getAttribute('aria-label')||'')).toLowerCase();
    if(el.parentElement)text+=' '+(el.parentElement.innerText||'').toLowerCase();
    return words.some(function(w){return text.indexOf(w)>=0;});
  }
  function setField(el,value){
    if(!el||value==null||value==='')return false;
    var v=String(value),done=false;
    if(el.tagName==='SELECT'){
      var opts=Array.prototype.slice.call(el.options||[]);
      var hit=opts.find(function(o){return String(o.value)===v||String(o.text).trim()===v||String(o.text).toLowerCase().indexOf(v.toLowerCase())>=0;});
      if(hit){el.value=hit.value;done=true;}
    }else{el.value=v;done=true;}
    if(done){el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}
    return done;
  }
  function prefill(){
    if(!window.ADCase360ActiveCase)return;
    var c=window.ADCase360ActiveCase,m=visibleModal();
    var els=Array.prototype.slice.call(m.querySelectorAll('input,select,textarea'));
    var caseValue=c.id||c.number||'';
    var clientValue=c.clientId||c.client_id||'';
    els.forEach(function(el){
      if(fieldMatches(el,['case_id','caseid','case number','case no','case name','select case','related case']))setField(el,caseValue);
      else if(fieldMatches(el,['client_id','clientid','client name','select client','related client']))setField(el,clientValue);
    });
    var hidden=m.querySelectorAll('input[type="hidden"]');
    hidden.forEach(function(el){
      var n=(el.name||el.id||'').toLowerCase();
      if(n.indexOf('case')>=0)setField(el,caseValue);
      if(n.indexOf('client')>=0)setField(el,clientValue);
    });
  }
  function open(type){
    window.ADCase360PrefillType=type;
    if(typeof window.openModal==='function')window.openModal(type);
    else if(typeof window.navigate==='function')window.navigate(type==='hearing'?'hearings':type==='task'?'tasks':type==='document'?'documents':'client-management');
    [50,180,450,900].forEach(function(ms){setTimeout(prefill,ms);});
  }
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
