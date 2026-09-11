(function(){
  function syncCaseNumber(prefixInput,numberInput,hidden){
    const prefix=prefixInput.value||'';
    const number=(numberInput.value||'').trim();
    hidden.value=prefix&&number?prefix+' '+number:(prefix||number);
    hidden.dispatchEvent(new Event('input',{bubbles:true}));
    hidden.dispatchEvent(new Event('change',{bubbles:true}));
  }

  function enhanceCivilCaseNumber(typeField,caseNumberField){
    if(typeField.value!=='Civil')return;
    if(caseNumberField.dataset.civilPrefixEnhanced==='1')return;

    const label=caseNumberField.closest('label');
    if(!label)return;
    caseNumberField.dataset.civilPrefixEnhanced='1';

    const original=(caseNumberField.value||'').trim();
    const match=original.match(/^(OS|OP)\s+(.*)$/i);
    const prefix=match?match[1].toUpperCase():'OS';
    const number=match?match[2]:original;

    caseNumberField.type='hidden';

    const wrap=document.createElement('div');
    wrap.style.cssText='display:grid;grid-template-columns:110px minmax(0,1fr);gap:8px;width:100%;';

    const prefixSelect=document.createElement('select');
    prefixSelect.id='caseNumberPrefix';
    prefixSelect.style.cssText='width:100%;height:42px;box-sizing:border-box;border:1px solid #d7dee9;border-radius:8px;padding:10px 11px;background:#fff;color:var(--ink);font-size:13px;line-height:20px;outline:none;';
    [['OS','OS'],['OP','OP']].forEach(function(x){
      const o=document.createElement('option');o.value=x[0];o.textContent=x[1];if(x[0]===prefix)o.selected=true;prefixSelect.appendChild(o);
    });

    const numberInput=document.createElement('input');
    numberInput.id='caseNumberValue';
    numberInput.type='text';
    numberInput.value=number;
    numberInput.placeholder='Enter case number / year';
    numberInput.style.cssText='width:100%;height:42px;box-sizing:border-box;border:1px solid #d7dee9;border-radius:8px;padding:10px 11px;background:#fff;color:var(--ink);font-size:13px;line-height:20px;outline:none;';

    prefixSelect.addEventListener('change',function(){syncCaseNumber(prefixSelect,numberInput,caseNumberField)});
    numberInput.addEventListener('input',function(){syncCaseNumber(prefixSelect,numberInput,caseNumberField)});
    [prefixSelect,numberInput].forEach(function(i){
      i.addEventListener('focus',function(){i.style.borderColor='#6b8fd6';i.style.boxShadow='0 0 0 3px rgba(53,106,230,.10)'});
      i.addEventListener('blur',function(){i.style.borderColor='#d7dee9';i.style.boxShadow='none'});
    });

    wrap.append(prefixSelect,numberInput);
    label.appendChild(wrap);
    syncCaseNumber(prefixSelect,numberInput,caseNumberField);
  }

  function moveTypeAboveCaseNumber(){
    const modal=document.querySelector('.modal');
    if(!modal)return;
    const grid=modal.querySelector('.modal-body .form-grid');
    if(!grid)return;
    const typeField=document.getElementById('f6');
    const caseNumberField=document.getElementById('f1');
    if(!typeField||!caseNumberField)return;
    const typeLabel=typeField.closest('label');
    const caseNumberLabel=caseNumberField.closest('label');
    if(!typeLabel||!caseNumberLabel||typeLabel.parentElement!==grid||caseNumberLabel.parentElement!==grid)return;
    if(typeLabel!==grid.firstElementChild)grid.insertBefore(typeLabel,caseNumberLabel);
    enhanceCivilCaseNumber(typeField,caseNumberField);
  }

  function boot(){
    moveTypeAboveCaseNumber();
    new MutationObserver(moveTypeAboveCaseNumber).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
