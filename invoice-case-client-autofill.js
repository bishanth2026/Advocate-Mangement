(function(){
  'use strict';
  function getState(){
    try{return JSON.parse(localStorage.getItem('advocateDeskData')||'{}')||{};}catch(e){return {};}
  }
  function norm(v){return String(v||'').trim().toLowerCase();}
  function findField(labelText, tag){
    var labels=[].slice.call(document.querySelectorAll('#modalBody label'));
    var label=labels.find(function(l){return norm(l.textContent).replace(/[:*]/g,'').trim()===norm(labelText);});
    if(!label)return null;
    var field=label.parentElement&&label.parentElement.querySelector(tag||'select,input');
    return field||null;
  }
  function getCaseValue(c){return c&&(c.number||c.caseNumber||c.caseNo||c.case_number||c.id||'');}
  function getClientValue(c){return c&&(c.id||c.clientId||c.client_id||'');}
  function matchCase(selected, cases){
    var s=norm(selected);
    return cases.find(function(c){return norm(getCaseValue(c))===s||norm(c.title)===s||norm(c.caseTitle)===s||norm(c.id)===s;});
  }
  function sync(){
    var body=document.getElementById('modalBody');
    if(!body||!document.getElementById('modal')||document.getElementById('modal').classList.contains('hidden'))return;
    var title=(document.getElementById('modalTitle')||{}).textContent||'';
    if(norm(title).indexOf('invoice')===-1)return;
    var selects=[].slice.call(body.querySelectorAll('select'));
    var client=findField('Client','select')||selects[0];
    var caseField=findField('Case','select')||selects[1];
    if(!client||!caseField||caseField.dataset.invoiceAutofill==='1')return;
    caseField.dataset.invoiceAutofill='1';
    function apply(){
      var state=getState(), cases=Array.isArray(state.cases)?state.cases:[], clients=Array.isArray(state.clients)?state.clients:[];
      var selected=matchCase(caseField.value,cases);
      if(!selected)return;
      var wanted=[selected.clientId,selected.client_id,selected.client,selected.party,selected.clientName].filter(Boolean).map(norm);
      var related=clients.find(function(c){return wanted.indexOf(norm(getClientValue(c)))>=0||wanted.indexOf(norm(c.name))>=0;});
      if(!related)return;
      var value=getClientValue(related);
      var option=[].slice.call(client.options).find(function(o){return norm(o.value)===norm(value)||norm(o.textContent)===norm(related.name);});
      if(option){client.value=option.value;client.dispatchEvent(new Event('change',{bubbles:true}));}
    }
    caseField.addEventListener('change',apply);
    apply();
  }
  var last='';
  function schedule(){var body=document.getElementById('modalBody');if(!body)return;var sig=body.childElementCount+':'+((document.getElementById('modalTitle')||{}).textContent||'');if(sig===last)return;last=sig;setTimeout(sync,0);}
  var observer=new MutationObserver(schedule);
  function init(){var body=document.getElementById('modalBody');if(body)observer.observe(body,{childList:true,subtree:true});schedule();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('[onclick*="invoice"],[data-record="invoice"],#modalClose'))setTimeout(schedule,50);},true);
})();
