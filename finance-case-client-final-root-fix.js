(function(){
'use strict';

function str(v){return v==null?'':String(v).trim();}
function key(v){return str(v).toLowerCase().replace(/\s+/g,' ');}
function data(){try{return JSON.parse(localStorage.getItem('advocateDeskData')||'{}')||{};}catch(e){return {};}}
function list(name){var d=data();return Array.isArray(d[name])?d[name]:[];}
function caseNumber(c){return str(c.number||c.caseNumber||c.case_no||c.caseNo||c.case_number||c.displayNumber);}
function caseId(c){return str(c.id||c.caseId||c.case_id);}
function caseClientValue(c){return str(c.clientId||c.client_id||c.clientName||c.client_name||c.client||c.party||c.partyName);}
function clientId(c){return str(c.id||c.clientId||c.client_id);}
function clientName(c){return str(c.name||c.clientName||c.client_name||c.fullName||c.full_name);}
function findCase(value){
  var q=key(value);if(!q)return null;
  return list('cases').find(function(c){
    return key(caseId(c))===q || key(caseNumber(c))===q;
  }) || list('cases').find(function(c){
    var n=key(caseNumber(c));return n && (n===q || n.indexOf(q)!==-1);
  }) || null;
}
function findClient(c){
  if(!c)return null;
  var link=key(caseClientValue(c));
  if(!link)return null;
  var found=list('clients').find(function(x){return key(clientId(x))===link||key(clientName(x))===link;});
  return found||({id:'',name:caseClientValue(c)});
}
function modal(){
  var m=document.getElementById('modal'),t=document.getElementById('modalTitle');
  return m&&!m.classList.contains('hidden')&&t&&/invoice/i.test(str(t.textContent))?m:null;
}
function caseVisible(m){
  var x=m.querySelector('.finance-case-autocomplete input:not([type="hidden"])');
  if(x)return x;
  var labels=[].slice.call(m.querySelectorAll('label'));
  for(var i=0;i<labels.length;i++){
    if(!/^case(?: number| no)?$/i.test(str(labels[i].textContent)))continue;
    var p=labels[i].parentElement;
    var y=p&&p.querySelector('input:not([type="hidden"]),select');
    if(y)return y;
  }
  return null;
}
function clientControls(m){
  var display=m.querySelector('[data-finance-client-display="true"]');
  if(display)return {display:display,select:null};
  var labels=[].slice.call(m.querySelectorAll('label'));
  for(var i=0;i<labels.length;i++){
    if(!/^client(?: name)?$/i.test(str(labels[i].textContent)))continue;
    var p=labels[i].parentElement;
    var input=p&&p.querySelector('input:not([type="hidden"])');
    var select=p&&p.querySelector('select');
    if(input)return {display:input,select:select};
    if(select)return {display:null,select:select};
  }
  return {display:null,select:null};
}
function originalCaseSelect(m){return m.querySelector('.finance-case-autocomplete select')||null;}
function setClient(m,c){
  var ctl=clientControls(m),name=clientName(c),cid=clientId(c);
  if(!name)return;
  if(ctl.select){
    var opt=[].slice.call(ctl.select.options||[]).find(function(o){return key(o.value)===key(cid)||key(o.textContent)===key(name);});
    if(!opt){opt=document.createElement('option');opt.value=cid||name;opt.textContent=name;ctl.select.appendChild(opt);}
    ctl.select.value=opt.value;
    ctl.select.dataset.selectedClientId=cid;
    ctl.select.dispatchEvent(new Event('input',{bubbles:true}));
    ctl.select.dispatchEvent(new Event('change',{bubbles:true}));
  }
  if(ctl.display){
    ctl.display.value=name;
    ctl.display.placeholder='';
    ctl.display.readOnly=true;
    ctl.display.dataset.selectedClientId=cid;
    ctl.display.dataset.selectedClientName=name;
  }
}
function clearClient(m){
  var ctl=clientControls(m);
  if(ctl.select){ctl.select.value='';ctl.select.dataset.selectedClientId='';}
  if(ctl.display){ctl.display.value='';ctl.display.placeholder='Select a case';delete ctl.display.dataset.selectedClientId;delete ctl.display.dataset.selectedClientName;}
}
function sync(){
  var m=modal();if(!m)return;
  var ci=caseVisible(m);if(!ci)return;
  var raw=str(ci.value);
  if(!raw){clearClient(m);return;}
  var c=findCase(raw);if(!c){return;}
  var cl=findClient(c);if(!cl){clearClient(m);return;}
  var cs=originalCaseSelect(m),id=caseId(c),num=caseNumber(c);
  ci.dataset.selectedCaseId=id;ci.dataset.selectedCaseNumber=num;
  if(cs){cs.dataset.selectedCaseId=id;cs.dataset.selectedCaseNumber=num;}
  setClient(m,cl);
}
function init(){
  if(window.__financeCaseClientRootFix)return;
  window.__financeCaseClientRootFix=true;
  var run=function(){sync();setTimeout(sync,50);setTimeout(sync,200);};
  document.addEventListener('input',function(e){if(e.target&&e.target.closest&&e.target.closest('.finance-case-autocomplete'))run();},true);
  document.addEventListener('change',function(e){if(e.target&&e.target.closest&&e.target.closest('.finance-case-autocomplete'))run();},true);
  document.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('.finance-case-results'))run();},true);
  document.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target&&e.target.closest&&e.target.closest('.finance-case-autocomplete'))run();},true);
  new MutationObserver(run).observe(document.body,{childList:true,subtree:true});
  setInterval(run,500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
