/* Adds a delete action to each case row without changing the existing case form. */
(function(){
  'use strict';
  var UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});}
  function clientText(c){
    if(Array.isArray(c.clientIds)&&c.clientIds.length){
      return c.clientIds.map(function(id){var found=state.clients.find(function(x){return String(x.id)===String(id);});return found?found.name:'';}).filter(Boolean).join(', ')||c.client||'—';
    }
    return c.client||'—';
  }
  function renderCasesWithDelete(){
    var content=document.getElementById('content');
    if(!content||typeof state==='undefined')return;
    content.innerHTML=layout('Cases','Manage your complete case portfolio',"openModal('case')")+
      '<div class="toolbar"><input class="filter" id="caseFilter" placeholder="Search case number, title or client..." oninput="filterTable(\'caseTable\',this.value)"><select class="filter" id="caseStatusFilter"><option value="">All Statuses</option><option>Active</option><option>Pending</option><option>Reserved</option><option>Disposed</option></select></div>'+
      '<div class="panel"><table id="caseTable"><thead><tr><th>Case</th><th>Client(s)</th><th>Court</th><th>Next Hearing</th><th>Status</th><th>Action</th></tr></thead><tbody>'+
      state.cases.map(function(c,i){return '<tr><td><span class="case-link">'+esc(c.number||'—')+'</span><br><span class="muted">'+esc(c.title||'')+'</span></td><td>'+esc(clientText(c))+'</td><td>'+esc(c.court||'—')+'</td><td>'+esc(c.next?fmtDate(c.next):'—')+'</td><td>'+badge(c.status||'Active')+'</td><td><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="secondary" onclick="openEditModal(\'case\','+i+')">Edit</button><button class="secondary" data-case-delete="'+esc(c.id)+'" onclick="deleteCaseFromList('+i+')">Delete</button></div></td></tr>';}).join('')+
      '</tbody></table></div>';
    var status=document.getElementById('caseStatusFilter');
    if(status)status.addEventListener('change',function(){var selected=this.value;document.querySelectorAll('#caseTable tbody tr').forEach(function(row){row.style.display=!selected||row.cells[4].textContent.trim()===selected?'':'none';});});
  }
  window.deleteCaseFromList=async function(index){
    var item=state.cases[index];
    if(!item)return;
    if(!confirm('Delete this case permanently?'))return;
    try{
      if(window.ADCloudCRUD&&typeof window.ADCloudCRUD.remove==='function'&&UUID.test(String(item.id||''))){await window.ADCloudCRUD.remove('cases',item.id);}
      state.cases.splice(index,1);
      save();
      renderCasesWithDelete();
    }catch(error){console.error('[AdvocateDesk] case delete failed',error);alert('Could not delete case: '+(error.message||error));}
  };
  function install(){
    if(typeof pages!=='undefined')pages.cases=renderCasesWithDelete;
    if(typeof navigate==='function'&&document.querySelector('.nav-item.active')&&document.querySelector('.nav-item.active').dataset.page==='cases')renderCasesWithDelete();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
