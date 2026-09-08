// AdvocateDesk production fixes
// Correct client creation/update without duplicate inserts.
function saveClient(i){
  const name=document.getElementById("f1")?.value.trim();
  const phone=document.getElementById("f2")?.value.trim();
  const email=document.getElementById("f3")?.value.trim();
  const status=document.getElementById("f4")?.value || "Active";
  if(!name){alert("Client name is required");return;}
  const editing=i!==null && i!==undefined;
  if(editing){
    const old=state.clients[i];
    if(!old){alert("Client not found");return;}
    state.clients[i]={...old,name,phone,email,status};
    state.cases.forEach(c=>{if(c.clientId===old.id)c.client=name;});
  }else{
    const id=`CL-${String(state.clients.length+1).padStart(3,"0")}`;
    state.clients.push({id,name,phone,email,cases:0,status});
  }
  save();
  closeModal();
  navigate("clients");
}

// Finance: reliable Case Fee Details actions, including rows whose case-number
// capitalization or spacing differs from the stored case record.
(function(){
  const norm=v=>String(v??'').replace(/\s+/g,' ').trim().toLowerCase();

  function feeForRow(s,row){
    const cells=row?.querySelectorAll('td');
    if(!cells?.length)return null;
    const number=((cells[0]?.innerText||'').split('\n')[0]||'').trim();
    if(!number)return null;
    let fee=(s.caseFees||[]).find(f=>norm(f.caseNumber)===norm(number));
    if(fee)return fee;
    const c=(s.cases||[]).find(x=>norm(x.number)===norm(number));
    if(c)fee=(s.caseFees||[]).find(f=>String(f.caseId)===String(c.id));
    return fee||null;
  }

  function caseForFee(s,fee){
    if(!fee)return null;
    return (s.cases||[]).find(c=>String(c.id)===String(fee.caseId)) ||
           (s.cases||[]).find(c=>norm(c.number)===norm(fee.caseNumber)) || null;
  }

  function addCaseFeeDeleteButtons(){
    const tbody=document.getElementById('p1feerows');
    if(!tbody)return;
    tbody.querySelectorAll('tr').forEach(function(row){
      if(row.querySelector('[data-delete-case-fee]'))return;
      const s=window.P1&&P1.state?P1.state():null;
      if(!s)return;
      const fee=feeForRow(s,row);
      if(!fee)return;
      const action=row.querySelector('td:last-child');
      if(!action)return;
      const b=document.createElement('button');
      b.type='button';
      b.className='secondary';
      b.setAttribute('data-delete-case-fee','1');
      b.setAttribute('data-case-id',String(fee.caseId));
      b.textContent='Delete';
      b.style.marginLeft='6px';
      b.style.color='#b42318';
      b.style.borderColor='#f1b5b0';
      action.appendChild(document.createTextNode(' '));
      action.appendChild(b);
    });
  }

  function deleteCaseFee(button){
    const caseId=button.getAttribute('data-case-id');
    if(!caseId)return;
    const s=window.P1&&P1.state?P1.state():null;
    if(!s)return;
    const fee=(s.caseFees||[]).find(x=>String(x.caseId)===String(caseId));
    if(!fee)return;
    const c=caseForFee(s,fee);
    if(!confirm('Delete the fee setup for '+(c?.number||fee.caseNumber||'this case')+'?\n\nThe case will remain. Payment and additional-charge history will be kept.'))return;
    s.caseFees=s.caseFees.filter(x=>String(x.caseId)!==String(caseId));
    P1.save(s);
    if(typeof window.p1Finance==='function')window.p1Finance();
    else if(typeof window.p1FeeRows==='function')window.p1FeeRows();
  }

  function handleFeeRowAction(e){
    const b=e.target.closest&&e.target.closest('#p1feerows button');
    if(!b)return;
    const row=b.closest('tr');
    if(!row)return;
    const text=(b.innerText||'').trim();
    const s=window.P1&&P1.state?P1.state():null;
    if(!s)return;
    const fee=feeForRow(s,row);
    if(!fee)return;
    if(text==='Fee Setup'){
      e.preventDefault();
      e.stopImmediatePropagation();
      if(typeof window.p1FeeSetup==='function')window.p1FeeSetup(fee.caseId);
    }else if(text==='＋ Payment'){
      e.preventDefault();
      e.stopImmediatePropagation();
      if(typeof window.p1TransactionModal==='function')window.p1TransactionModal('payment',fee.caseId);
    }
  }

  document.addEventListener('click',function(e){
    const del=e.target.closest&&e.target.closest('[data-delete-case-fee]');
    if(del){e.preventDefault();e.stopImmediatePropagation();deleteCaseFee(del);return;}
    handleFeeRowAction(e);
  },true);

  document.addEventListener('pointerup',function(e){
    const del=e.target.closest&&e.target.closest('[data-delete-case-fee]');
    if(del){e.preventDefault();e.stopImmediatePropagation();return;}
    const b=e.target.closest&&e.target.closest('#p1feerows button');
    if(b){e.preventDefault();e.stopImmediatePropagation();handleFeeRowAction(e);}
  },true);

  const observer=new MutationObserver(addCaseFeeDeleteButtons);
  function start(){
    const content=document.getElementById('content');
    if(!content)return;
    observer.observe(content,{childList:true,subtree:true});
    addCaseFeeDeleteButtons();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();

// Finance route fix: the legacy app.js has an older finance() renderer.
// Dashboard "View Finance" and navigate('finance') must use the Phase-1 ledger.
(function(){
  function install(){
    if(!window.P1)return;
    window.p1Finance=function(){
      const s=P1.state();
      s.caseFees=Array.isArray(s.caseFees)?s.caseFees:[];
      s.feePayments=Array.isArray(s.feePayments)?s.feePayments:[];
      s.additionalChargeTransactions=Array.isArray(s.additionalChargeTransactions)?s.additionalChargeTransactions:[];
      const num=v=>{const n=Number(v);return Number.isFinite(n)&&n>=0?n:0};
      const money=v=>P1.money(num(v));
      const agreed=s.caseFees.reduce((a,f)=>a+num(f.agreedFees),0);
      const additional=s.caseFees.reduce((a,f)=>a+num(f.additionalCharges),0)+s.additionalChargeTransactions.reduce((a,x)=>a+num(x.amount),0);
      const received=s.feePayments.reduce((a,p)=>a+num(p.amount),0);
      const balance=agreed+additional-received;
      P1.nav('finance');
      P1.content().innerHTML=P1.layout('Finance','Case fees, client payments, additional charges and outstanding balances',P1.btn('＋ Add Transaction','p1TransactionModal()',true))+`<div class="cards">
        <div class="stat"><div class="stat-top">Agreed Fees</div><div class="stat-value">${money(agreed)}</div><div class="stat-foot">Total agreed fees across all cases</div></div>
        <div class="stat"><div class="stat-top">Additional Charges</div><div class="stat-value">${money(additional)}</div><div class="stat-foot">Additional charges linked to cases</div></div>
        <div class="stat"><div class="stat-top">Amount Received</div><div class="stat-value">${money(received)}</div><div class="stat-foot">Client fee payments received</div></div>
        <div class="stat"><div class="stat-top">Balance Fees</div><div class="stat-value">${money(balance)}</div><div class="stat-foot">Agreed + additional − received</div></div>
      </div>
      <div class="panel" style="margin-top:16px"><div class="panel-head"><div><h3>Case Fee Details</h3><span class="muted">Each case has its own agreed fee, additional charges, client payments and balance.</span></div><div class="p1-fee-inline-stats"><span>Total Payable <strong>${money(agreed+additional)}</strong></span><span>Received <strong>${money(received)}</strong></span><span>Balance <strong>${money(balance)}</strong></span></div></div>
        <div class="toolbar"><input class="filter" id="p1feeq" placeholder="Search case number, client or case title..." oninput="p1FeeRows()"></div>
        <div class="p1-fee-table-wrap"><table><thead><tr><th>Case Number</th><th>Client</th><th>Agreed Fees</th><th>Additional Charges</th><th>Total Payable</th><th>Amount Received</th><th>Balance Fees</th><th>Action</th></tr></thead><tbody id="p1feerows"></tbody></table></div>
      </div>
      <div class="panel" style="margin-top:16px"><div class="panel-head"><div><h3>Payment History</h3><span class="muted">Client fee payments are linked to the selected case and reduce its balance.</span></div><div>${P1.btn('＋ Record Client Payment',"p1TransactionModal('payment')")}</div></div><div class="p1-fee-table-wrap"><table><thead><tr><th>Date</th><th>Case Number</th><th>Client</th><th>Amount</th><th>Method</th><th>Reference</th><th>Notes</th><th>Action</th></tr></thead><tbody id="p1feepayrows"></tbody></table></div></div>
      <div class="panel" style="margin-top:16px"><div class="panel-head"><div><h3>Additional Charges History</h3><span class="muted">Additional charges recorded against individual cases are included in the Additional Charges card and that case's balance.</span></div><div>${P1.btn('＋ Add Additional Charge',"p1TransactionModal('additional')")}</div></div><div class="p1-fee-table-wrap"><table><thead><tr><th>Date</th><th>Case Number</th><th>Client</th><th>Category</th><th>Description</th><th>Amount</th><th>Reference</th><th>Action</th></tr></thead><tbody id="p1additionalrows"></tbody></table></div></div>`;
      if(typeof window.p1FeeRows==='function')window.p1FeeRows();
      if(typeof window.p1AdditionalRows==='function')window.p1AdditionalRows();
    };
    const originalNavigate=window.navigate;
    if(typeof originalNavigate==='function'&&!originalNavigate.__financeRouteFixed){
      const routed=function(page){
        if(String(page)==='finance'){window.p1Finance();return;}
        return originalNavigate.apply(this,arguments);
      };
      routed.__financeRouteFixed=true;
      window.navigate=routed;
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(install,0)},{once:true});
  else setTimeout(install,0);
})();
