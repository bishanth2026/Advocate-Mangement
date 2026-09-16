(function(){
'use strict';
var bound=new WeakSet();
function state(){try{return JSON.parse(localStorage.getItem('advocateDeskData')||'{}')||{};}catch(e){return {};}}
function str(v){return String(v==null?'':v).trim();}
function norm(v){return str(v).toLowerCase().replace(/\s+/g,' ');}
function cleanLabel(v){return norm(v).replace(/[*:]/g,'').trim();}
function isCaseLabel(v){var x=cleanLabel(v);return /^(case|case number|case no|case id|select case)$/.test(x)||x.indexOf('case number')>=0;}
function isClientLabel(v){var x=cleanLabel(v);return /^(client|client name|party|customer)$/.test(x)||x.indexOf('client')>=0;}
function controlForLabel(label,selector){var id=label.htmlFor||label.getAttribute('for');if(id){var el=document.getElementById(id);if(el)return el;}var p=label.parentElement;return p&&p.querySelector(selector||'select,input:not([type="hidden"]),textarea');}
function findControl(body,test,selector){var labels=[].slice.call(body.querySelectorAll('label'));for(var i=0;i<labels.length;i++){if(test(labels[i].textContent||'')){var el=controlForLabel(labels[i],selector);if(el)return el;}}return null;}
function caseNumber(c){return str(c.number||c.caseNumber||c.case_no||c.caseNo||c.case_number||c.displayNumber);}
function caseLabel(c){return str(c.label||c.text)||[caseNumber(c),str(c.title||c.caseTitle||c.name||c.case_name)].filter(Boolean).join(' — ')||str(c.id);}
function caseId(c){return str(c.id||c.caseId||c.case_id);}
function clientId(c){return str(c.id||c.clientId||c.client_id);}
function getValue(el){if(!el)return '';if(el.tagName==='SELECT'){var o=el.options[el.selectedIndex];return str(el.value|| (o&&o.textContent));}return str(el.value||el.getAttribute('data-case-value'));}
function findCase(raw,cases){var q=norm(raw);if(!q)return null;var exact=cases.find(function(c){return [caseNumber(c),caseLabel(c),caseId(c),c.title,c.name].some(function(v){return norm(v)===q;});});if(exact)return exact;return cases.find(function(c){return [caseNumber(c),caseLabel(c),caseId(c),c.title,c.name].some(function(v){return norm(v).indexOf(q)>=0;});});}
function setValue(el,value){if(!el)return false;var changed=el.value!==value;el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));return changed;}
function apply(){var modal=document.getElementById('modal'),body=document.getElementById('modalBody');if(!modal||modal.classList.contains('hidden')||!body)return;var title=str((document.getElementById('modalTitle')||{}).textContent);if(!/invoice|finance|payment/i.test(title))return;var cf=findControl(body,isCaseLabel);var cl=findControl(body,isClientLabel);if(!cf||!cl)return;var d=state(),cases=Array.isArray(d.cases)?d.cases:[],clients=Array.isArray(d.clients)?d.clients:[];var selected=findCase(getValue(cf),cases);if(!selected)return;var wanted=[selected.clientId,selected.client_id,selected.client,selected.clientName,selected.client_name,selected.party,selected.partyName].filter(Boolean).map(norm);var related=clients.find(function(c){return wanted.indexOf(norm(clientId(c)))>=0||wanted.indexOf(norm(c.name))>=0;});if(!related)return;var cid=clientId(related);if(cl.tagName==='SELECT'){var opt=[].slice.call(cl.options||[]).find(function(o){return norm(o.value)===norm(cid)||norm(o.textContent)===norm(related.name);});if(opt)setValue(cl,opt.value);}else{setValue(cl,related.name);cl.setAttribute('data-client-id',cid);}}
function schedule(){[0,80,250,600].forEach(function(ms){setTimeout(apply,ms);});}
function init(){var body=document.getElementById('modalBody');if(!body)return;new MutationObserver(schedule).observe(body,{childList:true,subtree:true});document.addEventListener('input',function(e){if(e.target&&e.target.closest&&e.target.closest('#modalBody'))schedule();},true);document.addEventListener('change',function(e){if(e.target&&e.target.closest&&e.target.closest('#modalBody'))schedule();},true);schedule();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();