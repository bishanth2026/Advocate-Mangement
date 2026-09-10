(function(){
  function daysUntilDue(value){
    if(!value)return null;
    var due=new Date(String(value).slice(0,10)+'T00:00:00');
    if(isNaN(due.getTime()))return null;
    var now=new Date();
    var today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    return Math.ceil((due.getTime()-today.getTime())/86400000);
  }
  function addAlerts(){
    var table=document.getElementById('taskTable');
    if(!table)return;
    table.querySelectorAll('tbody tr').forEach(function(row){
      var dueCell=row.cells&&row.cells[2];
      if(!dueCell)return;
      var text=(dueCell.innerText||'').trim();
      if(!text)return;
      if(dueCell.querySelector('[data-task-due-alert]'))return;
      var s=window.P1&&P1.state?P1.state():null;
      if(!s||!Array.isArray(s.tasks))return;
      var title=((row.cells[0]&&row.cells[0].innerText)||'').trim();
      var task=s.tasks.find(function(t){return String(t.title||'').trim()===title;});
      if(!task||String(task.status||'').trim().toLowerCase()==='completed')return;
      var days=daysUntilDue(task.due);
      if(days===null||days<0||days>5)return;
      var alert=document.createElement('div');
      alert.setAttribute('data-task-due-alert','1');
      alert.textContent=days===0?'Task due today':('Task date nearing — '+days+' day'+(days===1?'':'s')+' left');
      alert.style.marginTop='5px';
      alert.style.fontSize='12px';
      alert.style.fontWeight='600';
      alert.style.lineHeight='1.3';
      alert.style.color='var(--danger,#dc2626)';
      dueCell.appendChild(alert);
    });
  }
  function start(){
    var content=document.getElementById('content');
    if(!content)return;
    var observer=new MutationObserver(function(){addAlerts()});
    observer.observe(content,{childList:true,subtree:true});
    addAlerts();
    setInterval(addAlerts,60000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
