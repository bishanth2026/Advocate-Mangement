(function(){
  'use strict';
  function boot(){
    var content=document.getElementById('content');
    if(!content)return;
    if(content.innerHTML.trim())return;
    var data;
    try{data=JSON.parse(localStorage.getItem('advocateDeskData')||'null')||{};}catch(e){data={};}
    data.cases=Array.isArray(data.cases)?data.cases:[];
    data.tasks=Array.isArray(data.tasks)?data.tasks:[];
    function esc(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c];});}
    function render(page){
      if(page==='tasks'){
        content.innerHTML='<div class="page-title"><div><h1>Tasks</h1><p>Work assigned across your practice</p></div></div><div class="panel"><table><thead><tr><th>Task</th><th>Case</th><th>Due</th><th>Priority</th><th>Status</th></tr></thead><tbody>'+data.tasks.map(function(t){return '<tr><td><strong>'+esc(t.title)+'</strong></td><td>'+esc(t.case)+'</td><td>'+esc(t.due)+'</td><td>'+esc(t.priority)+'</td><td>'+esc(t.status)+'</td></tr>';}).join('')+'</tbody></table></div>';
      }else{
        content.innerHTML='<div class="page-title"><div><h1>Good morning, Advocate</h1><p>Local Workspace</p></div></div><div class="cards"><div class="stat"><div class="stat-top">Cases</div><div class="stat-value">'+data.cases.length+'</div></div><div class="stat"><div class="stat-top">Pending Tasks</div><div class="stat-value">'+data.tasks.filter(function(t){return t.status!=="Completed";}).length+'</div></div></div><div class="panel"><div class="panel-head"><h3>Quick Actions</h3></div><div class="panel-body"><button class="primary" onclick="window.__recoveryNavigate(\'tasks\')">Open Tasks</button></div></div>';
      }
      document.querySelectorAll('[data-page]').forEach(function(btn){btn.classList.toggle('active',btn.getAttribute('data-page')===page);});
    }
    window.__recoveryNavigate=render;
    document.querySelectorAll('[data-page]').forEach(function(btn){btn.addEventListener('click',function(){render(btn.getAttribute('data-page'));});});
    render('dashboard');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
