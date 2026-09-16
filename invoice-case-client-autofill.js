(function(){
  'use strict';
  function getState(){try{return JSON.parse(localStorage.getItem('advocateDeskData')||'{}')||{};}catch(e){return {};}}
  function norm(v){return String(v==null?'':v).trim().toLowerCase();}
  function clean(v){return norm(v).replace(/\s+/g,' ');}
  function fieldByLabel(text, selector){
    var body=document.getElementById('modalBody'); if(!body)return null;
    var labels=[].slice.call(body.querySelectorAll('label'));
    var label=labels.find(function(l){return clean(l.textContent).replace(/[:*]/g,'').trim()===clean(text);});
    if(!label)return null;
    var id=label.htmlFor||label.getAttribute('for');
    if(id){var byId=document.getElementById(id);if(byId)return byId;}
    var parent=label.parentElement;
    return parent&&parent.querySelector(selector||'select,input:not([type="hidden"]),textarea');
  }
  function valueOfCase(c){return c&&(c.number||c.caseNumber||c.caseNo||c.case_number||c.id||'');}
  function valueOfClient(c){return c&&(c.id||c.clientId||c.client_id||'');}
  function findCase(raw,cases){
    var s=clean(raw); if(!s)return null;
    return cases.find(function(c){
      return [valueOfCase(c),c.title,c.caseTitle,c.name,c.id].some(function(v){return clean(v)===s;});
    }) || cases.find(function(c){
      return [valueOfCase(c),c.title,c.caseTitle,c.name,c.id].some(function(v){return clean(v).indexOf(s)!==-1;});
    });
  }
  function currentCaseValue(field){
    if(!field)return '';
    if(field.tagName&&field.tagName.toLowerCase()==='select'){
      var o=field.options[field.selectedIndex];return field.value|| (o?o.textContent:'');
    }
    return field.value||field.getAttribute('data-case-value')||'';
  }
  function sync(){
    var modal=document.getElementById('modal'),body=document.getElementById('modalBody');
    if(!modal||modal.classList.contains('hidden')||!body)return;
    var title=(document.getElementById('modalTitle')||{}).textContent||'';
    if(!/invoice|finance|payment/i.test(title))return;
    var caseField=fieldByLabel('Case','select,input:not([type="hidden"]),textarea');
    var client=fieldByLabel('Client','select');
    if(!caseField||!client)return;
    if(caseField.dataset.invoiceAutofillBound==='1')return;
    caseField.dataset.invoiceAutofillBound='1';
    function apply(){
      var state=getState(),cases=Array.isArray(state.cases)?state.cases:[],clients=Array.isArray(state.clients)?state.clients:[];
      var selected=findCase(currentCaseValue(caseField),cases);
      if(!selected)return;
      var wanted=[selected.clientId,selected.client_id,selected.client,selected.party,selected.clientName,selected.client_name].filter(Boolean).map(clean);
      var related=clients.find(function(c){return wanted.indexOf(clean(valueOfClient(c)))!==-1||wanted.indexOf(clean(c.name))!==-1;});
      if(!related)return;
      var wantedValue=valueOfClient(related),option=[].slice.call(client.options||[]).find(function(o){return clean(o.value)===clean(wantedValue)||clean(o.textContent)===clean(related.name);});
      if(option&&client.value!==option.value){client.value=option.value;client.dispatchEvent(new Event('change',{bubbles:true}));}
    }
    ['change','input','blur'].forEach(function(ev){caseField.addEventListener(ev,apply);});
    apply();
  }
  function schedule(){setTimeout(sync,0);setTimeout(sync,120);setTimeout(sync,400);}
  function init(){var body=document.getElementById('modalBody');if(body)new MutationObserver(schedule).observe(body,{childList:true,subtree:true});schedule();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('[onclick*="invoice"],[data-record="invoice"],#modalClose'))schedule();},true);
})();
