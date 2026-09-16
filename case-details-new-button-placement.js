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
      var text=(panel.textContent||'').trim();
      return /case number|parties \/ clients|next hearing|status/i.test(text);
    });
    if(!casePanel) return false;

    var oldPageTitle=Array.prototype.find.call(content.querySelectorAll('.page-title'),function(el){
      return /all cases/i.test((el.textContent||'').trim());
    });
    var oldHeading=content.querySelector('[data-case-details-heading]');
    var heading=oldHeading||oldPageTitle;

    if(!heading){
      heading=document.createElement('div');
      heading.className='page-title';
      heading.setAttribute('data-case-details-heading','true');
      heading.innerHTML='<h1>All Cases</h1>';
    }else{
      heading.setAttribute('data-case-details-heading','true');
      if(!/all cases/i.test((heading.textContent||'').trim())){
        heading.innerHTML='<h1>All Cases</h1>';
      }
    }

    var changed=false;
    if(clientPanel.parentNode===content && content.firstElementChild!==clientPanel){
      content.insertBefore(clientPanel,content.firstChild);
      changed=true;
    }
    if(heading.parentNode!==content || heading.previousElementSibling!==clientPanel){
      content.insertBefore(heading,clientPanel.nextSibling);
      changed=true;
    }
    if(casePanel.parentNode!==content || casePanel.previousElementSibling!==heading){
      content.insertBefore(casePanel,heading.nextSibling);
      changed=true;
    }

    return changed;
  }

  function start(){
    var attempts=0;
    function tryArrange(){
      if(attempts++>=12) return;
      if(!arrangeCaseSections()) setTimeout(tryArrange,100);
    }
    tryArrange();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',start,{once:true});
  }else{
    start();
  }
})();
