/* Direct Supabase persistence for New/Edit Task forms. */
(function(){
  'use strict';
  var started=false;
  function ready(){return !!(window.ADCloudCRUD&&window.ADCloudCRUD.ready&&window.ADCloudCRUD.ready());}
  function modal(){return document.querySelector('.modal');}
  function isTaskModal(m){var h=m&&m.querySelector('h1,h2,h3,.modal-title,.modal-header strong');var t=((h&&h.textContent)||'').replace(/\s+/g,' ').toLowerCase();return t.indexOf('task')>=0;}
  function field(m,label){var ls=m.querySelectorAll('label');for(var i=0;i<ls.length;i++){if((ls[i].textContent||'').trim().toLowerCase().indexOf(label.toLowerCase())===0)return ls[i].querySelector('input,textarea,select');}return null;}
  function val(m,label){var e=field(m,label);return e?String(e.value||'').trim():'';}
  function payload(m){
    var caseId=val(m,'Case ID')||val(m,'Case')||null;
    var clientId=val(m,'Client ID')||val(m,'Client')||null;
    return {
      title:val(m,'Task Title')||val(m,'Title')||val(m,'Task'),
      description:val(m,'Description')||val(m,'Notes'),
      status:val(m,'Status')||'Pending',
      due_date:val(m,'Due Date')||null,
      case_id:caseId,
      client_id:clientId
    };
  }
  function id(m){var e=m.querySelector('[data-task-id]');return e&&e.dataset.taskId||null;}
  async function save(m){
    if(!ready())return false;
    var p=payload(m);
    if(!p.title){alert('Please enter a task title.');return true;}
    try{
      var existing=id(m);
      if(existing)await ADCloudCRUD.update('tasks',existing,p);
      else await ADCloudCRUD.insert('tasks',p);
      alert('Task saved securely to Supabase.');
      window.location.reload();
    }catch(e){console.error(e);alert('Could not save task to Supabase: '+(e.message||e));}
    return true;
  }
  function boot(){
    if(started)return;
    started=true;
    document.addEventListener('click',function(e){
      var b=e.target.closest&&e.target.closest('button'),m=modal();
      if(!b||!m||!isTaskModal(m)||!ready())return;
      if((b.textContent||'').trim().toLowerCase()==='save'){
        e.preventDefault();e.stopImmediatePropagation();save(m);
      }
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
