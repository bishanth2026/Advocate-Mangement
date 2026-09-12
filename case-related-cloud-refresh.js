/* Refresh case-related records before opening Case 360. */
(function(){
  'use strict';
  var KEY='advocateDeskData';
  function ready(){return !!(window.ADCloudCRUD&&window.ADCloudCRUD.ready&&window.ADCloudCRUD.ready());}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return {};}}
  function write(s){try{localStorage.setItem(KEY,JSON.stringify(s));}catch(e){}}
  function map(table,row){
    if(table==='hearings')return Object.assign({},row,{caseId:row.case_id||row.caseId||'',_cloud:true});
    if(table==='meetings')return Object.assign({},row,{caseId:row.case_id||row.caseId||'',clientId:row.client_id||row.clientId||'',_cloud:true});
    if(table==='tasks')return Object.assign({},row,{caseId:row.case_id||row.caseId||'',_cloud:true});
    if(table==='documents')return Object.assign({},row,{caseId:row.case_id||row.caseId||'',_cloud:true});
    return Object.assign({},row,{_cloud:true});
  }
  async function refresh(){
    if(!ready())return;
    var s=read();
    var tables=['hearings','meetings','tasks','documents'];
    for(var i=0;i<tables.length;i++){
      try{var rows=await window.ADCloudCRUD.list(tables[i],{order:'created_at',ascending:false});s[tables[i]]=Array.isArray(rows)?rows.map(function(r){return map(tables[i],r);}):[];}catch(e){console.warn('[AdvocateDesk] '+tables[i]+' refresh skipped:',e.message);}
    }
    write(s);
  }
  window.ADRelatedCloud={refresh:refresh};
  var tries=0;function boot(){if(ready()){refresh();}else if(tries++<20)setTimeout(boot,500);}boot();
})();
