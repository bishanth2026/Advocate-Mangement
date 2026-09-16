(function(){
'use strict';
var mounted=new WeakSet();
function state(){try{return JSON.parse(localStorage.getItem('advocateDeskData')||'{}')||{};}catch(e){return {};}}
function s(v){return String(v==null?'':v).trim();}
function n(v){return s(v).toLowerCase();}
function no(c){return s(c&&(c.number||c.caseNumber||c.caseNo||c.case_number||c.id));}
function label(c){return [no(c),s(c&&(c.title||c.caseTitle||c.name))].filter(Boolean).join(' — ')||no(c);}
function active(){var m=document.getElementById('modal'),t=document.getElementById('modalTitle');return m&&!m.classList.contains('hidden')&&t&&/invoice|finance|payment/i.test(t.textContent||'');}
function find(body){var ss=[].slice.call(body.querySelectorAll('select'));return ss.find(function(x){return /case/i.test((x.name||'')+' '+(x.id||'')+' '+(x.parentElement&&x.parentElement.textContent||''));})||ss[1]||ss[0];}
function mount(){if(!active())return;var body=document.getElementById('modalBody');if(!body)return;var field=find(body);if(!field||mounted.has(field))return;var cases=state().cases;if(!Array.isArray(cases))cases=[];mounted.add(field);
var wrap=document.createElement('div');wrap.style.cssText='position:relative;width:100%;';
var input=document.createElement('input');input.type='text';input.className=field.className||'';input.placeholder='Type case number...';input.autocomplete='off';input.style.cssText='width:100%;box-sizing:border-box;';
var menu=document.createElement('div');menu.style.cssText='position:absolute;left:0;right:0;top:100%;z-index:10000;background:#fff;border:1px solid #d1d5db;border-radius:8px;max-height:240px;overflow-y:auto;display:none;box-shadow:0 8px 20px rgba(0,0,0,.12);';
function close(){menu.style.display='none';}
function choose(c){input.value=label(c);field.value=no(c);field.dispatchEvent(new Event('change',{bubbles:true}));close();}
function render(){var q=n(input.value);menu.innerHTML='';cases.filter(function(c){return !q||n(label(c)).indexOf(q)!==-1;}).slice(0,100).forEach(function(c){var b=document.createElement('button');b.type='button';b.textContent=label(c);b.style.cssText='display:block;width:100%;text-align:left;padding:10px 12px;border:0;background:#fff;color:#111827;cursor:pointer;';b.addEventListener('mousedown',function(e){e.preventDefault();e.stopPropagation();choose(c);});menu.appendChild(b);});menu.style.display=menu.children.length?'block':'none';}
input.addEventListener('focus',render);input.addEventListener('input',function(){field.value='';render();});document.addEventListener('mousedown',function(e){if(!wrap.contains(e.target))close();});
wrap.appendChild(input);wrap.appendChild(menu);field.style.display='none';field.parentNode.insertBefore(wrap,field);
}
var ob=new MutationObserver(function(){mount();});
function init(){if(document.body)ob.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});mount();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();