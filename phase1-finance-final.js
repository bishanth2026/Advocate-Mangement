/* Finance: case-fee ledger with linked client payments and expenses. */
(function(){
  function S(){const s=P1.state();s.caseFees=Array.isArray(s.caseFees)?s.caseFees:[];s.feePayments=Array.isArray(s.feePayments)?s.feePayments:[];s.financeTransactions=Array.isArray(s.financeTransactions)?s.financeTransactions:[];return s}
  const num=v=>{const n=Number(v);return Number.isFinite(n)&&n>=0?n:0};
  const money=v=>P1.money(num(v));
  const esc=v=>P1.esc(v);
  const today=()=>new Date().toISOString().slice(0,10);
  function findCase(s,id){return s.cases.find(c=>String(c.id)===String(id))||s.cases.find(c=>String(c.number)===String(id))||null}
  function getFee(s,c){let f=s.caseFees.find(x=>String(x.caseId)===String(c.id));if(!f){f={id:'FEE-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),caseId:c.id,caseNumber:c.number,clientId:c.clientId||'',clientName:c.client||'',agreedFees:0,additionalCharges:0};s.caseFees.push(f)}return f}
  function totals(s,f,excludeId){const agreed=num(f.agreedFees),additional=num(f.additionalCharges),received=s.feePayments.filter(p=>String(p.caseId)===String(f.caseId)&&p.id!==excludeId).reduce((a,p)=>a+num(p.amount),0);return{agreed,additional,payable:agreed+additional,received,balance:agreed+additional-received}}

  function finance(){
    const s=S();
    const agreed=s.caseFees.reduce((a,f)=>a+num(f.agreedFees),0);
    const additional=s.caseFees.reduce((a,f)=>a+num(f.additionalCharges),0);
    const received=s.feePayments.reduce((a,p)=>a+num(p.amount),0);
    const balance=agreed+additional-received;
    P1.nav('finance');
    P1.content().innerHTML=P1.layout('Finance','Case fees, client payments, expenses and outstanding balances',`${P1.btn('＋ Add Transaction','p1TransactionModal()',true)} ${P1.btn('＋ Add Case Fee','p1FeeSetup()')}`)+
      `<div class="cards">
        <div class="stat"><div class="stat-top">Agreed Fees</div><div class="stat-value">${money(agreed)}</div><div class="stat-foot">Total agreed fees across all cases</div></div>
        <div class="stat"><div class="stat-top">Additional Charges</div><div class="stat-value">${money(additional)}</div><div class="stat-foot">Additional charges across all cases</div></div>
        <div class="stat"><div class="stat-top">Amount Received</div><div class="stat-value">${money(received)}</div><div class="stat-foot">Client fee payments received</div></div>
        <div class="stat"><div class="stat-top">Balance Fees</div><div class="stat-value">${money(balance)}</div><div class="stat-foot">Agreed + additional − received</div></div>
      </div>
      <div class="panel" style="margin-top:16px">
        <div class="panel-head"><div><h3>Case Fee Details</h3><span class="muted">Each case has its own agreed fee, additional charges, client payments and balance.</span></div>
          <div class="p1-fee-inline-stats"><span>Total Payable <strong>${money(agreed+additional)}</strong></span><span>Received <strong>${money(received)}</strong></span><span>Balance <strong>${money(balance)}</strong></span></div>
        </div>
        <div class="toolbar"><input class="filter" id="p1feeq" placeholder="Search case number, client or case title..." oninput="p1FeeRows()"></div>
        <div class="p1-fee-table-wrap"><table><thead><tr><th>Case Number</th><th>Client</th><th>Agreed Fees</th><th>Additional Charges</th><th>Total Payable</th><th>Amount Received</th><th>Balance Fees</th><th>Action</th></tr></thead><tbody id="p1feerows"></tbody></table></div>
      </div>
      <div class="panel" style="margin-top:16px"><div class="panel-head"><div><h3>Payment History</h3><span class="muted">Client fee payments are linked to the selected case and automatically reduce its balance.</span></div><div>${P1.btn('＋ Record Client Payment','p1TransactionModal(\'payment\')')}</div></div><div class="p1-fee-table-wrap"><table><thead><tr><th>Date</th><th>Case Number</th><th>Client</th><th>Amount</th><th>Method</th><th>Reference</th><th>Notes</th><th>Action</th></tr></thead><tbody id="p1feepayrows"></tbody></table></div></div>
      <div class="panel" style="margin-top:16px"><div class="panel-head"><div><h3>Expense History</h3><span class="muted">Office expenses are recorded separately and do not change case fee balances.</span></div><div>${P1.btn('＋ Record Expense','p1TransactionModal(\'expense\')')}</div></div><div class="p1-fee-table-wrap"><table><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Method</th><th>Reference</th><th>Notes</th><th>Action</th></tr></thead><tbody id="p1expenserows"></tbody></table></div></div>`;
    p1FeeRows();
    p1ExpenseRows();
  }

  window.p1FeeRows=function(){
    const s=S(),q=(document.getElementById('p1feeq')?.value||'').trim().toLowerCase(),el=document.getElementById('p1feerows');if(!el)return;
    const rows=s.caseFees.map(f=>{const c=findCase(s,f.caseId);return c?{f,c,t:totals(s,f)}:null}).filter(Boolean).filter(r=>!q||(`${r.c.number} ${r.c.client||''} ${r.c.title||''}`).toLowerCase().includes(q));
    el.innerHTML=rows.map(r=>`<tr><td><strong>${esc(r.c.number)}</strong><br><span class="muted">${esc(r.c.title||'')}</span></td><td>${esc(r.c.client||r.f.clientName||'—')}</td><td>${money(r.t.agreed)}</td><td>${money(r.t.additional)}</td><td><strong>${money(r.t.payable)}</strong></td><td>${money(r.t.received)}</td><td><strong>${money(r.t.balance)}</strong></td><td>${P1.btn('Fee Setup',`p1FeeSetup(${JSON.stringify(r.c.id)})`)} ${P1.btn('＋ Payment',`p1TransactionModal('payment',${JSON.stringify(r.c.id)})`)}</td></tr>`).join('')||'<tr><td colspan="8"><div class="empty">No case fee records found. Use “Add Case Fee” to set fees for a case.</div></td></tr>';
    const pe=document.getElementById('p1feepayrows');if(!pe)return;
    const arr=s.feePayments.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
    pe.innerHTML=arr.map(p=>{const c=findCase(s,p.caseId),i=s.feePayments.findIndex(x=>x.id===p.id);return `<tr><td>${P1.date(p.date)}</td><td><strong>${esc(c?.number||p.caseNumber||'—')}</strong></td><td>${esc(c?.client||p.clientName||'—')}</td><td><strong>${money(p.amount)}</strong></td><td>${esc(p.method||'')}</td><td>${esc(p.reference||'—')}</td><td>${esc(p.notes||'—')}</td><td>${P1.btn('Edit',`p1TransactionModal('payment',${JSON.stringify(p.caseId)},${i})`)} ${P1.btn('Delete',`p1DeleteFeePayment(${i})`)}</td></tr>`}).join('')||'<tr><td colspan="8"><div class="empty">No client fee payments recorded.</div></td></tr>';
  };

  window.p1TransactionModal=function(kind,caseId,i){
    const s=S();
    if(kind!=='payment'&&kind!=='expense')kind='payment';
    let c=kind==='payment'?(caseId?findCase(s,caseId):null):null;
    let x=kind==='payment'?(i==null?{}:s.feePayments[i]||{}):(i==null?{}:s.financeTransactions[i]||{});
    if(kind==='payment'&&!c&&x.caseId)c=findCase(s,x.caseId);
    if(kind==='payment'&&!c)c=s.cases[0]||null;
    if(kind==='payment'&&!c){alert('No cases are available. Create a case first.');return}
    const caseOpts=kind==='payment'?s.cases.map(z=>`<option value="${esc(z.id)}" ${String(z.id)===String(c.id)?'selected':''}>${esc(z.number)} — ${esc(z.client||'')}</option>`).join(''):'';
    const clientOpts=s.clients.map(z=>`<option value="${esc(z.id)}" ${String(z.id)===String(x.clientId||'')?'selected':''}>${esc(z.name)}</option>`).join('');
    const title=i==null?(kind==='payment'?'Record Client Fee Payment':'Record Expense'):(kind==='payment'?'Edit Client Fee Payment':'Edit Expense');
    const body=kind==='payment'?`<div class="form-grid"><div class="field full"><label>Case Number</label><select id="p1txcase" onchange="p1TxCaseChange()">${caseOpts}</select></div><div class="field"><label>Client</label><input id="p1txclient" value="${esc(c.client||x.clientName||'')}" readonly></div><div class="field"><label>Date</label><input id="p1txdate" type="date" value="${esc(x.date||today())}"></div><div class="field"><label>Amount Received</label><input id="p1txamount" type="number" min="0" step="0.01" value="${esc(x.amount??'')}"></div><div class="field"><label>Payment Method</label><select id="p1txmethod">${['Cash','Bank Transfer','UPI','Card','Cheque','Other'].map(v=>`<option ${x.method===v?'selected':''}>${v}</option>`).join('')}</select></div><div class="field"><label>Receipt / Reference</label><input id="p1txref" value="${esc(x.reference||'')}"></div><div class="field full"><label>Notes</label><textarea id="p1txnotes">${esc(x.notes||'')}</textarea></div></div><div class="fee-balance-note">This payment is linked to the selected case. Saving it increases Amount Received and reduces that case’s Balance Fees.</div><div class="form-actions">${P1.btn('Cancel','p1CloseModal()')} ${P1.btn(i==null?'Save Payment':'Update Payment',`p1SaveTransaction('payment',${i==null?'null':i})`,true)}</div>`:`<div class="form-grid"><div class="field"><label>Date</label><input id="p1txdate" type="date" value="${esc(x.date||today())}"></div><div class="field"><label>Expense Category</label><input id="p1txcat" value="${esc(x.category||'Office Expense')}"></div><div class="field full"><label>Description</label><input id="p1txdesc" value="${esc(x.description||x.notes||'')}"></div><div class="field"><label>Amount</label><input id="p1txamount" type="number" min="0" step="0.01" value="${esc(x.amount??'')}"></div><div class="field"><label>Payment Method</label><select id="p1txmethod">${['Cash','Bank Transfer','UPI','Card','Cheque','Other'].map(v=>`<option ${x.method===v?'selected':''}>${v}</option>`).join('')}</select></div><div class="field"><label>Reference</label><input id="p1txref" value="${esc(x.reference||'')}"></div><div class="field"><label>Client / Payee (optional)</label><select id="p1txclient"><option value="">— Not linked —</option>${clientOpts}</select></div><div class="field full"><label>Notes</label><textarea id="p1txnotes">${esc(x.notes||'')}</textarea></div></div><div class="fee-balance-note">Expenses are stored separately from case-fee payments and do not reduce any client’s case fee balance.</div><div class="form-actions">${P1.btn('Cancel','p1CloseModal()')} ${P1.btn(i==null?'Save Expense':'Update Expense',`p1SaveTransaction('expense',${i==null?'null':i})`,true)}</div>`;
    p1OpenModal(title,body);
  };

  window.p1TxCaseChange=function(){const s=S(),c=findCase(s,document.getElementById('p1txcase')?.value);if(c)document.getElementById('p1txclient').value=c.client||''};
  window.p1SaveTransaction=function(kind,i){
    const s=S(),amount=num(document.getElementById('p1txamount')?.value);if(amount<=0){alert('Enter a valid amount.');return}
    if(kind==='payment'){
      const c=findCase(s,document.getElementById('p1txcase')?.value);if(!c){alert('Select a case number.');return}
      const old=i==null?null:s.feePayments[i];const x={id:old?.id||'PAY-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),caseId:c.id,caseNumber:c.number,clientId:c.clientId||'',clientName:c.client||'',date:document.getElementById('p1txdate').value,amount,method:document.getElementById('p1txmethod').value,reference:(document.getElementById('p1txref').value||'').trim(),notes:(document.getElementById('p1txnotes').value||'').trim()};if(i==null)s.feePayments.push(x);else s.feePayments[i]=x;
    }else{
      const ci=document.getElementById('p1txclient')?.value||'',client=s.clients.find(z=>String(z.id)===String(ci)),old=i==null?null:s.financeTransactions[i];const x={id:old?.id||'FIN-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),type:'expense',date:document.getElementById('p1txdate').value,clientId:ci,clientName:client?.name||'',category:(document.getElementById('p1txcat').value||'').trim()||'Office Expense',description:(document.getElementById('p1txdesc').value||'').trim(),amount,method:document.getElementById('p1txmethod').value,reference:(document.getElementById('p1txref').value||'').trim(),notes:(document.getElementById('p1txnotes').value||'').trim()};if(i==null)s.financeTransactions.push(x);else s.financeTransactions[i]=x;
    }
    P1.save(s);p1CloseModal();finance();
  };

  window.p1ExpenseRows=function(){
    const s=S(),el=document.getElementById('p1expenserows');if(!el)return;
    const arr=s.financeTransactions.filter(x=>x.type==='expense').slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
    el.innerHTML=arr.map(x=>{const i=s.financeTransactions.findIndex(y=>y.id===x.id);return `<tr><td>${P1.date(x.date)}</td><td>${esc(x.category||'Office Expense')}</td><td>${esc(x.description||'—')}<br><span class="muted">${esc(x.clientName||'')}</span></td><td><strong>${money(x.amount)}</strong></td><td>${esc(x.method||'')}</td><td>${esc(x.reference||'—')}</td><td>${esc(x.notes||'—')}</td><td>${P1.btn('Edit',`p1TransactionModal('expense',null,${i})`)} ${P1.btn('Delete',`p1DeleteExpense(${i})`)}</td></tr>`}).join('')||'<tr><td colspan="8"><div class="empty">No expenses recorded.</div></td></tr>';
  };

  window.p1DeleteExpense=function(i){if(!confirm('Delete this expense?'))return;const s=S();s.financeTransactions.splice(i,1);P1.save(s);finance()};

  window.p1FeeSetup=function(caseId){
    const s=S();let c=caseId?findCase(s,caseId):null;if(!c)c=s.cases[0]||null;if(!c){alert('No cases are available. Create a case first.');return}
    const f=getFee(s,c),opts=s.cases.map(x=>`<option value="${esc(x.id)}" ${String(x.id)===String(c.id)?'selected':''}>${esc(x.number)} — ${esc(x.client||'')}</option>`).join('');
    p1OpenModal(caseId?'Edit Case Fee':'Add Case Fee',`<div class="form-grid"><div class="field full"><label>Case Number</label><select id="p1feecase" onchange="p1FeeSetupChange()">${opts}</select></div><div class="field"><label>Client</label><input id="p1feeclient" value="${esc(c.client||'')}" readonly></div><div class="field"><label>Agreed Fees</label><input id="p1agreed" type="number" min="0" step="0.01" value="${esc(f.agreedFees??'')}" oninput="p1FeeTotalUpdate()"></div><div class="field"><label>Additional Charges</label><input id="p1additional" type="number" min="0" step="0.01" value="${esc(f.additionalCharges??'')}" oninput="p1FeeTotalUpdate()"></div><div class="field"><label>Total Payable</label><input id="p1totalpayable" value="${money(num(f.agreedFees)+num(f.additionalCharges))}" readonly></div></div><div class="fee-balance-note">Total Payable = Agreed Fees + Additional Charges</div><div class="form-actions">${P1.btn('Cancel','p1CloseModal()')} ${P1.btn('Save Case Fee','p1SaveFee()',true)}</div>`);setTimeout(p1FeeTotalUpdate,0);
  };
  window.p1FeeSetupChange=function(){const s=S(),c=findCase(s,document.getElementById('p1feecase')?.value);if(!c)return;const f=getFee(s,c);document.getElementById('p1feeclient').value=c.client||'';document.getElementById('p1agreed').value=f.agreedFees??'';document.getElementById('p1additional').value=f.additionalCharges??'';p1FeeTotalUpdate()};
  window.p1FeeTotalUpdate=function(){const a=num(document.getElementById('p1agreed')?.value),b=num(document.getElementById('p1additional')?.value),e=document.getElementById('p1totalpayable');if(e)e.value=money(a+b)};
  window.p1SaveFee=function(){const s=S(),c=findCase(s,document.getElementById('p1feecase')?.value),a=num(document.getElementById('p1agreed')?.value),b=num(document.getElementById('p1additional')?.value);if(!c){alert('Select a case number.');return}const f=getFee(s,c);f.caseId=c.id;f.caseNumber=c.number;f.clientId=c.clientId||'';f.clientName=c.client||'';f.agreedFees=a;f.additionalCharges=b;P1.save(s);p1CloseModal();finance()};

  window.p1FeePayment=function(caseId,i){p1TransactionModal('payment',caseId,i)};
  window.p1DeleteFeePayment=function(i){if(!confirm('Delete this client fee payment?'))return;const s=S();s.feePayments.splice(i,1);P1.save(s);finance()};

  window.p1Finance=function(){finance()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{if(location.hash==='#finance')finance()},{once:true});
})();
