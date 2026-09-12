(function(){
  'use strict';
  var scheduled=false;
  function getHeading(){
    var selectors=['#content .page-title','#content h1','#content h2','main h1','main h2'];
    for(var i=0;i<selectors.length;i++){
      var nodes=document.querySelectorAll(selectors[i]);
      for(var j=0;j<nodes.length;j++){
        if(/\bhearings\b/i.test((nodes[j].textContent||'').trim()))return nodes[j];
      }
    }
    return null;
  }
  function isHearingsPage(){
    return !!document.getElementById('hearingTable') && !!getHeading();
  }
  function csv(){
    var table=document.getElementById('hearingTable');
    if(!table){alert('Open Hearings first.');return;}
    var rows=Array.from(table.querySelectorAll('tr')).map(function(tr){
      return Array.from(tr.querySelectorAll('th,td')).slice(0,6).map(function(cell){
        return '"'+String(cell.innerText||'').replace(/"/g,'""').replace(/\s+/g,' ').trim()+'"';
      }).join(',');
    });
    var blob=new Blob([rows.join('\n')],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='hearings-'+new Date().toISOString().slice(0,10)+'.csv';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(function(){URL.revokeObjectURL(url)},500);
  }
  function enhance(){
    scheduled=false;
    var heading=getHeading();
    var old=document.querySelector('[data-hearing-tools]');
    if(!isHearingsPage()){
      if(old)old.remove();
      return;
    }
    if(old && old.parentNode===heading)return;
    if(old)old.remove();
    var wrap=document.createElement('span');
    wrap.dataset.hearingTools='1';
    wrap.style.cssText='display:inline-flex;gap:8px;flex-wrap:wrap;align-items:center;margin-left:14px;vertical-align:middle';
    var b=document.createElement('button');b.className='secondary';b.textContent='Export CSV';b.type='button';b.addEventListener('click',csv);
    var p=document.createElement('button');p.className='secondary';p.textContent='Print';p.type='button';p.addEventListener('click',function(){window.print()});
    wrap.appendChild(b);wrap.appendChild(p);heading.appendChild(wrap);
  }
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    if(window.requestAnimationFrame)window.requestAnimationFrame(enhance);else setTimeout(enhance,0);
  }
  enhance();
  if(window.MutationObserver){
    new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
  }else{
    setTimeout(function(){setInterval(enhance,1000)},1000);
  }
})();
