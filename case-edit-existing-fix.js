/* Reliable case-edit hydration. Keeps all existing case functions intact. */
(function(){
  'use strict';
  function collection(type){
    return ({case:'cases',client:'clients',hearing:'hearings',task:'tasks',discussion:'discussions',meeting:'meetings'})[type]||type+'s';
  }
  function currentData(){
    try{return JSON.parse(localStorage.getItem('advocateDeskData')||'null')||{};}catch(e){return {};}
  }
  function findClientValue(select,value){
    if(!select||value==null)return;
    const wanted=String(value).trim().toLowerCase();
    const option=Array.from(select.options||[]).find(function(o){return String(o.value||'').trim().toLowerCase()===wanted||String(o.textContent||'').trim().toLowerCase()===wanted||String(o.dataset.name||'').trim().toLowerCase()===wanted;});
    if(option)select.value=option.value;
  }
  function setValue(id,value){
    const el=document.getElementById(id);if(!el||value==null)return;
    el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function hydrateCase(item){
    if(!item)return;
    setValue('f1',item.number||'');setValue('f2',item.title||'');setValue('f4',item.court||'');setValue('f5',item.next||item.nextHearing||'');setValue('f6',item.type||'Civil');setValue('f7',item.status||'Active');
    const number=String(item.number||'').trim().match(/^([A-Za-z]+)\s*(.*)$/);
    const prefix=document.getElementById('caseNumberPrefix');const numberInput=document.getElementById('caseNumberValue');
    if(number&&prefix&&numberInput){prefix.value=number[1].toUpperCase();numberInput.value=number[2]||'';prefix.dispatchEvent(new Event('change',{bubbles:true}));}
    const ids=Array.isArray(item.clientIds)?item.clientIds.slice():item.clientId?[item.clientId]:[];
    const clientsSelect=document.getElementById('f3');
    if(clientsSelect&&clientsSelect.multiple){Array.from(clientsSelect.options).forEach(function(o){o.selected=ids.map(String).includes(String(o.value));});clientsSelect.dispatchEvent(new Event('change',{bubbles:true}));}
    const parts=String(item.title||'').split(/\s+(?:vs\.?|v\.)\s+/i);
    const petitioner=item.petitioner||item.petitionerId||(parts.length>1?parts[0]:'');
    const respondent=item.respondent||item.respondentId||(parts.length>1?parts.slice(1).join(' '):'');
    findClientValue(document.getElementById('casePetitioner'),petitioner);findClientValue(document.getElementById('caseRespondent'),respondent);
  }
  function install(){
    if(typeof window.openEditModal!=='function'||window.openEditModal.__caseEditFixed)return;
    const original=window.openEditModal;
    function fixed(type,index){
      const data=currentData();const list=data[collection(type)];const item=Array.isArray(list)?list[index]:null;
      original.apply(this,arguments);
      if(type==='case'&&item){window.setTimeout(function(){hydrateCase(item);},0);window.setTimeout(function(){hydrateCase(item);},120);}
    }
    fixed.__caseEditFixed=true;window.openEditModal=fixed;
  }
  function boot(){install();new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
