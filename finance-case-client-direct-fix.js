(function(){
'use strict';

function text(v){return v==null?'':String(v).trim();}
function norm(v){return text(v).toLowerCase().replace(/\s+/g,' ');}
function getData(){try{return JSON.parse(localStorage.getItem('advocateDeskData')||'{}')||{};}catch(e){return {};}}
function cases(){var d=getData();return Array.isArray(d.cases)?d.cases:[];}
function clients(){var d=getData();return Array.isArray(d.clients)?d.clients:[];}
function caseId(c){return text(c&& (c.id||c.caseId||c.case_id||c.value));}
function caseNumber(c){return text(c&& (c.number||c.caseNumber||c.case_no||c.caseNo||c.case_number||c.displayNumber));}
function caseTitle(c){return text(c&& (c.title||c.caseTitle||c.name||c.case_name));}
function clientId(c){return text(c&& (c.id||c.clientId||c.client_id));}
function clientName(c){return text(c&& (c.name||c.clientName||c.client_name||c.fullName||c.full_name));}
function findCase(raw){
  raw=text(raw); if(!raw)return null;
  var n=norm(raw), list=cases();
  var c=list.find(function(x){return norm(caseId(x))===n||norm(caseNumber(x))===n;});
  if(c)return c;
  return list.find(function(x){return norm(caseNumber(x))&&norm(caseNumber(x)).indexOf(n)!==-1;})||null;
}
function relatedClient(c){
  if(!c)return null;
  var links=[c.clientId,c.client_id,c.client,c.clientName,c.client_name,c.party,c.partyName].filter(Boolean).map(norm);
  var found=clients().find(function(x){return links.indexOf(norm(clientId(x)))!==-1||links.indexOf(norm(clientName(x)))!==-1;});
  if(found)return found;
  if(text(c.client))return {id:'',name:text(c.client)};
  return null;
}
function financeModal(){
  var m=document.getElementById('modal'),t=document.getElementById('modalTitle');
  return m&&!m.classList.contains('hidden')&&t&&/create invoice|new invoice|invoice/i.test(text(t.textContent))?m:null;
}
function caseInput(m){
  var root=m.querySelector('.finance-case-autocomplete');
  if(root){var i=root.querySelector('input:not([type="hidden"])');if(i)return i;}
  var labels=[].slice.call(m.querySelectorAll('label'));
  for(var i=0;i<labels.length;i++){
    var l=norm(labels[i].textContent);
    if(l==='case'||l.indexOf('case number')!==-1||l.indexOf('case no')!==-1){
      var id=labels[i].htmlFor||labels[i].getAttribute('for');
      if(id){var el=document.getElementById(id);if(el)return el;}
      var p=labels[i].parentElement,el2=p&&p.querySelector('input:not([type="hidden"]),select');
      if(el2)return el2;
    }
  }
  return null;
}
function clientField(m){
  var labels=[].slice.call(m.querySelectorAll('label'));
  for(var i=0;i<labels.length;i++){
    var l=norm(labels[i].textContent);
    if(l!=='client'&&l.indexOf('client name')===-1)continue;
    var id=labels[i].htmlFor||labels[i].getAttribute('for');
    if(id){var el=document.getElementById(id);if(el)return el;}
    var p=labels[i].parentElement;
    var display=p&&p.querySelector('[data-finance-client-display="true"]');
    if(display)return display;
    var input=p&&p.querySelector('input:not([type="hidden"]),select');
    if(input)return input;
  }
  return m.querySelector('[data-finance-client-display="true"]');
}
function controls(field){
  var wrap=field&&field.parentElement;
  var select=field&&field.tagName==='SELECT'?field:null;
  if(!select&&wrap)select=wrap.querySelector('select');
  var display=field&&field.tagName==='INPUT'?field:null;
  if(!display&&wrap)display=wrap.querySelector('[data-finance-client-display="true"],input:not([type="hidden"])');
  return {select:select,display:display,wrap:wrap};
}
function hideClientDropdown(ctrl){
  if(!ctrl||!ctrl.select)return;
  ctrl.select.dataset.directClientHidden='1';
  ctrl.select.style.display='none';
  ctrl.select.setAttribute('aria-hidden','true');
  var wrap=ctrl.select.parentElement;
  if(!wrap)return;
  var d=wrap.querySelector('[data-finance-client-display="true"]');
  if(!d){
    d=document.createElement('input');
    d.type='text';
    d.className=ctrl.select.className||'';
    d.readOnly=true;
    d.tabIndex=-1;
    d.dataset.financeClientDisplay='true';
    d.setAttribute('aria-label','Client name');
    d.placeholder='Select a case';
    wrap.appendChild(d);
  }
  ctrl.display=d;
}
function setClient(m,c){
  var field=clientField(m); if(!field)return;
  var ctrl=controls(field); hideClientDropdown(ctrl);
  if(!ctrl.display)ctrl.display=field;
  var name=clientName(c),cid=clientId(c);
  if(ctrl.select){
    var opt=[].slice.call(ctrl.select.options||[]).find(function(o){return norm(o.value)===norm(cid)||norm(o.textContent)===norm(name)||norm(o.value)===norm(name);});
    if(!opt){opt=document.createElement('option');opt.value=cid||name;opt.textContent=name;ctrl.select.appendChild(opt);}
    ctrl.select.value=opt.value;
    ctrl.select.dataset.selectedClientId=cid;
    ctrl.select.dataset.selectedCaseId=ctrl.select.dataset.selectedCaseId||'';
  }
  ctrl.display.value=name;
  ctrl.display.placeholder='';
  ctrl.display.dataset.selectedClientId=cid;
  ctrl.display.dataset.selectedClientName=name;
}
function clearClient(m){
  var field=clientField(m);if(!field)return;
  var ctrl=controls(field);hideClientDropdown(ctrl);
  if(ctrl.select){ctrl.select.value='';ctrl.select.dataset.selectedClientId='';ctrl.select.dataset.selectedCaseId='';}
  if(ctrl.display){ctrl.display.value='';ctrl.display.placeholder='Select a case';delete ctrl.display.dataset.selectedClientId;delete ctrl.display.dataset.selectedClientName;}
}
function syncCaseId(m,c){
  var cf=caseInput(m);if(!cf||!c)return;
  var id=caseId(c),num=caseNumber(c);
  cf.dataset.selectedCaseId=id;
  cf.dataset.selectedCaseNumber=num;
  var original=cf.tagName==='SELECT'?cf:m.querySelector('.finance-case-autocomplete select');
  if(original){original.dataset.selectedCaseId=id;original.dataset.selectedCaseNumber=num;}
  var client=clientField(m);if(client){var ctrl=controls(client);if(ctrl.select)ctrl.select.dataset.selectedCaseId=id;if(ctrl.display)ctrl.display.dataset.selectedCaseId=id;}
}
function sync(){
  var m=financeModal();if(!m)return;
  var cf=caseInput(m),cl=clientField(m);if(!cf||!cl)return;
  var raw='';
  if(cf.tagName==='SELECT'){var o=cf.options[cf.selectedIndex];raw=o?text(o.textContent||o.value):text(cf.value);}
  else raw=text(cf.value);
  var c=findCase(raw);
  if(!c){clearClient(m);return;}
  var client=relatedClient(c);
  if(!client){clearClient(m);return;}
  syncCaseId(m,c);
  setClient(m,client);
}
function init(){
  if(window.__financeDirectCaseClientFix)return;
  window.__financeDirectCaseClientFix=true;
  var run=function(){setTimeout(sync,0);setTimeout(sync,40);setTimeout(sync,120);};
  document.addEventListener('input',function(e){var m=financeModal();if(m&&e.target&&e.target.closest&&e.target.closest('.finance-case-autocomplete'))run();},true);
  document.addEventListener('change',function(e){var m=financeModal();if(m&&e.target&&e.target.closest&&e.target.closest('.finance-case-autocomplete'))run();},true);
  document.addEventListener('click',function(e){var m=financeModal();if(m&&e.target&&e.target.closest&&e.target.closest('.finance-case-results'))run();},true);
  document.addEventListener('keydown',function(e){if(e.key==='Enter'){var m=financeModal();if(m&&e.target&&e.target.closest&&e.target.closest('.finance-case-autocomplete'))run();}},true);
  new MutationObserver(function(){run();}).observe(document.body,{childList:true,subtree:true});
  run();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
