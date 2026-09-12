/* Finance persistence bridge: mirrors local finance transactions to Supabase payments. */
(function(){
  'use strict';
  function uuid(v){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v||''))?String(v):null;}
  function ready(){return !!(window.ADCloudCRUD&&window.ADCloudCRUD.ready&&window.ADCloudCRUD.ready());}
  async function mirror(kind,index){
    try{
      if(!ready())return;
      var s=window.P1&&window.P1.state?window.P1.state():null;if(!s)return;
      var list=kind==='payment'?s.feePayments:s.additionalChargeTransactions;
      var x=list&&list[index];if(!x)return;
      var payload={case_id:uuid(x.caseId),client_id:uuid(x.clientId),amount:Number(x.amount)||0,payment_date:x.date||null,payment_method:x.method||x.category||null,reference:x.reference||null,notes:x.notes||x.description||null};
      if(!payload.amount)return;
      await window.ADCloudCRUD.insert('payments',payload);
    }catch(e){console.warn('[Finance cloud sync]',e);}
  }
  function install(){
    if(!window.p1SaveTransaction||window.__financeCloudWrapped)return;
    var original=window.p1SaveTransaction;
    window.p1SaveTransaction=function(kind,i){
      var result=original.apply(this,arguments);
      var index=i==null?(kind==='payment'?(window.P1.state().feePayments.length-1):(window.P1.state().additionalChargeTransactions.length-1)):i;
      mirror(kind,index);
      return result;
    };
    window.__financeCloudWrapped=true;
  }
  var tries=0;var timer=setInterval(function(){install();if(window.__financeCloudWrapped||++tries>30)clearInterval(timer);},250);
})();
