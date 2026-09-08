/* Authoritative case-fee save/setup layer. Loaded last so no older fee renderer can overwrite saved data. */
(function(){
  function S(){const s=P1.state();s.caseFees=Array.isArray(s.caseFees)?s.caseFees:[];s.feePayments=Array.isArray(s.feePayments)?s.feePayments:[];return s}
  function num(v){const n=Number(v);return Number.isFinite(n)&&n>=0?n:0}
  function findCase(s,id){return s.cases.find(c=>String(c.id)===String(id))||s.cases.find(c=>String(c.number)===String(id))||null}
  function getFee(s,c){let f=s.caseFees.find(x=>String(x.caseId)===String(c.id));if(!f){f={id:'FEE-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),caseId:c.id,caseNumber:c.number,clientId:c.clientId||'',clientName:c.client||'',agreedFees:0,additionalCharges:0};s.caseFees.push(f)}return f}
  function money(v){return P1.money(num(v))}
  function setup(caseId){
    const s=S();
    let c=caseId?findCase(s,caseId):null;
    if(!c)c=s.cases[0]||null;
    if(!c){alert('No cases are available. Create a case first.');return}
    const f=getFee(s,c);
    P1.save(s);
    const opts=s.cases.map(x=>`<option value="${P1.esc(x.id)}" ${String(x.id)===String(c.id)?'selected':''}>${P1.esc(x.number)} — ${P1.esc(x.client||'')}</option>`).join('');
    p1OpenModal(caseId?'Edit Case Fee':'Add Case Fee',`
      <div class="form-grid">
        <div class="field full"><label>Case Number</label><select id="p1authCase" onchange="p1AuthCaseChange()">${opts}</select></div>
        <div class="field"><label>Client</label><input id="p1authClient" value="${P1.esc(c.client||'')}" readonly></div>
        <div class="field"><label>Agreed Fees</label><input id="p1authAgreed" type="number" min="0" step="0.01" value="${P1.esc(f.agreedFees??0)}" oninput="p1AuthTotal()"></div>
        <div class="field"><label>Additional Charges</label><input id="p1authAdditional" type="number" min="0" step="0.01" value="${P1.esc(f.additionalCharges??0)}" oninput="p1AuthTotal()"></div>
        <div class="field"><label>Total Payable</label><input id="p1authTotalPayable" value="${money(num(f.agreedFees)+num(f.additionalCharges))}" readonly></div>
      </div>
      <div class="fee-balance-note">Total Payable = Agreed Fees + Additional Charges</div>
      <div class="form-actions">${P1.btn('Cancel','p1CloseModal()')} ${P1.btn('Save Case Fee','p1AuthSave()',true)}</div>`);
    setTimeout(p1AuthTotal,0);
  }
  window.p1AuthCaseChange=function(){
    const s=S(),id=document.getElementById('p1authCase')?.value,c=findCase(s,id);if(!c)return;
    const f=getFee(s,c);
    document.getElementById('p1authClient').value=c.client||'';
    document.getElementById('p1authAgreed').value=f.agreedFees??0;
    document.getElementById('p1authAdditional').value=f.additionalCharges??0;
    p1AuthTotal();
  };
  window.p1AuthTotal=function(){
    const a=num(document.getElementById('p1authAgreed')?.value),b=num(document.getElementById('p1authAdditional')?.value),e=document.getElementById('p1authTotalPayable');
    if(e)e.value=money(a+b);
  };
  window.p1AuthSave=function(){
    try{
      const s=S(),id=document.getElementById('p1authCase')?.value,c=findCase(s,id);
      if(!c){alert('Select a case number.');return}
      const a=num(document.getElementById('p1authAgreed')?.value),b=num(document.getElementById('p1authAdditional')?.value);
      const f=getFee(s,c);
      f.caseId=c.id;f.caseNumber=c.number;f.clientId=c.clientId||'';f.clientName=c.client||'';f.agreedFees=a;f.additionalCharges=b;
      P1.save(s);
      p1CloseModal();
      if(typeof window.p1FinalFinance==='function')window.p1FinalFinance();
      else if(typeof window.p1Finance==='function')window.p1Finance();
      window.dispatchEvent(new Event('advocateDeskFeeUpdated'));
      setTimeout(function(){if(typeof window.p1FinalFinance==='function')window.p1FinalFinance();},80);
    }catch(err){console.error('Case fee save failed:',err);alert('Unable to save the case fee. Please try again.');}
  };
  // Override all older setup entry points so every Fee Setup button opens this same form.
  window.p1FeeSetup=setup;
  window.p1SyncSetup=setup;
})();
