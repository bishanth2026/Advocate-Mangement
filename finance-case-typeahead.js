(function(){
  'use strict';
  function getState(){try{return JSON.parse(localStorage.getItem('advocateDeskData')||'{}')||{};}catch(e){return {};}}
  function norm(v){return String(v==null?'':v).trim().toLowerCase();}
  function caseNo(c){return c&&(c.number||c.caseNumber||c.caseNo||c.case_number||c.id||'');}
  function caseLabel(c){return [caseNo(c),c.title||c.caseTitle||c.name||''].filter(Boolean).join(' — ');}
  function isInvoiceModal(){var m=document.getElementById('modal'),t=document.getElementById('modalTitle');return m&&!m.classList.contains('hidden')&&t&&/invoice|finance|payment/i.test(t.textContent||'');}
  function findCaseSelect(body){
    var labels=[].slice.call(body.querySelectorAll('label'));
    for(var i=0;i<labels.length;i++){
      if(/case\s*(number|no)?|case/i.test(labels[i].textContent||'')){
        var p=labels[i].parentElement;
        var s=p&&p.querySelector('select');
        if(s)return s;
      }
    }
    var selects=[].slice.call(body.querySelectorAll('select'));
    return selects.find(function(s){return /case|number/i.test((s.name||'')+' '+(s.id||'')+' '+(s.parentElement&&pText(s.parentElement)));})||selects[1]||selects[0];
  }
  function pText(el){return (el&&el.textContent)||'';}
  function enhance(){
    if(!isInvoiceModal())return;
    var body=document.getElementById('modalBody');if(!body)return;
    var field=findCaseSelect(body);if(!field||field.dataset.financeTypeahead==='1')return;
    var cases=getState().cases;if(!Array.isArray(cases)||!cases.length)return;
    field.dataset.financeTypeahead='1';
    var wrap=document.createElement('div');wrap.style.cssText='position:relative;width:100%;';
    var input=document.createElement('input');input.type='text';input.className=field.className||'';input.placeholder='Type case number...';input.autocomplete='off';input.style.cssText='width:100%;box-sizing:border-box;';
    var menu=document.createElement('div');menu.style.cssText='position:absolute;left:0;right:0;top:100%;z-index:10000;background:#fff;border:1px solid #d1d5db;border-radius:8px;max-height:240px;overflow-y:auto;display:none;box-shadow:0 8px 20px rgba(0,0,0,.12);';
    function choose(c){
      input.value=caseLabel(c);field.value=String(caseNo(c));
      field.dispatchEvent(new Event('input',{bubbles:true}));
      field.dispatchEvent(new Event('change',{bubbles:true}));
      menu.style.display='none';
    }
    function render(){
      var q=norm(input.value);menu.innerHTML='';
      cases.filter(function(c){return !q||norm(caseNo(c)).includes(q)||norm(caseLabel(c)).includes(q);}).slice(0,100).forEach(function(c){
        var b=document.createElement('button');b.type='button';b.textContent=caseLabel(c);b.style.cssText='display:block;width:100%;text-align:left;padding:10px 12px;border:0;background:#fff;color:#111827;cursor:pointer;';
        b.addEventListener('mousedown',function(e){e.preventDefault();choose(c);});menu.appendChild(b);
      });
      menu.style.display=menu.children.length?'block':'none';
    }
    input.addEventListener('focus',render);
    input.addEventListener('input',function(){field.value='';render();});
    document.addEventListener('mousedown',function(e){if(!wrap.contains(e.target))menu.style.display='none';});
    wrap.appendChild(input);wrap.appendChild(menu);field.style.display='none';field.parentNode.insertBefore(wrap,field);
  }
  var observer=new MutationObserver(function(){setTimeout(enhance,50);});
  function init(){if(document.body)observer.observe(document.body,{childList:true,subtree:true});setTimeout(enhance,100);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();