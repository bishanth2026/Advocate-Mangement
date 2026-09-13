/* Correct legacy success text when a case form is being saved. */
(function(){
  'use strict';
  if(window.__AD_CASE_ALERT_FIX__)return;
  window.__AD_CASE_ALERT_FIX__=true;

  var nativeAlert=window.alert.bind(window);

  function activeCaseModal(){
    var modal=document.querySelector('.modal');
    if(!modal)return false;
    var heading=modal.querySelector('h1,h2,h3,.modal-title,.modal-header strong');
    var text=((heading&&heading.textContent)||modal.textContent||'').replace(/\s+/g,' ').toLowerCase();
    return /\b(new|edit)\s+case\b/.test(text);
  }

  window.alert=function(message){
    var text=String(message==null?'':message);
    var legacyClientSave=/client\s+(created|saved)|client\s+created\s+and\s+saved/i.test(text);
    var caseContext=!!window.__AD_CASE_SAVE_IN_PROGRESS__||activeCaseModal();

    if(caseContext&&legacyClientSave){
      text=/\b(update|updated)\b/i.test(text)||/\bedit\s+case\b/i.test(document.querySelector('.modal')?.textContent||'')
        ?'Case updated and saved to Supabase.'
        :'Case created and saved to Supabase.';
    }
    return nativeAlert(text);
  };
})();
