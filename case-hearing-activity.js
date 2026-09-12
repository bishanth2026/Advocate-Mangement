/* Add a Case 360 activity when a case's next hearing is created or changed. */
(function(){
  'use strict';
  var KEY='advocateDeskData', seen={};
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return {};}}
  function write(d){localStorage.setItem(KEY,JSON.stringify(d));}
  function tick(){
    var d=read(); if(!Array.isArray(d.cases))return;
    d.caseActivities=d.caseActivities||{}; var changed=false;
    d.cases.forEach(function(c){
      if(!c||!c.next)return;
      var id=String(c.id||c.number||''); if(!id)return;
      var signature=String(c.next)+'|'+String(c.number||c.id);
      if(seen[id]===signature)return;
      seen[id]=signature;
      var items=d.caseActivities[id]=Array.isArray(d.caseActivities[id])?d.caseActivities[id]:[];
      var exists=items.some(function(a){return a.source==='case-next-hearing'&&a.signature===signature;});
      if(!exists){
        items.push({id:'ACT-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),type:'Hearing scheduled',notes:'Next hearing scheduled for '+c.next+(c.court?' at '+c.court:'')+'.',createdAt:new Date().toISOString(),source:'case-next-hearing',signature:signature});
        changed=true;
      }
    });
    if(changed)write(d);
  }
  function boot(){tick();setInterval(tick,1000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
