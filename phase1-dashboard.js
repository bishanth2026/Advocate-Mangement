/* Stable dashboard enhancement layer. Prevents MutationObserver render loops. */
(function(){
  let scheduled=false;
  let observer=null;
  let patching=false;

  function isSuperAdmin(){
    try{return !!(window.ADAuth&&ADAuth.get&&ADAuth.get()?.role==='super_admin')}catch(e){return false}
  }
  function adminData(){
    let a=[];try{a=JSON.parse(localStorage.getItem('advocateDeskAdmins')||'[]')}catch(e){a=[]}
    if(!Array.isArray(a))a=[];
    const active=a.filter(x=>String(x&&x.status||'Active').trim().toLowerCase()==='active').length;
    return {total:a.length,active,disabled:Math.max(0,a.length-active),orgs:[...new Set(a.map(x=>String(x&&x.organization||'').trim()).filter(Boolean))].length};
  }
  function repairSuperAdminView(){
    if(!isSuperAdmin())return;
    const c=document.getElementById('content');if(!c)return;
    c.querySelector('#p1DashboardFeeCards')?.remove();
    c.querySelector('#p1DashboardFeeDetails')?.remove();
    const cards=c.querySelector('.cards');if(!cards)return;
    const stats=cards.querySelectorAll('.stat');if(stats.length<4)return;
    const d=adminData();
    const values=[d.orgs,d.total,d.active,d.disabled];
    const labels=['Organizations','Admin Accounts','Active Admins','Disabled Accounts'];
    const foot=['Law offices managed','Administrator accounts · View all','Currently enabled · View all','Access disabled · View all'];
    stats.forEach(function(card,i){
      if(i>3)return;
      const top=card.querySelector('.stat-top'),val=card.querySelector('.stat-value'),ft=card.querySelector('.stat-foot');
      if(top&&top.textContent.trim()!==labels[i])top.textContent=labels[i];
      if(val)val.textContent=String(values[i]);
      if(ft)ft.textContent=foot[i];
      card.style.cursor='pointer';
      card.onclick=function(){if(window.ADSuper&&ADSuper.go)ADSuper.go(i===0?'organizations':'admins')};
    });
  }
  function removeCustomerDashboardPanels(){
    const c=document.getElementById('content');
    if(!c)return;
    c.querySelector('#p1DashboardFeeCards')?.remove();
    c.querySelector('#p1DashboardFeeDetails')?.remove();
    repairSuperAdminView();
  }

  function feeSummary(s){
    const fees=Array.isArray(s.caseFees)?s.caseFees:[];
    const pays=Array.isArray(s.feePayments)?s.feePayments:[];
    const agreed=fees.reduce((a,f)=>a+Number(f.agreedFees||0),0);
    const additional=fees.reduce((a,f)=>a+Number(f.additionalCharges||0),0);
    const received=pays.reduce((a,p)=>a+Number(p.amount||0),0);
    const payable=agreed+additional;
    return {agreed,additional,received,payable,balance:payable-received};
  }
  function money(v){return '₹'+Number(v||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2)}
  }
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

  function schedule(){
    if(isSuperAdmin()){removeCustomerDashboardPanels();return}
    if(scheduled)return;
    scheduled=true;
    setTimeout(function(){scheduled=false;patch()},60);
  }

  function patch(){
    if(isSuperAdmin()){removeCustomerDashboardPanels();return}
    if(patching)return;
    const c=document.getElementById('content');
    if(!c)return;
    const active=document.querySelector('.nav-item.active')?.dataset.page;
    if(active && active!=='dashboard')return;

    patching=true;
    try{
      const s=P1.state();
      const today=new Date().toISOString().slice(0,10);
      const n=s.hearings.filter(h=>String(h.date||'')>=today).length;
      const fs=feeSummary(s);

      const p=c.querySelector('.page-title p');
      if(p&&/Demo Workspace/.test(p.textContent)){
        const d=new Date();
        const target=d.toLocaleDateString('en-IN',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})+' • Demo Workspace';
        if(p.textContent!==target)p.textContent=target;
      }

      const v=c.querySelectorAll('.stat-value');
      if(v[1]&&v[1].textContent!==String(n))v[1].textContent=String(n);

      let feeCards=c.querySelector('#p1DashboardFeeCards');
      if(!feeCards){
        const cards=c.querySelector('.cards');
        if(cards){
          feeCards=document.createElement('div');
          feeCards.id='p1DashboardFeeCards';
          feeCards.className='cards';
          feeCards.innerHTML=`<div class="stat"><div class="stat-top">Agreed Fees <span>₹</span></div><div class="stat-value">${money(fs.agreed)}</div><div class="stat-foot">Across all case fees</div></div><div class="stat"><div class="stat-top">Additional Charges <span>＋</span></div><div class="stat-value">${money(fs.additional)}</div><div class="stat-foot">Added above agreed fees</div></div><div class="stat"><div class="stat-top">Amount Received <span>✓</span></div><div class="stat-value">${money(fs.received)}</div><div class="stat-foot">Case fee payments</div></div><div class="stat"><div class="stat-top">Outstanding Fees <span>₹</span></div><div class="stat-value">${money(fs.balance)}</div><div class="stat-foot">Total payable less received</div></div>`;
          cards.insertAdjacentElement('afterend',feeCards);
        }
      }else{
        const vals=feeCards.querySelectorAll('.stat-value');
        [fs.agreed,fs.additional,fs.received,fs.balance].forEach((x,i)=>{
          if(vals[i]){const m=money(x);if(vals[i].textContent!==m)vals[i].textContent=m}
        });
      }

      const rows=(Array.isArray(s.caseFees)?s.caseFees:[]).map(f=>{
        const cs=s.cases.find(x=>x.id===f.caseId);
        const received=(Array.isArray(s.feePayments)?s.feePayments:[]).filter(p=>p.caseId===f.caseId).reduce((a,p)=>a+Number(p.amount||0),0);
        const payable=Number(f.agreedFees||0)+Number(f.additionalCharges||0);
        return {f,cs,received,payable,balance:payable-received};
      }).filter(r=>r.f&&(Number(r.f.agreedFees||0)||Number(r.f.additionalCharges||0)||r.received));

      let panel=c.querySelector('#p1DashboardFeeDetails');
      if(rows.length){
        if(!panel){
          const anchor=c.querySelector('.grid-2');
          if(anchor){
            panel=document.createElement('div');
            panel.id='p1DashboardFeeDetails';
            panel.className='panel';
            panel.style.marginTop='16px';
            anchor.insertAdjacentElement('afterend',panel);
          }
        }
        if(panel){
          const html=`<div class="panel-head"><h3>Case Fee Details</h3><button class="secondary" onclick="navigate('finance')">View Finance</button></div><div class="panel-body" style="padding:0"><table><thead><tr><th>Case Number</th><th>Client</th><th>Agreed Fees</th><th>Additional Charges</th><th>Total Payable</th><th>Received</th><th>Balance</th></tr></thead><tbody>${rows.map(r=>`<tr><td><strong>${esc(r.cs?.number||r.f.caseNumber||'—')}</strong><br><span class="muted">${esc(r.cs?.title||'')}</span></td><td>${esc(r.cs?.client||r.f.clientName||'—')}</td><td>${money(r.f.agreedFees)}</td><td>${money(r.f.additionalCharges)}</td><td><strong>${money(r.payable)}</strong></td><td>${money(r.received)}</td><td><strong>${money(r.balance)}</strong></td></tr>`).join('')}</tbody></table></div>`;
          if(panel.innerHTML!==html)panel.innerHTML=html;
        }
      }else if(panel){
        panel.remove();
      }
    }finally{
      patching=false;
    }
  }

  function start(){
    if(isSuperAdmin()){
      removeCustomerDashboardPanels();
      setTimeout(repairSuperAdminView,100);
      setTimeout(repairSuperAdminView,400);
      setTimeout(repairSuperAdminView,900);
      return;
    }
    schedule();
    document.addEventListener('advocateDeskFeeUpdated',schedule);
    document.addEventListener('click',function(e){
      if(e.target.closest?.('.nav-item[data-page="dashboard"]'))schedule();
    },true);
    const root=document.getElementById('content')||document.body;
    observer=new MutationObserver(function(){
      if(patching)return;
      const active=document.querySelector('.nav-item.active')?.dataset.page;
      if(active==='dashboard')schedule();
    });
    observer.observe(root,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
