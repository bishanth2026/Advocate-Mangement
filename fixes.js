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

// Finance: add a Delete action to each Case Fee Details row.
(function(){
  function addCaseFeeDeleteButtons(){
    const tbody=document.getElementById('p1feerows');
    if(!tbody)return;
    tbody.querySelectorAll('tr').forEach(function(row){
      if(row.querySelector('[data-delete-case-fee]'))return;
      const cells=row.querySelectorAll('td');
      if(!cells.length)return;
      const caseNumber=((cells[0]?.innerText||'').split('\n')[0]||'').trim();
      if(!caseNumber)return;
      const s=window.P1&&P1.state?P1.state():null;
      if(!s)return;
      const c=(s.cases||[]).find(function(x){return String(x.number)===caseNumber});
      if(!c)return;
      const action=cells[cells.length-1];
      if(!action)return;
      const b=document.createElement('button');
      b.type='button';
      b.className='secondary';
      b.setAttribute('data-delete-case-fee','1');
      b.setAttribute('data-case-id',String(c.id));
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
    const c=(s.cases||[]).find(function(x){return String(x.id)===String(caseId)});
    const fee=(s.caseFees||[]).find(function(x){return String(x.caseId)===String(caseId)});
    if(!fee)return;
    if(!confirm('Delete the fee setup for '+(c?.number||fee.caseNumber||'this case')+'?\n\nThe case will remain. Payment and additional-charge history will be kept.'))return;
    s.caseFees=s.caseFees.filter(function(x){return String(x.caseId)!==String(caseId)});
    P1.save(s);
    if(typeof window.finance==='function')window.finance();
    else if(typeof window.p1FeeRows==='function')window.p1FeeRows();
  }
  document.addEventListener('click',function(e){
    const b=e.target.closest&&e.target.closest('[data-delete-case-fee]');
    if(!b)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    deleteCaseFee(b);
  },true);
  document.addEventListener('pointerup',function(e){
    const b=e.target.closest&&e.target.closest('[data-delete-case-fee]');
    if(!b)return;
    e.preventDefault();
    e.stopImmediatePropagation();
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
