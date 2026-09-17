(function(){
'use strict';
function txt(v){return v==null?'':String(v).trim();}
function norm(v){return txt(v).toLowerCase().replace(/\s+/g,' ');}
function data(){try{return JSON.parse(localStorage.getItem('advocateDeskData')||'{}')||{};}catch(e){return {};}}
function modal(){var m=document.getElementById('modal'),t=document.getElementById('modalTitle');return m&&!m.classList.contains('hidden')&&t&&/create invoice|new invoice|invoice/i.test(t.textContent||'')?m:null;}
function fieldByLabel(root,kind){
  var labels=[].slice.call(root.querySelectorAll('label'));
  for(var i=0;i<labels.length;i++){
    var l=norm(labels[i].textContent);
    var ok=kind==='case'
      ?(l==='case'||l.indexOf('case number')>=0||l.indexOf('case no')>=0)
      :(l==='client'||l.indexOf('client name')>=0);
    if(!ok)continue;
    var id=labels[i].htmlFor||labels[i].getAttribute('for');
    if(id){var byId=document.getElementById(id);if(byId)return byId;}
    var p=labels[i].parentElement;
    var el=p&&p.querySelector('select,input:not([type="hidden"]),textarea');
    if(el)return el;
  }
  return null;
}
function cases(){var d=data();return [].concat(Array.isArray(d.cases)?d.cases:[],Array.isArray(d.caseRecords)?d.caseRecords:[],Array.isArray(d.allCases)?d.allCases:[]);}
function clients(){var d=data();return Array.isArray(d.clients)?d.clients:[];}
function caseNo(c){return txt(c.number||c.caseNumber||c.case_no||c.caseNo||c.case_number||c.displayNumber);}
function caseId(c){return txt(c.id||c.caseId||c.case_id||c.value);}
function clientId(c){return txt(c.id||c.clientId||c.client_id);}
function clientName(c){return txt(c.name||c.clientName||c.client_name||c.fullName||c.full_name);}
function linkedClient(c){
  var links=[c.clientId,c.client_id,c.client,c.clientName,c.client_name,c.party,c.partyName].filter(Boolean).map(norm);
  var found=clients().find(function(x){return links.indexOf(norm(clientId(x)))>=0||links.indexOf(norm(clientName(x)))>=0;});
  if(found)return found;
  if(typeof c.client==='string'&&c.client)return {id:'',name:c.client};
  return null;
}
function visibleCaseText(select){
  if(!select)return '';
  var p=select.parentElement;
  var input=p&&p.querySelector('input:not([type="hidden"]):not([data-finance-client-display])');
  return input?txt(input.value):'';
}
function selectedCase(select){
  var list=cases();
  var values=[txt(select&&select.value),visibleCaseText(select)];
  for(var i=0;i<values.length;i++){
    var raw=values[i];if(!raw)continue;
    var found=list.find(function(c){return norm(caseId(c))===norm(raw)||norm(caseNo(c))===norm(raw)||norm(c.title)===norm(raw)||norm(c.name)===norm(raw);});
    if(found)return found;
    found=list.find(function(c){return norm(caseNo(c))===norm(raw)||norm(caseNo(c)).indexOf(norm(raw))>=0;});
    if(found)return found;
  }
  return null;
}
function makeReadonly(select){
  if(!select||select.dataset.finalReadonly==='1')return;
  var wrap=select.parentElement;
  select.dataset.finalReadonly='1';
  select.style.display='none';
  select.setAttribute('aria-hidden','true');
  var display=wrap.querySelector('[data-finance-client-display="true"]')||document.createElement('input');
  display.type='text';
  display.className=select.className||'';
  display.readOnly=true;
  display.tabIndex=-1;
  display.placeholder='Select a case';
  display.setAttribute('aria-label','Client name');
  display.dataset.financeClientDisplay='true';
  display.style.cursor='default';
  if(!display.parentElement)wrap.appendChild(display);
}
function clientControls(field){
  var wrap=field&&field.parentElement;
  var select=field&&field.tagName==='SELECT'?field:null;
  if(!select&&wrap)select=wrap.querySelector('select');
  var display=field&&field.matches&&field.matches('[data-finance-client-display="true"]')?field:null;
  if(!display&&wrap)display=wrap.querySelector('[data-finance-client-display="true"]');
  if(!display&&field&&field.tagName==='INPUT'&&field.type!=='hidden')display=field;
  return {wrap:wrap,select:select,display:display};
}
function setDisplay(ctrl,name){
  if(ctrl&&ctrl.display){ctrl.display.value=name||'';ctrl.display.placeholder=name?'':'Select a case';}
}
function sync(){
  var m=modal();if(!m)return;
  var body=document.getElementById('modalBody')||m;
  var cf=fieldByLabel(body,'case'),cl=fieldByLabel(body,'client');
  if(!cf||!cl)return;
  var ctrl=clientControls(cl);
  if(ctrl.select)makeReadonly(ctrl.select);
  var c=selectedCase(cf);
  if(!c){setDisplay(ctrl,'');if(ctrl.select)ctrl.select.value='';return;}
  var client=linkedClient(c);
  if(!client){setDisplay(ctrl,'');return;}
  var cid=clientId(client),name=clientName(client);
  if(ctrl.select){
    var opt=[].slice.call(ctrl.select.options||[]).find(function(o){return norm(o.value)===norm(cid)||norm(o.textContent)===norm(name)||norm(o.value)===norm(name);});
    if(!opt){opt=document.createElement('option');opt.value=cid||name;opt.textContent=name;ctrl.select.appendChild(opt);}
    ctrl.select.value=opt.value;
    ctrl.select.dataset.caseId=caseId(c);
    ctrl.select.dataset.clientId=cid;
  }
  if(ctrl.display){
    ctrl.display.value=name;
    ctrl.display.placeholder='';
    ctrl.display.dataset.caseId=caseId(c);
    ctrl.display.dataset.clientId=cid;
    ctrl.display.dataset.clientName=name;
  }
}
function init(){
  var root=document.getElementById('modalBody')||document.body;
  if(!root||root.dataset.financeFinalInit==='1')return;
  root.dataset.financeFinalInit='1';
  var run=function(){[0,60,150,300,600,1000].forEach(function(ms){setTimeout(sync,ms);});};
  new MutationObserver(run).observe(root,{childList:true,subtree:true});
  document.addEventListener('input',run,true);
  document.addEventListener('change',run,true);
  document.addEventListener('click',run,true);
  document.addEventListener('keydown',run,true);
  run();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
