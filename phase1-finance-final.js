/* Clean Finance module: general transactions remain independent from case-fee ledgers. */
(function(){
  function S(){const s=P1.state();s.caseFees=Array.isArray(s.caseFees)?s.caseFees:[];s.feePayments=Array.isArray(s.feePayments)?s.feePayments:[];s.financeTransactions=Array.isArray(s.financeTransactions)?s.financeTransactions:[];return s}
  const num=v=>{const n=Number(v);return Number.isFinite(n)&&n>=0?n:0};
  const money=v=>P1.money(num(v));
  const esc=v=>P1.esc(v);
  const today=()=>new Date().toISOString().slice(0,10);
  function findCase(s,id){return s.cases.find(c=>String(c.id)===String(id))||s.cases.find(c=>String(c.number)===String(id))||null}
  function getFee(s,c){let f=s.caseFees.find(x=>String(x.caseId)===String(c.id));if(!f){f={id:'FEE-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),caseId:c.id,caseNumber:c.number,clientId:c.clientId||'',clientName:c.client||'',agreedFees:0,additionalCharges:0};s.caseFees.push(f)}return f}
  function feeTotals(s,f,excludeId){const received=s.feePayments.filter(p=>String(p.caseId)===String(f.caseId)&&p.id!==excludeId).reduce((a,p)=>a+num(p.amount),0);const agreed=num(f.agreedFees),additional=num(f.additionalCharges),payable=agreed+additional;return{agreed,additional,payable,received,balance:payable-received}}
  function refresh(){P1.save(S());p1CloseModal();window.dispatchEvent(new Event('advocateDeskFeeUpdated'));if(typeof window.p1Finance==='function')window.p1Finance()}

  function finance(){
    const s=S();
    const otherIncome=s.financeTransactions.filter(x=>x.type==='income').reduce((a,x)=>a+num(x.amount),0);
    const caseIncome=s.feePayments.reduce((a,x)=>a+num(x.amount),0);
    const income=otherIncome+caseIncome;
    const expense=s.financeTransactions.filter(x=>x.type==='expense').reduce((a,x)=>a+num(x.amount),0);
    const txCount=s.financeTransactions.length+s.feePayments.length;
    const agreed=s.caseFees.reduce((a,f)=>a+num(f.agreedFees),0);
    const additional=s.caseFees.reduce((a,f)=>a+num(f.additionalCharges),0);
    const casePayable=agreed+additional;
    const caseBalance=casePayable-caseIncome;
    P1.nav('finance');
    P1.content().innerHTML=P1.layout('Finance','Fees, payments, expenses and client ledgers',`${P1.btn('＋ Add Transaction','p1FinanceModal()',true)} ${P1.btn('＋ Add Case Fee','p1FeeSetup()')}`)+
      `<div class="cards">
        <div class="stat"><div class="stat-top">Fees Received</div><div class="stat-value">${money(income)}</div><div class="stat-foot">Case payments + other income</div></div>
        <div class="stat"><div class="stat-top">Transactions</div><div class="stat-value">${txCount}</div><div class="stat-foot">Other transactions + case payments</div></div>
        <div class="stat"><div class="stat-top">Expenses</div><div class="stat-value">${money(expense)}</div><div class="stat-foot">Recorded expenses</div></div>
        <div class="stat"><div class="stat-top">Net Income</div><div class="stat-value">${money(income-expense)}</div><div class="stat-foot">All income less expenses</div></div>
      </div>
      <div class="panel" style="margin-top:16px">
        <div class="panel-head"><div><h3>Case Fee Details</h3><span class="muted">Each case has its own agreed fee, additional charges, payments and balance.</span></div>
          <div class="p1-fee-inline-stats"><span>Total Payable <strong>${money(casePayable)}</strong></span><span>Received <strong>${money(caseIncome)}</strong></span><span>Balance <strong>${money(caseBalance)}</strong></span></div>
        </div>
        <div class="toolbar"><input class="filter" id="p1feeq" placeholder="Search case number, client or case title..." oninput="p1FeeRows()"></div>
        <div class="p1-fee-table-wrap"><table><thead><tr><th>Case Number</th><th>Client</th><th>Agreed Fees</th><th>Additional Charges</th><th>Total Payable</th><th>Received</th><th>Balance</th><th>Action</th></tr></thead><tbody id="p1feerows"></tbody></table></div>
      </div>
      <div class="panel" style="margin-top:16px"><div class="panel-head"><h3>Case Fee Payment History</h3><span class="muted">Only payments recorded against a case fee are shown here.</span></div><div class="p1-fee-table-wrap"><table><thead><tr><th>Date</th><th>Case Number</th><th>Client</th><th>Amount</th><th>Method</th><th>Reference</th><th>Notes</th><th>Action</th></tr></thead><tbody id="p1feepayrows"></tbody></table></div></div>
      <div class="panel" style="margin-top:16px"><div class="panel-head"><div><h3>Other Finance Transactions</h3><span class="muted">General income and expenses stay separate from case-fee balances.</span></div></div><div class="toolbar"><input class="filter" id="p1q" placeholder="Search client, case, category, reference..." oninput="p1FinanceRows()"><select class="filter" id="p1f" onchange="p1FinanceRows()"><option value="">All</option><option value="income">Income</option><option value="expense">Expense</option></select></div><div class="p1-fee-table-wrap"><table><thead><tr><th>Date</th><th>Type</th><th>Client / Case</th><th>Category</th><th>Amount</th><th>Method</th><th>Reference</th><th>Action</th></tr></thead><tbody id="p1rows"></tbody></table></div></div>`;
    p1FeeRows();p1FinanceRows();
  }

  window.p1FeeRows=function(){
    const s=S(),q=(document.getElementById('p1feeq')?.value||'').trim().toLowerCase(),el=document.getElementById('p1feerows');if(!el)return;
    const rows=s.caseFees.map(f=>{const c=findCase(s,f.caseId);return c?{f,c,t:feeTotals(s,f)}:null}).filter(Boolean).filter(r=>!q||(`${r.c.number} ${r.c.client||''} ${r.c.title||''}`).toLowerCase().includes(q));
    el.innerHTML=rows.map(r=>`<tr><td><strong>${esc(r.c.number)}</strong><br><span class="muted">${esc(r.c.title||'')}</span></td><td>${esc(r.c.client||'—')}</td><td>${money(r.t.agreed)}</td><td>${money(r.t.additional)}</td><td><strong>${money(r.t.payable)}</strong></td><td>${money(r.t.received)}</td><td><strong>${money(r.t.balance)}</strong></td><td>${P1.btn('Fee Setup',`p1FeeSetup(${JSON.stringify(r.c.id)})`)} ${P1.btn('＋ Payment',`p1FeePayment(${JSON.stringify(r.c.id)})`)}</td></tr>`).join('')||'<tr><td colspan="8"><div class="empty">No case fee records found. Use “Add Case Fee” to set fees for a case.</div></td></tr>';
    const pe=document.getElementById('p1feepayrows');if(!pe)return;
    const arr=s.feePayments.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
    pe.innerHTML=arr.map(p=>{const c=findCase(s,p.caseId),i=s.feePayments.findIndex(x=>x.id===p.id);return `<tr><td>${P1.date(p.date)}</td><td><strong>${esc(c?.number||p.caseNumber||'—')}</strong></td><td>${esc(c?.client||p.clientName||'—')}</td><td><strong>${money(p.amount)}</strong></td><td>${esc(p.method||'')}</td><td>${esc(p.reference||'—')}</td><td>${esc(p.notes||'—')}</td><td>${P1.btn('Edit',`p1FeePayment(${JSON.stringify(p.caseId)},${i})`)} ${P1.btn('Delete',`p1DeleteFeePayment(${i})`)}</td></tr>`}).join('')||'<tr><td colspan="8"><div class="empty">No case fee payments recorded.</div></td></tr>';
  };

  window.p1FinanceRows=function(){
    const s=S(),q=(document.getElementById('p1q')?.value||'').trim().toLowerCase(),f=(document.getElementById('p1f')?.value||''),el=document.getElementById('p1rows');if(!el)return;
    const rows=s.financeTransactions.filter(x=>(!f||x.type===f)&&(!q||JSON.stringify(x).toLowerCase().includes(q)));
    el.innerHTML=rows.map(x=>{const i=s.financeTransactions.findIndex(y=>y.id===x.id);return `<tr><td>${P1.date(x.date)}</td><td>${x.type==='income'?'<span class="badge green">Income</span>':'<span class="badge red">Expense</span>'}</td><td>${esc(x.clientName||'—')}<br><span class="muted">${esc(x.case||'')}</span></td><td>${esc(x.category||'')}</td><td><strong>${money(x.amount)}</strong></td><td>${esc(x.method||'')}</td><td>${esc(x.reference||'—')}</td><td>${P1.btn('Edit',`p1FinanceModal(${i})`)} ${P1.btn('Delete',`p1DeleteFinance(${i})`)}</td></tr>`}).join('')||'<tr><td colspan="8"><div class="empty">No other finance transactions found.</div></td></tr>';
  };

  window.p1FinanceModal=function(i){
    const s=S(),x=i==null?{}:s.financeTransactions[i]||{};
    p1OpenModal(i==null?'Add Transaction':'Edit Transaction',`<div class="form-grid"><div class="field"><label>Type</label><select id="p1type"><option value="income" ${x.type!=='expense'?'selected':''}>Income / Payment</option><option value="expense" ${x.type==='expense'?'selected':''}>Expense</option></select></div><div class="field"><label>Date</label><input id="p1date" type="date" value="${esc(x.date||today())}"></div><div class="field"><label>Client</label><select id="p1client"><option value="">— Not linked —</option>${s.clients.map(c=>`<option value="${esc(c.id)}" ${String(x.clientId)===String(c.id)?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div><div class="field"><label>Case</label><select id="p1case"><option value="">— Not linked —</option>${s.cases.map(c=>`<option value="${esc(c.number)}" ${String(x.case)===String(c.number)?'selected':''}>${esc(c.number)}</option>`).join('')}</select></div><div class="field"><label>Category</label><input id="p1cat" value="${esc(x.category||'Legal Fees')}"></div><div class="field"><label>Amount</label><input id="p1amount" type="number" min="0" step="0.01" value="${esc(x.amount||'')}"></div><div class="field"><label>Payment Method</label><select id="p1method">${['Cash','Bank Transfer','UPI','Card','Cheque','Other'].map(v=>`<option ${x.method===v?'selected':''}>${v}</option>`).join('')}</select></div><div class="field"><label>Receipt / Reference</label><input id="p1ref" value="${esc(x.reference||'')}"></div><div class="field full"><label>Notes</label><textarea id="p1notes">${esc(x.notes||'')}</textarea></div></div><div class="form-actions">${P1.btn('Cancel','p1CloseModal()')} ${P1.btn('Save Transaction',`p1SaveFinance(${i==null?'null':i})`,true)}</div>`);
  };
  window.p1SaveFinance=function(i){
    const s=S(),ci=document.getElementById('p1client')?.value||'',c=s.clients.find(x=>String(x.id)===String(ci)),amount=num(document.getElementById('p1amount')?.value);if(amount<=0){alert('Enter a valid amount.');return}
    const old=i==null?null:s.financeTransactions[i],x={id:old?.id||'FIN-'+Date.now(),type:document.getElementById('p1type').value,date:document.getElementById('p1date').value,clientId:ci,clientName:c?.name||'',case:document.getElementById('p1case').value,category:(document.getElementById('p1cat').value||'').trim()||'Other',amount,method:document.getElementById('p1method').value,reference:(document.getElementById('p1ref').value||'').trim(),notes:(document.getElementById('p1notes').value||'').trim()};
    if(i==null)s.financeTransactions.push(x);else s.financeTransactions[i]=x;P1.save(s);p1CloseModal();finance();
  };
  window.p1DeleteFinance=function(i){if(!confirm('Delete this transaction?'))return;const s=S();s.financeTransactions.splice(i,1);P1.save(s);finance()};

  window.p1FeeSetup=function(caseId){
    const s=S();let c=caseId?findCase(s,caseId):null;if(!c)c=s.cases[0]||null;if(!c){alert('No cases are available. Create a case first.');return}
    const f=getFee(s,c),opts=s.cases.map(x=>`<option value="${esc(x.id)}" ${String(x.id)===String(c.id)?'selected':''}>${esc(x.number)} — ${esc(x.client||'')}</option>`).join('');
    p1OpenModal(caseId?'Edit Case Fee':'Add Case Fee',`<div class="form-grid"><div class="field full"><label>Case Number</label><select id="p1feecase" onchange="p1FeeSetupChange()">${opts}</select></div><div class="field"><label>Client</label><input id="p1feeclient" value="${esc(c.client||'')}" readonly></div><div class="field"><label>Agreed Fees</label><input id="p1agreed" type="number" min="0" step="0.01" value="${esc(f.agreedFees??'')}" oninput="p1FeeTotalUpdate()"></div><div class="field"><label>Additional Charges</label><input id="p1additional" type="number" min="0" step="0.01" value="${esc(f.additionalCharges??'')}" oninput="p1FeeTotalUpdate()"></div><div class="field"><label>Total Payable</label><input id="p1totalpayable" value="${money(num(f.agreedFees)+num(f.additionalCharges))}" readonly></div></div><div class="fee-balance-note">Total Payable = Agreed Fees + Additional Charges</div><div class="form-actions">${P1.btn('Cancel','p1CloseModal()')} ${P1.btn('Save Case Fee','p1SaveFee()',true)}</div>`);setTimeout(p1FeeTotalUpdate,0);
  };
  window.p1FeeSetupChange=function(){const s=S(),c=findCase(s,document.getElementById('p1feecase')?.value);if(!c)return;const f=getFee(s,c);document.getElementById('p1feeclient').value=c.client||'';document.getElementById('p1agreed').value=f.agreedFees??'';document.getElementById('p1additional').value=f.additionalCharges??'';p1FeeTotalUpdate()};
  window.p1FeeTotalUpdate=function(){const a=num(document.getElementById('p1agreed')?.value),b=num(document.getElementById('p1additional')?.value),e=document.getElementById('p1totalpayable');if(e)e.value=money(a+b)};
  window.p1SaveFee=function(){const s=S(),c=findCase(s,document.getElementById('p1feecase')?.value),a=num(document.getElementById('p1agreed')?.value),b=num(document.getElementById('p1additional')?.value);if(!c){alert('Select a case number.');return}const f=getFee(s,c);f.caseId=c.id;f.caseNumber=c.number;f.clientId=c.clientId||'';f.clientName=c.client||'';f.agreedFees=a;f.additionalCharges=b;P1.save(s);p1CloseModal();finance()};

  window.p1FeePayment=function(caseId,i){const s=S(),c=findCase(s,caseId);if(!c){alert('Case not found.');return}const p=i==null?{}:s.feePayments[i]||{},f=getFee(s,c),t=feeTotals(s,f,i==null?null:p.id);p1OpenModal(i==null?'Add Fee Payment':'Edit Fee Payment',`<div class="form-grid"><div class="field full"><label>Case Number</label><input value="${esc(c.number)} — ${esc(c.client||'')}" readonly></div><div class="field"><label>Date</label><input id="p1paydate" type="date" value="${esc(p.date||today())}"></div><div class="field"><label>Amount Received</label><input id="p1payamount" type="number" min="0" step="0.01" value="${esc(p.amount||'')}"></div><div class="field"><label>Payment Method</label><select id="p1paymethod">${['Cash','Bank Transfer','UPI','Card','Cheque','Other'].map(v=>`<option ${p.method===v?'selected':''}>${v}</option>`).join('')}</select></div><div class="field"><label>Receipt / Reference</label><input id="p1payref" value="${esc(p.reference||'')}"></div><div class="field full"><label>Notes</label><textarea id="p1paynotes">${esc(p.notes||'')}</textarea></div></div><div class="fee-balance-note">Total Payable: <strong>${money(t.payable)}</strong> &nbsp; | &nbsp; Received: <strong>${money(t.received)}</strong> &nbsp; | &nbsp; Balance: <strong>${money(t.balance)}</strong></div><div class="form-actions">${P1.btn('Cancel','p1CloseModal()')} ${P1.btn('Save Payment',`p1SaveFeePayment(${JSON.stringify(c.id)},${i==null?'null':i})`,true)}</div>`)};
  window.p1SaveFeePayment=function(caseId,i){const s=S(),c=findCase(s,caseId),amount=num(document.getElementById('p1payamount')?.value);if(!c||amount<=0){alert('Enter a valid payment amount.');return}const old=i==null?null:s.feePayments[i],p={id:old?.id||'PAY-'+Date.now(),caseId:c.id,caseNumber:c.number,clientId:c.clientId||'',clientName:c.client||'',date:document.getElementById('p1paydate').value,amount,method:document.getElementById('p1paymethod').value,reference:(document.getElementById('p1payref').value||'').trim(),notes:(document.getElementById('p1paynotes').value||'').trim()};if(i==null)s.feePayments.push(p);else s.feePayments[i]=p;P1.save(s);p1CloseModal();finance()};
  window.p1DeleteFeePayment=function(i){if(!confirm('Delete this fee payment?'))return;const s=S();s.feePayments.splice(i,1);P1.save(s);finance()};
  window.p1Finance=finance;
  document.addEventListener('advocateDeskFeeUpdated',()=>{if(document.querySelector('.nav-item.active')?.dataset.page==='finance')finance()});
})();
