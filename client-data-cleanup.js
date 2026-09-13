/* Prevent case-type values from appearing as client records. */
(function(){
  'use strict';
  var KEY='advocateDeskData';
  var CASE_TYPES={civil:true,criminal:true,writ:true,family:true,other:true};
  function isCorruptClient(c){
    if(!c)return false;
    var name=String(c.name||'').trim().toLowerCase();
    if(!CASE_TYPES[name])return false;
    var phone=String(c.phone||'').trim();
    var email=String(c.email||'').trim();
    /* These are the legacy case-field values that were incorrectly copied
       into the client form. Do not remove a genuine client merely because
       their name happens to match a case type. */
    return !/^\+?[0-9 ()-]{7,}$/.test(phone) || /^(os|cc|wp|op|cr|fc)(\s|\/|-|\d|$)/i.test(phone) ||
      /^(os|cc|wp|op|cr|fc)(\s|\/|-|\d|$)/i.test(email);
  }
  function clean(){
    try{
      var s=JSON.parse(localStorage.getItem(KEY)||'{}')||{};
      if(!Array.isArray(s.clients))return false;
      var before=s.clients.length;
      s.clients=s.clients.filter(function(c){return !isCorruptClient(c);});
      if(s.clients.length!==before){
        localStorage.setItem(KEY,JSON.stringify(s));
        return true;
      }
    }catch(e){console.warn('[AdvocateDesk] client data cleanup skipped',e);}
    return false;
  }
  function removeBadRows(){
    var table=document.getElementById('clientTable');
    if(!table)return;
    table.querySelectorAll('tbody tr').forEach(function(row){
      var cells=row.querySelectorAll('td');
      if(cells.length<3)return;
      var name=(cells[0].textContent||'').trim().split(/\s+/)[0].toLowerCase();
      var phone=(cells[1].textContent||'').trim();
      var email=(cells[2].textContent||'').trim();
      if(CASE_TYPES[name] && (!/^\+?[0-9 ()-]{7,}$/.test(phone)||/^(os|cc|wp|op|cr|fc)(\s|\/|-|\d|$)/i.test(phone)||/^(os|cc|wp|op|cr|fc)(\s|\/|-|\d|$)/i.test(email)))row.remove();
    });
  }
  clean();
  setTimeout(removeBadRows,0);
  setTimeout(removeBadRows,700);
  document.addEventListener('click',function(){setTimeout(function(){clean();removeBadRows();},100);},true);
})();
