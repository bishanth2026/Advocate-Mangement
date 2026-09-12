/* Direct Supabase persistence for New/Edit Case forms. */
(function(){
  'use strict';
  var active=false, KEY='advocateDeskData';
  function ready(){return !!(window.ADCloudCRUD&&window.ADCloudCRUD.ready&&window.ADCloudCRUD.ready());}
  function modal(){return document.querySelector('.modal');}
  function isCaseModal(m){var h=m&&m.querySelector('h1,h2,h3,.modal-title,.modal-header strong');var t=((h&&h.textContent)||'').replace(/\s+/g,' ').toLowerCase();return t.indexOf('new case')>=0||t.indexOf('edit case')>=0;}
  function field(m,label){var labels=m.querySelectorAll('label');for(var i=0;i<labels.length;i++){if((labels[i].textContent||'').replace(/\s+/g,' ').trim().toLowerCase().indexOf(label.toLowerCase())===0)return labels[i].querySelector('input,textarea,select');}return null;}
  function value(m,label){var el=field(m,label);return el?String(el.value||'').trim():'';}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return {};}}
  function write(s){try{localStorage.setItem(KEY,JSON.stringify(s));}catch(e){console.warn('[AdvocateDesk] case cache write failed',e);}}
  function validId(id){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id||''));}
  function mapRow(r){return {id:r.id,caseNumber:r.case_number||'',title:r.title||'',court:r.court||'',caseType:r.case_type||'',status:r.status||'Active',description:r.description||'',clientId:r.client_id||'',createdAt:r.created_at||'',updatedAt:r.updated_at||'',_cloud:true};}
  async function syncCases(){if(!ready())return;var rows=await window.ADCloudCRUD.list('cases',{order:'created_at',ascending:false});var s=read();s.cases=(rows||[]).map(mapRow);write(s);}
  function casePayload(m){
    var number=value(m,'Case Number')||value(m,'Case No');
    var title=value(m,'Case Title')||value(m,'Title');
    var court=value(m,'Court');
    var type=value(m,'Case Type')||value(m,'Type');
    var status=value(m,'Status')||'Active';
    var petitioner=value(m,'Petitioner');
    var respondent=value(m,'Respondent');
    var time=value(m,'Hearing Time');
    var client=value(m,'Client');
    var p={case_number:number||null,title:title||null,court:court||null,case_type:type||null,status:status||'Active',description:[petitioner?'Petitioner: '+petitioner:'',respondent?'Respondent: '+respondent:'',time?'Hearing Time: '+time:''].filter(Boolean).join('\n')||null};
    if(client){var c=field(m,'Client');if(c&&c.value&&validId(c.value))p.client_id=c.value;}
    return p;
  }
  function findExistingId(m){var b=m.querySelector('[data-case-id]');if(b&&b.dataset.caseId)return b.dataset.caseId;var h=m.querySelector('input[name="case_id"],input[name="id"]');return h&&h.value?h.value:null;}
  async function saveCase(m){
    if(!ready())return false;
    var p=casePayload(m);if(!p.title&&!p.case_number){alert('Please enter a case number or case title.');return true;}
    var id=findExistingId(m);
    try{var row=id&&validId(id)?await window.ADCloudCRUD.update('cases',id,p):await window.ADCloudCRUD.insert('cases',p);var s=read();s.cases=Array.isArray(s.cases)?s.cases:[];var mapped=mapRow(Object.assign({},p,row||{},{id:(row&&row.id)||id}));var ix=s.cases.findIndex(function(x){return String(x.id)===String(mapped.id);});if(ix>=0)s.cases[ix]=mapped;else s.cases.unshift(mapped);write(s);alert('Case saved securely to Supabase.');window.location.reload();}
    catch(e){console.error(e);alert('Could not save case to Supabase: '+(e.message||e));}
    return true;
  }
  function enhanceDelete(m){
    if(!isCaseModal(m)||m.querySelector('[data-case-cloud-delete]'))return;
    var buttons=m.querySelectorAll('button'),saveButton=null;
    for(var i=0;i<buttons.length;i++)if((buttons[i].textContent||'').trim().toLowerCase()==='save')saveButton=buttons[i];
    if(!saveButton)return;
    var del=document.createElement('button');del.type='button';del.className='secondary';del.textContent='Delete';del.setAttribute('data-case-cloud-delete','1');del.style.marginRight='auto';
    del.addEventListener('click',async function(){var id=findExistingId(m);if(!validId(id)){alert('This case is not yet saved in Supabase.');return;}if(!confirm('Delete this case permanently?'))return;try{await window.ADCloudCRUD.remove('cases',id);var s=read();s.cases=(s.cases||[]).filter(function(x){return String(x.id)!==String(id);});write(s);alert('Case deleted.');window.location.reload();}catch(e){alert('Could not delete case: '+(e.message||e));}});
    saveButton.parentElement.insertBefore(del,saveButton);
  }
  function boot(){if(active)return;active=true;new MutationObserver(function(){var m=modal();if(m&&isCaseModal(m))enhanceDelete(m);}).observe(document.body,{childList:true,subtree:true});document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button'),m=modal();if(!b||!m||!isCaseModal(m)||!ready())return;if((b.textContent||'').trim().toLowerCase()==='save'){e.preventDefault();e.stopImmediatePropagation();saveCase(m);}},true);var tries=0;function wait(){if(ready()){syncCases().catch(function(e){console.warn('[AdvocateDesk] case sync skipped:',e.message);});}else if(tries++<20)setTimeout(wait,500);}wait();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
