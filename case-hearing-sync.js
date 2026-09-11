(function(){
  var lastSignature='';
  function read(){try{return JSON.parse(localStorage.getItem('advocateDeskData')||'null')}catch(e){return null}}
  function write(s){localStorage.setItem('advocateDeskData',JSON.stringify(s))}
  function esc(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]})}
  function clientIds(c,s){var ids=Array.isArray(c&&c.clientIds)?c.clientIds.slice():[];if(!ids.length&&c&&c.clientId)ids=[c.clientId];if(!ids.length&&c&&c.client){var x=(s.clients||[]).find(function(z){return z.name===c.client});if(x)ids=[x.id]}return ids.filter(Boolean)}
  function syncCases(){
    var s=read();if(!s||!Array.isArray(s.cases))return false;
    s.hearings=Array.isArray(s.hearings)?s.hearings:[];
    var changed=false;
    s.cases.forEach(function(c){
      if(!c||!c.id||!c.number||!c.next)return;
      var ids=clientIds(c,s), names=(s.clients||[]).filter(function(x){return ids.indexOf(x.id)>=0}).map(function(x){return x.name}).filter(Boolean);
      var existing=s.hearings.find(function(h){return h.source==='case-next-hearing'&&String(h.caseId)===String(c.id)})
        ||s.hearings.find(function(h){return String(h.case)===String(c.number)&&String(h.date)===String(c.next)});
      if(existing){
        var before=JSON.stringify({date:existing.date,case:existing.case,title:existing.title,court:existing.court,clientIds:existing.clientIds,clientNames:existing.clientNames});
        existing.source='case-next-hearing';existing.caseId=c.id;existing.date=c.next;existing.case=c.number;existing.title=c.title||'';existing.court=c.court||'';existing.clientIds=ids;existing.clientId=ids[0]||'';existing.clientNames=names;existing.client=c.client||names.join(', ');existing.stage=existing.stage||'Scheduled';existing.time=existing.time||'';
        var after=JSON.stringify({date:existing.date,case:existing.case,title:existing.title,court:existing.court,clientIds:existing.clientIds,clientNames:existing.clientNames});
        if(before!==after)changed=true;
      }else{
        s.hearings.push({id:'HEAR-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),source:'case-next-hearing',caseId:c.id,date:c.next,time:'',case:c.number,title:c.title||'',client:c.client||names.join(', '),clientId:ids[0]||'',clientIds:ids,clientNames:names,court:c.court||'',stage:'Scheduled'});changed=true;
      }
    });
    if(changed)write(s);
    return changed;
  }
  function refreshDashboard(){
    var s=read(),content=document.getElementById('content');if(!s||!content)return;
    var h3=Array.prototype.slice.call(content.querySelectorAll('h3')).find(function(x){return (x.innerText||'').trim()==='Upcoming Hearings'});if(!h3)return;
    var panel=h3.closest('.panel'),list=panel&&panel.querySelector('.list');if(!list)return;
    var today=new Date();today.setHours(0,0,0,0);
    var arr=(s.hearings||[]).filter(function(h){if(!h.date)return false;var d=new Date(String(h.date).slice(0,10)+'T00:00:00');return !isNaN(d)&&d>=today}).sort(function(a,b){return String(a.date).localeCompare(String(b.date))}).slice(0,4);
    list.innerHTML=arr.length?arr.map(function(x){var d=new Date(String(x.date).slice(0,10)+'T00:00:00');var names=Array.isArray(x.clientNames)&&x.clientNames.length?x.clientNames.join(', '):(x.client||'');return '<div class="list-row"><div class="date-box"><b>'+d.getDate()+'</b><small>'+d.toLocaleString('en',{month:'short'})+'</small></div><div class="list-main"><strong>'+esc(x.case||'')+' — '+esc(x.title||'')+'</strong><small>'+esc(x.time||'Time not set')+' • '+esc(x.court||'')+' • '+esc(x.stage||'Scheduled')+(names?' • '+esc(names):'')+'</small></div></div>'}).join(''):'<div class="empty">No upcoming hearings.</div>';
  }
  function tick(){
    var changed=syncCases();var s=read();var sig='';try{sig=JSON.stringify((s&&s.hearings)||[])}catch(e){}
    if(changed||sig!==lastSignature){lastSignature=sig;refreshDashboard()}
  }
  function start(){tick();setInterval(tick,500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();