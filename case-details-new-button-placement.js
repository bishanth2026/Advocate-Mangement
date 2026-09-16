(function(){
  'use strict';

  function arrangeCaseSections(){
    var content=document.getElementById('content');
    if(!content) return false;

    var title=Array.prototype.find.call(content.querySelectorAll('h1'),function(el){
      return (el.textContent||'').trim()==='All Cases';
    });
    if(!title) return false;

    var pageTitle=title.closest('.page-title');
    if(!pageTitle) return false;

    var clientHeading=Array.prototype.find.call(content.querySelectorAll('h3,h2'),function(el){
      return /all clients\s*\/\s*parties/i.test((el.textContent||'').trim());
    });
    if(!clientHeading) return false;

    var clientPanel=clientHeading.closest('.panel');
    if(!clientPanel) return false;

    var casePanel=Array.prototype.find.call(content.querySelectorAll('.panel'),function(panel){
      if(panel===clientPanel) return false;
      var text=(panel.textContent||'').trim();
      return /case number|parties \/ clients|next hearing|status/i.test(text);
    });
    if(!casePanel) return false;

    var changed=false;
    if(clientPanel.parentNode===content && content.firstElementChild!==clientPanel){
      content.insertBefore(clientPanel,content.firstChild);
      changed=true;
    }
    if(pageTitle.parentNode!==content || pageTitle.previousElementSibling!==clientPanel){
      content.insertBefore(pageTitle,clientPanel.nextSibling);
      changed=true;
    }
    if(casePanel.parentNode!==content || casePanel.previousElementSibling!==pageTitle){
      content.insertBefore(casePanel,pageTitle.nextSibling);
      changed=true;
    }

    var oldHeading=content.querySelector('[data-case-details-heading]');
    if(oldHeading){
      oldHeading.remove();
      changed=true;
    }
    return changed;
  }

  function start(){
    var attempts=0;
    function tryArrange(){
      if(attempts++>=12) return;
      if(!arrangeCaseSections()){
        setTimeout(tryArrange,100);
      }
    }
    tryArrange();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',start,{once:true});
  }else{
    start();
  }
})();
