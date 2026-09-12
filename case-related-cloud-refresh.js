/* Refresh case-related records before opening related pages. */
(function(){
  'use strict';
  var KEY='advocateDeskData';
  function ready(){return !!(window.ADCloudCRUD&&window.ADCloudCRUD.ready&&window.ADCloudCRUD.ready());}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return {};}}
  function write(s){try{localStorage.setItem(KEY,JSON.stringify(s));}catch(e){}}
  function map(table,row){
    if(table==='hearings')return Object.assign({},row,{caseId:row.case_id||row.caseId||'',clientId:row.client_id||row.clientId||'',_cloud:true});
    if(table==='meetings')return Object.assign({},row,{caseId:row.case_id||row.caseId||'',clientId:row.client_id||row.clientId||'',_cloud:true});
    if(table==='tasks')return Object.assign({},row,{caseId:row.case_id||row.caseId||'',_cloud:true});
    if(table==='documents')return Object.assign({},row,{caseId:row.case_id||row.caseId||'',_cloud:true});
    return Object.assign({},row,{_cloud:true});
  }
  async function refresh(){
    if(!ready())return false;
    var s=read();
    var tables=['hearings','meetings','tasks','documents'];
    for(var i=0;i<tables.length;i++){
      try{
        var rows=await window.ADCloudCRUD.list(tables[i],{order:'created_at',ascending:false});
        s[tables[i]]=Array.isArray(rows)?rows.map(function(r){return map(tables[i],r);}):[];
      }catch(e){console.warn('[AdvocateDesk] '+tables[i]+' refresh skipped:',e.message);}
    }
    write(s);
    return true;
  }
  window.ADRelatedCloud={refresh:refresh};
  var tries=0;
  function boot(){if(ready()){refresh();}else if(tries++<30)setTimeout(boot,500);}
  boot();
  function refreshForPage(page){
    if(page==='cases'||page==='case-360'||page==='hearings'||page==='calendar'||page==='tasks'||page==='documents'){
      refresh().then(function(){
        if(page==='hearings'&&typeof window.navigate==='function'&&location.hash==='#hearings'){
          var c=document.getElementById('content');if(c&&typeof window.render==='function')try{window.render('hearings');}catch(e){}
        }
      });
    }
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('[data-page]');
    if(b)refreshForPage(b.getAttribute('data-page'));
  },true);
  var oldNav=window.navigate;
  if(typeof oldNav==='function'&&!oldNav.__relatedCloudRefresh){
    function nav(page){refreshForPage(page);return oldNav.apply(this,arguments);}
    nav.__relatedCloudRefresh=true;window.navigate=nav;
  }
})();
