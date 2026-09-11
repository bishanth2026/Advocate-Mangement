(function(){
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
    if(grid.querySelector('[data-client-management-layout]'))return;
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
  function boot(){
    var content=document.getElementById('content');
    if(!content)return;
    var observer=new MutationObserver(function(){arrange()});
    observer.observe(content,{childList:true,subtree:true});
    arrange();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
