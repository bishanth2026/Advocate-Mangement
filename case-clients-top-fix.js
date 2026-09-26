(function(){
  'use strict';

  /*
   * Root-cause fix:
   * The previous version moved the "All Clients / Parties" panel above
   * the case table on the Case & Client page. That broke the intended
   * page order: All Cases heading -> Cases table -> All Clients / Parties.
   *
   * This file is now scoped to the NEW/EDIT CASE modal only. It does not
   * reorder sections on the Case & Client page.
   */

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

    if(target.parentNode===body && body.firstElementChild!==target){
      body.insertBefore(target,body.firstElementChild);
    }
    target.classList.add('clients-parties-top');
  }

  var scheduled=false;
  function schedule(){
    if(scheduled) return;
    scheduled=true;
    setTimeout(function(){
      scheduled=false;
      moveClientsToTop();
    },0);
  }

  var observer=new MutationObserver(schedule);
  function start(){
    var body=document.getElementById('modalBody');
    if(body) observer.observe(body,{childList:true,subtree:true});
    document.addEventListener('click',schedule,true);
    schedule();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start);
  else start();
})();