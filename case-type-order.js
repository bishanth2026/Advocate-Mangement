(function(){
  const STYLE='width:100%;height:42px;box-sizing:border-box;border:1px solid #d7dee9;border-radius:8px;padding:10px 11px;background:#fff;color:var(--ink);font-size:13px;line-height:20px;outline:none;';
  const OPTIONS={Civil:['OS','OP'],Criminal:['CC','CP','ST','MC']};

  function sync(prefix,number,hidden){
    hidden.value=prefix.value+(number.value.trim()?' '+number.value.trim():'');
    hidden.dispatchEvent(new Event('input',{bubbles:true}));
    hidden.dispatchEvent(new Event('change',{bubbles:true}));
  }

  function build(typeField,caseNumberField){
    const label=caseNumberField.closest('label');
    if(!label)return;
    const type=(typeField.value||'').trim();
    const choices=OPTIONS[type];
    const oldWrap=label.querySelector('.case-number-type-wrap');

    if(!choices){
      if(oldWrap){
        const prefix=oldWrap.querySelector('#caseNumberPrefix')?.value||'';
        const number=oldWrap.querySelector('#caseNumberValue')?.value.trim()||'';
        caseNumberField.type='text';
        caseNumberField.style.cssText=STYLE;
        caseNumberField.value=prefix+(number?' '+number:'');
        oldWrap.remove();
      }else{
        caseNumberField.type='text';
        caseNumberField.style.cssText=STYLE;
      }
      return;
    }

    let number='';
    let prefix=choices[0];
    if(oldWrap){
      prefix=oldWrap.querySelector('#caseNumberPrefix')?.value||prefix;
      number=oldWrap.querySelector('#caseNumberValue')?.value.trim()||'';
    }else{
      const current=String(caseNumberField.value||'').trim();
      const m=current.match(/^(OS|OP|CC|CP|ST|MC)(?:\s+(.*))?$/i);
      if(m){
        const oldPrefix=m[1].toUpperCase();
        if(choices.includes(oldPrefix))prefix=oldPrefix;
        number=(m[2]||'').trim();
      }else number=current;
    }

    if(!oldWrap){
      caseNumberField.type='hidden';
      caseNumberField.style.cssText='';
      const wrap=document.createElement('div');
      wrap.className='case-number-type-wrap';
      wrap.style.cssText='display:grid;grid-template-columns:110px minmax(0,1fr);gap:8px;width:100%;';

      const prefixSelect=document.createElement('select');
      prefixSelect.id='caseNumberPrefix';
      prefixSelect.style.cssText=STYLE;
      const numberInput=document.createElement('input');
      numberInput.id='caseNumberValue';
      numberInput.type='text';
      numberInput.placeholder='Enter case number / year';
      numberInput.style.cssText=STYLE;

      wrap.append(prefixSelect,numberInput);
      label.appendChild(wrap);

      prefixSelect.addEventListener('change',function(){sync(prefixSelect,numberInput,caseNumberField)});
      numberInput.addEventListener('input',function(){sync(prefixSelect,numberInput,caseNumberField)});
      [prefixSelect,numberInput].forEach(function(el){
        el.addEventListener('focus',function(){el.style.borderColor='#6b8fd6';el.style.boxShadow='0 0 0 3px rgba(53,106,230,.10)'});
        el.addEventListener('blur',function(){el.style.borderColor='#d7dee9';el.style.boxShadow='none'});
      });
    }

    const prefixSelect=label.querySelector('#caseNumberPrefix');
    const numberInput=label.querySelector('#caseNumberValue');
    if(!prefixSelect||!numberInput)return;

    prefixSelect.innerHTML='';
    choices.forEach(function(value){
      const option=document.createElement('option');
      option.value=value;
      option.textContent=value;
      if(value===prefix)option.selected=true;
      prefixSelect.appendChild(option);
    });
    if(!choices.includes(prefix))prefix=choices[0];
    prefixSelect.value=prefix;
    numberInput.value=number;
    sync(prefixSelect,numberInput,caseNumberField);
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

    if(typeField.dataset.caseTypeListener!=='1'){
      typeField.dataset.caseTypeListener='1';
      typeField.addEventListener('change',function(){build(typeField,caseNumberField)});
    }
    build(typeField,caseNumberField);
  }

  function boot(){
    moveTypeAboveCaseNumber();
    document.addEventListener('click',function(){
      window.setTimeout(moveTypeAboveCaseNumber,0);
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
