(function(){
const K='advocateDeskData';
window.P1={
 state(){let s={};try{s=JSON.parse(localStorage.getItem(K)||'{}')||{}}catch(e){};['cases','clients','hearings','tasks','discussions','meetings','financeTransactions','documents'].forEach(k=>s[k]=Array.isArray(s[k])?s[k]:[]);s.settings=Object.assign({firmName:'',advocateName:'',phone:'',email:'',whatsapp:'',barNumber:'',address:'',defaultCourt:'',timezone:'Asia/Kolkata'},s.settings||{});return s},
 save(s){localStorage.setItem(K,JSON.stringify(s))},
 esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))},
 date(v){return v?new Date(String(v).slice(0,10)+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—'},
 money(v){return '₹'+Number(v||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})},
 btn(t,fn,p){return `<button class="${p?'primary':'secondary'}" onclick="${fn}">${this.esc(t)}</button>`},
 content(){return document.getElementById('content')},
 layout(t,s,a){return `<div class="page-title"><div><h1>${this.esc(t)}</h1><p>${this.esc(s||'')}</p></div>${a||''}</div>`},
 nav(p){document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===p))}
};
window.p1OpenModal=function(title,body){let m=document.getElementById('p1Modal');if(!m){m=document.createElement('div');m.id='p1Modal';m.className='modal hidden';document.body.appendChild(m)}m.innerHTML=`<div class="modal-card"><div class="modal-head"><h3>${P1.esc(title)}</h3><button onclick="p1CloseModal()">×</button></div>${body}</div>`;m.classList.remove('hidden');document.body.classList.add('p1-modal-open')};
window.p1CloseModal=function(){document.getElementById('p1Modal')?.classList.add('hidden');document.body.classList.remove('p1-modal-open')};
function boot(){document.addEventListener('click',e=>{const n=e.target.closest?.('.nav-item[data-page]');if(!n)return;const p=n.dataset.page;if(['finance','reports','settings','documents','calendar'].includes(p)){e.preventDefault();e.stopImmediatePropagation();P1.nav(p);document.body.classList.remove('menu-open');document.querySelector('.sidebar')?.classList.remove('open');document.getElementById('mobileOverlay')?.classList.remove('open');if(p==='finance')window.p1Finance();if(p==='reports')window.p1Reports();if(p==='settings')window.p1Settings();if(p==='documents')window.p1Documents();if(p==='calendar')window.p1Calendar()}},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();