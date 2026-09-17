(function(){
'use strict';

var KEY='advocateDeskData';
function s(v){return v==null?'':String(v).trim();}
function n(v){return s(v).toLowerCase().replace(/\s+/g,' ');}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return {};}}
function allCases(){var d=read();return [].concat(d.cases||[],d.caseRecords||[],d.allCases||[]).filter(Boolean);}
function allClients(){var d=read();return Array.isArray(d.clients)?d.clients:[];}
function id(x){return s(x&& (x.id||x.clientId||x.client_id));}
function name(x){return s(x&& (x.name||x.clientName||x.client_name||x.fullName||x.full_name));}
function caseId(x){return s(x&& (x.id||x.caseId||x.case_id));}
function caseNo(x){return s(x&& (x.number||x.caseNumber||x.case_no||x.caseNo||x.case_number||x.displayNumber));}
function relatedClient(c){
  if(!c)return null;
  var refs=[c.clientId,c.client_id,c.client,c.clientName,c.client_name,c.party,c.partyName].map(n).filter(Boolean);
  var found=allClients().find(function(cl){return refs.indexOf(n(id(cl)))>=0||refs.indexOf(n(name(cl)))>=0;});
  if(found)return found;
  if(s(c.client))return {id:'',name:s(c.client)};
  return null;
}
function isInvoiceModal(){
  var m=document.getElementById('modal'),t=document.getElementById('modalTitle');
  return !!(m&&!m.classList.contains('hidden')&&t&&/invoice/i.test(t.textContent||''));
}
function root(){return document.getElementById('modalBody')||document.getElementById('modal')||document.body;}
function labelField(kind){
  var r=root();
  var labels=[].slice.call(r.querySelectorAll('label'));
  for(var i=0;i<labels.length;i++){
    var text=n(labels[i].textContent);
    var match=kind==='case'?(text==='case'||text.indexOf('case number')>=0||text.indexOf('case no')>=0):(text==='client'||text.indexOf('client name')>=0);
    if(!match)continue;
    var forId=labels[i].htmlFor||labels[i].getAttribute('for');
    if(forId){var byId=document.getElementById(forId);if(byId)return byId;}
    var p=labels[i].parentElement;
    var f=p&&p.querySelector('input:not([type="hidden"]),select,textarea');
    if(f)return f;
  }
  return null;
}
function caseText(field){
  if(!field)return '';
  if(field.tagName==='INPUT'||field.tagName==='TEXTAREA')return s(field.value);
  if(field.tagName==='SELECT'){
    var opt=field.options&&field.options[field.selectedIndex];
    return s(field.value)||s(opt&&opt.textContent);
  }
  return s(field.textContent);
}
function findCase(field){
  var raw=caseText(field), list=allCases();
  if(!raw)return null;
  var exact=list.find(function(c){return [caseId(c),caseNo(c),c.title,c.name].some(function(v){return n(v)===n(raw);});});
  if(exact)return exact;
  return list.find(function(c){return n(caseNo(c))===n(raw)||n(caseNo(c)).indexOf(n(raw))>=0;})||null;
}
function clientControls(field){
  var p=field&&field.parentElement;
  var hidden=p&&p.querySelector('select');
  var display=field&&field.tagName==='INPUT'&&field.type!=='hidden'?field:null;
  if(!display&&p)display=p.querySelector('input:not([type="hidden"])');
  if(!display&&p)display=p.querySelector('[data-finance-client-display="true"]');
  return {hidden:hidden,display:display};
}
function ensureReadonly(ctrl){
  if(!ctrl||!ctrl.display)return;
  ctrl.display.readOnly=true;
  ctrl.display.setAttribute('aria-readonly','true');
  ctrl.display.setAttribute('data-finance-client-display','true');
  ctrl.display.tabIndex=-1;
}
function emit(el,type){try{el.dispatchEvent(new Event(type,{bubbles:true}));}catch(e){try{var ev=document.createEvent('Event');ev.initEvent(type,true,true);el.dispatchEvent(ev);}catch(_){}}}
function clearClient(ctrl){
  if(ctrl.hidden){ctrl.hidden.value='';ctrl.hidden.dataset.caseId='';ctrl.hidden.dataset.clientId='';}
  if(ctrl.display){ctrl.display.value='';ctrl.display.placeholder='Select a case';ctrl.display.dataset.caseId='';ctrl.display.dataset.clientId='';ctrl.display.dataset.clientName='';}
}
function sync(){
  if(!isInvoiceModal())return;
  var cf=labelField('case'),cl=labelField('client');
  if(!cf||!cl)return;
  var ctrl=clientControls(cl);ensureReadonly(ctrl);
  var c=findCase(cf);
  if(!c){clearClient(ctrl);return;}
  var client=relatedClient(c);
  if(!client){
    if(ctrl.display){ctrl.display.value='Client information not found for this case.';ctrl.display.placeholder='';}
    return;
  }
  var clientName=name(client)||s(c.client);
  var clientKey=id(client)||clientName;
  var selectedCaseId=caseId(c);
  if(ctrl.hidden){
    var option=[].slice.call(ctrl.hidden.options||[]).find(function(o){return n(o.value)===n(clientKey)||n(o.textContent)===n(clientName);});
    if(!option){option=document.createElement('option');option.value=clientKey;option.textContent=clientName;ctrl.hidden.appendChild(option);}
    ctrl.hidden.value=option.value;
    ctrl.hidden.dataset.caseId=selectedCaseId;
    ctrl.hidden.dataset.clientId=id(client);
  }
  if(ctrl.display){
    ctrl.display.value=clientName;
    ctrl.display.placeholder='';
    ctrl.display.dataset.caseId=selectedCaseId;
    ctrl.display.dataset.clientId=id(client);
    ctrl.display.dataset.clientName=clientName;
  }
  var m=document.getElementById('modal');
  if(m){m.dataset.selectedCaseId=selectedCaseId;m.dataset.selectedClientId=id(client);m.dataset.selectedCaseNumber=caseNo(c);m.dataset.selectedClientName=clientName;}
}
function schedule(){[0,25,100,250,500].forEach(function(ms){setTimeout(sync,ms);});}
function init(){
  if(window.__financeCaseClientPermanentFix)return;
  window.__financeCaseClientPermanentFix=true;
  document.addEventListener('input',schedule,true);
  document.addEventListener('change',schedule,true);
  document.addEventListener('click',schedule,true);
  document.addEventListener('keydown',schedule,true);
  var mo=new MutationObserver(schedule);mo.observe(document.body,{childList:true,subtree:true});
  schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
