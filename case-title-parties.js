(function(){
  function getClients(){
    try{
      const data=JSON.parse(localStorage.getItem('advocateDeskData')||'null');
      return data&&Array.isArray(data.clients)?data.clients:[];
    }catch(e){return []}
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
    if(value && !Array.from(select.options).some(function(o){return o.selected}) ){
      const custom=document.createElement('option');
      custom.value=value;
      custom.textContent=value;
      custom.selected=true;
      select.appendChild(custom);
    }
    return select;
  }
  function enhance(){
    const modal=document.querySelector('.modal');
    if(!modal)return;
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
    pSelect.addEventListener('change',sync);
    rSelect.addEventListener('change',sync);
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
