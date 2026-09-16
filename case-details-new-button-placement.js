(function(){
  'use strict';
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

    // Keep the existing client section first, then show the complete All Cases
    // heading/subheading and New button, followed by the case details panel.
    if(clientPanel.parentNode===content){
      content.insertBefore(clientPanel,content.firstChild);
    }
    if(pageTitle.parentNode!==content || pageTitle.previousElementSibling!==clientPanel){
      content.insertBefore(pageTitle,clientPanel.nextSibling);
    }
    if(casePanel.parentNode!==content || casePanel.previousElementSibling!==pageTitle){
      content.insertBefore(casePanel,pageTitle.nextSibling);
    }

    // Remove only the temporary heading created by the earlier placement fix.
    var oldHeading=content.querySelector('[data-case-details-heading]');
    if(oldHeading) oldHeading.remove();
  }

  var scheduled=false;
  function schedule(){
    if(scheduled) return;
    scheduled=true;
    setTimeout(function(){scheduled=false;arrangeCaseSections();},0);
  }
  function start(){
    var content=document.getElementById('content');
    if(!content) return;
    new MutationObserver(schedule).observe(content,{childList:true,subtree:true});
    schedule();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
