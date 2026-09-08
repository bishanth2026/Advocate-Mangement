/* One-time cleanup of test fee-ledger data created during the Finance rollout.
   Keeps Cases, Clients, Hearings, Tasks, Documents and other app data untouched. */
(function(){
  const FLAG='advocateDeskFeeCleanup20260908';
  if(localStorage.getItem(FLAG)==='done') return;
  try{
    const key='advocateDeskData';
    const s=JSON.parse(localStorage.getItem(key)||'{}');
    s.caseFees=[];
    s.feePayments=[];
    localStorage.setItem(key,JSON.stringify(s));
    localStorage.setItem(FLAG,'done');
  }catch(e){ console.warn('Fee cleanup skipped',e); }
})();