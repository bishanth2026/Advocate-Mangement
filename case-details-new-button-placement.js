(function(){
  'use strict';

  var observer;
  var scheduled=false;

  function arrangeCaseSections(){
    var content=document.getElementById('content');
    if(!content) return;

    var title=Array.prototype.find.call(content.querySelectorAll('h1'),function(el){
      return (el.textContent||'').trim()==='All Cases';
    });
    if(!title) return;

    var pageTitle=title.closest('.page-title');
    if(!pageTitle) return;

    var clientHeading=Array.prototype.find.call(content.querySelectorAll('h3,h2'),function(el){
      return /all clients\s*\/\s*parties/i.test((el.textContent||'').trim());
    });
    if(!clientHeading) return;

    var clientPanel=clientHeading.closest('.panel');
    if(!clientPanel) return;

    var casePanel=Array.prototype.find.call(content.querySelectorAll('.panel'),function(panel){
      if(panel===clientPanel) return false;
      var text=(panel.textContent||'').trim();
      return /case number|parties \/ clients|next hearing|status/i.test(text);
    });
    if(!casePanel) return;

    if(observer) observer.disconnect();
    try {
      if(clientPanel.parentNode===content && content.firstElementChild!==clientPanel){
        content.insertBefore(clientPanel,content.firstChild);
      }
      if(pageTitle.parentNode!==content || pageTitle.previousElementSibling!==clientPanel){
        content.insertBefore(pageTitle,clientPanel.nextSibling);
      }
      if(casePanel.parentNode!==content || casePanel.previousElementSibling!==pageTitle){
        content.insertBefore(casePanel,pageTitle.nextSibling);
      }
      var oldHeading=content.querySelector('[data-case-details-heading]');
      if(oldHeading) oldHeading.remove();
    } finally {
      if(observer) observer.observe(content,{childList:true,subtree:true});
    }
  }

  function schedule(){
    if(scheduled) return;
    scheduled=true;
    setTimeout(function(){scheduled=false;arrangeCaseSections();},0);
  }

  function start(){
    var content=document.getElementById('content');
    if(!content) return;
    observer=new MutationObserver(schedule);
    observer.observe(content,{childList:true,subtree:true});
    schedule();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
