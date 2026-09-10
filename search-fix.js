(function(){
  function text(v){return String(v==null?'':v).toLowerCase().trim()}
  function filterTable(id,value){
    var table=document.getElementById(id); if(!table)return;
    var q=text(value);
    table.querySelectorAll('tbody tr').forEach(function(row){
      row.style.display=!q||text(row.innerText).indexOf(q)!==-1?'':'none';
    });
  }
  window.filterTable=filterTable;

  function getState(){return window.P1&&P1.state?P1.state():null}
  function results(q){
    var s=getState(); if(!s)return [];
    var out=[];
    (s.cases||[]).forEach(function(c){
      if(text([c.number,c.title,c.client,c.court,c.type,c.status].join(' ')).indexOf(q)!==-1)
        out.push({type:'Case',title:c.number+' — '+c.title,sub:(c.client||'')+' • '+(c.court||''),page:'cases'});
    });
    (s.clients||[]).forEach(function(c){
      if(text([c.name,c.phone,c.email,c.id].join(' ')).indexOf(q)!==-1)
        out.push({type:'Client',title:c.name,sub:(c.phone||'')+' • '+(c.email||''),page:'clients'});
    });
    (s.hearings||[]).forEach(function(h){
      if(text([h.case,h.title,h.court,h.stage,h.date,h.time].join(' ')).indexOf(q)!==-1)
        out.push({type:'Hearing',title:h.case+' — '+h.title,sub:(h.date||'')+' • '+(h.court||''),page:'hearings'});
    });
    (s.tasks||[]).forEach(function(t){
      if(text([t.title,t.case,t.due,t.priority,t.status].join(' ')).indexOf(q)!==-1)
        out.push({type:'Task',title:t.title,sub:(t.case||'No case linked')+' • Due '+(t.due||''),page:'tasks'});
    });
    return out.slice(0,12);
  }
  function ensureBox(input){
    if(document.getElementById('globalSearchResults'))return document.getElementById('globalSearchResults');
    var box=document.createElement('div');
    box.id='globalSearchResults';
    box.style.cssText='position:absolute;top:calc(100% + 6px);left:0;right:0;background:#fff;border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 12px 30px rgba(15,23,42,.14);max-height:420px;overflow:auto;z-index:2000;display:none;';
    input.parentElement.style.position='relative';
    input.parentElement.appendChild(box);
    return box;
  }
  function showResults(input){
    var box=ensureBox(input),q=text(input.value);
    if(!q){box.style.display='none';box.innerHTML='';return}
    var r=results(q);
    box.innerHTML=r.length?r.map(function(x,i){return '<button type="button" data-search-index="'+i+'" style="display:block;width:100%;text-align:left;border:0;background:#fff;padding:11px 13px;cursor:pointer;border-bottom:1px solid #f1f5f9"><strong style="display:block;font-size:13px">'+escapeHtml(x.title)+'</strong><small style="display:block;color:#64748b;margin-top:3px">'+escapeHtml(x.type+' • '+x.sub)+'</small></button>'}).join(''):'<div style="padding:14px;color:#64748b;font-size:13px">No matching cases, clients, hearings or tasks.</div>';
    box.style.display='block';
    Array.from(box.querySelectorAll('[data-search-index]')).forEach(function(b){b.addEventListener('click',function(){var x=r[Number(b.getAttribute('data-search-index'))];box.style.display='none';input.value='';if(typeof window.navigate==='function')window.navigate(x.page);else{var nav=document.querySelector('.nav-item[data-page="'+x.page+'"]');if(nav)nav.click()}})});
  }
  function escapeHtml(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]})}
  function start(){
    var input=document.getElementById('globalSearch'); if(!input)return;
    input.setAttribute('autocomplete','off');
    input.addEventListener('input',function(){showResults(input)});
    input.addEventListener('focus',function(){if(input.value.trim())showResults(input)});
    document.addEventListener('click',function(e){var box=document.getElementById('globalSearchResults');if(box&&!input.contains(e.target)&&!box.contains(e.target))box.style.display='none'});
    input.addEventListener('keydown',function(e){if(e.key==='Escape'){var box=document.getElementById('globalSearchResults');if(box)box.style.display='none';input.blur()}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
