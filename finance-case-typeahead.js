(function(){
  'use strict';
  function norm(v){return String(v||'').trim().toLowerCase();}
  function state(){try{return JSON.parse(localStorage.getItem('advocateDeskData')||'{}')||{};}catch(e){return {};}}
  function caseNumber(c){return c&&(c.number||c.caseNumber||c.caseNo||c.case_number||c.id||'');}
  function label(c){return [caseNumber(c),c.title||c.caseTitle||c.name||''].filter(Boolean).join(' — ');}
  function findCase(v,cases){var s=norm(v);return cases.find(function(c){return norm(caseNumber(c))===s||norm(label(c))===s;});}
  function enhance(){
    var modal=document.getElementById('modal'), body=document.getElementById('modalBody'), title=document.getElementById('modalTitle');
    if(!modal||modal.classList.contains('hidden')||!body||!title||!/invoice|finance|payment/i.test(title.textContent||''))return;
    var selects=[].slice.call(body.querySelectorAll('select'));
    var field=selects.find(function(s){var t=((s.previousElementSibling||{}).textContent||'')+' '+(s.name||'')+' '+(s.id||'');return /case|number/i.test(t);})||selects[1];
    if(!field||field.dataset.financeTypeahead==='1')return;
    var cases=state().cases; if(!Array.isArray(cases)||!cases.length)return;
    field.dataset.financeTypeahead='1';
    var wrap=document.createElement('div');wrap.style.cssText='position:relative;width:100%;';
    var input=document.createElement('input');input.type='text';input.className=field.className||'';input.placeholder='Type case number...';input.autocomplete='off';
    var menu=document.createElement('div');menu.style.cssText='position:absolute;left:0;right:0;top:100%;z-index:9999;background:#fff;border:1px solid #d1d5db;border-radius:8px;max-height:240px;overflow:auto;display:none;box-shadow:0 8px 20px rgba(0,0,0,.12);';
    function render(){var q=norm(input.value);menu.innerHTML='';cases.filter(function(c){return !q||norm(label(c)).includes(q)||norm(caseNumber(c)).includes(q);}).forEach(function(c){var b=document.createElement('button');b.type='button';b.textContent=label(c);b.style.cssText='display:block;width:100%;text-align:left;padding:10px 12px;border:0;background:#fff;cursor:pointer;';b.onclick=function(){input.value=label(c);field.value=caseNumber(c);field.dispatchEvent(new Event('change',{bubbles:true}));menu.style.display='none';};menu.appendChild(b);});menu.style.display=menu.children.length?'block':'none';}
    input.addEventListener('focus',render);input.addEventListener('input',function(){field.value='';render();});document.addEventListener('click',function(e){if(!wrap.contains(e.target))menu.style.display='none';});
    wrap.appendChild(input);wrap.appendChild(menu);field.style.display='none';field.parentNode.insertBefore(wrap,field);
  }
  var obs=new MutationObserver(function(){setTimeout(enhance,0);});obs.observe(document.body,{childList:true,subtree:true});setTimeout(enhance,100);
})();
