/* Keep Case 360 aligned with the latest Supabase case and related records. */
(function(){
  'use strict';
  var wrapped=false,crudWrapped=false,currentCase=null,refreshing=false,originalOpen=null;
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
    catch(e){try{return await window.ADCloudCRUD.list(table);}catch(e2){console.warn('[AdvocateDesk] '+table+' refresh skipped:',e2.message);return null;}}
  }
  async function refresh(){
    if(!ready())return false;
    var s=read();
    var tables=['cases','hearings','meetings','tasks','documents','discussions','caseFees','feePayments','additionalChargeTransactions'];
    var dbTables={caseFees:'case_fees',feePayments:'fee_payments',additionalChargeTransactions:'additional_charge_transactions'};
    for(var i=0;i<tables.length;i++){var key=tables[i],table=dbTables[key]||key,rows=await list(table);if(Array.isArray(rows))s[key]=rows.map(function(r){return map(table,r);});}
    write(s);return true;
  }
  async function refreshOpenCase(){
    if(refreshing||!currentCase||!originalOpen)return;
    refreshing=true;
    try{await refresh();window.dispatchEvent(new CustomEvent('advocate:case360-refresh',{detail:{caseId:currentCase}}));await originalOpen(currentCase);}
    catch(e){console.warn('[AdvocateDesk] automatic Case 360 refresh skipped:',e.message);}
    finally{refreshing=false;}
  }
  function install(){
    if(wrapped||typeof window.openCase360!=='function')return;
    originalOpen=window.openCase360;
    window.openCase360=async function(id){currentCase=id;window.__case360CurrentId=id;if(ready())await refresh();return originalOpen(id);};
    wrapped=true;
  }
  function installCrud(){
    if(crudWrapped||!window.ADCloudCRUD)return;
    var api=window.ADCloudCRUD;
    ['insert','update','remove','upsert'].forEach(function(name){
      if(typeof api[name]!=='function'||api[name].__case360Wrapped)return;
      var original=api[name];
      var wrappedMethod=async function(){var result=await original.apply(this,arguments);setTimeout(refreshOpenCase,150);return result;};
      wrappedMethod.__case360Wrapped=true;api[name]=wrappedMethod;
    });
    crudWrapped=true;
  }
  function boot(){install();installCrud();if(!wrapped||!crudWrapped)setTimeout(boot,300);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  var timer=setInterval(function(){install();installCrud();if(wrapped&&crudWrapped)clearInterval(timer);},500);setTimeout(function(){clearInterval(timer);},15000);
  window.ADCase360Cloud={refresh:refresh};
})();
