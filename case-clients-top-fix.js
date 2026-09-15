(function(){
  'use strict';

  function moveClientsToTop(){
    var modal=document.getElementById('modal');
    var title=document.getElementById('modalTitle');
    var body=document.getElementById('modalBody');
    if(!modal||!title||!body||modal.classList.contains('hidden')) return;
    if(!/create new case|edit case|new case/i.test((title.textContent||'').trim())) return;
    var groups=Array.prototype.slice.call(body.querySelectorAll('.form-group,.field,.form-field,.input-group'));
    var target=null;
    groups.forEach(function(group){
      if(target) return;
      var text=(group.textContent||'').replace(/\s+/g,' ').trim();
      if(/all clients\s*\/\s*parties|select clients|clients\s*\/\s*parties/i.test(text)) target=group;
    });
    if(!target) return;
    if(target.parentNode===body && body.firstElementChild!==target) body.insertBefore(target,body.firstElementChild);
    target.classList.add('clients-parties-top');
  }

  function closestSection(el){
    while(el && el.id!=='content'){
      if(el.classList && (el.classList.contains('panel') || el.classList.contains('card') || el.classList.contains('section'))) return el;
      el=el.parentElement;
    }
    return null;
  }

  function moveClientsSectionAboveCases(){
    var content=document.getElementById('content');
    if(!content) return;
    var headings=Array.prototype.slice.call(content.querySelectorAll('h1,h2,h3,h4,.page-title,.section-title'));
    var clientsHeading=headings.find(function(el){return (el.textContent||'').replace(/\s+/g,' ').trim()==='All Clients / Parties';});
    if(!clientsHeading) return;
    var clientsSection=closestSection(clientsHeading);
    if(!clientsSection) clientsSection=clientsHeading.parentElement;
    if(!clientsSection) return;

    var casesSection=null;
    headings.forEach(function(el){
      if(casesSection) return;
      var text=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(text==='All Cases' || text==='Case & Client') casesSection=closestSection(el);
    });
    if(!casesSection){
      var panels=Array.prototype.slice.call(content.querySelectorAll('.panel,.card,section'));
      casesSection=panels.find(function(el){
        var text=(el.textContent||'').replace(/\s+/g,' ');
        return /Next Hearing/.test(text) && /Status/.test(text) && /Action/.test(text);
      });
    }
    if(!casesSection || clientsSection===casesSection) return;
    if(casesSection.parentNode===content && clientsSection!==casesSection.previousElementSibling){
      content.insertBefore(clientsSection,casesSection);
    }else if(casesSection.parentNode && clientsSection.parentNode===casesSection.parentNode){
      casesSection.parentNode.insertBefore(clientsSection,casesSection);
    }
  }

  var scheduled=false;
  function schedule(){
    if(scheduled) return;
    scheduled=true;
    setTimeout(function(){
      scheduled=false;
      moveClientsToTop();
      moveClientsSectionAboveCases();
    },0);
  }

  var observer=new MutationObserver(schedule);
  function start(){
    var body=document.getElementById('modalBody');
    var content=document.getElementById('content');
    if(body) observer.observe(body,{childList:true,subtree:true});
    if(content) observer.observe(content,{childList:true,subtree:true});
    document.addEventListener('click',schedule,true);
    schedule();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
