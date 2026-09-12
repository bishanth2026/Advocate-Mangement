/* Case 360 WhatsApp sharing helper. Load this script after case-360-actions.js. */
(function(){
  'use strict';
  function getCase(){
    try{
      var s=JSON.parse(localStorage.getItem('advocateDeskData')||'{}')||{};
      var p=document.querySelector('#content .page-title p');
      var n=p?p.textContent.replace(/.*—\s*/,'').trim():'';
      return (s.cases||[]).find(function(c){
        return String(c.number||'')===n || String(c.id||'')===n;
      })||null;
    }catch(e){return null;}
  }
  function add(){
    var c=document.getElementById('content');
    var h=c&&c.querySelector('h1');
    if(!h||h.textContent.trim()!=='Case 360'||c.querySelector('[data-case360-whatsapp]'))return;
    var x=getCase();
    if(!x)return;
    var b=document.createElement('button');
    b.type='button';
    b.className='secondary';
    b.textContent='Share on WhatsApp';
    b.setAttribute('data-case360-whatsapp','1');
    b.onclick=function(){
      var ref=x.number||x.id||'';
      var msg='Case update\nReference: '+ref+'\nClient: '+(x.clientName||x.client||'')+'\nStatus: '+(x.status||'')+'\nPriority: '+(x.priority||'');
      window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank','noopener');
    };
    var bar=c.querySelector('[data-case360-actions]')||c.querySelector('.page-actions')||c.querySelector('.actions');
    if(bar)bar.appendChild(b);
    else if(h.parentElement)h.parentElement.appendChild(b);
  }
  function boot(){
    var r=document.getElementById('content');
    if(!r)return;
    new MutationObserver(add).observe(r,{childList:true,subtree:true});
    add();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
