/* Case display compatibility: normalize legacy/cloud field names before rendering. */
(function(){
  'use strict';
  const KEY='advocateDeskData';
  let patching=false;
  let observer=null;
  function first(obj,keys,fallback=''){for(const key of keys){const value=obj&&obj[key];if(value!==undefined&&value!==null&&String(value).trim()!=='')return value;}return fallback;}
  function normalize(){
    let data;try{data=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){return null;}
    if(!data||!Array.isArray(data.cases))return data;
    let changed=false;
    data.cases=data.cases.map(c=>{
      const item={...c};
      const petitioner=first(item,['petitioner','petitionerName','petitioner_name'],'');
      const respondent=first(item,['respondent','respondentName','respondent_name'],'');
      const title=first(item,['title','caseTitle','case_title','caseName','case_name'],petitioner&&respondent?`${petitioner} vs ${respondent}`:'Untitled case');
      const number=first(item,['number','caseNumber','case_number','caseNo','case_no','filingNumber','filing_number'],first(item,['id'],'—'));
      const next=first(item,['next','nextHearing','next_hearing','hearingDate','hearing_date','nextHearingDate','next_hearing_date'],'');
      const ids=Array.isArray(item.clientIds)?item.clientIds:Array.isArray(item.client_ids)?item.client_ids:(item.clientId?[item.clientId]:(item.client_id?[item.client_id]:[]));
      const client=first(item,['client','clientName','client_name'],'');
      const normalized={...item,number,title,next,client,clientIds:ids};
      if(JSON.stringify(normalized)!==JSON.stringify(c)){changed=true;}
      return normalized;
    });
    if(changed){try{localStorage.setItem(KEY,JSON.stringify(data));}catch(e){}}
    return data;
  }
  function patchVisibleCases(){
    if(patching)return;
    const data=normalize();
    if(!data||!Array.isArray(data.cases))return;
    const rows=document.querySelectorAll('#caseTable tbody tr');
    if(!rows.length)return;
    patching=true;
    try{
      rows.forEach((row,index)=>{
        const c=data.cases[index];if(!c)return;
        const cells=row.querySelectorAll('td');if(cells.length<4)return;
        const caseCell=cells[0];
        const number=first(c,['number','caseNumber','case_number'],'—');
        const title=first(c,['title','caseTitle','case_title'],'Untitled case');
        const nextCaseHtml=`<span class="case-link">${escapeHtml(number)}</span><br><span class="muted">${escapeHtml(title)}</span>`;
        if(caseCell.innerHTML!==nextCaseHtml)caseCell.innerHTML=nextCaseHtml;
        const clientCell=cells[1];
        let names=[];
        const ids=Array.isArray(c.clientIds)?c.clientIds:[];
        ids.forEach(id=>{const client=data.clients&&data.clients.find(x=>x.id===id);if(client)names.push(client.name);});
        if(!names.length&&c.client)names=[c.client];
        const clientText=names.join(', ')||'—';
        if(clientCell.textContent!==clientText)clientCell.textContent=clientText;
        const nextCell=cells[3];
        const next=first(c,['next','nextHearing','next_hearing','hearingDate','hearing_date'],'');
        const nextText=next?formatDate(next):'—';
        if(nextCell.textContent!==nextText)nextCell.textContent=nextText;
      });
    }finally{patching=false;}
  }
  function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function formatDate(value){const raw=String(value||'').trim();if(!raw)return'—';const date=new Date(raw.length===10?raw+'T00:00:00':raw);if(Number.isNaN(date.getTime()))return'—';return date.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});}
  function run(){normalize();patchVisibleCases();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  observer=new MutationObserver(()=>{
    if(!patching&&document.getElementById('caseTable'))patchVisibleCases();
  });
  observer.observe(document.body,{childList:true,subtree:true});
})();
