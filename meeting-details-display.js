(function(){
  function esc(v){return String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))}
  function enhance(){
    var content=document.getElementById('content');
    if(!content)return;
    var heads=content.querySelectorAll('h1,h2,h3,h4');
    for(var i=0;i<heads.length;i++){
      var title=(heads[i].innerText||'').trim().toLowerCase();
      if(title!=='client meetings')continue;
      var panel=heads[i].closest('.panel');
      var table=panel&&panel.querySelector('table');
      if(!table||!table.tBodies[0])continue;
      var meetings=[];
      try{
        var s=JSON.parse(localStorage.getItem('advocateDeskData')||'null')||{};
        meetings=Array.isArray(s.meetings)?s.meetings:[];
      }catch(e){meetings=[]}
      var ths=table.tHead&&table.tHead.rows[0]?table.tHead.rows[0].cells:null;
      if(!ths)continue;
      var detailsIndex=-1;
      for(var h=0;h<ths.length;h++){
        if((ths[h].innerText||'').trim().toLowerCase()==='details'){detailsIndex=h;break}
      }
      if(detailsIndex<0){
        var th=document.createElement('th');
        th.textContent='Details';
        th.setAttribute('data-meeting-details','1');
        ths[ths.length-1].before(th);
        detailsIndex=ths.length-2;
      }
      var rows=table.tBodies[0].rows;
      for(var r=0;r<rows.length;r++){
        var cell=rows[r].cells[detailsIndex];
        if(!cell){cell=rows[r].insertCell(detailsIndex)}
        var m=meetings[r]||{};
        var detail=m.details||'';
        cell.innerHTML=detail?`<span style="white-space:pre-wrap;display:block;max-width:320px">${esc(detail)}</span>`:'—';
        cell.setAttribute('data-meeting-details-cell','1');
      }
      table.style.width='100%';
      table.style.minWidth='900px';
      return;
    }
  }
  function boot(){
    var content=document.getElementById('content');
    if(!content)return;
    var observer=new MutationObserver(function(){requestAnimationFrame(enhance)});
    observer.observe(content,{childList:true,subtree:true});
    enhance();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
