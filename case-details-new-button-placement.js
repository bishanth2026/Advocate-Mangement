(function(){
  'use strict';

  function arrangeCaseSections(){
    var content=document.getElementById('content');
    if(!content) return false;

    var clientHeading=Array.prototype.find.call(content.querySelectorAll('h3,h2'),function(el){
      return /all clients\s*\/\s*parties/i.test((el.textContent||'').trim());
    });
    if(!clientHeading) return false;

    var clientPanel=clientHeading.closest('.panel');
    if(!clientPanel) return false;

    var casePanel=Array.prototype.find.call(content.querySelectorAll('.panel'),function(panel){
      if(panel===clientPanel) return false;
      return /case number|parties \/ clients|next hearing|status/i.test((panel.textContent||'').trim());
    });
    if(!casePanel || !casePanel.parentNode) return false;

    // Remove headings created by older versions so duplicate headings cannot remain.
    Array.prototype.slice.call(content.querySelectorAll('[data-all-cases-heading]')).forEach(function(el){el.remove();});

    // Keep the clients panel before the cases panel without changing its contents or styling.
    if(clientPanel.parentNode===casePanel.parentNode &&
       (clientPanel.compareDocumentPosition(casePanel)&Node.DOCUMENT_POSITION_PRECEDING)){
      casePanel.parentNode.insertBefore(clientPanel,casePanel);
    }

    var heading=document.createElement('h2');
    heading.textContent='All Cases';
    heading.setAttribute('data-all-cases-heading','true');
    heading.style.margin='20px 0 12px';
    heading.style.fontSize='20px';
    heading.style.fontWeight='700';
    heading.style.color='var(--text, #111827)';
    casePanel.parentNode.insertBefore(heading,casePanel);
    return true;
  }

  function start(){
    var content=document.getElementById('content');
    if(!content) return;
    var observer=null;
    var finished=false;
    function attempt(){
      if(finished) return;
      if(arrangeCaseSections()){
        finished=true;
        if(observer) observer.disconnect();
      }
    }
    attempt();
    if(finished) return;
    observer=new MutationObserver(attempt);
    observer.observe(content,{childList:true,subtree:true});
    setTimeout(function(){if(observer) observer.disconnect();},5000);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',start,{once:true});
  }else{
    start();
  }
})();
