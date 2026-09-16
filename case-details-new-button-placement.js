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

    var heading=content.querySelector('[data-all-cases-heading]');
    if(!heading){
      heading=document.createElement('h2');
      heading.textContent='All Cases';
      heading.setAttribute('data-all-cases-heading','true');
      heading.style.margin='20px 0 12px';
      heading.style.fontSize='20px';
      heading.style.fontWeight='700';
      heading.style.color='var(--text, #111827)';
      casePanel.parentNode.insertBefore(heading,casePanel);
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
