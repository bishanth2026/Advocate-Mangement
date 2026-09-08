/* Final Finance balance correction. Only adjusts the visible Outstanding Fees card. */
(function(){
  function num(v){const n=Number(v);return Number.isFinite(n)&&n>=0?n:0}
  function money(v){return '₹'+num(v).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}
  function fix(){
    if(document.querySelector('.nav-item.active')?.dataset.page!=='finance')return;
    const s=P1.state();
    const fees=Array.isArray(s.caseFees)?s.caseFees:[];
    const payments=Array.isArray(s.feePayments)?s.feePayments:[];
    const tx=Array.isArray(s.financeTransactions)?s.financeTransactions:[];
    const payable=fees.reduce((a,f)=>a+num(f.agreedFees)+num(f.additionalCharges),0);
    const caseReceived=payments.reduce((a,p)=>a+num(p.amount),0);
    const otherIncome=tx.filter(x=>x.type==='income').reduce((a,x)=>a+num(x.amount),0);
    const totalReceived=caseReceived+otherIncome;
    const balance=Math.max(0,payable-totalReceived);
    const cards=document.querySelectorAll('.cards .stat');
    if(cards.length>=4){
      const value=cards[3].querySelector('.stat-value');
      const foot=cards[3].querySelector('.stat-foot');
      if(value)value.textContent=money(balance);
      if(foot)foot.textContent='Total payable less all received';
    }
  }
  window.p1FixFinanceBalance=fix;
  document.addEventListener('advocateDeskFeeUpdated',()=>setTimeout(fix,30));
  document.addEventListener('click',e=>{if(e.target.closest?.('.nav-item[data-page="finance"]'))setTimeout(fix,80)},true);
  setTimeout(fix,200);
  setInterval(fix,1000);
})();
