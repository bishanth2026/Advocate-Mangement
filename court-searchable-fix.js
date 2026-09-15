(function(){
  'use strict';
  var courts = [
    'JFCM Court, Kunnamangalam',
    'District Court / Rent Control Appellate Authority, Kozhikode',
    'Sub Court Kozhikode',
    'Munsiff Court 1 Kozhikode',
    'Munsiff Court 2 Kozhikode',
    'JFCM 1 Kozhikode',
    'JFCM 2 Kozhikode',
    'JFCM 3 Kozhikode',
    'JFCM 5 Kozhikode',
    'Chief Judicial Magistrate Court, Kozhikode',
    'MACT Kozhikode',
    'JFCM IV Kozhikode',
    'Additional District and Sessions Court-III, Kozhikode',
    'Additional District Court, POCSO, Kozhikode',
    'JFCM 7, NI ACT Cases, Kozhikode',
    'Special Fast Track Court, Kozhikode',
    'Commercial Court Kozhikode',
    'Judicial First Class Magistrate 8 Kozhikode',
    'Judicial First Class Magistrate 9 Kozhikode',
    'Judicial First Class Magistrate 10 Kozhikode',
    'Judicial First Class Magistrate 11 Kozhikode',
    'Family Court Vatakara',
    'Munsiff Court,Koyilandy',
    'Sub Court,Koyilandy',
    'Judicial First Class Magistrate Court, Koyilandy',
    'Special Fast Track Court, Koyilandy',
    'Commercial Court, Koyilandy',
    'Family Court,Kozhikode',
    'Munsiff-Magistrate Court, Perambra',
    'Judicial First Class Magistrate Court-I, Perambra',
    'Judicial First Class Magistrate Court-II, Perambra',
    'Munsiff Court, Payyoli',
    'Judicial First Class Magistrate Court,Payyoli',
    'Munsiff Court, Nadapuram',
    'Judicial First Class Magistrate Court, Nadapuram',
    'Fast Track Special Court, Nadapuram',
    'JFCM I Thamarassery',
    'JFCM II Thamarassery',
    'Munsiff Court, Thamarassery',
    'JFCM VI Kozhikode, Eranhipalam',
    'Spl. Addl Sessions Court, Marad Cases, Kozhikode',
    'Addl. District and Sessions Court, Vatakara',
    'Judicial First Class Magistrate Court, Vatakara',
    'MACT Vatakara',
    'Sub Court, Vatakara',
    'Munsiff Court, Vadakara',
    'JFCM II Court, Vatakara',
    'NDPS Act Cases, Vatakara',
    'Commercial Court, Vatakara',
    'Addl. District Court-II Vatakara',
    'Grama Nyayalaya Kunnummal',
    'Grama Nyayalaya Koduvally'
  ];
  function enhance(){
    var input=document.getElementById('partyCourt');
    if(!input || input.dataset.courtSearchable==='1') return;
    input.dataset.courtSearchable='1';
    input.setAttribute('list','court-search-options');
    input.setAttribute('autocomplete','off');
    input.placeholder='Type or select court';
    var list=document.getElementById('court-search-options');
    if(!list){
      list=document.createElement('datalist');
      list.id='court-search-options';
      courts.forEach(function(c){var option=document.createElement('option');option.value=c;list.appendChild(option);});
      document.body.appendChild(list);
    }
  }
  var observer=new MutationObserver(enhance);
  function start(){enhance();var body=document.getElementById('content');if(body)observer.observe(body,{childList:true,subtree:true});}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
