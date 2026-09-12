(function(){
  'use strict';
  function isHearingsPage(){
    var table=document.getElementById('hearingTable');
    var heading=document.querySelector('#content .page-title');
    return !!table && !!heading && /\bhearings\b/i.test(heading.textContent||'');
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
    var title=document.querySelector('#content .page-title');
    if(!title)return;
    var old=title.querySelector('[data-hearing-tools]');
    if(!isHearingsPage()){
      if(old)old.remove();
      return;
    }
    if(old)return;
    var wrap=document.createElement('span');
    wrap.dataset.hearingTools='1';
    wrap.style.cssText='display:inline-flex;gap:8px;flex-wrap:wrap;align-items:center;margin-left:12px';
    var b=document.createElement('button');b.className='secondary';b.textContent='Export CSV';b.type='button';b.addEventListener('click',csv);
    var p=document.createElement('button');p.className='secondary';p.textContent='Print';p.type='button';p.addEventListener('click',function(){window.print()});
    wrap.appendChild(b);wrap.appendChild(p);title.appendChild(wrap);
  }
  enhance();
  setInterval(enhance,500);
})();
