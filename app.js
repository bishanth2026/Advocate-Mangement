const auth=ADAuth.require();
if(!auth){throw new Error('Authentication required');}
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
document.title=(auth.role==="super_admin"?"Super Admin":"Admin")+" — AdvocateDesk";
document.querySelector(".profile-mini strong").textContent=auth.name;
document.querySelector(".profile-mini small").textContent=auth.role==="super_admin"?"Super Administrator":"Office Administrator";
document.querySelector(".user-chip").innerHTML=`${auth.role==="super_admin"?"👑":"A"} <span>${auth.name}</span> ▾`;
if(auth.role!=="super_admin"){document.querySelectorAll(".admin-only").forEach(el=>el.remove())}


function layout(title,sub,action=""){return `<div class="page-title"><div><h1>${title}</h1><p>${sub}</p></div>${action?`<button class="primary" onclick="${action}">＋ New</button>`:""}</div>`}

function dashboard(){
  const upcoming=state.hearings.slice(0,4);
  content.innerHTML=layout("Good morning, Advocate","Thursday, 03 September 2026 • Demo Workspace",`openModal('case')`)+
  `<div class="dashboard-hero ${auth.role==="super_admin"?"super-admin-hero":""}" role="img" aria-label="AdvocateDesk ${auth.role==="super_admin"?"Super Admin":"legal practice"} banner"></div>
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
 <div class="panel"><table id="caseTable"><thead><tr><th>Case</th><th>Client</th><th>Court</th><th>Next Hearing</th><th>Status</th><th>Action</th></tr></thead><tbody>${state.cases.map((c,i)=>`<tr><td><span class="case-link">${c.number}</span><br><span class="muted">${c.title}</span></td><td>${c.client}</td><td>${c.court}</td><td>${fmtDate(c.next)}</td><td>${badge(c.status)}</td><td><button class="secondary" onclick="openEditModal('case',${i})">Edit</button></td></tr>`).join("")}</tbody></table></div>`;
}
function clients(){
 content.innerHTML=layout("Clients","Client directory and case relationships",`openModal('client')`)+
 `<div class="toolbar"><input class="filter" placeholder="Search clients..." oninput="filterTable('clientTable',this.value)"></div><div class="panel"><table id="clientTable"><thead><tr><th>Client</th><th>Phone</th><th>Email</th><th>Cases</th><th>Status</th><th>Action</th></tr></thead><tbody>${state.clients.map((c,i)=>`<tr><td><strong>${c.name}</strong><br><span class="muted">${c.id}</span></td><td>${c.phone}</td><td>${c.email}</td><td>${c.cases}</td><td>${badge(c.status)}</td><td><button class="secondary" onclick="openEditModal('client',${i})">Edit</button></td></tr>`).join("")}</tbody></table></div>`;
}
function getHearingClient(h){
  if(h.clientId){ return state.clients.find(c=>c.id===h.clientId) || null; }
  const relatedCase=state.cases.find(c=>c.number===h.case || c.id===h.case);
  if(!relatedCase) return null;
  return state.clients.find(c=>c.id===relatedCase.clientId || c.name===relatedCase.client) || null;
}
function normalizeWhatsApp(phone){
  let digits=String(phone||"").replace(/\D/g,"");
  if(digits.startsWith("00")) digits=digits.slice(2);
  if(digits.length===10 && /^[6-9]/.test(digits)) digits="91"+digits;
  return digits;
}
function hearingWhatsAppUrl(h){
  const client=getHearingClient(h);
  if(!client) return null;
  const number=normalizeWhatsApp(client.phone);
  if(!number) return null;
  const message=[
    `Dear ${client.name},`,
    ``,
    `This is a hearing reminder from AdvocateDesk.`,
    `Case: ${h.case}`,
    `Case Title: ${h.title}`,
    `Hearing Date: ${fmtDate(h.date)}`,
    `Hearing Time: ${h.time}`,
    `Court: ${h.court}`,
    `Stage: ${h.stage}`,
    ``,
    `Please contact the advocate's office for any further information.`
  ].join("\n");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
function sendHearingWhatsApp(index){
  const h=state.hearings[index];
  const client=getHearingClient(h);
  const url=hearingWhatsAppUrl(h);
  if(!client){alert("No client is linked to this hearing.");return;}
  if(!url){alert(`No valid WhatsApp/mobile number is available for ${client.name}. Please update the client phone number.`);return;}
  window.open(url,"_blank","noopener,noreferrer");
}
function hearings(){
 content.innerHTML=layout("Hearings","Upcoming court dates and proceedings",`openModal('hearing')`)+
 `<div class="panel"><table><thead><tr><th>Date</th><th>Time</th><th>Case</th><th>Client</th><th>Court</th><th>Stage</th><th>Action</th></tr></thead><tbody>${state.hearings.map((h,i)=>{const c=getHearingClient(h);return `<tr><td><strong>${fmtDate(h.date)}</strong></td><td>${h.time}</td><td><strong>${h.case}</strong><br><span class="muted">${h.title}</span></td><td>${c?c.name:"—"}</td><td>${h.court}</td><td>${badge(h.stage)}</td><td><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="secondary" onclick="openEditModal('hearing',${i})">Edit</button><button class="secondary" onclick="sendHearingWhatsApp(${i})">WhatsApp</button></div></td></tr>`}).join("")}</tbody></table></div>`;
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
 `<div class="panel"><table><thead><tr><th>Task</th><th>Case</th><th>Due</th><th>Priority</th><th>Status</th><th>Action</th></tr></thead><tbody>${state.tasks.map((t,i)=>`<tr><td><strong>${t.title}</strong></td><td>${t.case}</td><td>${fmtDate(t.due)}</td><td>${badge(t.priority)}</td><td>${badge(t.status)}</td><td><button class="secondary" onclick="openEditModal('task',${i})">Edit</button></td></tr>`).join("")}</tbody></table></div>`;
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
if(auth.role==="super_admin") pages["central-control"]=function(){
 content.innerHTML=layout("Central Control","System-wide administration across all organizations")+`<div class="admin-grid"><div class="admin-card admin-card-super"><div class="admin-card-icon">👑</div><div><h3>Super Admin</h3><p>Full platform-wide control across every organization and law office.</p></div><span class="role-badge">FULL CONTROL</span></div><div class="admin-card admin-card-admin"><div class="admin-card-icon">🛡️</div><div><h3>Admin</h3><p>Office-level control for authorized users, cases, clients and operations.</p></div><span class="role-badge">OFFICE CONTROL</span></div></div><div class="panel central-panel"><div class="panel-head"><div><h3>Organizations & Administrators</h3><span>Central account control</span></div><button class="primary" onclick="addAdminDemo()">＋ Create Admin</button></div><table><thead><tr><th>Organization</th><th>Administrator</th><th>Status</th><th>Access</th></tr></thead><tbody><tr><td><strong>Demo Law Office</strong></td><td>Advocate Admin</td><td>${badge("Active")}</td><td>Office management</td></tr></tbody></table></div><div class="admin-control-grid"><div class="control-tile"><strong>🏢 Organizations</strong><span>Create and manage law offices.</span></div><div class="control-tile"><strong>👥 Users & Roles</strong><span>Control Admin, Advocate, Clerk, Accountant and Staff access.</span></div><div class="control-tile"><strong>🔐 Security</strong><span>Global authentication and security policies.</span></div><div class="control-tile"><strong>📋 Audit Logs</strong><span>Review important administrator activity.</span></div><div class="control-tile"><strong>💾 Data Policies</strong><span>Manage backup and retention policies.</span></div><div class="control-tile"><strong>⚙ System Settings</strong><span>Configure global platform defaults.</span></div></div>`;
};
function navigate(page){if(!pages[page]) return;document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));pages[page]();document.querySelector(".sidebar").classList.remove("open")}
function addAdminDemo(){alert("Admin creation is a demo action now. Supabase will create the real account securely in the next phase.")}
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.page)));
document.getElementById("mobileMenu").onclick=()=>document.querySelector(".sidebar").classList.toggle("open");
document.getElementById("modalClose").onclick=()=>document.getElementById("modal").classList.add("hidden");
document.getElementById("globalSearch").addEventListener("keydown",e=>{if(e.key==="Enter"){navigate("cases");document.getElementById("caseFilter").value=e.target.value;filterTable("caseTable",e.target.value)}});

function filterTable(id,q){q=q.toLowerCase();document.querySelectorAll(`#${id} tbody tr`).forEach(r=>r.style.display=r.innerText.toLowerCase().includes(q)?"":"none")}
function openModal(type){
 const titles={case:"Create New Case",client:"Create New Client",hearing:"Schedule Hearing",task:"Create Task",document:"Add Document"};
 document.getElementById("modalTitle").textContent=titles[type];
 const forms={
 case:`<div class="form-grid"><div class="field"><label>Case Number</label><input id="f1" placeholder="OS 123/2026"></div><div class="field"><label>Case Title</label><input id="f2" placeholder="Party v. Party"></div><div class="field"><label>Client</label><select id="f3"><option value="">Select a client</option>${state.clients.map(c=>`<option value="${c.id}">${c.name} (${c.id})</option>`).join("")}</select></div><div class="field"><label>Court</label><input id="f4" placeholder="Court name"></div><div class="field"><label>Next Hearing</label><input id="f5" type="date"></div><div class="field"><label>Case Type</label><select id="f6"><option>Civil</option><option>Criminal</option><option>Writ</option><option>Family</option></select></div><div class="field"><label>Status</label><select id="f7"><option>Active</option><option>Pending</option><option>Reserved</option><option>Disposed</option></select></div></div><div class="form-actions"><button class="secondary" onclick="closeModal()">Cancel</button><button class="primary" onclick="addRecord('case')">Save Case</button></div>`,
 client:`<div class="form-grid"><div class="field"><label>Client Name</label><input id="f1"></div><div class="field"><label>Phone / WhatsApp</label><input id="f2"></div><div class="field"><label>Email</label><input id="f3"></div><div class="field"><label>Status</label><select id="f4"><option>Active</option><option>Inactive</option></select></div></div><div class="form-actions"><button class="secondary" onclick="closeModal()">Cancel</button><button class="primary" onclick="addRecord('client')">Save Client</button></div>`,
 hearing:`<div class="form-grid"><div class="field"><label>Date</label><input id="f1" type="date"></div><div class="field"><label>Time</label><input id="f2" type="time"></div><div class="field"><label>Case Number</label><select id="f3" onchange="syncHearingCase()"><option value="">Select a case</option>${state.cases.map(c=>`<option value="${c.id}">${c.number} — ${c.client}</option>`).join("")}</select></div><div class="field"><label>Case Title</label><input id="f4" readonly></div><div class="field"><label>Client</label><input id="fClient" readonly placeholder="Selected from case"></div><div class="field full"><label>Court</label><input id="f5" placeholder="Court name"></div><div class="field"><label>Stage</label><input id="f6" placeholder="Evidence / Arguments"></div></div><div class="notice" style="margin-top:14px">When you schedule this hearing, WhatsApp will open with the hearing details prepared for the selected client.</div><div class="form-actions"><button class="secondary" onclick="closeModal()">Cancel</button><button class="primary" onclick="addRecord('hearing')">Schedule & WhatsApp</button></div>`,
 task:`<div class="form-grid"><div class="field full"><label>Task</label><input id="f1"></div><div class="field"><label>Case</label><input id="f2"></div><div class="field"><label>Due Date</label><input id="f3" type="date"></div><div class="field"><label>Priority</label><select id="f4"><option>High</option><option>Medium</option><option>Low</option></select></div><div class="field"><label>Status</label><select id="f5"><option>Pending</option><option>In Progress</option><option>Completed</option></select></div></div><div class="form-actions"><button class="secondary" onclick="closeModal()">Cancel</button><button class="primary" onclick="addRecord('task')">Save Task</button></div>`,
 document:`<div class="field"><label>Document Name</label><input placeholder="e.g. Petition.pdf"><br><label>Case</label><input placeholder="Case number"><br><label>Category</label><select><option>Petition</option><option>Order</option><option>Evidence</option><option>Other</option></select></div><div class="notice" style="margin-top:14px">File upload will be connected to secure Supabase Storage in the next phase.</div><div class="form-actions"><button class="secondary" onclick="closeModal()">Close</button></div>`
 };
 document.getElementById("modalBody").innerHTML=forms[type];document.getElementById("modal").classList.remove("hidden");
}

function openEditModal(type,index){
 const item=state[type==='case'?'cases':type==='client'?'clients':type==='hearing'?'hearings':'tasks'][index];
 if(!item) return;
 document.getElementById("modalTitle").textContent=`Edit ${type.charAt(0).toUpperCase()+type.slice(1)}`;
 let form="";
 if(type==='client'){
  form=`<div class="form-grid"><div class="field"><label>Client Name</label><input id="f1" value="${esc(item.name)}"></div><div class="field"><label>Phone / WhatsApp</label><input id="f2" value="${esc(item.phone)}"></div><div class="field"><label>Email</label><input id="f3" value="${esc(item.email)}"></div><div class="field"><label>Status</label><select id="f4"><option ${item.status==='Active'?'selected':''}>Active</option><option ${item.status==='Inactive'?'selected':''}>Inactive</option></select></div></div>`;
 } else if(type==='case'){
  form=`<div class="form-grid"><div class="field"><label>Case Number</label><input id="f1" value="${esc(item.number)}"></div><div class="field"><label>Case Title</label><input id="f2" value="${esc(item.title)}"></div><div class="field"><label>Client</label><select id="f3">${state.clients.map(c=>`<option value="${esc(c.id)}" ${c.id===item.clientId?'selected':''}>${esc(c.name)} (${esc(c.id)})</option>`).join("")}</select></div><div class="field"><label>Court</label><input id="f4" value="${esc(item.court)}"></div><div class="field"><label>Next Hearing</label><input id="f5" type="date" value="${esc(item.next)}"></div><div class="field"><label>Case Type</label><select id="f6">${['Civil','Criminal','Writ','Family'].map(x=>`<option ${x===item.type?'selected':''}>${x}</option>`).join('')}</select></div><div class="field"><label>Status</label><select id="f7">${['Active','Pending','Reserved','Disposed'].map(x=>`<option ${x===item.status?'selected':''}>${x}</option>`).join('')}</select></div></div>`;
 } else if(type==='hearing'){
  const relatedCase=state.cases.find(c=>c.number===item.case || c.id===item.case || c.id===item.caseId);
  const caseId=relatedCase?relatedCase.id:'';
  form=`<div class="form-grid"><div class="field"><label>Date</label><input id="f1" type="date" value="${esc(item.date)}"></div><div class="field"><label>Time</label><input id="f2" type="text" value="${esc(item.time)}" placeholder="10:30 AM"></div><div class="field"><label>Case Number</label><select id="f3" onchange="syncHearingCase()"><option value="">Select a case</option>${state.cases.map(c=>`<option value="${esc(c.id)}" ${c.id===caseId?'selected':''}>${esc(c.number)} — ${esc(c.client)}</option>`).join("")}</select></div><div class="field"><label>Case Title</label><input id="f4" readonly value="${esc(item.title)}"></div><div class="field"><label>Client</label><input id="fClient" readonly></div><div class="field full"><label>Court</label><input id="f5" value="${esc(item.court)}"></div><div class="field"><label>Stage</label><input id="f6" value="${esc(item.stage)}"></div></div>`;
 } else if(type==='task'){
  form=`<div class="form-grid"><div class="field full"><label>Task</label><input id="f1" value="${esc(item.title)}"></div><div class="field"><label>Case</label><input id="f2" value="${esc(item.case)}"></div><div class="field"><label>Due Date</label><input id="f3" type="date" value="${esc(item.due)}"></div><div class="field"><label>Priority</label><select id="f4">${['High','Medium','Low'].map(x=>`<option ${x===item.priority?'selected':''}>${x}</option>`).join('')}</select></div><div class="field"><label>Status</label><select id="f5">${['Pending','In Progress','Completed'].map(x=>`<option ${x===item.status?'selected':''}>${x}</option>`).join('')}</select></div></div>`;
 }
 document.getElementById("modalBody").innerHTML=form+`<div class="form-actions"><button class="secondary" onclick="closeModal()">Cancel</button><button class="primary" onclick="updateRecord('${type}',${index})">Update ${type.charAt(0).toUpperCase()+type.slice(1)}</button></div>`;
 document.getElementById("modal").classList.remove("hidden");
 if(type==='hearing') syncHearingCase();
}
function esc(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function updateRecord(type,index){
 const key=type==='case'?'cases':type==='client'?'clients':type==='hearing'?'hearings':'tasks';
 const item=state[key][index];
 if(!item) return;
 if(type==='client'){
  const oldName=item.name; item.name=document.getElementById('f1').value.trim()||oldName; item.phone=document.getElementById('f2').value.trim()||'—'; item.email=document.getElementById('f3').value.trim()||'—'; item.status=document.getElementById('f4').value;
  state.cases.forEach(c=>{if(c.clientId===item.id || c.client===oldName){c.client=item.name;c.clientId=item.id;}});
 } else if(type==='case'){
  const oldNumber=item.number, oldClientId=item.clientId;
  const client=state.clients.find(c=>c.id===document.getElementById('f3').value); if(!client){alert('Please select a client.');return;}
  item.number=document.getElementById('f1').value.trim()||oldNumber; item.title=document.getElementById('f2').value.trim()||'Untitled'; item.client=client.name; item.clientId=client.id; item.court=document.getElementById('f4').value.trim()||'—'; item.next=document.getElementById('f5').value||item.next; item.type=document.getElementById('f6').value; item.status=document.getElementById('f7').value;
  if(oldNumber!==item.number){state.hearings.forEach(h=>{if(h.case===oldNumber) h.case=item.number;});state.tasks.forEach(t=>{if(t.case===oldNumber)t.case=item.number;});}
  state.clients.forEach(c=>{c.cases=state.cases.filter(x=>x.clientId===c.id || x.client===c.name).length;});
 } else if(type==='hearing'){
  const relatedCase=state.cases.find(c=>c.id===document.getElementById('f3').value); if(!relatedCase){alert('Please select a case.');return;}
  const client=getHearingClient({clientId:relatedCase.clientId,case:relatedCase.number}); if(!client){alert('The selected case is not linked to a client.');return;}
  item.date=document.getElementById('f1').value||item.date; item.time=document.getElementById('f2').value||item.time; item.case=relatedCase.number; item.title=relatedCase.title; item.court=document.getElementById('f5').value.trim()||relatedCase.court||'Court'; item.stage=document.getElementById('f6').value.trim()||'Hearing'; item.clientId=client.id;
 } else if(type==='task'){
  item.title=document.getElementById('f1').value.trim()||item.title; item.case=document.getElementById('f2').value.trim()||'—'; item.due=document.getElementById('f3').value||item.due; item.priority=document.getElementById('f4').value; item.status=document.getElementById('f5').value;
 }
 save(); closeModal(); navigate(type==='case'?'cases':type==='client'?'clients':type==='hearing'?'hearings':'tasks');
}
function syncHearingCase(){
  const select=document.getElementById("f3");
  const relatedCase=state.cases.find(c=>c.id===select.value);
  const title=document.getElementById("f4");
  const clientInput=document.getElementById("fClient");
  const court=document.getElementById("f5");
  if(!relatedCase){if(title)title.value="";if(clientInput)clientInput.value="";return;}
  const client=getHearingClient({clientId:relatedCase.clientId,case:relatedCase.number});
  if(title)title.value=relatedCase.title||"";
  if(clientInput)clientInput.value=client?`${client.name}${client.phone?` — ${client.phone}`:""}`:"No client linked";
  if(court && !court.value) court.value=relatedCase.court||"";
}
function closeModal(){document.getElementById("modal").classList.add("hidden")}
function addRecord(type){
 if(type==="case"){
  const selectedClientId=document.getElementById("f3").value;
  const selectedClient=state.clients.find(c=>c.id===selectedClientId);
  if(!selectedClient){alert("Please select a client.");return}
  selectedClient.cases=(Number(selectedClient.cases)||0)+1;
  state.cases.unshift({id:"CS-"+Date.now(),number:document.getElementById("f1").value||"New Case",title:document.getElementById("f2").value||"Untitled",client:selectedClient.name,clientId:selectedClient.id,court:document.getElementById("f4").value||"—",next:document.getElementById("f5").value||"2026-09-30",status:document.getElementById("f7")?.value||"Active",type:document.getElementById("f6").value})
}
 if(type==="client"){state.clients.unshift({id:"CL-"+String(Date.now()).slice(-5),name:document.getElementById("f1").value||"New Client",phone:document.getElementById("f2").value||"—",email:document.getElementById("f3").value||"—",cases:0,status:document.getElementById("f4").value})}
 if(type==="hearing"){
  const selectedCaseId=document.getElementById("f3").value;
  const relatedCase=state.cases.find(c=>c.id===selectedCaseId);
  if(!relatedCase){alert("Please select a case.");return;}
  const client=getHearingClient({clientId:relatedCase.clientId,case:relatedCase.number});
  if(!client){alert("The selected case is not linked to a client. Please check the case/client relationship.");return;}
  let tm=document.getElementById("f2").value||"10:00";
  const hearing={date:document.getElementById("f1").value||"2026-09-30",time:tm,case:relatedCase.number,title:document.getElementById("f4").value||relatedCase.title,court:document.getElementById("f5").value||relatedCase.court||"Court",stage:document.getElementById("f6").value||"Hearing",clientId:client.id};
  state.hearings.push(hearing);
  save();
  const url=hearingWhatsAppUrl(hearing);
  closeModal();
  navigate("hearings");
  if(url){window.open(url,"_blank","noopener,noreferrer");}
  else{alert(`Hearing saved, but ${client.name} does not have a valid WhatsApp/mobile number. Please update the client record.`);}
  return;
 }
 if(type==="task"){state.tasks.unshift({title:document.getElementById("f1").value||"New task",case:document.getElementById("f2").value||"—",due:document.getElementById("f3").value||"2026-09-30",priority:document.getElementById("f4").value,status:document.getElementById("f5")?.value||"Pending"})}
 save();closeModal();navigate(type==="case"?"cases":type==="client"?"clients":type==="hearing"?"hearings":"tasks")
}
navigate("dashboard");
// Central Control demo interactions. Supabase will enforce these permissions server-side later.
document.addEventListener("click", function(e){
  if(e.target && e.target.id==="add-admin-user"){
    const name=prompt("User name:");
    if(!name) return;
    const role=prompt("Role (Admin / Advocate / Clerk / Accountant / Staff):","Staff") || "Staff";
    const tbody=document.getElementById("admin-users-table");
    if(tbody){
      const tr=document.createElement("tr");
      tr.innerHTML=`<td>${name}</td><td><span class="role-badge">${role}</span></td><td>Main Office</td><td><span class="status-badge active">Active</span></td><td>Assigned by role</td>`;
      tbody.prepend(tr);
    }
  }
});

document.querySelector(".profile-mini").addEventListener("click",()=>ADAuth.logout());
document.querySelector(".user-chip").addEventListener("click",()=>ADAuth.logout());
