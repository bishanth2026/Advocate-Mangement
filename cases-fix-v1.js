(function(){
  'use strict';
  const esc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const read=()=>{try{return JSON.parse(localStorage.getItem('advocateDeskData')||'{}')}catch(e){return {}}};
  const write=d=>localStorage.setItem('advocateDeskData',JSON.stringify(d));
  let mode='home';
  function shell(){return '<div class="page-title"><div><h1>My Cases</h1><p>Click on a section to continue.</p></div></div>'+
    '<div class="cases-home panel"><button class="case-section" onclick="casesFixOpen(\'petitioner\')"><span><b>For Petitioner</b><small>List of all cases</small></span><strong>→</strong></button>'+
    '<button class="case-section" onclick="casesFixOpen(\'respondent\')"><span><b>For Respondent</b><small>List of all cases</small></span><strong>→</strong></button>'+
    '<button class="case-section" onclick="casesFixOpen(\'victim\')"><span><b>For victim</b><small>List of all cases</small></span><strong>→</strong></button></div>';
  }
  function list(type){
    const d=read(); const items=Array.isArray(d.caseParties)?d.caseParties.filter(x=>x.type===type):[];
    const label=type==='petitioner'?'Petitioner':type==='respondent'?'Respondent':'Victim';
    return '<div class="page-title"><div><h1>'+label+' Cases</h1><p>Manage and save '+label.toLowerCase()+' case details.</p></div><button class="primary" onclick="casesFixAdd(\''+type+'\')">＋ Add '+label+'</button></div>'+
      '<div class="panel"><div class="cases-toolbar"><button class="secondary" onclick="casesFixHome()">← My Cases</button><span class="cases-count">'+items.length+' record(s)</span></div>'+
      (items.length?'<div class="party-list">'+items.map((x,i)=>'<div class="party-row"><div><strong>'+esc(x.name)+'</strong><small>Case No: '+esc(x.caseNumber||'—')+' • '+esc(x.court||'—')+'</small><small>Phone: '+esc(x.phone||'—')+'</small></div><button class="secondary" onclick="casesFixEdit(\''+type+'\','+i+')">Edit</button></div>').join('')+'</div>':'<div class="empty">No '+label.toLowerCase()+' records yet. Click Add to create one.</div>')+'</div>';
  }
  function form(type,index){
    const d=read(); const all=Array.isArray(d.caseParties)?d.caseParties:[]; const filtered=all.filter(x=>x.type===type); const item=index>=0?filtered[index]:{};
    const label=type==='petitioner'?'Petitioner':type==='respondent'?'Respondent':'Victim';
    const val=k=>esc(item[k]||'');
    document.getElementById('content').innerHTML='<div class="page-title"><div><h1>'+(index>=0?'Edit ':'Add ')+label+'</h1><p>Enter the details and press Save.</p></div></div><div class="panel party-form"><div class="form-grid">'+
      '<label>Full Name<input id="partyName" value="'+val('name')+'" required></label><label>Case Number<input id="partyCase" value="'+val('caseNumber')+'" placeholder="OS 123/2026"></label><label>Court<input id="partyCourt" value="'+val('court')+'" placeholder="District Court, Kozhikode"></label><label>Phone<input id="partyPhone" value="'+val('phone')+'" inputmode="tel"></label><label>Email<input id="partyEmail" value="'+val('email')+'" type="email"></label><label>Address<textarea id="partyAddress" rows="3">'+val('address')+'</textarea></label><label>Case Details<textarea id="partyDetails" rows="4">'+val('details')+'</textarea></label></div><div class="form-actions"><button class="secondary" onclick="casesFixOpen(\''+type+'\')">Cancel</button><button class="primary" onclick="casesFixSave(\''+type+'\','+index+')">Save Details</button></div></div>';
  }
  window.casesFixHome=()=>{mode='home';document.getElementById('content').innerHTML=shell();};
  window.casesFixOpen=type=>{mode=type;document.getElementById('content').innerHTML=list(type);};
  window.casesFixAdd=type=>form(type,-1);
  window.casesFixEdit=(type,index)=>form(type,index);
  window.casesFixSave=(type,index)=>{
    const name=document.getElementById('partyName').value.trim();
    if(!name){alert('Please enter the full name.');return;}
    const d=read(); d.caseParties=Array.isArray(d.caseParties)?d.caseParties:[];
    const filtered=d.caseParties.filter(x=>x.type===type); const old=index>=0?filtered[index]:null;
    const record={...(old||{}),type,name,caseNumber:document.getElementById('partyCase').value.trim(),court:document.getElementById('partyCourt').value.trim(),phone:document.getElementById('partyPhone').value.trim(),email:document.getElementById('partyEmail').value.trim(),address:document.getElementById('partyAddress').value.trim(),details:document.getElementById('partyDetails').value.trim(),updatedAt:new Date().toISOString()};
    if(index>=0){const pos=d.caseParties.indexOf(old);d.caseParties[pos]=record;}else d.caseParties.push(record);
    write(d); alert('Details saved successfully.'); casesFixOpen(type);
  };
  const style=document.createElement('style');style.textContent='.cases-home{max-width:560px;margin:24px auto;padding:24px}.case-section{width:100%;display:flex;align-items:center;justify-content:space-between;text-align:left;background:transparent;border:0;border-bottom:1px solid var(--border,#e5e7eb);padding:24px 8px;cursor:pointer}.case-section:last-child{border-bottom:0}.case-section span{display:flex;flex-direction:column;gap:6px}.case-section b{font-size:20px;color:var(--text,#111827)}.case-section small,.party-row small{display:block;color:var(--muted,#64748b);font-size:14px}.case-section strong{font-size:36px;color:#87909a;font-weight:400}.cases-toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:16px;border-bottom:1px solid var(--border,#e5e7eb)}.cases-count{color:var(--muted,#64748b)}.party-list{padding:0 16px}.party-row{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:18px 0;border-bottom:1px solid var(--border,#e5e7eb)}.party-row:last-child{border-bottom:0}.party-row strong{font-size:17px}.party-form{padding:24px}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.form-grid label{display:flex;flex-direction:column;gap:7px;font-weight:600;color:var(--text,#111827)}.form-grid input,.form-grid textarea{width:100%;box-sizing:border-box;padding:12px;border:1px solid var(--border,#d1d5db);border-radius:8px;font:inherit;background:var(--card,#fff);color:inherit}.form-grid label:last-child{grid-column:1/-1}.form-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:24px}@media(max-width:700px){.form-grid{grid-template-columns:1fr}.form-grid label:last-child{grid-column:auto}.party-form{padding:16px}.case-section b{font-size:18px}}';document.head.appendChild(style);
  document.addEventListener('click',function(e){const b=e.target.closest&&e.target.closest('[data-page="cases"]');if(!b)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x===b));casesFixHome();},true);
})();
