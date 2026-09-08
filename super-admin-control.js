/* Super Admin control plane. Keeps Super Admin separate from the customer law-office workspace. */
(function(){
  'use strict';
  const KEY='advocateDeskAdmins';
  const seed=[{id:'ADM-001',name:'Advocate Admin',email:'admin@advocatedesk.local',password:'demo123',organization:'Demo Law Office',status:'Active'}];
  function list(){let a;try{a=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){a=null}if(!Array.isArray(a)||!a.length){a=JSON.parse(JSON.stringify(seed));localStorage.setItem(KEY,JSON.stringify(a))}return a}
  function save(a){localStorage.setItem(KEY,JSON.stringify(a))}
  function isSuper(){const a=window.ADAuth&&ADAuth.get?ADAuth.get():null;return !!(a&&a.role==='super_admin')}
  function esc(v){return window.P1&&P1.esc?P1.esc(v):String(v==null?'':v).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})}
  function ensureNav(){
    if(!isSuper())return;
    const sidebar=document.querySelector('.sidebar');
    if(!sidebar)return;
    sidebar.style.overflowY='auto';sidebar.style.overflowX='hidden';
    document.querySelectorAll('#nav .nav-item, .sidebar-bottom .nav-item').forEach(function(el){el.style.display='none'});
    let wrap=document.getElementById('super-control-nav');
    if(!wrap){
      wrap=document.createElement('div');wrap.id='super-control-nav';
      wrap.innerHTML='<button class="nav-item super-nav-active" data-super-page="overview"><span class="nav-icon">⌂</span><span>Overview</span></button><button class="nav-item" data-super-page="organizations"><span class="nav-icon">▦</span><span>Organizations</span></button><button class="nav-item" data-super-page="admins"><span class="nav-icon">⚙</span><span>Admin Accounts</span></button>';
      const nav=document.querySelector('#nav');
      if(nav)nav.insertAdjacentElement('afterend',wrap);
    }
    wrap.querySelectorAll('.nav-item').forEach(function(b){b.style.display='flex'});
    const bottom=document.querySelector('.sidebar-bottom');
    if(bottom){const profile=bottom.querySelector('.profile-mini');if(profile)profile.style.display='flex'}
  }
  function shell(title,sub,body){
    return `<div class="page-title"><div><h1>${title}</h1><p>${sub}</p></div></div>${body}`;
  }
  function overview(){
    ensureNav();
    const a=list(), active=a.filter(x=>x.status==='Active').length, disabled=a.filter(x=>x.status!=='Active').length;
    const orgs=[...new Set(a.map(x=>String(x.organization||'').trim()).filter(Boolean))];
    const content=document.getElementById('content');if(!content)return;
    content.innerHTML=shell('Super Admin Control','Central platform overview — customer law-office workspaces are kept separate.',`
      <div class="notice"><strong>Super Admin mode</strong> — You are in the platform control area. Customer cases, clients, hearings, documents and finance are not shown here.</div>
      <div class="cards">
        <div class="stat"><div class="stat-top">Organizations</div><div class="stat-value">${orgs.length}</div><div class="stat-foot">Law offices managed</div></div>
        <div class="stat"><div class="stat-top">Admin Accounts</div><div class="stat-value">${a.length}</div><div class="stat-foot">Administrator accounts</div></div>
        <div class="stat"><div class="stat-top">Active Admins</div><div class="stat-value">${active}</div><div class="stat-foot">Currently enabled</div></div>
        <div class="stat"><div class="stat-top">Disabled Accounts</div><div class="stat-value">${disabled}</div><div class="stat-foot">Access disabled</div></div>
      </div>
      <div class="grid-2">
        <div class="panel"><div class="panel-head"><div><h3>Central Control</h3><span class="muted">Manage platform access without entering a customer's workspace.</span></div></div><div class="panel-body" style="padding:14px"><div class="quick-grid"><button class="quick" onclick="ADSuper.go('organizations')"><strong>▦ Organizations</strong><small>View law offices assigned to Admin accounts</small></button><button class="quick" onclick="ADSuper.go('admins')"><strong>⚙ Admin Accounts</strong><small>Create, edit, enable, disable and reset access</small></button></div></div></div>
        <div class="panel"><div class="panel-head"><div><h3>Platform Access</h3><span class="muted">Security boundary</span></div></div><div class="panel-body" style="padding:14px"><p style="margin:0 0 8px">Super Admin controls the platform and customer Admin access.</p><p class="muted" style="margin:0">Customer case and finance data remains inside the Admin workspace. Production authentication and organization isolation will be enforced with Supabase Auth and RLS.</p></div></div>
      </div>`);
    setActive('overview');
  }
  function organizations(){
    ensureNav();
    const a=list(), map={};a.forEach(x=>{const o=String(x.organization||'Unassigned').trim()||'Unassigned';if(!map[o])map[o]={name:o,total:0,active:0};map[o].total++;if(x.status==='Active')map[o].active++});
    const rows=Object.values(map).map(o=>`<tr><td><strong>${esc(o.name)}</strong></td><td>${o.total}</td><td>${o.active}</td><td>${o.total-o.active}</td></tr>`).join('');
    const content=document.getElementById('content');if(!content)return;
    content.innerHTML=shell('Organizations','Law offices represented by the Admin accounts on this browser.',`<div class="notice">Organization assignment is managed from Admin Accounts. Full cloud organization management will be connected with Supabase.</div><div class="panel"><div class="panel-head"><div><h3>Law Offices</h3><span class="muted">Overview of current Admin assignments</span></div><button class="secondary" onclick="ADSuper.go('admins')">Manage Admins</button></div><div class="p1-fee-table-wrap"><table><thead><tr><th>Law Office / Organization</th><th>Total Admins</th><th>Active</th><th>Disabled</th></tr></thead><tbody>${rows||'<tr><td colspan="4">No organizations yet.</td></tr>'}</tbody></table></div></div>`);
    setActive('organizations');
  }
  function admins(){
    ensureNav();
    const a=list();
    const content=document.getElementById('content');if(!content)return;
    content.innerHTML=shell('Admin Accounts','Control administrator access for each customer law office.',`<div class="notice">Only Super Admin can create, edit, disable, enable or reset Admin accounts. Passwords are never displayed.</div><div class="panel"><div class="panel-head"><div><h3>Administrators</h3><span class="muted">Manage law-office administrator access.</span></div><button class="primary" onclick="adAdminAdd()">＋ Create Admin</button></div><div class="p1-fee-table-wrap"><table><thead><tr><th>Admin</th><th>Email / Username</th><th>Law Office</th><th>Status</th><th>Actions</th></tr></thead><tbody>${a.map((x,i)=>`<tr><td><strong>${esc(x.name)}</strong></td><td>${esc(x.email)}</td><td>${esc(x.organization||'—')}</td><td><span class="badge ${x.status==='Active'?'green':'red'}">${esc(x.status)}</span></td><td><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="secondary" onclick="adAdminEdit(${i})">Edit</button><button class="secondary" onclick="adAdminToggle(${i})">${x.status==='Active'?'Disable':'Enable'}</button><button class="secondary" onclick="adAdminReset(${i})">Reset Password</button></div></td></tr>`).join('')}</tbody></table></div></div>`);
    setActive('admins');
  }
  function setActive(page){const w=document.getElementById('super-control-nav');if(!w)return;w.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('super-nav-active',b.getAttribute('data-super-page')===page))}
  function go(page){if(!isSuper())return;if(page==='organizations')organizations();else if(page==='admins')admins();else overview()}
  function modal(title,body){if(typeof p1OpenModal==='function')p1OpenModal(title,body);else if(typeof openModal==='function')openModal('client')}
  window.adAdminAdd=function(){modal('Create Admin',`<div class="form-grid"><div class="field"><label>Admin Name</label><input id="ada_name"></div><div class="field"><label>Email / Username</label><input id="ada_email" type="email"></div><div class="field"><label>Organization / Law Office</label><input id="ada_org" value="Demo Law Office"></div><div class="field"><label>Temporary Password</label><input id="ada_pass" type="password"></div></div><div class="form-actions"><button class="primary" onclick="adAdminSaveNew()">Create Admin</button></div>`)};
  window.adAdminSaveNew=function(){const name=document.getElementById('ada_name')?.value.trim(),email=document.getElementById('ada_email')?.value.trim().toLowerCase(),org=document.getElementById('ada_org')?.value.trim(),password=document.getElementById('ada_pass')?.value;if(!name||!email||!org||!password)return alert('Please complete all fields.');if(password.length<4)return alert('Password must be at least 4 characters.');const a=list();if(a.some(x=>String(x.email||'').toLowerCase()===email))return alert('An Admin with this email already exists.');a.push({id:'ADM-'+String(Date.now()).slice(-8),name,email,password,organization:org,status:'Active'});save(a);if(typeof p1CloseModal==='function')p1CloseModal();admins()};
  window.adAdminEdit=function(i){const x=list()[i];if(!x)return;modal('Edit Admin',`<div class="form-grid"><div class="field"><label>Admin Name</label><input id="ade_name" value="${esc(x.name)}"></div><div class="field"><label>Email / Username</label><input id="ade_email" type="email" value="${esc(x.email)}"></div><div class="field"><label>Organization / Law Office</label><input id="ade_org" value="${esc(x.organization||'')}"></div></div><div class="form-actions"><button class="primary" onclick="adAdminSaveEdit(${i})">Save Changes</button></div>`)};
  window.adAdminSaveEdit=function(i){const a=list(),x=a[i];if(!x)return;const name=document.getElementById('ade_name')?.value.trim(),email=document.getElementById('ade_email')?.value.trim().toLowerCase(),org=document.getElementById('ade_org')?.value.trim();if(!name||!email||!org)return alert('Please complete all fields.');if(a.some((z,j)=>j!==i&&String(z.email||'').toLowerCase()===email))return alert('Another Admin already uses this email.');a[i]={...x,name,email,organization:org};save(a);if(typeof p1CloseModal==='function')p1CloseModal();admins()};
  window.adAdminToggle=function(i){const a=list(),x=a[i];if(!x)return;const next=x.status==='Active'?'Disabled':'Active';if(!confirm(next==='Disabled'?'Disable this Admin login?':'Enable this Admin login?'))return;x.status=next;save(a);admins()};
  window.adAdminReset=function(i){const a=list(),x=a[i];if(!x)return;const p=prompt('Enter the new password for '+x.email+':');if(p===null)return;if(!p.trim()||p.trim().length<4)return alert('Password must be at least 4 characters.');x.password=p.trim();save(a);alert('Admin password reset successfully.')};
  window.ADSuper={go,overview,organizations,admins,list,save};
  function boot(){
    if(!isSuper())return;
    list();ensureNav();
    const sidebar=document.querySelector('.sidebar');
    if(sidebar){sidebar.style.overflowY='auto';sidebar.style.overflowX='hidden'}
    const navHandler=function(e){const n=e.target.closest&&e.target.closest('#super-control-nav .nav-item');if(n&&isSuper()){e.preventDefault();e.stopImmediatePropagation();go(n.getAttribute('data-super-page'))}};
    document.addEventListener('click',navHandler,true);
    setTimeout(function(){ensureNav();overview()},150);
    setTimeout(ensureNav,600);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
