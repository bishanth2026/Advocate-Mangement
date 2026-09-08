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
    if(typeof window.finance==='function')window.finance();
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
