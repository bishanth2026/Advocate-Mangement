(function(){
  function getClients(){
    try{
      const data=JSON.parse(localStorage.getItem('advocateDeskData')||'null');
      return data&&Array.isArray(data.clients)?data.clients:[];
    }catch(e){return []}
  }
  function isCaseModal(modal){
    const text=(modal.innerText||modal.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    const heading=modal.querySelector('h1,h2,h3,.modal-title,.modal-header strong');
    const headingText=(heading?.textContent||'').toLowerCase();
    return /new case|edit case|case details|case file/.test(headingText) || (/case title/.test(text)&&!/new client|edit client/.test(headingText));
  }
  function makeClientSelect(id,value,placeholder){
    const select=document.createElement('select');
    select.id=id;
    select.name=id;
    select.style.cssText='width:100%;height:42px;box-sizing:border-box;border:1px solid #d7dee9;border-radius:8px;padding:10px 11px;background:#fff;color:var(--ink);font-size:13px;line-height:20px;outline:none;';
    const first=document.createElement('option');
    first.value='';
    first.textContent=placeholder;
    select.appendChild(first);
    getClients().forEach(function(client){
      const option=document.createElement('option');
      option.value=client.id||client.name||'';
      option.textContent=client.name||client.id||'';
      option.dataset.name=client.name||'';
      if((value||'').trim()===(client.name||'').trim() || (value||'').trim()===(client.id||'').trim()) option.selected=true;
      select.appendChild(option);
    });
    const add=document.createElement('option');
    add.value='__ADD_NEW_CLIENT__';
    add.textContent='＋ Add New Client';
    select.appendChild(add);
    if(value && !Array.from(select.options).some(function(o){return o.selected}) ){
      const custom=document.createElement('option');
      custom.value=value;
      custom.textContent=value;
      custom.selected=true;
      select.appendChild(custom);
    }
    return select;
  }
  function refreshSelect(select,selectedId){
    if(!select)return;
    const placeholder=select.options[0]?.textContent||'Select client';
    const id=select.id;
    const fresh=makeClientSelect(id,selectedId,placeholder);
    fresh.style.cssText=select.style.cssText;
    select.replaceWith(fresh);
    return fresh;
  }
  function addNewClient(select,role){
    if(!window.P1 || typeof P1.state!=='function' || typeof P1.save!=='function'){
      alert('Client management is not available. Please refresh the page and try again.');
      return;
    }
    const title=role==='petitioner'?'Add New Petitioner':'Add New Respondent';
    const formId='casePartyNewClientForm';
    const body=`<form id="${formId}" onsubmit="return false" style="display:grid;gap:12px;padding:4px 0">
      <label><span>Client Name *</span><input id="casePartyClientName" type="text" placeholder="Enter client name" required></label>
      <label><span>Phone</span><input id="casePartyClientPhone" type="tel" placeholder="Enter mobile number"></label>
      <label><span>Email</span><input id="casePartyClientEmail" type="email" placeholder="Enter email address"></label>
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:4px">
        <button type="button" class="secondary" onclick="p1CloseModal()">Cancel</button>
        <button type="button" class="primary" id="casePartyClientSave">Save Client</button>
      </div>
    </form>`;
    if(typeof p1OpenModal==='function')p1OpenModal(title,body);else{alert('Please refresh the page and try again.');return}
    setTimeout(function(){
      const name=document.getElementById('casePartyClientName');
      name?.focus();
      document.getElementById('casePartyClientSave')?.addEventListener('click',function(){
        const clientName=(document.getElementById('casePartyClientName')?.value||'').trim();
        const phone=(document.getElementById('casePartyClientPhone')?.value||'').trim();
        const email=(document.getElementById('casePartyClientEmail')?.value||'').trim();
        if(!clientName){alert('Client name is required.');name?.focus();return}
        const s=P1.state();
        const existing=s.clients.find(function(c){return String(c.name||'').trim().toLowerCase()===clientName.toLowerCase()});
        let client=existing;
        if(!client){
          client={id:'CL-'+Date.now(),name:clientName,phone:phone,email:email,cases:0,status:'Active'};
          s.clients.push(client);
          P1.save(s);
        }
        p1CloseModal();
        const selectedId=client.id||client.name;
        const current=document.getElementById(select.id);
        const fresh=refreshSelect(current,selectedId);
        if(fresh){fresh.value=selectedId;fresh.dispatchEvent(new Event('change',{bubbles:true}))}
      });
    },0);
  }
  function enhance(){
    const modal=document.querySelector('.modal');
    if(!modal || !isCaseModal(modal))return;
    const titleField=document.getElementById('f2');
    if(!titleField || titleField.dataset.partiesEnhanced==='1')return;
    const label=titleField.closest('label');
    if(!label)return;

    titleField.dataset.partiesEnhanced='1';
    const original=titleField.value||'';
    let petitioner=original, respondent='';
    const parts=original.split(/\s+(?:vs\.?|v\.)\s+/i);
    if(parts.length>1){petitioner=parts[0].trim();respondent=parts.slice(1).join(' ').trim()}

    label.querySelector('span')?.remove?.();
    const labelText=label.firstChild;
    if(labelText && labelText.nodeType===3) labelText.textContent='Case Title';

    titleField.style.display='none';
    const wrap=document.createElement('div');
    wrap.className='case-parties-wrap';
    wrap.style.cssText='display:grid;grid-template-columns:minmax(0,1fr) 70px minmax(0,1fr);gap:8px;align-items:end;width:100%;';

    const pWrap=document.createElement('div');
    const pLabel=document.createElement('div');
    pLabel.textContent='Petitioner';
    pLabel.style.cssText='font-size:11px;font-weight:600;color:#667085;margin-bottom:5px;';
    const pSelect=makeClientSelect('casePetitioner',petitioner,'Select petitioner');
    pWrap.append(pLabel,pSelect);

    const vs=document.createElement('div');
    vs.textContent='VS';
    vs.style.cssText='height:42px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#667085;';

    const rWrap=document.createElement('div');
    const rLabel=document.createElement('div');
    rLabel.textContent='Respondent';
    rLabel.style.cssText='font-size:11px;font-weight:600;color:#667085;margin-bottom:5px;';
    const rSelect=makeClientSelect('caseRespondent',respondent,'Select respondent');
    rWrap.append(rLabel,rSelect);

    wrap.append(pWrap,vs,rWrap);
    label.appendChild(wrap);

    function sync(){
      const a=pSelect.options[pSelect.selectedIndex]?.dataset.name || pSelect.options[pSelect.selectedIndex]?.textContent || '';
      const b=rSelect.options[rSelect.selectedIndex]?.dataset.name || rSelect.options[rSelect.selectedIndex]?.textContent || '';
      titleField.value=a&&b?a+' vs '+b:(a||b);
      titleField.dispatchEvent(new Event('input',{bubbles:true}));
      titleField.dispatchEvent(new Event('change',{bubbles:true}));
    }
    pSelect.addEventListener('change',function(){
      if(pSelect.value==='__ADD_NEW_CLIENT__'){
        pSelect.value='';
        addNewClient(pSelect,'petitioner');
        return;
      }
      sync();
    });
    rSelect.addEventListener('change',function(){
      if(rSelect.value==='__ADD_NEW_CLIENT__'){
        rSelect.value='';
        addNewClient(rSelect,'respondent');
        return;
      }
      sync();
    });
    [pSelect,rSelect].forEach(function(i){i.addEventListener('focus',function(){i.style.borderColor='#6b8fd6';i.style.boxShadow='0 0 0 3px rgba(53,106,230,.10)'});i.addEventListener('blur',function(){i.style.borderColor='#d7dee9';i.style.boxShadow='none'})});
    sync();
  }
  function boot(){
    enhance();
    const observer=new MutationObserver(enhance);
    observer.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
