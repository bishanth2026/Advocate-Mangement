/* Ensure case save/update never displays the legacy client-save notice. */
(function(){
  'use strict';
  if(window.__AD_CASE_ALERT_FIX__)return;
  window.__AD_CASE_ALERT_FIX__=true;
  var nativeAlert=window.alert.bind(window);
  window.alert=function(message){
    var text=String(message==null?'':message);
    var caseSave=!!window.__AD_CASE_SAVE_IN_PROGRESS__;
    if(caseSave && /client\s+(created|saved)|client\s+created\s+and\s+saved/i.test(text)){
      text=/updated|update/i.test(text)?'Case updated and saved to Supabase.':'Case created and saved to Supabase.';
    }
    return nativeAlert(text);
  };
})();
