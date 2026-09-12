/* Supabase persistence for client meetings. */
(function(){
  'use strict';
  function ready(){return !!(window.ADCloudCRUD&&window.ADCloudCRUD.ready&&window.ADCloudCRUD.ready());}
  function clean(m){return {client_id:m.clientId||null,case_id:m.caseId||null,subject:String(m.subject||'').trim(),details:String(m.details||'').trim(),date:m.date||null,time:m.time||null,mode:m.mode||null,location:String(m.location||'').trim()};}
  function validId(id){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id||''));}
  async function save(meeting,id){
    if(!ready())throw new Error('Cloud session is not ready');
    var p=clean(meeting);
    if(!p.subject)throw new Error('Meeting subject is required');
    if(!p.date)throw new Error('Meeting date is required');
    return validId(id)?window.ADCloudCRUD.update('meetings',id,p):window.ADCloudCRUD.insert('meetings',p);
  }
  async function list(){if(!ready())throw new Error('Cloud session is not ready');return window.ADCloudCRUD.list('meetings',{order:'date',ascending:true});}
  async function sync(){
    var rows=await list();
    var s;try{s=JSON.parse(localStorage.getItem('advocateDeskData')||'{}')||{};}catch(e){s={};}
    var local=Array.isArray(s.meetings)?s.meetings:[];
    var mapped=(rows||[]).map(function(r){return {id:r.id,clientId:r.client_id||'',caseId:r.case_id||'',subject:r.subject||'',details:r.details||'',date:r.date||'',time:r.time||'',mode:r.mode||'',location:r.location||'',_cloud:true};});
    var byId={};mapped.forEach(function(r){byId[String(r.id)]=r;});
    s.meetings=local.filter(function(r){return !r.id||!byId[String(r.id)];}).concat(mapped);
    localStorage.setItem('advocateDeskData',JSON.stringify(s));
    return s.meetings;
  }
  async function remove(id){if(!ready())throw new Error('Cloud session is not ready');return validId(id)?window.ADCloudCRUD.remove('meetings',id):null;}
  window.ADMeetingCloud={ready:ready,save:save,list:list,sync:sync,remove:remove};
  var tries=0;
  function bootSync(){
    if(ready()){sync().catch(function(e){console.warn('[AdvocateDesk] Meeting sync skipped:',e.message);});return;}
    if(tries++<20)setTimeout(bootSync,500);
  }
  setTimeout(bootSync,300);
})();
