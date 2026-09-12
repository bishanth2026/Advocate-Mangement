/* Prevent the legacy client-save notice from appearing while saving a case. */
(function(){
  'use strict';
  if(window.__AD_CASE_ALERT_FIX__)return;
  window.__AD_CASE_ALERT_FIX__=true;
  var nativeAlert=window.alert.bind(window);
  function activeCaseModal(){
    var modals=document.querySelectorAll('.modal,#modal');
    for(var i=0;i<modals.length;i++){
      var m=modals[i];
      if(!m||m.classList.contains('hidden'))continue;
      var heading=m.querySelector('h1,h2,h3,.modal-title,.modal-header strong');
      var title=((heading&&heading.textContent)||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(/^(new|edit|update)\s+case\b/.test(title))return true;
    }
    return false;
  }
  window.alert=function(message){
    var text=String(message==null?'':message);
    if(activeCaseModal() && /client\s+(created|saved)|client\s+created\s+and\s+saved/i.test(text)){
      text=/updated|update/i.test(text)?'Case updated and saved to Supabase.':'Case created and saved to Supabase.';
    }
    return nativeAlert(text);
  };
})();
