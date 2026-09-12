/* Keep Case 360 aligned with the latest Supabase case and related records. */
(function(){
  'use strict';
  var wrapped=false;
  var KEY='advocateDeskData';
  function ready(){return !!(window.ADCloudCRUD&&window.ADCloudCRUD.ready&&window.ADCloudCRUD.ready());}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return {};}}
  function write(s){try{localStorage.setItem(KEY,JSON.stringify(s));}catch(e){}}
  function map(table,r){
    var x=Object.assign({},r,{_cloud:true});
    if(table==='cases'){x.caseNumber=r.case_number||r.caseNumber||'';x.number=r.case_number||r.number||'';x.caseType=r.case_type||r.caseType||'';x.type=r.case_type||r.type||'';x.clientId=r.client_id||r.clientId||'';x.createdAt=r.created_at||r.createdAt||'';x.updatedAt=r.updated_at||r.updatedAt||'';}
    if(table==='hearings'||table==='meetings'){x.caseId=r.case_id||r.caseId||'';x.clientId=r.client_id||r.clientId||'';}
    if(table==='tasks'||table==='documents'){x.caseId=r.case_id||r.caseId||'';}
    return x;
  }
  async function list(table){
    try{return await window.ADCloudCRUD.list(table,{order:'created_at',ascending:false});}
    catch(e){
      try{return await window.ADCloudCRUD.list(table);}
      catch(e2){console.warn('[AdvocateDesk] '+table+' refresh skipped:',e2.message);return null;}
    }
  }
  async function refresh(){
    if(!ready())return false;
    var s=read();
    var tables=['cases','hearings','meetings','tasks','documents','discussions','caseFees','feePayments','additionalChargeTransactions'];
    var dbTables={caseFees:'case_fees',feePayments:'fee_payments',additionalChargeTransactions:'additional_charge_transactions'};
    for(var i=0;i<tables.length;i++){
      var key=tables[i],table=dbTables[key]||key;
      var rows=await list(table);
      if(Array.isArray(rows))s[key]=rows.map(function(r){return map(table,r);});
    }
    write(s);
    return true;
  }
  function install(){
    if(wrapped||typeof window.openCase360!=='function')return;
    var original=window.openCase360;
    window.openCase360=async function(id){
      if(ready())await refresh();
      return original(id);
    };
    wrapped=true;
  }
  var tries=0;
  function boot(){install();if(!wrapped&&tries++<50)setTimeout(boot,300);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.ADCase360Cloud={refresh:refresh};
})();
