(function(){
  var observer=null;
  var rendering=false;
  function daysUntilDue(value){
    if(!value)return null;
    var due=new Date(String(value).slice(0,10)+'T00:00:00');
    if(isNaN(due.getTime()))return null;
    var now=new Date();
    var today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    return Math.ceil((due.getTime()-today.getTime())/86400000);
  }
  function fmt(value){
    if(!value)return '—';
    var d=new Date(String(value).slice(0,10)+'T00:00:00');
    return isNaN(d.getTime())?'—':d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
  }
  function esc(v){return window.P1&&P1.esc?P1.esc(v):String(v==null?'':v).replace(/[&<>\"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]})}
  function badge(v){
    var cls=v==='Completed'?'green':(v==='High'?'gold':(v==='Pending'?'blue':'red'));
    return '<span class="badge '+cls+'">'+esc(v)+'</span>';
  }
  function render(){
    if(rendering)return;
    rendering=true;
    if(observer)observer.disconnect();
    try{
      var content=document.getElementById('content');
      if(!content)return;
      var h=content.querySelector('.grid-2');
      if(!h||!h.querySelector('h3'))return;
      if(!/Upcoming Hearings/i.test(h.querySelector('h3').textContent||''))return;
      var old=content.querySelector('[data-dashboard-task-panel]');
      if(old)old.remove();
      var s=window.P1&&P1.state?P1.state():null;
      if(!s||!Array.isArray(s.tasks))return;
      var tasks=s.tasks.filter(function(t){return String(t.status||'').trim().toLowerCase()!=='completed' && t.due;})
        .sort(function(a,b){return String(a.due).localeCompare(String(b.due));}).slice(0,5);
      var rows=tasks.map(function(t){
        var days=daysUntilDue(t.due), near=days!==null&&days>=0&&days<=5;
        var due=fmt(t.due);
        var dueText=near?(days===0?'Task due today':'Task date nearing — '+days+' day'+(days===1?'':'s')+' left'):'Due '+due;
        return '<div class="list-row"><div class="date-box"><b>'+new Date(String(t.due).slice(0,10)+'T00:00:00').getDate()+'</b><small>'+new Date(String(t.due).slice(0,10)+'T00:00:00').toLocaleString('en',{month:'short'})+'</small></div><div class="list-main"><strong>'+esc(t.title)+'</strong><small>'+esc(t.case||'No case linked')+' • Due '+esc(due)+'</small>'+(near?'<small style="color:var(--danger,#dc2626);font-weight:600">'+esc(dueText)+'</small>':'')+'</div><div>'+badge(t.priority||'Normal')+'<div style="margin-top:5px">'+badge(t.status||'Pending')+'</div></div></div>';
      }).join('');
      var panel=document.createElement('div');
      panel.setAttribute('data-dashboard-task-panel','1');
      panel.className='panel';
      panel.innerHTML='<div class="panel-head"><h3>Upcoming Tasks</h3><button class="secondary" type="button" data-dashboard-view-tasks>View all</button></div><div class="list">'+(rows||'<div class="empty">No upcoming tasks.</div>')+'</div>';
      var quick=Array.from(content.querySelectorAll('.panel .panel-head h3')).find(function(x){return /Quick Actions/i.test(x.textContent||'')});
      if(quick&&quick.closest('.panel')) quick.closest('.panel').before(panel); else h.after(panel);
      var viewBtn=panel.querySelector('[data-dashboard-view-tasks]');
      if(viewBtn)viewBtn.addEventListener('click',function(){if(typeof window.navigate==='function')window.navigate('tasks');else{var b=document.querySelector('.nav-item[data-page="tasks"]');if(b)b.click()}});
    }finally{
      rendering=false;
      if(observer){
        var c=document.getElementById('content');
        if(c)observer.observe(c,{childList:true,subtree:true});
      }
    }
  }
  function start(){
    var c=document.getElementById('content');if(!c)return;
    observer=new MutationObserver(function(){
      if(rendering)return;
      window.requestAnimationFrame(function(){if(!rendering)render()});
    });
    observer.observe(c,{childList:true,subtree:true});
    render();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
