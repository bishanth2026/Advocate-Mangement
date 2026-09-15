(function(){
  'use strict';
  var courts = [
    'District Court, Kozhikode','Additional District Court, Kozhikode','Sub Court, Kozhikode','Munsiff Court, Kozhikode','Chief Judicial Magistrate Court, Kozhikode','JFCM I Kozhikode','JFCM II Kozhikode','JFCM III Kozhikode','JFCM IV Kozhikode','JFCM V Kozhikode','JFCM VI Kozhikode','JFCM VII Kozhikode','JFCM VIII Kozhikode','JFCM IX Kozhikode','JFCM X Kozhikode','Family Court, Kozhikode','MACT, Kozhikode','Commercial Court, Kozhikode','Special Court, Kozhikode','District Court / Rent Control Appellate Authority, Kozhikode','Family Court, Vatakara','Sub Court, Vatakara','Munsiff Court, Vatakara','JFCM Court, Vatakara','MACT, Vatakara','Commercial Court, Vatakara','Sub Court, Koyilandy','Munsiff Court, Koyilandy','JFCM Court, Koyilandy','Sub Court, Perambra','Munsiff Court, Perambra','JFCM Court, Perambra','Munsiff Court, Payyoli','JFCM Court, Payyoli','Munsiff Court, Nadapuram','JFCM Court, Nadapuram','Munsiff Court, Thamarassery','JFCM Court, Thamarassery','JFCM Court, Kunnamangalam','Grama Nyayalaya, Kunnummal','Grama Nyayalaya, Koduvally'
  ];
  var scheduled=false;
  function getList(){
    var list=document.getElementById('court-search-options');
    if(!list){list=document.createElement('datalist');list.id='court-search-options';document.body.appendChild(list);}
    if(list.dataset.ready==='1') return list;
    var seen={};
    courts.forEach(function(c){seen[c]=true;});
    document.querySelectorAll('#modal select option').forEach(function(o){
      var v=(o.value||o.textContent||'').trim();
      if(v && !/^select court$/i.test(v) && !/^select$/i.test(v)) seen[v]=true;
    });
    Object.keys(seen).forEach(function(c){var option=document.createElement('option');option.value=c;list.appendChild(option);});
    list.dataset.ready='1';
    return list;
  }
  function enhance(){
    getList();
    var direct=document.getElementById('partyCourt');
    if(direct){direct.removeAttribute('disabled');direct.removeAttribute('readonly');direct.setAttribute('list','court-search-options');direct.placeholder='Type court name...';return;}
    document.querySelectorAll('#modal select').forEach(function(select){
      if(select.dataset.courtSearchable==='1') return;
      var label=select.closest('label,.form-group,.field,.form-field');
      var text=label ? label.textContent : '';
      if(!/\bcourt\b/i.test(text)) return;
      var input=document.createElement('input');
      input.type='text';input.name=select.name||'';input.id=select.id||'';input.className=select.className;input.value=select.value||'';input.placeholder='Type court name...';input.setAttribute('list','court-search-options');input.autocomplete='off';input.dataset.courtSearchable='1';
      select.parentNode.replaceChild(input,select);
    });
  }
  function schedule(){if(scheduled)return;scheduled=true;setTimeout(function(){scheduled=false;enhance();},0);}
  function start(){schedule();var target=document.getElementById('content')||document.body;var observer=new MutationObserver(schedule);observer.observe(target,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
