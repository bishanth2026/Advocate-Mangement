(function(){
  'use strict';
  function moveNewButton(){
    var content=document.getElementById('content');
    if(!content) return;
    var title=Array.prototype.find.call(content.querySelectorAll('h1'),function(el){return (el.textContent||'').trim()==='All Cases';});
    if(!title) return;
    var pageTitle=title.closest('.page-title');
    if(!pageTitle) return;
    var button=pageTitle.querySelector('button.primary');
    if(!button) return;
    var clientHeading=Array.prototype.find.call(content.querySelectorAll('h3,h2'),function(el){return /all clients\s*\/\s*parties/i.test((el.textContent||'').trim());});
    if(!clientHeading) return;
    var clientPanel=clientHeading.closest('.panel');
    if(!clientPanel) return;
    var casePanel=Array.prototype.find.call(content.querySelectorAll('.panel'),function(panel){
      if(panel===clientPanel) return false;
      var text=(panel.textContent||'').trim();
      return /case number|parties \/ clients|next hearing|status/i.test(text);
    });
    if(!casePanel) return;
    if(casePanel.previousElementSibling!==clientPanel){
      clientPanel.parentNode.insertBefore(casePanel,clientPanel.nextSibling);
    }
    var existing=content.querySelector('[data-case-details-heading]');
    if(!existing){
      existing=document.createElement('div');
      existing.className='panel-head';
      existing.setAttribute('data-case-details-heading','true');
      var heading=document.createElement('h3');
      heading.textContent='Case Details';
      existing.appendChild(heading);
    }
    if(existing.parentNode!==casePanel.parentNode || existing.nextElementSibling!==casePanel){
      casePanel.parentNode.insertBefore(existing,casePanel);
    }
    if(button.parentNode!==existing) existing.appendChild(button);
  }
  var scheduled=false;
  function schedule(){
    if(scheduled) return;
    scheduled=true;
    setTimeout(function(){scheduled=false;moveNewButton();},0);
  }
  function start(){
    var content=document.getElementById('content');
    if(!content) return;
    new MutationObserver(schedule).observe(content,{childList:true,subtree:true});
    schedule();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
