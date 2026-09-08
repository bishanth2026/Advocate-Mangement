/* Super Admin -> Admin account control (demo/localStorage phase). */
(function(){
  const KEY='advocateDeskAdmins';
  const seed=[{id:'ADM-001',name:'Advocate Admin',email:'admin@advocatedesk.local',password:'demo123',organization:'Demo Law Office',status:'Active'}];
  function list(){let a;try{a=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){a=null}if(!Array.isArray(a)||!a.length){a=JSON.parse(JSON.stringify(seed));localStorage.setItem(KEY,JSON.stringify(a))}return a}
  function save(a){localStorage.setItem(KEY,JSON.stringify(a))}
  function esc(v){return P1.esc(v)}
  function render(){
    const auth=ADAuth.get();
    if(!auth||auth.role!=='super_admin'){alert('Super Admin access required.');return}
    const a=list();
    P1.nav('central-control');
    P1.content().innerHTML=P1.layout('Admin Accounts','Super Admin control of administrator login accounts',`<button class="primary" onclick="adAdminAdd()">＋ Create Admin</button>`)+
      `<div class="notice">Only Super Admin can create, edit, disable, enable or reset Admin accounts. Changes apply to the Admin login on this browser.</div>`+
      `<div class="panel"><div class="panel-head"><div><h3>Administrators</h3><span class="muted">Manage law-office administrator access.</span></div></div><div class="p1-fee-table-wrap"><table><thead><tr><th>Admin</th><th>Email</th><th>Organization</th><th>Status</th><th>Actions</th></tr></thead><tbody>${a.map((x,i)=>`<tr><td><strong>${esc(x.name)}</strong><br><span class="muted">${esc(x.id)}</span></td><td>${esc(x.email)}</td><td>${esc(x.organization||'—')}</td><td><span class="badge ${x.status==='Active'?'green':'red'}">${esc(x.status)}</span></td><td><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="secondary" onclick="adAdminEdit(${i})">Edit</button><button class="secondary" onclick="adAdminToggle(${i})">${x.status==='Active'?'Disable':'Enable'}</button><button class="secondary" onclick="adAdminReset(${i})">Reset Password</button></div></td></tr>`).join('')}</tbody></table></div></div>`;
  }
  function modal(title,body){p1OpenModal(title,body)}
  window.adAdminAdd=function(){modal('Create Admin',`<div class="form-grid"><div class="field"><label>Admin Name</label><input id="ada_name"></div><div class="field"><label>Email</label><input id="ada_email" type="email"></div><div class="field"><label>Organization / Law Office</label><input id="ada_org" value="Demo Law Office"></div><div class="field"><label>Temporary Password</label><input id="ada_pass" type="password" value="demo123"></div></div><div class="form-actions"><button class="primary" onclick="adAdminSaveNew()">Create Admin</button></div>`)};
  window.adAdminSaveNew=function(){const name=ada_name.value.trim(),email=ada_email.value.trim().toLowerCase(),org=ada_org.value.trim(),password=ada_pass.value;if(!name||!email||!org||!password)return alert('Please complete all fields.');const a=list();if(a.some(x=>x.email.toLowerCase()===email))return alert('An Admin with this email already exists.');a.push({id:'ADM-'+String(Date.now()).slice(-8),name,email,password,organization:org,status:'Active'});save(a);p1CloseModal();render()};
  window.adAdminEdit=function(i){const x=list()[i];if(!x)return;modal('Edit Admin',`<div class="form-grid"><div class="field"><label>Admin Name</label><input id="ade_name" value="${esc(x.name)}"></div><div class="field"><label>Email</label><input id="ade_email" type="email" value="${esc(x.email)}"></div><div class="field"><label>Organization / Law Office</label><input id="ade_org" value="${esc(x.organization||'')}"></div></div><div class="form-actions"><button class="primary" onclick="adAdminSaveEdit(${i})">Save Changes</button></div>`)};
  window.adAdminSaveEdit=function(i){const a=list(),x=a[i];if(!x)return;const name=ade_name.value.trim(),email=ade_email.value.trim().toLowerCase(),org=ade_org.value.trim();if(!name||!email||!org)return alert('Please complete all fields.');if(a.some((z,j)=>j!==i&&z.email.toLowerCase()===email))return alert('Another Admin already uses this email.');a[i]={...x,name,email,organization:org};save(a);p1CloseModal();render()};
  window.adAdminToggle=function(i){const a=list(),x=a[i];if(!x)return;const next=x.status==='Active'?'Disabled':'Active';if(!confirm(next==='Disabled'?'Disable this Admin login?':'Enable this Admin login?'))return;x.status=next;save(a);render()};
  window.adAdminReset=function(i){const a=list(),x=a[i];if(!x)return;const p=prompt('Enter the new password for '+x.email+':','demo123');if(p===null)return;if(!p.trim())return alert('Password cannot be empty.');x.password=p;save(a);alert('Admin password reset successfully.')};
  window.ADAdminControl={list,save,render};
  function boot(){list();document.addEventListener('click',function(e){const n=e.target.closest&&e.target.closest('.nav-item[data-page="central-control"]');if(n&&ADAuth.get()?.role==='super_admin'){e.preventDefault();e.stopImmediatePropagation();render()}} ,true)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();