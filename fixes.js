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
