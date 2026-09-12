/* Case 360 activity timeline. Loads after case-360.js. */
(function(){
  'use strict';
  var KEY='advocateDeskData';
  function store(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return {};}}
  function save(d){localStorage.setItem(KEY,JSON.stringify(d));}
  function currentCase(){
    var root=document.getElementById('content');
    var p=root&&root.querySelector('.page-title p');
    var ref=p?p.textContent.replace(/.*—\s*/,'').trim():'';
    var d=store();
    return (d.cases||[]).find(function(c){return String(c.number||'')===ref||String(c.id||'')===ref;})||null;
  }
  function render(){
    var root=document.getElementById('content');
    if(!root||!root.querySelector('h1')||root.querySelector('h1').textContent.trim()!=='Case 360'||root.querySelector('[data-case360-activity]'))return;
    var c=currentCase();if(!c)return;
    var d=store();d.caseActivities=d.caseActivities||{};var id=String(c.id||c.number||'');var items=d.caseActivities[id]||[];
    var section=document.createElement('section');section.className='card';section.setAttribute('data-case360-activity','1');
    section.innerHTML='<div class="card-header"><h2>Activity Timeline</h2><button type="button" class="primary" data-add-activity>Add Activity</button></div><div data-activity-list></div>';
    var list=section.querySelector('[data-activity-list]');
    function draw(){list.innerHTML='';if(!items.length){list.innerHTML='<p class="muted">No activities recorded yet.</p>';return;}items.slice().sort(function(a,b){return String(b.createdAt).localeCompare(String(a.createdAt));}).forEach(function(a){var el=document.createElement('article');el.className='activity-item';el.innerHTML='<strong></strong><small></small><p></p><button type="button" class="danger" data-delete>Delete</button>';el.querySelector('strong').textContent=a.type;el.querySelector('small').textContent=new Date(a.createdAt).toLocaleString();el.querySelector('p').textContent=a.notes;el.querySelector('[data-delete]').onclick=function(){items=items.filter(function(x){return x.id!==a.id;});d.caseActivities[id]=items;save(d);draw();};list.appendChild(el);});}
    section.querySelector('[data-add-activity]').onclick=function(){var type=prompt('Activity type (Discussion, Hearing, Document, Payment, Follow-up, Note):','Note');if(!type)return;var notes=prompt('Enter activity details:','');if(notes===null)return;items.push({id:Date.now().toString(),type:type,notes:notes,createdAt:new Date().toISOString()});d.caseActivities[id]=items;save(d);draw();};
    draw();root.appendChild(section);
  }
  function boot(){var root=document.getElementById('content');if(!root)return;new MutationObserver(render).observe(root,{childList:true,subtree:true});render();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
