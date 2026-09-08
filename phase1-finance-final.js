/* Finance: case-fee ledger only. General finance transactions are intentionally excluded from this page. */
(function(){
  function S(){const s=P1.state();s.caseFees=Array.isArray(s.caseFees)?s.caseFees:[];s.feePayments=Array.isArray(s.feePayments)?s.feePayments:[];return s}
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
    P1.content().innerHTML=P1.layout('Finance','Case fees, payments and outstanding balances',P1.btn('＋ Add Case Fee','p1FeeSetup()',true))+
      `<div class="cards">
        <div class="stat"><div class="stat-top">Agreed Fees</div><div class="stat-value">${money(agreed)}</div><div class="stat-foot">Total agreed fees across all cases</div></div>
        <div class="stat"><div class="stat-top">Additional Charges</div><div class="stat-value">${money(additional)}</div><div class="stat-foot">Additional charges across all cases</div></div>
        <div class="stat"><div class="stat-top">Amount Received</div><div class="stat-value">${money(received)}</div><div class="stat-foot">Case fee payments received</div></div>
        <div class="stat"><div class="stat-top">Balance Fees</div><div class="stat-value">${money(balance)}</div><div class="stat-foot">Agreed + additional − received</div></div>
      </div>
      <div class="panel" style="margin-top:16px">
        <div class="panel-head"><div><h3>Case Fee Details</h3><span class="muted">Each case has its own agreed fee, additional charges, payments and balance.</span></div>
          <div class="p1-fee-inline-stats"><span>Total Payable <strong>${money(agreed+additional)}</strong></span><span>Received <strong>${money(received)}</strong></span><span>Balance <strong>${money(balance)}</strong></span></div>
        </div>
        <div class="toolbar"><input class="filter" id="p1feeq" placeholder="Search case number, client or case title..." oninput="p1FeeRows()"></div>
        <div class="p1-fee-table-wrap"><table><thead><tr><th>Case Number</th><th>Client</th><th>Agreed Fees</th><th>Additional Charges</th><th>Total Payable</th><th>Amount Received</th><th>Balance Fees</th><th>Action</th></tr></thead><tbody id="p1feerows"></tbody></table></div>
      </div>
      <div class="panel" style="margin-top:16px"><div class="panel-head"><div><h3>Payment History</h3><span class="muted">All payments recorded against case fees.</span></div></div><div class="p1-fee-table-wrap"><table><thead><tr><th>Date</th><th>Case Number</th><th>Client</th><th>Amount</th><th>Method</th><th>Reference</th><th>Notes</th><th>Action</th></tr></thead><tbody id="p1feepayrows"></tbody></table></div></div>`;
    p1FeeRows();
  }

  window.p1FeeRows=function(){
    const s=S(),q=(document.getElementById('p1feeq')?.value||'').trim().toLowerCase(),el=document.getElementById('p1feerows');if(!el)return;
    const rows=s.caseFees.map(f=>{const c=findCase(s,f.caseId);return c?{f,c,t:totals(s,f)}:null}).filter(Boolean).filter(r=>!q||(`${r.c.number} ${r.c.client||''} ${r.c.title||''}`).toLowerCase().includes(q));
    el.innerHTML=rows.map(r=>`<tr><td><strong>${esc(r.c.number)}</strong><br><span class="muted">${esc(r.c.title||'')}</span></td><td>${esc(r.c.client||r.f.clientName||'—')}</td><td>${money(r.t.agreed)}</td><td>${money(r.t.additional)}</td><td><strong>${money(r.t.payable)}</strong></td><td>${money(r.t.received)}</td><td><strong>${money(r.t.balance)}</strong></td><td>${P1.btn('Fee Setup',`p1FeeSetup(${JSON.stringify(r.c.id)})`)} ${P1.btn('＋ Payment',`p1FeePayment(${JSON.stringify(r.c.id)})`)}</td></tr>`).join('')||'<tr><td colspan="8"><div class="empty">No case fee records found. Use “Add Case Fee” to set fees for a case.</div></td></tr>';
    const pe=document.getElementById('p1feepayrows');if(!pe)return;
    const arr=s.feePayments.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
    pe.innerHTML=arr.map(p=>{const c=findCase(s,p.caseId),i=s.feePayments.findIndex(x=>x.id===p.id);return `<tr><td>${P1.date(p.date)}</td><td><strong>${esc(c?.number||p.caseNumber||'—')}</strong></td><td>${esc(c?.client||p.clientName||'—')}</td><td><strong>${money(p.amount)}</strong></td><td>${esc(p.method||'')}</td><td>${esc(p.reference||'—')}</td><td>${esc(p.notes||'—')}</td><td>${P1.btn('Edit',`p1FeePayment(${JSON.stringify(p.caseId)},${i})`)} ${P1.btn('Delete',`p1DeleteFeePayment(${i})`)}</td></tr>`}).join('')||'<tr><td colspan="8"><div class="empty">No case fee payments recorded.</div></td></tr>';
  };

  window.p1FeeSetup=function(caseId){
    const s=S();let c=caseId?findCase(s,caseId):null;if(!c)c=s.cases[0]||null;if(!c){alert('No cases are available. Create a case first.');return}
    const f=getFee(s,c),opts=s.cases.map(x=>`<option value="${esc(x.id)}" ${String(x.id)===String(c.id)?'selected':''}>${esc(x.number)} — ${esc(x.client||'')}</option>`).join('');
    p1OpenModal(caseId?'Edit Case Fee':'Add Case Fee',`<div class="form-grid"><div class="field full"><label>Case Number</label><select id="p1feecase" onchange="p1FeeSetupChange()">${opts}</select></div><div class="field"><label>Client</label><input id="p1feeclient" value="${esc(c.client||'')}" readonly></div><div class="field"><label>Agreed Fees</label><input id="p1agreed" type="number" min="0" step="0.01" value="${esc(f.agreedFees??'')}" oninput="p1FeeTotalUpdate()"></div><div class="field"><label>Additional Charges</label><input id="p1additional" type="number" min="0" step="0.01" value="${esc(f.additionalCharges??'')}" oninput="p1FeeTotalUpdate()"></div><div class="field"><label>Total Payable</label><input id="p1totalpayable" value="${money(num(f.agreedFees)+num(f.additionalCharges))}" readonly></div></div><div class="fee-balance-note">Total Payable = Agreed Fees + Additional Charges</div><div class="form-actions">${P1.btn('Cancel','p1CloseModal()')} ${P1.btn('Save Case Fee','p1SaveFee()',true)}</div>`);setTimeout(p1FeeTotalUpdate,0);
  };
  window.p1FeeSetupChange=function(){const s=S(),c=findCase(s,document.getElementById('p1feecase')?.value);if(!c)return;const f=getFee(s,c);document.getElementById('p1feeclient').value=c.client||'';document.getElementById('p1agreed').value=f.agreedFees??'';document.getElementById('p1additional').value=f.additionalCharges??'';p1FeeTotalUpdate()};
  window.p1FeeTotalUpdate=function(){const a=num(document.getElementById('p1agreed')?.value),b=num(document.getElementById('p1additional')?.value),e=document.getElementById('p1totalpayable');if(e)e.value=money(a+b)};
  window.p1SaveFee=function(){const s=S(),c=findCase(s,document.getElementById('p1feecase')?.value),a=num(document.getElementById('p1agreed')?.value),b=num(document.getElementById('p1additional')?.value);if(!c){alert('Select a case number.');return}const f=getFee(s,c);f.caseId=c.id;f.caseNumber=c.number;f.clientId=c.clientId||'';f.clientName=c.client||'';f.agreedFees=a;f.additionalCharges=b;P1.save(s);p1CloseModal();finance()};

  window.p1FeePayment=function(caseId,i){
    const s=S();let c=findCase(s,caseId);if(!c&&i!=null)c=findCase(s,s.feePayments[i]?.caseId);if(!c)c=s.cases[0]||null;if(!c){alert('No cases are available.');return}
    const x=i==null?{}:s.feePayments[i]||{};
    const opts=s.cases.map(z=>`<option value="${esc(z.id)}" ${String(z.id)===String(c.id)?'selected':''}>${esc(z.number)} — ${esc(z.client||'')}</option>`).join('');
    p1OpenModal(i==null?'Add Fee Payment':'Edit Fee Payment',`<div class="form-grid"><div class="field full"><label>Case Number</label><select id="p1paycase" onchange="p1PayCaseChange()">${opts}</select></div><div class="field"><label>Client</label><input id="p1payclient" value="${esc(c.client||'')}" readonly></div><div class="field"><label>Date</label><input id="p1paydate" type="date" value="${esc(x.date||today())}"></div><div class="field"><label>Amount Received</label><input id="p1payamount" type="number" min="0" step="0.01" value="${esc(x.amount??'')}"></div><div class="field"><label>Payment Method</label><select id="p1paymethod">${['Cash','Bank Transfer','UPI','Card','Cheque','Other'].map(v=>`<option ${x.method===v?'selected':''}>${v}</option>`).join('')}</select></div><div class="field"><label>Receipt / Reference</label><input id="p1payref" value="${esc(x.reference||'')}"></div><div class="field full"><label>Notes</label><textarea id="p1paynotes">${esc(x.notes||'')}</textarea></div></div><div class="form-actions">${P1.btn('Cancel','p1CloseModal()')} ${P1.btn('Save Payment',`p1SaveFeePayment(${i==null?'null':i})`,true)}</div>`);
  };
  window.p1PayCaseChange=function(){const s=S(),c=findCase(s,document.getElementById('p1paycase')?.value);if(c)document.getElementById('p1payclient').value=c.client||''};
  window.p1SaveFeePayment=function(i){
    const s=S(),c=findCase(s,document.getElementById('p1paycase')?.value),amount=num(document.getElementById('p1payamount')?.value);if(!c){alert('Select a case number.');return}if(amount<=0){alert('Enter a valid amount received.');return}
    const old=i==null?null:s.feePayments[i];const x={id:old?.id||'PAY-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),caseId:c.id,caseNumber:c.number,clientId:c.clientId||'',clientName:c.client||'',date:document.getElementById('p1paydate').value,amount,method:document.getElementById('p1paymethod').value,reference:(document.getElementById('p1payref').value||'').trim(),notes:(document.getElementById('p1paynotes').value||'').trim()};if(i==null)s.feePayments.push(x);else s.feePayments[i]=x;P1.save(s);p1CloseModal();finance()};
  window.p1DeleteFeePayment=function(i){if(!confirm('Delete this case fee payment?'))return;const s=S();s.feePayments.splice(i,1);P1.save(s);finance()};

  window.p1Finance=function(){finance()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{if(location.hash==='#finance')finance()},{once:true});
})();
