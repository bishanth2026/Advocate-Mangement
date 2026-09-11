(function(){
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
    const pInput=document.createElement('input');
    pInput.type='text';pInput.id='casePetitioner';pInput.value=petitioner;pInput.placeholder='Petitioner';pInput.autocomplete='off';
    pInput.style.cssText='width:100%;height:42px;box-sizing:border-box;border:1px solid #d7dee9;border-radius:8px;padding:10px 11px;background:#fff;color:var(--ink);font-size:13px;line-height:20px;outline:none;';
    pWrap.append(pLabel,pInput);

    const vs=document.createElement('div');
    vs.textContent='VS';
    vs.style.cssText='height:42px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#667085;';

    const rWrap=document.createElement('div');
    const rLabel=document.createElement('div');
    rLabel.textContent='Respondent';
    rLabel.style.cssText='font-size:11px;font-weight:600;color:#667085;margin-bottom:5px;';
    const rInput=document.createElement('input');
    rInput.type='text';rInput.id='caseRespondent';rInput.value=respondent;rInput.placeholder='Respondent';rInput.autocomplete='off';
    rInput.style.cssText='width:100%;height:42px;box-sizing:border-box;border:1px solid #d7dee9;border-radius:8px;padding:10px 11px;background:#fff;color:var(--ink);font-size:13px;line-height:20px;outline:none;';
    rWrap.append(rLabel,rInput);

    wrap.append(pWrap,vs,rWrap);
    label.appendChild(wrap);

    function sync(){
      const a=pInput.value.trim(),b=rInput.value.trim();
      titleField.value=a&&b?a+' vs '+b:(a||b);
      titleField.dispatchEvent(new Event('input',{bubbles:true}));
      titleField.dispatchEvent(new Event('change',{bubbles:true}));
    }
    pInput.addEventListener('input',sync);rInput.addEventListener('input',sync);
    [pInput,rInput].forEach(function(i){i.addEventListener('focus',function(){i.style.borderColor='#6b8fd6';i.style.boxShadow='0 0 0 3px rgba(53,106,230,.10)'});i.addEventListener('blur',function(){i.style.borderColor='#d7dee9';i.style.boxShadow='none'})});
    sync();
  }
  function boot(){
    enhance();
    const observer=new MutationObserver(enhance);
    observer.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
