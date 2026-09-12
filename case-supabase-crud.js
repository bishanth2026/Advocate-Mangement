/* Direct Supabase persistence for New/Edit Case forms. */
(function(){
  'use strict';
  var active=false;
  function ready(){return !!(window.ADCloudCRUD&&window.ADCloudCRUD.ready&&window.ADCloudCRUD.ready());}
  function modal(){return document.querySelector('.modal');}
  function isCaseModal(m){
    var h=m&&m.querySelector('h1,h2,h3,.modal-title,.modal-header strong');
    var t=((h&&h.textContent)||'').replace(/\s+/g,' ').toLowerCase();
    return t.indexOf('new case')>=0||t.indexOf('edit case')>=0;
  }
  function field(m,label){
    var labels=m.querySelectorAll('label');
    for(var i=0;i<labels.length;i++){
      if((labels[i].textContent||'').replace(/\s+/g,' ').trim().toLowerCase().indexOf(label.toLowerCase())===0){
        return labels[i].querySelector('input,textarea,select');
      }
    }
    return null;
  }
  function value(m,label){var el=field(m,label);return el?String(el.value||'').trim():'';}
  function casePayload(m){
    var number=value(m,'Case Number')||value(m,'Case No');
    var title=value(m,'Case Title')||value(m,'Title');
    var court=value(m,'Court');
    var type=value(m,'Case Type')||value(m,'Type');
    var status=value(m,'Status')||'Active';
    var next=value(m,'Next Hearing Date')||value(m,'Hearing Date');
    var time=value(m,'Hearing Time');
    var petitioner=value(m,'Petitioner');
    var respondent=value(m,'Respondent');
    var client=value(m,'Client');
    return {case_number:number,title:title,court:court,case_type:type,status:status,description:[petitioner?'Petitioner: '+petitioner:'',respondent?'Respondent: '+respondent:'',time?'Hearing Time: '+time:''].filter(Boolean).join('\n'),next_hearing_date:next||null,client_name:client};
  }
  function findExistingId(m){
    var b=m.querySelector('[data-case-id]');
    if(b&&b.dataset.caseId)return b.dataset.caseId;
    var h=m.querySelector('h1,h2,h3,.modal-title,.modal-header strong');
    var text=(h&&h.textContent)||'';
    var match=text.match(/([0-9a-f]{8}-[0-9a-f-]{27,})/i);return match?match[1]:null;
  }
  async function saveCase(m){
    if(!ready())return false;
    var p=casePayload(m);
    if(!p.title&&!p.case_number){alert('Please enter a case number or case title.');return true;}
    var id=findExistingId(m);
    try{
      if(id)await window.ADCloudCRUD.update('cases',id,p);
      else await window.ADCloudCRUD.insert('cases',p);
      alert('Case saved securely to Supabase.');
      window.location.reload();
    }catch(e){console.error(e);alert('Could not save case to Supabase: '+(e.message||e));}
    return true;
  }
  function enhanceDelete(m){
    if(!isCaseModal(m)||m.querySelector('[data-case-cloud-delete]'))return;
    var buttons=m.querySelectorAll('button');
    var saveButton=null;
    for(var i=0;i<buttons.length;i++)if((buttons[i].textContent||'').trim().toLowerCase()==='save')saveButton=buttons[i];
    if(!saveButton)return;
    var del=document.createElement('button');del.type='button';del.className='secondary';del.textContent='Delete';del.setAttribute('data-case-cloud-delete','1');
    del.style.marginRight='auto';
    del.addEventListener('click',async function(){
      var id=findExistingId(m);if(!id){alert('This case is not yet saved in Supabase.');return;}
      if(!confirm('Delete this case permanently?'))return;
      try{await window.ADCloudCRUD.remove('cases',id);alert('Case deleted.');window.location.reload();}catch(e){alert('Could not delete case: '+(e.message||e));}
    });
    saveButton.parentElement.insertBefore(del,saveButton);
  }
  function boot(){
    if(active)return;active=true;
    new MutationObserver(function(){var m=modal();if(m&&isCaseModal(m))enhanceDelete(m);}).observe(document.body,{childList:true,subtree:true});
    document.addEventListener('click',function(e){
      var b=e.target.closest&&e.target.closest('button');var m=modal();
      if(!b||!m||!isCaseModal(m)||!ready())return;
      if((b.textContent||'').trim().toLowerCase()==='save'){
        e.preventDefault();e.stopImmediatePropagation();saveCase(m);
      }
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
