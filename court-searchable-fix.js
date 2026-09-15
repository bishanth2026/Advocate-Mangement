(function(){
  'use strict';
  var courts = [
    'District Court, Kozhikode',
    'Additional District Court, Kozhikode',
    'Sub Court, Kozhikode',
    'Munsiff Court, Kozhikode',
    'Chief Judicial Magistrate Court, Kozhikode',
    'JFCM I Kozhikode',
    'JFCM II Kozhikode',
    'JFCM III Kozhikode',
    'JFCM IV Kozhikode',
    'JFCM V Kozhikode',
    'JFCM VI Kozhikode',
    'JFCM VII Kozhikode',
    'JFCM VIII Kozhikode',
    'JFCM IX Kozhikode',
    'JFCM X Kozhikode',
    'Family Court, Kozhikode',
    'MACT, Kozhikode',
    'Commercial Court, Kozhikode',
    'Special Court, Kozhikode',
    'District Court / Rent Control Appellate Authority, Kozhikode',
    'Family Court, Vatakara',
    'Sub Court, Vatakara',
    'Munsiff Court, Vatakara',
    'JFCM Court, Vatakara',
    'MACT, Vatakara',
    'Commercial Court, Vatakara',
    'Sub Court, Koyilandy',
    'Munsiff Court, Koyilandy',
    'JFCM Court, Koyilandy',
    'Sub Court, Perambra',
    'Munsiff Court, Perambra',
    'JFCM Court, Perambra',
    'Munsiff Court, Payyoli',
    'JFCM Court, Payyoli',
    'Munsiff Court, Nadapuram',
    'JFCM Court, Nadapuram',
    'Munsiff Court, Thamarassery',
    'JFCM Court, Thamarassery',
    'JFCM Court, Kunnamangalam',
    'Grama Nyayalaya, Kunnummal',
    'Grama Nyayalaya, Koduvally'
  ];
  function getList(){
    var list=document.getElementById('court-search-options');
    if(!list){
      list=document.createElement('datalist');
      list.id='court-search-options';
      document.body.appendChild(list);
    }
    var seen={};
    courts.forEach(function(c){seen[c]=true;});
    document.querySelectorAll('select option').forEach(function(o){
      var v=(o.value||o.textContent||'').trim();
      if(v && !/^select court$/i.test(v) && !/^select$/i.test(v)) seen[v]=true;
    });
    list.innerHTML='';
    Object.keys(seen).forEach(function(c){
      var option=document.createElement('option');
      option.value=c;
      list.appendChild(option);
    });
    return list;
  }
  function enhance(){
    getList();
    document.querySelectorAll('#modal label, #modal .form-group, #modal .field, #modal .form-field').forEach(function(wrapper){
      var text=(wrapper.firstChild && wrapper.firstChild.textContent || wrapper.textContent || '').trim();
      if(!/^court$/i.test(text.split(/\s+/)[0] || '') && !/\bCourt\b/i.test(text)) return;
      var select=wrapper.querySelector('select');
      if(!select || select.dataset.courtSearchable==='1') return;
      var input=document.createElement('input');
      Array.prototype.slice.call(select.attributes).forEach(function(a){
        if(a.name!=='class' && a.name!=='style') input.setAttribute(a.name,a.value);
      });
      input.type='text';
      input.value=(select.value||'').trim();
      if(/^select court$/i.test(input.value) || /^select$/i.test(input.value)) input.value='';
      input.placeholder='Type court name...';
      input.setAttribute('list','court-search-options');
      input.setAttribute('autocomplete','off');
      input.className=select.className;
      input.style.cssText=select.style.cssText;
      input.dataset.courtSearchable='1';
      select.parentNode.replaceChild(input,select);
    });
    var direct=document.getElementById('partyCourt');
    if(direct){direct.setAttribute('list','court-search-options');direct.placeholder='Type court name...';}
  }
  var observer=new MutationObserver(enhance);
  function start(){enhance();observer.observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
