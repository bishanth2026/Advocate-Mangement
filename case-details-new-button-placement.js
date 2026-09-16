(function(){
  'use strict';

  function findPanel(content, pattern, skip){
    return Array.prototype.find.call(content.querySelectorAll('.panel'),function(panel){
      if(skip && panel===skip) return false;
      return pattern.test((panel.textContent||'').trim());
    });
  }

  function ensureHeading(content, casePanel){
    var heading=content.querySelector('[data-all-cases-heading]');
    if(!heading){
      heading=document.createElement('h2');
      heading.textContent='All Cases';
      heading.setAttribute('data-all-cases-heading','true');
      heading.style.margin='20px 0 12px';
      heading.style.fontSize='20px';
      heading.style.fontWeight='700';
      heading.style.color='var(--text, #111827)';
    }
    if(heading.parentNode!==content || heading.nextElementSibling!==casePanel){
      content.insertBefore(heading,casePanel);
    }
  }

  function arrangeCaseSections(){
    var content=document.getElementById('content');
    if(!content) return false;

    var clientHeading=Array.prototype.find.call(content.querySelectorAll('h3,h2'),function(el){
      return /all clients\s*\/\s*parties/i.test((el.textContent||'').trim());
    });
    if(!clientHeading) return false;

    var clientPanel=clientHeading.closest('.panel');
    if(!clientPanel) return false;

    var casePanel=findPanel(content,/case number|parties \/ clients|next hearing|status/i,clientPanel);
    if(!casePanel) return false;

    if(clientPanel.parentNode===content && content.firstElementChild!==clientPanel){
      content.insertBefore(clientPanel,content.firstChild);
    }
    ensureHeading(content,casePanel);
    return true;
  }

  function run(){
    var attempts=0;
    function retry(){
      if(attempts++>=20) return;
      if(!arrangeCaseSections()) setTimeout(retry,100);
    }
    retry();
  }

  run();
  [100,300,600,1000,1500].forEach(function(ms){setTimeout(run,ms);});
  document.addEventListener('click',function(event){
    var item=event.target.closest&&event.target.closest('[data-page="case-client"]');
    if(item){[30,150,400,800,1300].forEach(function(ms){setTimeout(run,ms);});}
  },true);
})();
