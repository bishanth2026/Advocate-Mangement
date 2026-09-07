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

// Mobile navigation fix: keep the existing sidebar design and make the
// existing mobile menu/overlay controls reliably open and close the sidebar.
(function(){
  function initMobileMenu(){
    const menu=document.getElementById("mobileMenu");
    const sidebar=document.querySelector(".sidebar");
    const overlay=document.getElementById("mobileOverlay");
    const nav=document.getElementById("nav");
    if(!menu||!sidebar)return;

    const isMobile=()=>window.matchMedia("(max-width:720px)").matches;
    const close=()=>{
      sidebar.classList.remove("open");
      if(overlay){overlay.classList.remove("open");overlay.setAttribute("aria-hidden","true");}
      document.body.classList.remove("menu-open");
    };
    const open=()=>{
      if(!isMobile())return;
      sidebar.classList.add("open");
      if(overlay){overlay.classList.add("open");overlay.setAttribute("aria-hidden","false");}
      document.body.classList.add("menu-open");
    };

    menu.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();sidebar.classList.contains("open")?close():open();});
    if(overlay)overlay.addEventListener("click",close);
    if(nav)nav.addEventListener("click",function(e){
      if(e.target.closest(".nav-item"))setTimeout(close,0);
    });
    document.addEventListener("keydown",function(e){if(e.key==="Escape")close();});
    window.addEventListener("resize",function(){if(!isMobile())close();});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initMobileMenu);
  else initMobileMenu();
})();
