(function(){
  'use strict';

  function textOf(el){
    return (el && el.textContent ? el.textContent : '').replace(/\s+/g,' ').trim();
  }

  function findClientPanel(content){
    var heading=Array.prototype.find.call(content.querySelectorAll('h2,h3,h4'),function(el){
      return /all clients\s*\/\s*parties/i.test(textOf(el));
    });
    return heading ? heading.closest('.panel') : null;
  }

  function findFirstCasePanel(content,clientPanel){
    return Array.prototype.find.call(content.querySelectorAll('.panel'),function(panel){
      if(panel===clientPanel) return false;
      return /case number|case title|client \/ party|parties \/ clients|next hearing/i.test(textOf(panel));
    }) || null;
  }

  function arrange(){
    var content=document.getElementById('content');
    if(!content) return false;

    var clientPanel=findClientPanel(content);
    if(!clientPanel) return false;

    var casePanel=findFirstCasePanel(content,clientPanel);
    if(!casePanel || !casePanel.parentNode) return false;

    Array.prototype.forEach.call(content.querySelectorAll('[data-all-cases-heading],[data-case-details-heading]'),function(el){
      el.remove();
    });

    var heading=document.createElement('h2');
    heading.textContent='All Cases';
    heading.setAttribute('data-all-cases-heading','true');
    heading.style.display='block';
    heading.style.width='100%';
    heading.style.boxSizing='border-box';
    heading.style.clear='both';
    heading.style.margin='20px 0 12px';
    heading.style.padding='0';
    heading.style.fontSize='20px';
    heading.style.lineHeight='1.3';
    heading.style.fontWeight='700';
    heading.style.color='var(--text, #111827)';

    // Insert exactly between the client panel and the first case record.
    casePanel.parentNode.insertBefore(heading,casePanel);
    return true;
  }

  function run(){
    var attempts=0;
    function retry(){
      if(attempts++>=30) return;
      if(!arrange()) setTimeout(retry,100);
    }
    retry();
  }

  run();
  [100,300,600,1000,1500,2500].forEach(function(ms){setTimeout(run,ms);});
  document.addEventListener('click',function(event){
    var item=event.target.closest&&event.target.closest('[data-page="case-client"]');
    if(item){[50,200,500,1000,1800].forEach(function(ms){setTimeout(run,ms);});}
  },true);
})();
