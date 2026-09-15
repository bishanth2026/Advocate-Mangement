/* Final keyboard-safe focus handling. Presentation only; no record logic changed. */
(function(){
  'use strict';
  if(window.__mobileKeyboardFinalFix)return;
  window.__mobileKeyboardFinalFix=true;
  function keepVisible(el){
    if(!el || !el.closest || !el.closest('.modal-card'))return;
    setTimeout(function(){
      try{el.scrollIntoView({block:'center',inline:'nearest',behavior:'auto'});}catch(e){try{el.scrollIntoView(false);}catch(ignore){}}
    },180);
  }
  document.addEventListener('focusin',function(e){keepVisible(e.target);},true);
  document.addEventListener('click',function(e){
    var el=e.target.closest&&e.target.closest('input,select,textarea');
    if(el)keepVisible(el);
  },true);
  if(window.visualViewport){
    var refresh=function(){
      var active=document.activeElement;
      if(active && active.closest && active.closest('.modal-card'))keepVisible(active);
    };
    window.visualViewport.addEventListener('resize',refresh);
    window.visualViewport.addEventListener('scroll',refresh);
  }
})();
