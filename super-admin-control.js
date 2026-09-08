/* Super Admin -> Admin account control (demo/localStorage phase). */
(function(){
  'use strict';
  const KEY='advocateDeskAdmins';
  const seed=[{id:'ADM-001',name:'Advocate Admin',email:'admin@advocatedesk.local',password:'demo123',organization:'Demo Law Office',status:'Active'}];
  function list(){let a;try{a=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){a=null}if(!Array.isArray(a)||!a.length){a=JSON.parse(JSON.stringify(seed));localStorage.setItem(KEY,JSON.stringify(a))}return a}
  function save(a){localStorage.setItem(KEY,JSON.stringify(a))}
  function isSuper(){const a=ADAuth.get();return !!(a&&a.role==='super_admin')}
  function ensureNav(){
    if(!isSuper())return;
    const bottom=document.querySelector('.sidebar-bottom');
    if(!bottom)return;
    const sidebar=document.querySelector('.sidebar');
    if(sidebar){sidebar.style.overflowY='auto';sidebar.style.overflowX='hidden';}
    let btn=document.querySelector('.nav-item[data-page="central-control"]');
    if(!btn){
      btn=document.createElement('button');
      btn.className='nav-item admin-only';
      btn.setAttribute('data-page','central-control');
      btn.innerHTML='<span class="nav-icon">⚙</span><span>Central Control</span>';
      bottom.insertBefore(btn,bottom.querySelector('.profile-mini')||null);
    }
    btn.style.display='flex';btn.removeAttribute('hidden');btn.setAttribute('aria-label','Central Control');
  }
  function esc(v){return window.P1&&P1.esc?P1.esc(v):String(v==null?'':v).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})}
  function render(){
    if(!isSuper()){alert('Super Admin access required.');return}
    ensureNav();
    if(window.P1&&P1.nav)P1.nav('central-control');
    const content=document.getElementById('content');if(!content)return;
    const a=list();
    content.innerHTML=(window.P1&&P1.layout?P1.layout('Admin Accounts','Manage administrator access for your client law offices',`<button class="primary" onclick="adAdminAdd()">＋ Create Admin</button>`):`<div class="page-title"><div><h1>Admin Accounts</h1><p>Manage administrator access for your client law offices</p></div><button class="primary" onclick="adAdminAdd()">＋ Create Admin</button></div>`)+
      `<div class="notice">Super Admin can create, edit, enable, disable and reset Admin accounts. Passwords are never displayed.</div>`+
      `<div class="panel"><div class="panel-head"><div><h3>Administrators</h3><span class="muted">Only essential account information is shown here.</span></div></div><div class="p1-fee-table-wrap"><table><thead><tr><th>Admin</th><th>Email / Username</th><th>Law Office / Organization</th><th>Status</th><th>Actions</th></tr></thead><tbody>${a.map((x,i)=>`<tr><td><strong>${esc(x.name)}</strong></td><td>${esc(x.email)}</td><td>${esc(x.organization||'—')}</td><td><span class="badge ${x.status==='Active'?'green':'red'}">${esc(x.status)}</span></td><td><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="secondary" onclick="adAdminEdit(${i})">Edit</button><button class="secondary" onclick="adAdminToggle(${i})">${x.status==='Active'?'Disable':'Enable'}</button><button class="secondary" onclick="adAdminReset(${i})">Reset Password</button></div></td></tr>`).join('')}</tbody></table></div></div>`;
  }
  function modal(title,body){if(typeof p1OpenModal==='function')p1OpenModal(title,body);else if(typeof openModal==='function')openModal('client')}
  window.adAdminAdd=function(){modal('Create Admin',`<div class="form-grid"><div class="field"><label>Admin Name</label><input id="ada_name"></div><div class="field"><label>Email / Username</label><input id="ada_email" type="email"></div><div class="field"><label>Organization / Law Office</label><input id="ada_org" value="Demo Law Office"></div><div class="field"><label>Temporary Password</label><input id="ada_pass" type="password" value="demo123"></div></div><div class="form-actions"><button class="primary" onclick="adAdminSaveNew()">Create Admin</button></div>`)};
  window.adAdminSaveNew=function(){const name=document.getElementById('ada_name')?.value.trim(),email=document.getElementById('ada_email')?.value.trim().toLowerCase(),org=document.getElementById('ada_org')?.value.trim(),password=document.getElementById('ada_pass')?.value;if(!name||!email||!org||!password)return alert('Please complete all fields.');if(password.length<4)return alert('Password must be at least 4 characters.');const a=list();if(a.some(x=>String(x.email||'').toLowerCase()===email))return alert('An Admin with this email already exists.');a.push({id:'ADM-'+String(Date.now()).slice(-8),name,email,password,organization:org,status:'Active'});save(a);if(typeof p1CloseModal==='function')p1CloseModal();render()};
  window.adAdminEdit=function(i){const x=list()[i];if(!x)return;modal('Edit Admin',`<div class="form-grid"><div class="field"><label>Admin Name</label><input id="ade_name" value="${esc(x.name)}"></div><div class="field"><label>Email / Username</label><input id="ade_email" type="email" value="${esc(x.email)}"></div><div class="field"><label>Organization / Law Office</label><input id="ade_org" value="${esc(x.organization||'')}"></div></div><div class="form-actions"><button class="primary" onclick="adAdminSaveEdit(${i})">Save Changes</button></div>`)};
  window.adAdminSaveEdit=function(i){const a=list(),x=a[i];if(!x)return;const name=document.getElementById('ade_name')?.value.trim(),email=document.getElementById('ade_email')?.value.trim().toLowerCase(),org=document.getElementById('ade_org')?.value.trim();if(!name||!email||!org)return alert('Please complete all fields.');if(a.some((z,j)=>j!==i&&String(z.email||'').toLowerCase()===email))return alert('Another Admin already uses this email.');a[i]={...x,name,email,organization:org};save(a);if(typeof p1CloseModal==='function')p1CloseModal();render()};
  window.adAdminToggle=function(i){const a=list(),x=a[i];if(!x)return;const next=x.status==='Active'?'Disabled':'Active';if(!confirm(next==='Disabled'?'Disable this Admin login?':'Enable this Admin login?'))return;x.status=next;save(a);render()};
  window.adAdminReset=function(i){const a=list(),x=a[i];if(!x)return;const p=prompt('Enter the new password for '+x.email+':','');if(p===null)return;if(!p.trim()||p.trim().length<4)return alert('Password must be at least 4 characters.');x.password=p.trim();save(a);alert('Admin password reset successfully.')};
  window.ADAdminControl={list,save,render};
  function boot(){
    if(!isSuper())return;
    list();ensureNav();
    document.addEventListener('click',function(e){const n=e.target.closest&&e.target.closest('.nav-item[data-page="central-control"]');if(n&&isSuper()){e.preventDefault();e.stopImmediatePropagation();render()}},true);
    setTimeout(ensureNav,100);setTimeout(ensureNav,500);
    if(location.hash==='#central-control')setTimeout(render,100);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();