const seed = {
  cases:[
    {id:"CS-2026-001",number:"OS 145/2026",title:"Rahman v. State",client:"Abdul Rahman",court:"District Court, Kozhikode",next:"2026-09-08",status:"Active",type:"Civil"},
    {id:"CS-2026-002",number:"CC 88/2026",title:"Fathima v. Kareem",client:"Fathima P.",court:"JMFC Court II",next:"2026-09-10",status:"Pending",type:"Criminal"},
    {id:"CS-2026-003",number:"WP 422/2026",title:"ABC Traders v. State",client:"ABC Traders",court:"High Court of Kerala",next:"2026-09-15",status:"Active",type:"Writ"},
    {id:"CS-2026-004",number:"OP 71/2025",title:"Shameer v. Amina",client:"Shameer K.",court:"Family Court",next:"2026-09-18",status:"Reserved",type:"Family"}
  ],
  clients:[
    {id:"CL-001",name:"Abdul Rahman",phone:"9876543210",email:"rahman@example.com",cases:2,status:"Active"},
    {id:"CL-002",name:"Fathima P.",phone:"9895001122",email:"fathima@example.com",cases:1,status:"Active"},
    {id:"CL-003",name:"ABC Traders",phone:"9847002211",email:"office@abctraders.example",cases:1,status:"Active"},
    {id:"CL-004",name:"Shameer K.",phone:"9961007788",email:"shameer@example.com",cases:1,status:"Active"}
  ],
  hearings:[
    {date:"2026-09-08",time:"10:30 AM",case:"OS 145/2026",title:"Rahman v. State",court:"District Court, Kozhikode",stage:"Evidence"},
    {date:"2026-09-10",time:"11:00 AM",case:"CC 88/2026",title:"Fathima v. Kareem",court:"JMFC Court II",stage:"Arguments"},
    {date:"2026-09-15",time:"10:00 AM",case:"WP 422/2026",title:"ABC Traders v. State",court:"High Court of Kerala",stage:"Admission"},
    {date:"2026-09-18",time:"02:00 PM",case:"OP 71/2025",title:"Shameer v. Amina",court:"Family Court",stage:"Mediation"}
  ],
  tasks:[
    {title:"Prepare counter affidavit",case:"OS 145/2026",due:"2026-09-06",priority:"High",status:"In Progress"},
    {title:"Collect client documents",case:"CC 88/2026",due:"2026-09-07",priority:"Medium",status:"Pending"},
    {title:"Review writ petition",case:"WP 422/2026",due:"2026-09-11",priority:"High",status:"Pending"}
  ]
};
const state = JSON.parse(localStorage.getItem("advocateDeskData") || "null") || seed;
const save=()=>localStorage.setItem("advocateDeskData",JSON.stringify(state));
const fmtDate=d=>new Date(d+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
const badge=s=>`<span class="badge ${s==="Active"||s==="Completed"?"green":s==="High"||s==="Reserved"?"gold":s==="Pending"?"blue":"red"}">${s}</span>`;
const content=document.getElementById("content");

function layout(title,sub,action=""){return `<div class="page-title"><div><h1>${title}</h1><p>${sub}</p></div>${action?`<button class="primary" onclick="${action}">＋ New</button>`:""}</div>`}

function dashboard(){
  const upcoming=state.hearings.slice(0,4);
  content.innerHTML=layout("Good morning, Advocate","Thursday, 03 September 2026 • Demo Workspace",`openModal('case')`)+
  `<div class="dashboard-hero" role="img" aria-label="AdvocateDesk legal practice banner"></div>
  <div class="notice">Demo mode is active. Records are stored in this browser for now. Supabase will be connected in the next phase.</div>
  <div class="cards">
   <div class="stat"><div class="stat-top">Active Cases <span>⚖</span></div><div class="stat-value">${state.cases.filter(x=>x.status==="Active").length}</div><div class="stat-foot">Live case portfolio</div></div>
   <div class="stat"><div class="stat-top">Upcoming Hearings <span>◷</span></div><div class="stat-value">${state.hearings.length}</div><div class="stat-foot">Next 30 days</div></div>
   <div class="stat"><div class="stat-top">Clients <span>♙</span></div><div class="stat-value">${state.clients.length}</div><div class="stat-foot">Registered clients</div></div>
   <div class="stat"><div class="stat-top">Pending Tasks <span>✓</span></div><div class="stat-value">${state.tasks.filter(x=>x.status!=="Completed").length}</div><div class="stat-foot">Requires attention</div></div>
  </div>
  <div class="grid-2">
   <div class="panel"><div class="panel-head"><h3>Upcoming Hearings</h3><button class="secondary" onclick="navigate('hearings')">View all</button></div>
   <div class="list">${upcoming.map(h=>`<div class="list-row"><div class="date-box"><b>${new Date(h.date+"T00:00:00").getDate()}</b><small>${new Date(h.date+"T00:00:00").toLocaleString("en",{month:"short"})}</small></div><div class="list-main"><strong>${h.case} — ${h.title}</strong><small>${h.time} • ${h.court} • ${h.stage}</small></div></div>`).join("")}</div></div>
   <div class="panel"><div class="panel-head"><h3>Quick Actions</h3></div><div class="panel-body" style="padding:14px"><div class="quick-grid">
    <button class="quick" onclick="openModal('case')"><strong>＋ New Case</strong><small>Create a case file</small></button>
    <button class="quick" onclick="openModal('client')"><strong>＋ New Client</strong><small>Add client details</small></button>
    <button class="quick" onclick="openModal('hearing')"><strong>＋ Hearing</strong><small>Schedule hearing</small></button>
    <button class="quick" onclick="openModal('task')"><strong>＋ Task</strong><small>Assign follow-up</small></button>
   </div></div></div>
  </div>`;
}

function cases(){
 content.innerHTML=layout("Cases","Manage your complete case portfolio",`openModal('case')`)+
 `<div class="toolbar"><input class="filter" id="caseFilter" placeholder="Search case number, title or client..." oninput="filterTable('caseTable',this.value)"><select class="filter"><option>All Statuses</option><option>Active</option><option>Pending</option><option>Reserved</option></select></div>
 <div class="panel"><table id="caseTable"><thead><tr><th>Case</th><th>Client</th><th>Court</th><th>Next Hearing</th><th>Status</th></tr></thead><tbody>${state.cases.map(c=>`<tr><td><span class="case-link">${c.number}</span><br><span class="muted">${c.title}</span></td><td>${c.client}</td><td>${c.court}</td><td>${fmtDate(c.next)}</td><td>${badge(c.status)}</td></tr>`).join("")}</tbody></table></div>`;
}
function clients(){
 content.innerHTML=layout("Clients","Client directory and case relationships",`openModal('client')`)+
 `<div class="toolbar"><input class="filter" placeholder="Search clients..." oninput="filterTable('clientTable',this.value)"></div><div class="panel"><table id="clientTable"><thead><tr><th>Client</th><th>Phone</th><th>Email</th><th>Cases</th><th>Status</th></tr></thead><tbody>${state.clients.map(c=>`<tr><td><strong>${c.name}</strong><br><span class="muted">${c.id}</span></td><td>${c.phone}</td><td>${c.email}</td><td>${c.cases}</td><td>${badge(c.status)}</td></tr>`).join("")}</tbody></table></div>`;
}
function hearings(){
 content.innerHTML=layout("Hearings","Upcoming court dates and proceedings",`openModal('hearing')`)+
 `<div class="panel"><table><thead><tr><th>Date</th><th>Time</th><th>Case</th><th>Court</th><th>Stage</th></tr></thead><tbody>${state.hearings.map(h=>`<tr><td><strong>${fmtDate(h.date)}</strong></td><td>${h.time}</td><td><strong>${h.case}</strong><br><span class="muted">${h.title}</span></td><td>${h.court}</td><td>${badge(h.stage)}</td></tr>`).join("")}</tbody></table></div>`;
}
function calendar(){
 content.innerHTML=layout("Calendar","Court hearings, appointments and deadlines")+`<div class="panel"><div class="panel-head"><h3>September 2026</h3><span>Monthly view</span></div><div class="list">${state.hearings.map(h=>`<div class="list-row"><div class="date-box"><b>${new Date(h.date+"T00:00:00").getDate()}</b><small>SEP</small></div><div class="list-main"><strong>${h.title}</strong><small>${h.time} • ${h.court} • ${h.case}</small></div><div>${badge(h.stage)}</div></div>`).join("")}</div></div>`;
}
function documents(){
 content.innerHTML=layout("Documents","Digital case files and document workspace",`openModal('document')`)+
 `<div class="cards"><div class="stat"><div class="stat-top">Case Documents</div><div class="stat-value">0</div><div class="stat-foot">Ready for Supabase Storage</div></div><div class="stat"><div class="stat-top">Templates</div><div class="stat-value">6</div><div class="stat-foot">Starter templates</div></div></div><div class="panel"><div class="empty">No documents in demo mode yet.<br>Document upload and secure storage will be connected after Supabase setup.</div></div>`;
}
function tasks(){
 content.innerHTML=layout("Tasks","Work assigned across your practice",`openModal('task')`)+
 `<div class="panel"><table><thead><tr><th>Task</th><th>Case</th><th>Due</th><th>Priority</th><th>Status</th></tr></thead><tbody>${state.tasks.map(t=>`<tr><td><strong>${t.title}</strong></td><td>${t.case}</td><td>${fmtDate(t.due)}</td><td>${badge(t.priority)}</td><td>${badge(t.status)}</td></tr>`).join("")}</tbody></table></div>`;
}
function finance(){
 content.innerHTML=layout("Finance","Fees, payments, expenses and client ledgers")+`<div class="cards"><div class="stat"><div class="stat-top">Fees Received</div><div class="stat-value">₹0</div><div class="stat-foot">Demo data</div></div><div class="stat"><div class="stat-top">Outstanding</div><div class="stat-value">₹0</div><div class="stat-foot">Demo data</div></div><div class="stat"><div class="stat-top">Expenses</div><div class="stat-value">₹0</div><div class="stat-foot">Demo data</div></div><div class="stat"><div class="stat-top">Net Income</div><div class="stat-value">₹0</div><div class="stat-foot">Demo data</div></div></div><div class="panel"><div class="empty">Financial transactions will be enabled in the next build phase.</div></div>`;
}
function reports(){
 content.innerHTML=layout("Reports","Practice performance and operational reports")+`<div class="quick-grid"><button class="quick"><strong>Case Report</strong><small>Active, pending and disposed cases</small></button><button class="quick"><strong>Hearing Report</strong><small>Upcoming and completed hearings</small></button><button class="quick"><strong>Client Report</strong><small>Client-wise case activity</small></button><button class="quick"><strong>Financial Report</strong><small>Fees, expenses and balances</small></button></div>`;
}
function settings(){
 content.innerHTML=layout("Settings","Workspace, profile and application settings")+`<div class="grid-2"><div class="panel"><div class="panel-head"><h3>Workspace</h3></div><div style="padding:18px"><div class="field"><label>Law Office / Practice Name</label><input value="AdvocateDesk Demo Office"></div><br><div class="field"><label>Default Court</label><input value="District Court, Kozhikode"></div></div></div><div class="panel"><div class="panel-head"><h3>Next Phase</h3></div><div style="padding:18px;font-size:12px;color:#667085;line-height:1.7">Supabase authentication, PostgreSQL records, role permissions, secure document storage and audit logs will be connected after the GitHub frontend is approved.</div></div></div>`;
}
const pages={dashboard,cases,clients,hearings,calendar,documents,tasks,finance,reports,settings};
function navigate(page){document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));pages[page]();document.querySelector(".sidebar").classList.remove("open")}
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.page)));
document.getElementById("mobileMenu").onclick=()=>document.querySelector(".sidebar").classList.toggle("open");
document.getElementById("modalClose").onclick=()=>document.getElementById("modal").classList.add("hidden");
document.getElementById("globalSearch").addEventListener("keydown",e=>{if(e.key==="Enter"){navigate("cases");document.getElementById("caseFilter").value=e.target.value;filterTable("caseTable",e.target.value)}});

function filterTable(id,q){q=q.toLowerCase();document.querySelectorAll(`#${id} tbody tr`).forEach(r=>r.style.display=r.innerText.toLowerCase().includes(q)?"":"none")}
function openModal(type){
 const titles={case:"Create New Case",client:"Create New Client",hearing:"Schedule Hearing",task:"Create Task",document:"Add Document"};
 document.getElementById("modalTitle").textContent=titles[type];
 const forms={
 case:`<div class="form-grid"><div class="field"><label>Case Number</label><input id="f1" placeholder="OS 123/2026"></div><div class="field"><label>Case Title</label><input id="f2" placeholder="Party v. Party"></div><div class="field"><label>Client</label><select id="f3"><option value="">Select a client</option>${state.clients.map(c=>`<option value="${c.id}">${c.name} (${c.id})</option>`).join("")}</select></div><div class="field"><label>Court</label><input id="f4" placeholder="Court name"></div><div class="field"><label>Next Hearing</label><input id="f5" type="date"></div><div class="field"><label>Case Type</label><select id="f6"><option>Civil</option><option>Criminal</option><option>Writ</option><option>Family</option></select></div></div><div class="form-actions"><button class="secondary" onclick="closeModal()">Cancel</button><button class="primary" onclick="addRecord('case')">Save Case</button></div>`,
 client:`<div class="form-grid"><div class="field"><label>Client Name</label><input id="f1"></div><div class="field"><label>Phone</label><input id="f2"></div><div class="field"><label>Email</label><input id="f3"></div><div class="field"><label>Status</label><select id="f4"><option>Active</option><option>Inactive</option></select></div></div><div class="form-actions"><button class="secondary" onclick="closeModal()">Cancel</button><button class="primary" onclick="addRecord('client')">Save Client</button></div>`,
 hearing:`<div class="form-grid"><div class="field"><label>Date</label><input id="f1" type="date"></div><div class="field"><label>Time</label><input id="f2" type="time"></div><div class="field"><label>Case Number</label><input id="f3"></div><div class="field"><label>Case Title</label><input id="f4"></div><div class="field full"><label>Court</label><input id="f5"></div><div class="field"><label>Stage</label><input id="f6" placeholder="Evidence / Arguments"></div></div><div class="form-actions"><button class="secondary" onclick="closeModal()">Cancel</button><button class="primary" onclick="addRecord('hearing')">Schedule</button></div>`,
 task:`<div class="form-grid"><div class="field full"><label>Task</label><input id="f1"></div><div class="field"><label>Case</label><input id="f2"></div><div class="field"><label>Due Date</label><input id="f3" type="date"></div><div class="field"><label>Priority</label><select id="f4"><option>High</option><option>Medium</option><option>Low</option></select></div></div><div class="form-actions"><button class="secondary" onclick="closeModal()">Cancel</button><button class="primary" onclick="addRecord('task')">Save Task</button></div>`,
 document:`<div class="field"><label>Document Name</label><input placeholder="e.g. Petition.pdf"><br><label>Case</label><input placeholder="Case number"><br><label>Category</label><select><option>Petition</option><option>Order</option><option>Evidence</option><option>Other</option></select></div><div class="notice" style="margin-top:14px">File upload will be connected to secure Supabase Storage in the next phase.</div><div class="form-actions"><button class="secondary" onclick="closeModal()">Close</button></div>`
 };
 document.getElementById("modalBody").innerHTML=forms[type];document.getElementById("modal").classList.remove("hidden");
}
function closeModal(){document.getElementById("modal").classList.add("hidden")}
function addRecord(type){
 if(type==="case"){
  const selectedClientId=document.getElementById("f3").value;
  const selectedClient=state.clients.find(c=>c.id===selectedClientId);
  if(!selectedClient){alert("Please select a client.");return}
  selectedClient.cases=(Number(selectedClient.cases)||0)+1;
  state.cases.unshift({id:"CS-"+Date.now(),number:document.getElementById("f1").value||"New Case",title:document.getElementById("f2").value||"Untitled",client:selectedClient.name,clientId:selectedClient.id,court:document.getElementById("f4").value||"—",next:document.getElementById("f5").value||"2026-09-30",status:"Active",type:document.getElementById("f6").value})
}
 if(type==="client"){state.clients.unshift({id:"CL-"+String(Date.now()).slice(-5),name:document.getElementById("f1").value||"New Client",phone:document.getElementById("f2").value||"—",email:document.getElementById("f3").value||"—",cases:0,status:document.getElementById("f4").value})}
 if(type==="hearing"){let tm=document.getElementById("f2").value||"10:00";state.hearings.push({date:document.getElementById("f1").value||"2026-09-30",time:tm,case:document.getElementById("f3").value||"New",title:document.getElementById("f4").value||"Hearing",court:document.getElementById("f5").value||"Court",stage:document.getElementById("f6").value||"Hearing"})}
 if(type==="task"){state.tasks.unshift({title:document.getElementById("f1").value||"New task",case:document.getElementById("f2").value||"—",due:document.getElementById("f3").value||"2026-09-30",priority:document.getElementById("f4").value,status:"Pending"})}
 save();closeModal();navigate(type==="case"?"cases":type==="client"?"clients":type==="hearing"?"hearings":"tasks")
}
navigate("dashboard");