(function(){
  var pending=null;
  function state(){try{return JSON.parse(localStorage.getItem('advocateDeskData')||'null')||{}}catch(e){return {}}}
  function save(s){localStorage.setItem('advocateDeskData',JSON.stringify(s))}
  function cases(){var s=state();return Array.isArray(s.cases)?s.cases:[]}
  function caseBy(v){var q=String(v||'').trim().toLowerCase();return cases().find(function(c){return String(c.id||'').toLowerCase()===q||String(c.number||'').toLowerCase()===q})||null}
  function ids(c){var a=Array.isArray(c.clientIds)?c.clientIds.slice():[];if(!a.length&&c.clientId)a=[c.clientId];return a.filter(Boolean)}
  function clients(c){var s=state(),a=ids(c);return a.map(function(id){return (s.clients||[]).find(function(x){return String(x.id)===String(id)})}).filter(Boolean)}
  function label(el){var l=el.closest('label');return l?(l.innerText||'').toLowerCase():(el.parentElement?(el.parentElement.innerText||'').toLowerCase():'')}
  function field(words){var a=document.querySelectorAll('#modal input,#modal select,#modal textarea');for(var i=0;i<a.length;i++){var t=label(a[i]);for(var j=0;j<words.length;j++)if(t.indexOf(words[j])!==-1)return a[i]}return null}
  function set(el,v){if(!el)return;el.value=v==null?'':v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}
  function addCase(){var m=document.getElementById('modal');if(!m||m.classList.contains('hidden'))return;var txt=(m.innerText||'').toLowerCase();if(txt.indexOf('meeting')===-1)return;if(document.getElementById('meetingCaseNumber'))return;
    var wrap=document.createElement('label');wrap.style.display='block';wrap.style.marginBottom='12px';wrap.innerHTML='<span style="display:block;margin-bottom:6px;font-weight:600">Case Number</span><select id="meetingCaseNumber" class="filter" style="width:100%"><option value="">Select case number</option></select>';
    var sel=wrap.querySelector('select');cases().forEach(function(c){var o=document.createElement('option');o.value=c.id;o.textContent=c.number;sel.appendChild(o)});
    var first=m.querySelector('label');if(first&&first.parentElement)first.parentElement.insertBefore(wrap,first);else m.querySelector('.modal-card')?.appendChild(wrap);
    sel.addEventListener('change',function(){var c=caseBy(sel.value);if(!c)return;var s=state(),cs=clients(c),cf=field(['client']);var title=field(['case title']);var court=field(['court']);
      if(cf){if(cf.tagName==='SELECT'){var firstId=ids(c)[0]||'';var opt=Array.prototype.slice.call(cf.options).find(function(o){return String(o.value)===String(firstId)||cs.some(function(x){return String(o.textContent).trim()===String(x.name).trim()})});if(opt)set(cf,opt.value)}else set(cf,cs.map(function(x){return x.name}).join(', '))}
      if(title)set(title,c.title||'');if(court)set(court,c.court||'');
      showClients(m,c,cs);pending={caseId:c.id,caseNumber:c.number,clientIds:ids(c),clientId:ids(c)[0]||'',caseTitle:c.title||'',court:c.court||''};
    });
  }
  function showClients(m,c,cs){var old=m.querySelector('[data-meeting-case-clients]');if(old)old.remove();var cf=field(['client']);if(!cf||!cs.length)return;var box=document.createElement('div');box.setAttribute('data-meeting-case-clients','1');box.style.marginBottom='12px';box.innerHTML='<div style="font-weight:600;margin-bottom:6px">Case Client(s)</div>';cs.forEach(function(cl){var l=document.createElement('label');l.style.display='flex';l.style.alignItems='center';l.style.gap='8px';l.style.padding='5px 0';var cb=document.createElement('input');cb.type='checkbox';cb.checked=true;cb.disabled=true;cb.value=cl.id;var sp=document.createElement('span');sp.textContent=cl.name;l.appendChild(cb);l.appendChild(sp);box.appendChild(l)});cf.parentElement.insertBefore(box,cf)}
  function hookSave(){var m=document.getElementById('modal');if(!m||m.classList.contains('hidden'))return;if(m.dataset.meetingCaseHook==='1')return;var txt=(m.innerText||'').toLowerCase();if(txt.indexOf('meeting')===-1)return;m.dataset.meetingCaseHook='1';Array.prototype.slice.call(m.querySelectorAll('button')).forEach(function(b){var t=(b.innerText||b.textContent||'').trim().toLowerCase();if(t==='save'||t.indexOf('save')===0)b.addEventListener('click',function(){var s=document.getElementById('meetingCaseNumber');if(!s||!s.value)return;var c=caseBy(s.value);if(c)pending={caseId:c.id,caseNumber:c.number,clientIds:ids(c),clientId:ids(c)[0]||'',caseTitle:c.title||'',court:c.court||''}},true)})}
  function persist(){if(!pending)return;var p=pending;pending=null;setTimeout(function(){var s=state(),a=s.meetings;if(!Array.isArray(a)||!a.length)return;var m=a[a.length-1];m.caseId=p.caseId;m.caseNumber=p.caseNumber;m.clientIds=p.clientIds||[];m.clientId=p.clientId||m.clientId||'';m.caseTitle=p.caseTitle||'';m.court=p.court||'';save(s)},220)}
  function boot(){var o=new MutationObserver(function(){addCase();hookSave()});o.observe(document.body,{childList:true,subtree:true});addCase();hookSave();setInterval(persist,500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();