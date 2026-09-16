(function(){
  'use strict';
  var mounted=new WeakSet();
  function state(){try{return JSON.parse(localStorage.getItem('advocateDeskData')||'{}')||{};}catch(e){return {};}}
  function text(v){return String(v==null?'':v).trim();}
  function norm(v){return text(v).toLowerCase();}
  function no(c){return text(c&&(c.number||c.caseNumber||c.case_no||c.caseNo||c.case_number||c.id));}
  function title(c){return text(c&&(c.title||c.caseTitle||c.name||c.case_name));}
  function label(c){return [no(c),title(c)].filter(Boolean).join(' — ')||no(c);}
  function open(){var m=document.getElementById('modal'),t=document.getElementById('modalTitle');return !!(m&&!m.classList.contains('hidden')&&t&&/invoice|finance|payment/i.test(t.textContent||''));}
  function find(body){
    var fields=[].slice.call(body.querySelectorAll('input,select,textarea'));
    var f=fields.find(function(x){return /case/i.test((x.name||'')+' '+(x.id||''));});
    if(f)return f;
    var labs=[].slice.call(body.querySelectorAll('label'));
    for(var i=0;i<labs.length;i++)if(/\bcase\b/i.test(labs[i].textContent||'')){var p=labs[i].parentElement,x=p&&p.querySelector('input,select,textarea');if(x)return x;}
    return null;
  }
  function mount(){
    if(!open())return;
    var body=document.getElementById('modalBody');if(!body)return;
    var original=find(body);if(!original||mounted.has(original))return;
    mounted.add(original);
    var parent=original.parentElement;if(!parent)return;
    var wrap=document.createElement('div');
    wrap.style.cssText='position:relative;width:100%;';
    parent.insertBefore(wrap,original);wrap.appendChild(original);
    original.style.display='none';
    var input=document.createElement('input');
    input.type='text';input.className=original.className||'';input.placeholder='Type case number...';input.autocomplete='off';
    input.style.cssText='width:100%;box-sizing:border-box;';
    var menu=document.createElement('div');
    menu.setAttribute('role','listbox');
    menu.style.cssText='position:absolute;left:0;right:0;top:100%;z-index:99999;background:#fff;border:1px solid #d1d5db;border-radius:8px;max-height:240px;overflow-y:auto;display:none;box-shadow:0 8px 20px rgba(0,0,0,.12);';
    function hide(){menu.style.display='none';}
    function render(){
      var cases=state().cases;if(!Array.isArray(cases))cases=[];
      var q=norm(input.value);menu.innerHTML='';
      cases.filter(function(c){var l=label(c);return !q||norm(l).indexOf(q)!==-1||norm(no(c)).indexOf(q)!==-1;}).slice(0,100).forEach(function(c){
        var b=document.createElement('button');b.type='button';b.setAttribute('role','option');b.textContent=label(c);
        b.style.cssText='display:block;width:100%;text-align:left;padding:10px 12px;border:0;background:#fff;color:#111827;cursor:pointer;font:inherit;';
        b.addEventListener('mousedown',function(e){e.preventDefault();e.stopPropagation();choose(c);});
        b.addEventListener('touchstart',function(e){e.preventDefault();e.stopPropagation();choose(c);},{passive:false});
        menu.appendChild(b);
      });
      menu.style.display=menu.children.length?'block':'none';
    }
    function choose(c){
      var value=no(c);input.value=value;original.value=value;
      original.dispatchEvent(new Event('input',{bubbles:true}));
      original.dispatchEvent(new Event('change',{bubbles:true}));
      hide();
    }
    input.addEventListener('focus',render);
    input.addEventListener('click',render);
    input.addEventListener('input',render);
    input.addEventListener('keyup',render);
    input.addEventListener('keydown',function(e){if(e.key==='Escape')hide();});
    document.addEventListener('mousedown',function(e){if(!wrap.contains(e.target))hide();});
    wrap.appendChild(input);wrap.appendChild(menu);
    var selected=original.options&&original.options[original.selectedIndex];
    if(selected&&selected.value)input.value=selected.textContent||selected.value;
  }
  var observer=new MutationObserver(function(){setTimeout(mount,30);});
  function init(){if(!document.body)return;observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});setTimeout(mount,0);setTimeout(mount,100);setTimeout(mount,500);setTimeout(mount,1000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();