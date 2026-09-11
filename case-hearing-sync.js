(function(){
  function read(){try{return JSON.parse(localStorage.getItem('advocateDeskData')||'null')||null}catch(e){return null}}
  function write(s){localStorage.setItem('advocateDeskData',JSON.stringify(s))}
  function esc(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]})}
  function clientIdsFor(c){var ids=Array.isArray(c&&c.clientIds)?c.clientIds.slice():[];if(!ids.length&&c&&c.clientId)ids=[c.clientId];if(!ids.length&&c&&c.client){var s=read();var x=(s&&s.clients||[]).find(function(z){return z.name===c.client});if(x)ids=[x.id]}return ids.filter(Boolean)}
  function syncHearing(caseData){
    var s=read();if(!s||!caseData||!caseData.number||!caseData.next)return;
    s.hearings=Array.isArray(s.hearings)?s.hearings:[];
    var ids=clientIdsFor(caseData), clients=(s.clients||[]).filter(function(c){return ids.indexOf(c.id)>=0});
    var names=clients.map(function(c){return c.name}).filter(Boolean);
    var existing=s.hearings.find(function(h){return h.source==='case-next-hearing'&&String(h.caseId)===String(caseData.id)})
      || s.hearings.find(function(h){return String(h.case)===String(caseData.number)&&h.source==='case-next-hearing'});
    var data={id:existing&&existing.id||('HEAR-'+Date.now()),source:'case-next-hearing',caseId:caseData.id,date:caseData.next,time:existing&&existing.time||'',case:caseData.number,title:caseData.title||'',client:caseData.client||names.join(', '),clientId:ids[0]||'',clientIds:ids,clientNames:names,court:caseData.court||'',stage:existing&&existing.stage||'Scheduled'};
    if(existing){Object.assign(existing,data)}else{s.hearings.push(data)}
    write(s)
  }
  function removeAutoHearing(caseId){var s=read();if(!s)return;s.hearings=(s.hearings||[]).filter(function(h){return !(h.source==='case-next-hearing'&&String(h.caseId)===String(caseId))});write(s)}
  function patchOpenModal(){
    if(typeof window.openModal!=='function'||window.openModal.__caseHearingSync)return;
    var original=window.openModal;
    function wrapped(type,index){
      var result=original.apply(this,arguments);
      if(type!=='case')return result;
      setTimeout(function(){
        var select=document.getElementById('f3');if(!select||select.tagName!=='SELECT')return;
        select.multiple=true;select.size=Math.min(6,Math.max(3,select.options.length));select.setAttribute('aria-label','Select one or more clients');
        var s=read(), item=index!==null&&index!==undefined&&s&&s.cases? s.cases[index]:null;
        var ids=clientIdsFor(item);
        Array.prototype.forEach.call(select.options,function(o){o.selected=ids.indexOf(o.value)>=0});
        var label=select.parentElement&&select.parentElement.querySelector('label');
        if(label){var note=label.querySelector('[data-multi-client-note]');if(!note){note=document.createElement('small');note.setAttribute('data-multi-client-note','1');note.textContent='Hold Ctrl (Windows) / Command (Mac) to select multiple clients.';note.style.display='block';note.style.marginTop='5px';note.style.opacity='.7';label.appendChild(note)}}
      },0);
      return result;
    }
    wrapped.__caseHearingSync=true;window.openModal=wrapped;
  }
  function patchSaveCase(){
    if(typeof window.saveCase!=='function'||window.saveCase.__caseHearingSync)return;
    var original=window.saveCase;
    function wrapped(index){
      var sBefore=read(), oldCase=index!==null&&index!==undefined&&sBefore&&sBefore.cases?sBefore.cases[index]:null;
      var modal=document.getElementById('modal');
      var dateEl=document.getElementById('f5');var numberEl=document.getElementById('f1');
      var next=dateEl&&dateEl.value||'';var number=numberEl&&numberEl.value.trim()||'';
      original.apply(this,arguments);
      setTimeout(function(){
        var s=read();if(!s)return;
        var c=(s.cases||[]).find(function(x){return String(x.number)===String(number)})||null;
        if(!c&&index!==null&&index!==undefined)c=s.cases[index];
        if(!c)return;
        if(next){c.next=next;syncHearing(c)}else if(oldCase){removeAutoHearing(oldCase.id)}
        write(s);
      },30);
    }
    wrapped.__caseHearingSync=true;window.saveCase=wrapped;
  }
  function refreshDashboard(){
    var s=read(),content=document.getElementById('content');if(!s||!content)return;
    var headings=Array.prototype.slice.call(content.querySelectorAll('h3'));var h3=headings.find(function(x){return (x.innerText||'').trim()==='Upcoming Hearings'});if(!h3)return;
    var panel=h3.closest('.panel');if(!panel)return;var list=panel.querySelector('.list');if(!list)return;
    var today=new Date();today.setHours(0,0,0,0);
    var arr=(s.hearings||[]).filter(function(h){if(!h.date)return false;var d=new Date(String(h.date).slice(0,10)+'T00:00:00');return !isNaN(d)&&d>=today}).sort(function(a,b){return String(a.date).localeCompare(String(b.date))}).slice(0,4);
    if(!arr.length){list.innerHTML='<div class="empty">No upcoming hearings.</div>';return}
    list.innerHTML=arr.map(function(x){var d=new Date(String(x.date).slice(0,10)+'T00:00:00');var names=Array.isArray(x.clientNames)&&x.clientNames.length?x.clientNames.join(', '):(x.client||'');return '<div class="list-row"><div class="date-box"><b>'+d.getDate()+'</b><small>'+d.toLocaleString('en',{month:'short'})+'</small></div><div class="list-main"><strong>'+esc(x.case||'')+' — '+esc(x.title||'')+'</strong><small>'+(esc(x.time||'Time not set'))+' • '+esc(x.court||'')+' • '+esc(x.stage||'Scheduled')+(names?' • '+esc(names):'')+'</small></div></div>'}).join('');
  }
  function patchNavigate(){
    if(typeof window.navigate!=='function'||window.navigate.__caseHearingSync)return;
    var original=window.navigate;
    function wrapped(page){var r=original.apply(this,arguments);if(page==='dashboard')setTimeout(refreshDashboard,20);return r}
    wrapped.__caseHearingSync=true;window.navigate=wrapped;
  }
  function start(){patchOpenModal();patchSaveCase();patchNavigate();setTimeout(function(){refreshDashboard()},100)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();