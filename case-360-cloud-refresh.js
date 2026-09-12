/* Keep Case 360 aligned with the latest Supabase case record. */
(function(){
  'use strict';
  var wrapped=false;
  function ready(){return !!(window.ADCloudCRUD&&window.ADCloudCRUD.ready&&window.ADCloudCRUD.ready());}
  function cache(rows){var s;try{s=JSON.parse(localStorage.getItem('advocateDeskData')||'{}')||{};}catch(e){s={};}s.cases=(rows||[]).map(function(r){return {id:r.id,number:r.case_number||'',caseNumber:r.case_number||'',title:r.title||'',court:r.court||'',type:r.case_type||'',caseType:r.case_type||'',status:r.status||'Active',description:r.description||'',clientId:r.client_id||'',createdAt:r.created_at||'',updatedAt:r.updated_at||'',_cloud:true};});try{localStorage.setItem('advocateDeskData',JSON.stringify(s));}catch(e){}return s;}
  function install(){if(wrapped||typeof window.openCase360!=='function')return;var original=window.openCase360;window.openCase360=async function(id){if(ready()){try{var rows=await window.ADCloudCRUD.list('cases',{order:'created_at',ascending:false});cache(rows);}catch(e){console.warn('[AdvocateDesk] Case 360 refresh skipped:',e.message);}}return original(id);};wrapped=true;}
  var tries=0;function boot(){install();if(!wrapped&&tries++<30)setTimeout(boot,300);}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
