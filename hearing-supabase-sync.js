/* Supabase persistence for hearings. */
(function(){
  'use strict';
  function ready(){return !!(window.ADCloudCRUD&&window.ADCloudCRUD.ready&&window.ADCloudCRUD.ready());}
  function validId(id){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id||''));}
  function clean(h){return {case_id:h.caseId||null,case_number:h.caseNumber||h.case||null,title:String(h.title||'').trim(),date:h.date||null,time:h.time||null,court:String(h.court||'').trim(),stage:String(h.stage||'').trim(),client_id:h.clientId||null,notes:String(h.notes||h.details||'').trim()};}
  async function save(h,id){if(!ready())throw new Error('Cloud session is not ready');var p=clean(h);if(!p.date)throw new Error('Hearing date is required');return validId(id)?window.ADCloudCRUD.update('hearings',id,p):window.ADCloudCRUD.insert('hearings',p);}
  async function remove(id){if(!ready())throw new Error('Cloud session is not ready');return validId(id)?window.ADCloudCRUD.remove('hearings',id):null;}
  async function list(){if(!ready())throw new Error('Cloud session is not ready');return window.ADCloudCRUD.list('hearings',{order:'date',ascending:true});}
  window.ADHe aringCloud=null;
  window.AD HearingCloud={save:save,remove:remove,list:list,ready:ready};
})();
