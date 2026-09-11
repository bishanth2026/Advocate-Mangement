(function(){
  function esc(v){return String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))}
  function arrange(){
    var content=document.getElementById('content');
    if(!content)return;
    var heads=content.querySelectorAll('h1,h2,h3,h4');
    var discussion=null, meetings=null;
    for(var i=0;i<heads.length;i++){
      var t=(heads[i].innerText||'').trim().toLowerCase();
      if(t==='discussion history') discussion=heads[i].closest('.panel');
      if(t==='client meetings') meetings=heads[i].closest('.panel');
    }
    if(!discussion||!meetings)return;
    var grid=discussion.parentElement;
    if(!grid||grid===content)return;
    if(!grid.querySelector('[data-client-management-layout]')){
      var marker=document.createElement('span');
      marker.setAttribute('data-client-management-layout','1');
      marker.style.display='none';
      grid.insertBefore(marker,grid.firstChild);
      grid.style.display='block';
      discussion.style.width='100%';
      discussion.style.maxWidth='100%';
      meetings.style.width='100%';
      meetings.style.maxWidth='100%';
      grid.appendChild(discussion);
      grid.appendChild(meetings);
      meetings.style.marginTop='18px';
    }
    showMeetingDetails(meetings);
  }
  function showMeetingDetails(panel){
    var table=panel&&panel.querySelector('table');
    if(!table||!table.tBodies[0])return;
    var meetings=[];
    try{
      var s=JSON.parse(localStorage.getItem('advocateDeskData')||'null')||{};
      meetings=Array.isArray(s.meetings)?s.meetings:[];
    }catch(e){meetings=[]}
    var head=table.tHead&&table.tHead.rows[0];
    if(!head)return;
    var detailsIndex=-1;
    for(var h=0;h<head.cells.length;h++){
      if((head.cells[h].innerText||'').trim().toLowerCase()==='details'){detailsIndex=h;break}
    }
    if(detailsIndex<0){
      var th=document.createElement('th');
      th.textContent='Details';
      th.setAttribute('data-meeting-details','1');
      head.cells[head.cells.length-1].before(th);
      detailsIndex=head.cells.length-2;
    }
    var rows=table.tBodies[0].rows;
    for(var r=0;r<rows.length;r++){
      var cell=rows[r].cells[detailsIndex];
      if(!cell)cell=rows[r].insertCell(detailsIndex);
      var m=meetings[r]||{};
      var detail=m.details||'';
      cell.innerHTML=detail?`<span style="white-space:pre-wrap;display:block;min-width:180px;max-width:320px">${esc(detail)}</span>`:'—';
      cell.setAttribute('data-meeting-details-cell','1');
    }
    table.style.width='100%';
    table.style.minWidth='900px';
  }
  function boot(){
    var content=document.getElementById('content');
    if(!content)return;
    var observer=new MutationObserver(function(){requestAnimationFrame(arrange)});
    observer.observe(content,{childList:true,subtree:true});
    arrange();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
