(function(){
  'use strict';
  function getHeading(){
    var selectors=['#content .page-title','#content h1','#content h2','main h1','main h2'];
    for(var i=0;i<selectors.length;i++){
      var nodes=document.querySelectorAll(selectors[i]);
      for(var j=0;j<nodes.length;j++){
        if(/^hearings$/i.test((nodes[j].textContent||'').trim()))return nodes[j];
      }
    }
    return null;
  }
  function isHearingsPage(){
    return !!document.getElementById('hearingTable') && !!getHeading();
  }
  function csvCell(value){
    return '"'+String(value==null?'':value).replace(/"/g,'""').replace(/[\r\n\t]+/g,' ').replace(/\s+/g,' ').trim()+'"';
  }
  function csv(){
    var table=document.getElementById('hearingTable');
    if(!table){alert('Open Hearings first.');return;}
    var rows=Array.from(table.querySelectorAll('tr')).map(function(tr){
      return Array.from(tr.querySelectorAll('th,td')).slice(0,6).map(function(cell){return csvCell(cell.textContent);}).join(',');
    }).filter(function(row){return row.replace(/[,\"]+/g,'').trim()!=='';});
    var csvText='\ufeff'+rows.join('\r\n');
    var blob=new Blob([csvText],{type:'text/csv;charset=utf-8;'});
    var url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;
    a.download='hearings-'+new Date().toISOString().slice(0,10)+'.csv';
    a.setAttribute('aria-label','Download hearing records as CSV');
    a.style.display='none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
  }
  function print(){
    if(!isHearingsPage()){alert('Open Hearings first.');return;}
    window.print();
  }
  function enhance(){
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
    var b=document.createElement('button');
    b.className='secondary';b.textContent='Export CSV';b.type='button';b.title='Export visible hearing records to CSV';b.addEventListener('click',csv);
    var p=document.createElement('button');
    p.className='secondary';p.textContent='Print';p.type='button';p.title='Print the hearing report';p.addEventListener('click',print);
    wrap.appendChild(b);wrap.appendChild(p);heading.appendChild(wrap);
  }
  enhance();
  window.addEventListener('hashchange',function(){setTimeout(enhance,50)});
  window.addEventListener('popstate',function(){setTimeout(enhance,50)});
  document.addEventListener('click',function(event){
    var link=event.target.closest&&event.target.closest('[data-page],.nav-item,a[href^="#"]');
    if(link)setTimeout(enhance,50);
  },true);
})();
