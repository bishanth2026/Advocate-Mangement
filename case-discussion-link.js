(function(){
  var pending=null;
  function getState(){try{return JSON.parse(localStorage.getItem('advocateDeskData')||'null')||{}}catch(e){return {}}}
  function saveState(s){localStorage.setItem('advocateDeskData',JSON.stringify(s))}
  function cases(){var s=getState();return Array.isArray(s.cases)?s.cases:[]}
  function caseByValue(v){var q=String(v||'').trim().toLowerCase();return cases().find(function(c){return String(c.id||'').trim().toLowerCase()===q||String(c.number||'').trim().toLowerCase()===q})||null}
  function labelText(el){var l=el.closest('label');if(l)return (l.innerText||'').toLowerCase();var p=el.parentElement;return p?(p.innerText||'').toLowerCase():''}
  function findField(words){var all=document.querySelectorAll('#modal input,#modal select,#modal textarea');for(var i=0;i<all.length;i++){var el=all[i],txt=labelText(el);for(var j=0;j<words.length;j++){if(txt.indexOf(words[j])!==-1)return el}}return null}
  function setField(el,value){if(!el)return;el.value=value==null?'':value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}
  function getClientIds(c){var ids=Array.isArray(c.clientIds)?c.clientIds.slice():[];if(!ids.length&&c.clientId)ids=[c.clientId];return ids.filter(Boolean)}
  function getClients(c){var s=getState(), ids=getClientIds(c);return ids.map(function(id){return (s.clients||[]).find(function(x){return String(x.id)===String(id)})}).filter(Boolean)}
  function prefillClients(field,c){if(!field||!c)return;var clients=getClients(c);var names=clients.map(function(x){return x.name}).filter(Boolean);if(field.tagName==='SELECT'){var wanted=clients.map(function(x){return String(x.id)});Array.prototype.slice.call(field.options).forEach(function(o){o.selected=wanted.indexOf(String(o.value))!==-1||names.indexOf(String(o.textContent).trim())!==-1});setField(field,field.multiple?field.value:((field.options[0]&&field.options[0].value)||''));if(field.multiple){field.dispatchEvent(new Event('input',{bubbles:true}));field.dispatchEvent(new Event('change',{bubbles:true}))}}else{setField(field,names.join(', '))}}
  function ensureClientMultiSelect(field,c){if(!field||!c)return field;var clients=getClients(c);if(!clients.length)return field;if(field.tagName==='SELECT'){
      field.multiple=true;field.size=Math.min(Math.max(clients.length,2),5);field.setAttribute('aria-label','Clients');
      var wanted=clients.map(function(x){return String(x.id)});
      Array.prototype.slice.call(field.options).forEach(function(o){o.selected=wanted.indexOf(String(o.value))!==-1||clients.some(function(x){return String(o.textContent).trim()===String(x.name).trim()})});
      return field;
    }
    var wrap=document.createElement('div');wrap.setAttribute('data-discussion-clients','1');wrap.style.display='grid';wrap.style.gap='6px';wrap.style.padding='10px';wrap.style.border='1px solid #dbe3ef';wrap.style.borderRadius='10px';wrap.style.background='#f8fafc';clients.forEach(function(cl){var row=document.createElement('label');row.style.display='flex';row.style.alignItems='center';row.style.gap='8px';var cb=document.createElement('input');cb.type='checkbox';cb.value=cl.id;cb.checked=true;var sp=document.createElement('span');sp.textContent=cl.name;row.appendChild(cb);row.appendChild(sp);wrap.appendChild(row)});field.style.display='none';field.parentNode.insertBefore(wrap,field.nextSibling);return wrap;
  }
  function addCaseField(){var modal=document.getElementById('modal');if(!modal||modal.classList.contains('hidden'))return;var heading=(modal.innerText||'').toLowerCase();if(heading.indexOf('discussion')===-1)return;if(document.getElementById('discussionCaseNumber'))return;
    var wrap=document.createElement('label');wrap.style.display='block';wrap.style.marginBottom='12px';wrap.innerHTML='<span style="display:block;margin-bottom:6px;font-weight:600">Case Number</span><select id="discussionCaseNumber" class="filter" style="width:100%"><option value="">Select case number</option></select>';
    var sel=wrap.querySelector('select');cases().forEach(function(c){var o=document.createElement('option');o.value=c.id;o.textContent=c.number;sel.appendChild(o)});
    var first=modal.querySelector('label');if(first&&first.parentElement)first.parentElement.insertBefore(wrap,first);else modal.querySelector('.modal-card')?.appendChild(wrap);
    sel.addEventListener('change',function(){var c=caseByValue(sel.value);if(!c)return;var client=findField(['client']);var title=findField(['case title','title']);var court=findField(['court']);
      if(client){if(client.tagName==='SELECT'){ensureClientMultiSelect(client,c);prefillClients(client,c)}else{prefillClients(client,c)}}
      if(title)setField(title,c.title||'');
      if(court)setField(court,c.court||'');
      pending={caseId:c.id,caseNumber:c.number,clientIds:getClientIds(c),clientId:getClientIds(c)[0]||'',caseTitle:c.title||'',court:c.court||''};
    });
  }
  function enhanceTable(){var content=document.getElementById('content');if(!content)return;var heads=content.querySelectorAll('h1,h2,h3,h4');var target=null;for(var i=0;i<heads.length;i++){if((heads[i].innerText||'').toLowerCase().indexOf('discussion history')!==-1){target=heads[i];break}}if(!target)return;var table=target.closest('.panel')?.querySelector('table')||target.parentElement?.parentElement?.querySelector('table');if(!table)return;if(table.dataset.caseDiscussion==='1')return;table.dataset.caseDiscussion='1';var tr=table.querySelector('thead tr');if(!tr)return;var th=document.createElement('th');th.textContent='Case Number';tr.insertBefore(th,tr.firstElementChild);
    var s=getState(),rows=table.querySelectorAll('tbody tr');rows.forEach(function(row,idx){var td=document.createElement('td');var d=(s.discussions||[])[idx]||{};var c=caseByValue(d.caseId||d.caseNumber||d.case||d.caseNo);td.textContent=c?c.number:(d.caseNumber||d.case||'—');row.insertBefore(td,row.firstElementChild)});
  }
  function hookSave(){var modal=document.getElementById('modal');if(!modal||modal.classList.contains('hidden'))return;if(modal.dataset.discussionSaveHook==='1')return;var text=(modal.innerText||'').toLowerCase();if(text.indexOf('discussion')===-1)return;modal.dataset.discussionSaveHook='1';var btns=modal.querySelectorAll('button');btns.forEach(function(b){var t=(b.innerText||b.textContent||'').trim().toLowerCase();if(t==='save'||t.indexOf('save')===0){b.addEventListener('click',function(){var sel=document.getElementById('discussionCaseNumber');if(sel&&sel.value){var c=caseByValue(sel.value);if(c)pending={caseId:c.id,caseNumber:c.number,clientIds:getClientIds(c),clientId:getClientIds(c)[0]||'',caseTitle:c.title||'',court:c.court||''};}},true)}})}
  function persistLink(){if(!pending)return;var p=pending;pending=null;setTimeout(function(){var s=getState();if(!Array.isArray(s.discussions)||!s.discussions.length)return;var target=s.discussions[s.discussions.length-1];target.caseId=p.caseId;target.caseNumber=p.caseNumber;target.clientIds=p.clientIds||[];target.clientId=p.clientId||'';target.caseTitle=p.caseTitle||'';target.court=p.court||'';saveState(s);try{if(typeof window.clientManagement==='function')window.clientManagement()}catch(e){}},180)}
  function boot(){var o=new MutationObserver(function(){addCaseField();hookSave();enhanceTable()});o.observe(document.body,{childList:true,subtree:true});addCaseField();hookSave();enhanceTable();setInterval(persistLink,500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();