(function(){
  'use strict';
  var mounted=new WeakMap();
  function readData(){
    try{
      var raw=JSON.parse(localStorage.getItem('advocateDeskData')||'{}');
      return raw&&typeof raw==='object'?raw:{};
    }catch(e){return {};}
  }
  function str(v){return v==null?'':String(v).trim();}
  function lower(v){return str(v).toLowerCase();}
  function caseNumber(c){return str(c.number||c.caseNumber||c.case_no||c.caseNo||c.case_number||c.id);}
  function caseTitle(c){return str(c.title||c.caseTitle||c.name||c.case_name);}
  function caseLabel(c){return [caseNumber(c),caseTitle(c)].filter(Boolean).join(' — ')||caseNumber(c);}
  function isInvoiceModal(){
    var modal=document.getElementById('modal');
    var title=document.getElementById('modalTitle');
    if(!modal||modal.classList.contains('hidden'))return false;
    return !!(title&&/invoice|finance|payment/i.test(title.textContent||''));
  }
  function findCaseField(body){
    var labels=[].slice.call(body.querySelectorAll('label'));
    for(var i=0;i<labels.length;i++){
      if(!/\bcase\b/i.test(labels[i].textContent||''))continue;
      var forId=labels[i].htmlFor||labels[i].getAttribute('for');
      if(forId){var byId=document.getElementById(forId);if(byId)return byId;}
      var parent=labels[i].parentElement;
      var field=parent&&parent.querySelector('input:not([type="hidden"]),select,textarea');
      if(field)return field;
    }
    var fields=[].slice.call(body.querySelectorAll('input:not([type="hidden"]),select,textarea'));
    return fields.find(function(f){return /case/i.test((f.name||'')+' '+(f.id||'')+' '+(f.getAttribute('aria-label')||''));})||null;
  }
  function getCases(){
    var data=readData();
    return Array.isArray(data.cases)?data.cases:[];
  }
  function mount(){
    if(!isInvoiceModal())return;
    var body=document.getElementById('modalBody');
    if(!body)return;
    var original=findCaseField(body);
    if(!original||mounted.has(original))return;
    var parent=original.parentElement;
    if(!parent)return;
    var wrap=document.createElement('div');
    wrap.className='finance-case-autocomplete';
    wrap.style.cssText='position:relative;width:100%;';
    parent.insertBefore(wrap,original);
    wrap.appendChild(original);
    var wasSelect=original.tagName.toLowerCase()==='select';
    if(wasSelect)original.style.display='none';
    var input=wasSelect?document.createElement('input'):original;
    if(wasSelect){
      input.type='text';
      input.className=original.className||'';
      input.placeholder='Type case number...';
      input.autocomplete='off';
      input.style.cssText='width:100%;box-sizing:border-box;';
      wrap.appendChild(input);
    }else{
      input.autocomplete='off';
      if(!input.placeholder)input.placeholder='Type case number...';
    }
    var menu=document.createElement('div');
    menu.className='finance-case-results';
    menu.setAttribute('role','listbox');
    menu.style.cssText='position:absolute;left:0;right:0;top:calc(100% + 2px);z-index:2147483647;background:#fff;border:1px solid #d1d5db;border-radius:8px;max-height:240px;overflow-y:auto;display:none;box-shadow:0 8px 20px rgba(0,0,0,.16);';
    wrap.appendChild(menu);
    function hide(){menu.style.display='none';}
    function choose(c){
      var number=caseNumber(c),label=caseLabel(c);
      input.value=wasSelect?label:number;
      if(wasSelect){
        var opts=[].slice.call(original.options||[]);
        var opt=opts.find(function(o){return lower(o.textContent)===lower(label)||lower(o.textContent).indexOf(lower(number))===0||lower(o.value)===lower(c.id);});
        if(opt)original.value=opt.value;
        else original.value=number;
        original.dispatchEvent(new Event('input',{bubbles:true}));
        original.dispatchEvent(new Event('change',{bubbles:true}));
      }else{
        input.dispatchEvent(new Event('input',{bubbles:true}));
        input.dispatchEvent(new Event('change',{bubbles:true}));
      }
      hide();
    }
    function render(){
      var q=lower(input.value),cases=getCases();
      menu.innerHTML='';
      cases.filter(function(c){
        var n=lower(caseNumber(c)),t=lower(caseTitle(c)),l=lower(caseLabel(c));
        return !q||n.indexOf(q)!==-1||t.indexOf(q)!==-1||l.indexOf(q)!==-1;
      }).slice(0,100).forEach(function(c){
        var item=document.createElement('button');
        item.type='button';item.setAttribute('role','option');item.textContent=caseLabel(c);
        item.style.cssText='display:block;width:100%;text-align:left;padding:10px 12px;border:0;background:#fff;color:#111827;cursor:pointer;font:inherit;';
        item.addEventListener('mousedown',function(e){e.preventDefault();choose(c);});
        item.addEventListener('click',function(e){e.preventDefault();choose(c);});
        item.addEventListener('touchstart',function(e){e.preventDefault();choose(c);},{passive:false});
        menu.appendChild(item);
      });
      menu.style.display=menu.children.length?'block':'none';
    }
    input.addEventListener('focus',render);
    input.addEventListener('click',render);
    input.addEventListener('input',render);
    input.addEventListener('keyup',render);
    document.addEventListener('mousedown',function(e){if(!wrap.contains(e.target))hide();});
    mounted.set(original,{wrap:wrap,input:input,menu:menu});
    if(wasSelect){
      var selected=original.options&&original.options[original.selectedIndex];
      if(selected&&selected.value)input.value=selected.textContent||selected.value;
    }
  }
  function init(){
    var observer=new MutationObserver(function(){mount();});
    observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
    mount();
    setTimeout(mount,50);setTimeout(mount,200);setTimeout(mount,500);setTimeout(mount,1000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();