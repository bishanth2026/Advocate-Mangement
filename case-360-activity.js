/* Case 360 activity timeline. Loads after case-360.js. */
(function(){
  'use strict';
  var KEY='advocateDeskData';
  function store(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return {};}}
  function save(d){localStorage.setItem(KEY,JSON.stringify(d));}
  function currentCase(){var root=document.getElementById('content');var p=root&&root.querySelector('.page-title p');var ref=p?p.textContent.replace(/.*—\s*/,'').trim():'';var d=store();return (d.cases||[]).find(function(c){return String(c.number||'')===ref||String(c.id||'')===ref;})||null;}
  function render(){
    var root=document.getElementById('content');if(!root||!root.querySelector('h1')||root.querySelector('h1').textContent.trim()!=='Case 360'||root.querySelector('[data-case360-activity]'))return;
    var c=currentCase();if(!c)return;var d=store();d.caseActivities=d.caseActivities||{};var id=String(c.id||c.number||'');var items=d.caseActivities[id]||[];
    var section=document.createElement('section');section.className='card';section.setAttribute('data-case360-activity','1');
    section.innerHTML='<div class="card-header"><h2>Activity Timeline</h2><button type="button" class="primary" data-add-activity>Add Activity</button></div><div data-activity-form hidden><div class="form-grid"><label>Activity type<select data-activity-type><option>Note</option><option>Client Discussion</option><option>Hearing</option><option>Document</option><option>Payment</option><option>Follow-up</option><option>Task</option></select></label><label>Date<input type="datetime-local" data-activity-date></label><label class="full">Details<textarea rows="3" data-activity-notes placeholder="Enter activity details"></textarea></label></div><div class="form-actions"><button type="button" class="primary" data-save-activity>Save Activity</button><button type="button" class="secondary" data-cancel-activity>Cancel</button></div></div><div data-activity-list></div>';
    var form=section.querySelector('[data-activity-form]'),list=section.querySelector('[data-activity-list]');
    function draw(){list.innerHTML='';if(!items.length){list.innerHTML='<p class="muted">No activities recorded yet.</p>';return;}items.slice().sort(function(a,b){return String(b.createdAt).localeCompare(String(a.createdAt));}).forEach(function(a){var el=document.createElement('article');el.className='activity-item';el.innerHTML='<strong></strong><small></small><p></p><button type="button" class="danger" data-delete>Delete</button>';el.querySelector('strong').textContent=a.type;el.querySelector('small').textContent=new Date(a.createdAt).toLocaleString();el.querySelector('p').textContent=a.notes;el.querySelector('[data-delete]').onclick=function(){items=items.filter(function(x){return x.id!==a.id;});d.caseActivities[id]=items;save(d);draw();};list.appendChild(el);});}
    section.querySelector('[data-add-activity]').onclick=function(){form.hidden=false;section.querySelector('[data-activity-date]').value=new Date().toISOString().slice(0,16);section.querySelector('[data-activity-notes]').focus();};
    section.querySelector('[data-cancel-activity]').onclick=function(){form.hidden=true;};
    section.querySelector('[data-save-activity]').onclick=function(){var notes=section.querySelector('[data-activity-notes]').value.trim();if(!notes){alert('Please enter activity details.');return;}var date=section.querySelector('[data-activity-date]').value;items.push({id:String(Date.now()),type:section.querySelector('[data-activity-type]').value,notes:notes,createdAt:date?new Date(date).toISOString():new Date().toISOString()});d.caseActivities[id]=items;save(d);form.hidden=true;section.querySelector('[data-activity-notes]').value='';draw();};
    draw();root.appendChild(section);
  }
  function boot(){var root=document.getElementById('content');if(!root)return;new MutationObserver(render).observe(root,{childList:true,subtree:true});render();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
