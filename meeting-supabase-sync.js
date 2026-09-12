/* Supabase persistence for client meetings. */
(function(){
  'use strict';
  function ready(){return !!(window.ADCloudCRUD&&window.ADCloudCRUD.ready&&window.ADCloudCRUD.ready());}
  function clean(m){return {client_id:m.clientId||null,case_id:m.caseId||null,subject:String(m.subject||'').trim(),details:String(m.details||'').trim(),date:m.date||null,time:m.time||null,mode:m.mode||null,location:String(m.location||'').trim()};}
  async function save(meeting,id){
    if(!ready())throw new Error('Cloud session is not ready');
    var p=clean(meeting);
    if(!p.subject)throw new Error('Meeting subject is required');
    if(!p.date)throw new Error('Meeting date is required');
    return id?window.ADCloudCRUD.update('meetings',id,p):window.ADCloudCRUD.insert('meetings',p);
  }
  async function list(){if(!ready())throw new Error('Cloud session is not ready');return window.ADCloudCRUD.list('meetings',{order:'date',ascending:true});}
  async function remove(id){if(!ready())throw new Error('Cloud session is not ready');return window.ADCloudCRUD.remove('meetings',id);}
  window.ADMeetingCloud={ready:ready,save:save,list:list,remove:remove};
})();
