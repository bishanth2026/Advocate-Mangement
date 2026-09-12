(function(){
  'use strict';
  function csv(){
    var table=document.getElementById('hearingTable');
    if(!table){alert('Open Hearings first.');return;}
    var rows=Array.from(table.querySelectorAll('tr')).map(function(tr){return Array.from(tr.querySelectorAll('th,td')).slice(0,6).map(function(cell){return '"'+String(cell.innerText||'').replace(/"/g,'""').replace(/\s+/g,' ').trim()+'"';}).join(',');});
    var blob=new Blob([rows.join('\n')],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='hearings-'+new Date().toISOString().slice(0,10)+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},500);
  }
  function enhance(){
    var title=document.querySelector('#content .page-title');
    if(!title||title.dataset.exportReady==='1')return;
    title.dataset.exportReady='1';
    var wrap=document.createElement('div');wrap.style.cssText='display:flex;gap:8px;flex-wrap:wrap;align-items:center';
    var b=document.createElement('button');b.className='secondary';b.textContent='Export CSV';b.type='button';b.addEventListener('click',csv);
    var p=document.createElement('button');p.className='secondary';p.textContent='Print';p.type='button';p.addEventListener('click',function(){window.print()});
    wrap.appendChild(b);wrap.appendChild(p);title.appendChild(wrap);
  }
  setInterval(enhance,500);
})();
