(function(){
  'use strict';
  var mounted=new WeakSet();
  function read(){try{return JSON.parse(localStorage.getItem('advocateDeskData')||'{}')||{};}catch(e){return {};}}
  function s(v){return String(v==null?'':v).trim();}
  function n(v){return s(v).toLowerCase();}
  function caseNumber(c){return s(c&&(c.number||c.caseNumber||c.case_no||c.caseNo||c.case_number||c.id));}
  function caseTitle(c){return s(c&&(c.title||c.caseTitle||c.name||c.case_name));}
  function display(c){return [caseNumber(c),caseTitle(c)].filter(Boolean).join(' — ')||caseNumber(c);}
  function isInvoice(){var m=document.getElementById('modal'),t=document.getElementById('modalTitle');return !!(m&&!m.classList.contains('hidden')&&t&&/invoice|finance|payment/i.test(t.textContent||''));}
  function findCase(body){
    var labels=[].slice.call(body.querySelectorAll('label'));
    for(var i=0;i<labels.length;i++){
      if(/^\s*case\s*:?/i.test(labels[i].textContent||'')){
        var p=labels[i].parentElement;
        var f=p&&p.querySelector('select,input,textarea');
        if(f)return f;
      }
    }
    var fields=[].slice.call(body.querySelectorAll('select,input,textarea'));
    return fields.find(function(f){return /case/i.test((f.id||'')+' '+(f.name||'')+' '+(f.getAttribute('aria-label')||''));})||null;
  }
  function mount(){
    if(!isInvoice())return;
    var body=document.getElementById('modalBody');if(!body)return;
    var original=findCase(body);if(!original||mounted.has(original))return;
    mounted.add(original);
    var parent=original.parentElement;if(!parent)return;
    var wrap=document.createElement('div');
    wrap.style.cssText='position:relative;width:100%;';
    parent.insertBefore(wrap,original);wrap.appendChild(original);
    original.setAttribute('data-finance-case-original','1');
    original.style.setProperty('display','none','important');
    var input=document.createElement('input');
    input.type='text';
    input.className=original.className||'';
    input.placeholder='Type case number...';
    input.autocomplete='off';
    input.setAttribute('aria-label','Case');
    input.style.cssText='width:100%;box-sizing:border-box;';
    var selected=original.options&&original.options[original.selectedIndex];
    if(selected&&selected.value)input.value=selected.textContent||selected.value;
    var menu=document.createElement('div');
    menu.setAttribute('role','listbox');
    menu.style.cssText='position:absolute;left:0;right:0;top:100%;z-index:100000;background:#fff;border:1px solid #d1d5db;border-radius:8px;max-height:240px;overflow-y:auto;display:none;box-shadow:0 8px 20px rgba(0,0,0,.12);';
    function hide(){menu.style.display='none';}
    function choose(c){
      var value=caseNumber(c);
      input.value=value;
      original.value=value;
      original.dispatchEvent(new Event('input',{bubbles:true}));
      original.dispatchEvent(new Event('change',{bubbles:true}));
      hide();
    }
    function render(){
      var cases=read().cases;
      if(!Array.isArray(cases))cases=[];
      var q=n(input.value);
      menu.innerHTML='';
      cases.filter(function(c){var text=display(c);return !q||n(text).indexOf(q)!==-1;}).slice(0,100).forEach(function(c){
        var b=document.createElement('button');
        b.type='button';b.setAttribute('role','option');b.textContent=display(c);
        b.style.cssText='display:block;width:100%;text-align:left;padding:10px 12px;border:0;background:#fff;color:#111827;cursor:pointer;font:inherit;';
        b.addEventListener('mousedown',function(e){e.preventDefault();e.stopPropagation();choose(c);});
        b.addEventListener('touchstart',function(e){e.preventDefault();e.stopPropagation();choose(c);},{passive:false});
        menu.appendChild(b);
      });
      menu.style.display=menu.children.length?'block':'none';
    }
    input.addEventListener('focus',render);
    input.addEventListener('click',render);
    input.addEventListener('input',render);
    input.addEventListener('keyup',render);
    input.addEventListener('keydown',function(e){if(e.key==='Escape')hide();});
    document.addEventListener('mousedown',function(e){if(!wrap.contains(e.target))hide();});
    wrap.appendChild(input);
    wrap.appendChild(menu);
  }
  var observer=new MutationObserver(function(){setTimeout(mount,20);});
  function init(){if(!document.body)return;observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});[0,100,300,700,1200].forEach(function(ms){setTimeout(mount,ms);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();