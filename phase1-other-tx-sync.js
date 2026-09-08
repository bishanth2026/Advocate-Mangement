/* Other Finance Transaction sync. Keeps income transactions connected to the Finance Amount Received card without changing case-fee balances. */
(function(){
  function S(){const s=P1.state();s.financeTransactions=Array.isArray(s.financeTransactions)?s.financeTransactions:[];s.caseFees=Array.isArray(s.caseFees)?s.caseFees:[];s.feePayments=Array.isArray(s.feePayments)?s.feePayments:[];return s}
  function num(v){const n=Number(v);return Number.isFinite(n)&&n>=0?n:0}
  function refresh(){
    window.dispatchEvent(new Event('advocateDeskFeeUpdated'));
    setTimeout(function(){
      if(document.querySelector('.nav-item.active')?.dataset.page==='finance' && typeof window.p1FinalFinance==='function') window.p1FinalFinance();
    },40);
  }
  function save(i){
    try{
      const s=S(),ci=document.getElementById('p1client')?.value||'',c=s.clients.find(x=>String(x.id)===String(ci));
      const x={
        id:i==null?'FIN-'+Date.now():(s.financeTransactions[i]?.id||'FIN-'+Date.now()),
        type:document.getElementById('p1type')?.value||'income',
        date:document.getElementById('p1date')?.value||new Date().toISOString().slice(0,10),
        clientId:ci,clientName:c?.name||'',
        case:document.getElementById('p1case')?.value||'',
        category:(document.getElementById('p1cat')?.value||'').trim()||'Other',
        amount:num(document.getElementById('p1amount')?.value),
        method:document.getElementById('p1method')?.value||'Other',
        reference:(document.getElementById('p1ref')?.value||'').trim(),
        notes:(document.getElementById('p1notes')?.value||'').trim()
      };
      if(x.amount<=0){alert('Enter a valid amount.');return}
      if(i==null)s.financeTransactions.push(x);else s.financeTransactions[i]=x;
      P1.save(s);p1CloseModal();refresh();
    }catch(err){console.error('Other transaction save failed:',err);alert('Unable to save the transaction. Please try again.');}
  }
  function remove(i){if(!confirm('Delete this transaction?'))return;const s=S();s.financeTransactions.splice(i,1);P1.save(s);refresh()}
  window.p1SaveFinance=save;
  window.p1DeleteFinance=remove;
  window.p1OtherIncomeTotal=function(){return S().financeTransactions.filter(x=>x.type==='income').reduce((a,x)=>a+num(x.amount),0)};
})();
