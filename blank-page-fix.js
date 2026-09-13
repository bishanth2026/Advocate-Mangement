(function(){
  'use strict';
  function readData(){
    try{
      var d=JSON.parse(localStorage.getItem('advocateDeskData')||'null')||{};
      return {cases:Array.isArray(d.cases)?d.cases:[],tasks:Array.isArray(d.tasks)?d.tasks:[],hearings:Array.isArray(d.hearings)?d.hearings:[],clients:Array.isArray(d.clients)?d.clients:[]};
    }catch(e){return {cases:[],tasks:[],hearings:[],clients:[]};}
  }
  function esc(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c];});}
  function date(v){if(!v)return '—';try{return new Date(v+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});}catch(e){return esc(v);}}
  function render(page){
    var content=document.getElementById('content');if(!content)return;
    var d=readData();
    if(page==='tasks'){
      content.innerHTML='<div class="page-title"><div><h1>Tasks</h1><p>Work assigned across your practice</p></div><button class="primary" onclick="openModal(\'task\')">＋ New</button></div><div class="panel"><table><thead><tr><th>Task</th><th>Case</th><th>Due</th><th>Priority</th><th>Status</th></tr></thead><tbody>'+d.tasks.map(function(t){return '<tr><td><strong>'+esc(t.title)+'</strong></td><td>'+esc(t.case||'—')+'</td><td>'+date(t.due)+'</td><td>'+esc(t.priority||'—')+'</td><td>'+esc(t.status||'—')+'</td></tr>';}).join('')+'</tbody></table></div>';
    }else if(page==='dashboard'){
      content.innerHTML='<div class="page-title"><div><h1>Good morning, Advocate</h1><p>Local Workspace</p></div><button class="primary" onclick="openModal(\'case\')">＋ New</button></div><div class="cards"><div class="stat"><div class="stat-top">Active Cases</div><div class="stat-value">'+d.cases.filter(function(x){return x.status==='Active';}).length+'</div></div><div class="stat"><div class="stat-top">Upcoming Hearings</div><div class="stat-value">'+d.hearings.length+'</div></div><div class="stat"><div class="stat-top">Clients</div><div class="stat-value">'+d.clients.length+'</div></div><div class="stat"><div class="stat-top">Pending Tasks</div><div class="stat-value">'+d.tasks.filter(function(x){return x.status!=='Completed';}).length+'</div></div></div><div class="panel"><div class="panel-head"><h3>Quick Actions</h3></div><div class="panel-body"><button class="quick" onclick="openModal(\'task\')"><strong>＋ New Task</strong><small>Assign follow-up</small></button></div></div>';
    }
    document.querySelectorAll('[data-page]').forEach(function(btn){btn.classList.toggle('active',btn.getAttribute('data-page')===page);});
  }
  function boot(){
    var content=document.getElementById('content');if(!content)return;
    document.querySelectorAll('[data-page]').forEach(function(btn){
      if(btn.getAttribute('data-blank-fix')==='1')return;
      btn.setAttribute('data-blank-fix','1');
      btn.addEventListener('click',function(){
        var page=btn.getAttribute('data-page');
        if(page!=='dashboard'&&page!=='tasks')return;
        setTimeout(function(){
          var heading=content.querySelector('h1');
          var expected=page==='tasks'?'Tasks':'Good morning, Advocate';
          if(!content.innerHTML.trim()||!heading||heading.textContent.trim()!==expected)render(page);
        },350);
      });
    });
    if(!content.innerHTML.trim())render('dashboard');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  setTimeout(boot,500);setTimeout(boot,1500);
})();
