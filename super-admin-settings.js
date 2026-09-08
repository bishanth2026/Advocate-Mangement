/* Super Admin settings — demo/localStorage stage. Production credentials must move to Supabase Auth. */
(function(){
  'use strict';
  const KEY='advocateDeskSuperAdmin';
  const DEFAULT={email:'superadmin@advocatedesk.local',password:'demo123',name:'System Owner'};
  function get(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(x&&x.email&&x.password)return x}catch(e){}localStorage.setItem(KEY,JSON.stringify(DEFAULT));return {...DEFAULT}}
  function save(x){localStorage.setItem(KEY,JSON.stringify(x))}
  function isSuper(){const a=window.ADAuth&&ADAuth.get?ADAuth.get():null;return !!(a&&a.role==='super_admin')}
  function esc(v){return window.P1&&P1.esc?P1.esc(v):String(v==null?'':v).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})}
  function openModal(title,body){
    if(typeof p1OpenModal==='function')return p1OpenModal(title,body);
    if(typeof openModal==='function')return openModal('client');
  }
  function closeModal(){if(typeof p1CloseModal==='function')p1CloseModal()}
  function settings(){
    if(!isSuper())return;
    const a=get(),content=document.getElementById('content');if(!content)return;
    content.innerHTML=`<div class="page-title"><div><h1>Super Admin Settings</h1><p>Manage your platform-owner account and security preferences.</p></div></div>
      <div class="notice"><strong>Super Admin security</strong> — Your login credentials are separate from customer Admin accounts. Passwords are never displayed.</div>
      <div class="grid-2">
        <div class="panel"><div class="panel-head"><div><h3>Super Admin Account</h3><span class="muted">Update the username/email and password used for Super Admin login.</span></div></div>
          <div class="panel-body" style="padding:16px"><div class="form-grid">
            <div class="field"><label>Super Admin Name</label><input id="sas_name" value="${esc(a.name||'System Owner')}"></div>
            <div class="field"><label>Username / Email</label><input id="sas_email" type="email" autocomplete="username" value="${esc(a.email)}"></div>
            <div class="field"><label>Current Password</label><input id="sas_current" type="password" autocomplete="current-password"></div>
            <div class="field"><label>New Password</label><input id="sas_new" type="password" autocomplete="new-password" placeholder="Minimum 6 characters"></div>
            <div class="field"><label>Confirm New Password</label><input id="sas_confirm" type="password" autocomplete="new-password"></div>
          </div><div class="form-actions" style="margin-top:16px"><button class="primary" onclick="ADSuperSettings.saveAccount()">Save Account Changes</button></div></div>
        </div>
        <div class="panel"><div class="panel-head"><div><h3>Security</h3><span class="muted">Account protection</span></div></div><div class="panel-body" style="padding:16px">
          <p style="margin-top:0"><strong>Current login:</strong> ${esc(a.email)}</p>
          <p class="muted">Changing the username/email or password will update the next Super Admin login on this browser.</p>
          <p class="muted">This demo version stores the credential locally in this browser. Before commercial production use, move Super Admin authentication to Supabase Auth so credentials are not stored in browser localStorage.</p>
        </div></div>
      </div>`;
    setActive();
  }
  function setActive(){const w=document.getElementById('super-control-nav');if(!w)return;w.querySelectorAll('.nav-item').forEach(function(b){b.classList.toggle('super-nav-active',b.getAttribute('data-super-page')==='settings')})}
  function ensureNav(){
    if(!isSuper())return;
    const w=document.getElementById('super-control-nav');if(!w)return;
    let b=w.querySelector('[data-super-page="settings"]');
    if(!b){b=document.createElement('button');b.className='nav-item';b.setAttribute('data-super-page','settings');b.innerHTML='<span class="nav-icon">⚙</span><span>Settings</span>';w.appendChild(b)}
  }
  window.ADSuperSettings={settings,ensureNav,saveAccount:function(){
    if(!isSuper())return;
    const a=get(),name=document.getElementById('sas_name')?.value.trim(),email=document.getElementById('sas_email')?.value.trim().toLowerCase(),current=document.getElementById('sas_current')?.value||'',next=document.getElementById('sas_new')?.value||'',confirm=document.getElementById('sas_confirm')?.value||'';
    if(!name||!email)return alert('Please enter the Super Admin name and username/email.');
    if(current!==a.password)return alert('Current password is incorrect.');
    if(next||confirm){if(next.length<6)return alert('New password must be at least 6 characters.');if(next!==confirm)return alert('New password and confirmation do not match.');a.password=next}
    a.name=name;a.email=email;save(a);
    const session=ADAuth.get();if(session){session.name=name;session.email=email;localStorage.setItem('advocateDeskAuth',JSON.stringify(session))}
    alert('Super Admin account updated successfully.');settings();
  }};
  function boot(){
    if(!isSuper())return;
    const wait=function(){if(window.ADSuper&&ADSuper.go){ensureNav();const w=document.getElementById('super-control-nav');if(w&&!w.getAttribute('data-settings-ready')){w.setAttribute('data-settings-ready','1');w.addEventListener('click',function(e){const b=e.target.closest&&e.target.closest('[data-super-page="settings"]');if(b&&isSuper()){e.preventDefault();e.stopPropagation();settings()}})}}};
    wait();setTimeout(wait,250);setTimeout(wait,700);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
