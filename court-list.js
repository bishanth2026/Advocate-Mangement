(function(){
  const COURTS = [
    "JFCM Court, Kunnamangalam",
    "District Court / Rent Control Appellate Authority, Kozhikode",
    "Sub Court Kozhikode",
    "Munsiff Court 1 Kozhikode",
    "Munsiff Court 2 Kozhikode",
    "JFCM 1 Kozhikode",
    "JFCM 2 Kozhikode",
    "JFCM 3 Kozhikode",
    "JFCM 5 Kozhikode",
    "Chief Judicial Magistrate Court, Kozhikode",
    "MACT Kozhikode",
    "JFCM IV Kozhikode",
    "Additional District and Sessions Court-III, Kozhikode",
    "Additional District Court, POCSO, Kozhikode",
    "JFCM 7, NI ACT Cases, Kozhikode",
    "Special Fast Track Court, Kozhikode",
    "Commercial Court Kozhikode",
    "Judicial First Class Magistrate 8 Kozhikode",
    "Judicial First Class Magistrate 9 Kozhikode",
    "Judicial First Class Magistrate 10 Kozhikode",
    "Judicial First Class Magistrate 11 Kozhikode",
    "Family Court Vatakara",
    "Munsiff Court,Koyilandy",
    "Sub Court,Koyilandy",
    "Judicial First Class Magistrate Court, Koyilandy",
    "Special Fast Track Court, Koyilandy",
    "Commercial Court, Koyilandy",
    "Family Court,Kozhikode",
    "Munsiff-Magistrate Court, Perambra",
    "Judicial First Class Magistrate Court-I, Perambra",
    "Judicial First Class Magistrate Court-II, Perambra",
    "Munsiff Court, Payyoli",
    "Judicial First Class Magistrate Court,Payyoli",
    "Munsiff Court, Nadapuram",
    "Judicial First Class Magistrate Court, Nadapuram",
    "Fast Track Special Court, Nadapuram",
    "JFCM I Thamarassery",
    "JFCM II Thamarassery",
    "Munsiff Court, Thamarassery,",
    "JFCM VI Kozhikode, Eranhipalam",
    "Spl. Addl Sessions Court, Marad Cases, Kozhikode",
    "Addl. District and Sessions Court, Vatakara",
    "Judicial First Class Magistrate Court, Vatakara",
    "MACT Vatakara",
    "Sub Court, Vatakara",
    "Munsiff Court, Vadakara",
    "JFCM II Court, Vatakara",
    "NDPS Act Cases, Vatakara",
    "Commercial Court, Vatakara",
    "Addl. District Court-II Vatakara",
    "Grama Nyayalaya Kunnummal",
    "Grama Nyayalaya Koduvalli"
  ];

  function enhanceCaseCourt(){
    const modal=document.querySelector('.modal');
    if(!modal)return;
    let field=document.getElementById('f4');
    if(!field || field.closest('.court-search-wrap'))return;
    const label=field.closest('label');
    if(!label)return;

    const current=field.value||'';
    const wrap=document.createElement('div');
    wrap.className='court-search-wrap';
    wrap.style.cssText='position:relative!important;display:block!important;width:100%!important;min-width:0!important;height:42px!important;';

    const input=document.createElement('input');
    input.type='text';
    input.id='f4';
    input.name=field.name||'court';
    input.value=current;
    input.placeholder='Search court by name or word...';
    input.autocomplete='off';
    input.setAttribute('role','combobox');
    input.setAttribute('aria-expanded','false');
    input.setAttribute('aria-autocomplete','list');
    input.style.cssText='display:block!important;visibility:visible!important;opacity:1!important;width:100%!important;height:42px!important;min-height:42px!important;box-sizing:border-box!important;margin:0!important;border:1px solid #d7dee9!important;border-radius:8px!important;padding:10px 11px!important;background:#fff!important;color:#18243a!important;font-size:13px!important;line-height:20px!important;outline:none!important;';

    const list=document.createElement('div');
    list.className='court-search-results';
    list.setAttribute('role','listbox');
    list.style.cssText='display:none;position:absolute;left:0;right:0;top:46px;max-height:230px;overflow-y:auto;background:#fff;border:1px solid #d7dee9;border-radius:9px;box-shadow:0 12px 30px rgba(15,23,42,.16);z-index:99999;padding:5px;box-sizing:border-box;';

    wrap.appendChild(input);
    wrap.appendChild(list);
    field.replaceWith(wrap);

    function closeResults(){
      list.style.display='none';
      input.setAttribute('aria-expanded','false');
    }
    function selectCourt(court){
      input.value=court;
      closeResults();
      input.dispatchEvent(new Event('input',{bubbles:true}));
      input.dispatchEvent(new Event('change',{bubbles:true}));
    }
    function showResults(query){
      const q=String(query||'').trim().toLowerCase();
      const matches=q?COURTS.filter(c=>c.toLowerCase().includes(q)):COURTS;
      list.innerHTML='';
      if(!matches.length){
        const empty=document.createElement('div');
        empty.textContent='No matching court found';
        empty.style.cssText='padding:11px 10px;color:#667085;font-size:12px;';
        list.appendChild(empty);
      }else{
        matches.forEach(function(court){
          const option=document.createElement('div');
          option.textContent=court;
          option.setAttribute('role','option');
          option.style.cssText='padding:10px 11px;border-radius:7px;cursor:pointer;font-size:12px;line-height:1.35;color:#18243a;';
          option.addEventListener('mouseenter',function(){option.style.background='#eef4fb'});
          option.addEventListener('mouseleave',function(){option.style.background='transparent'});
          option.addEventListener('mousedown',function(e){e.preventDefault();selectCourt(court)});
          list.appendChild(option);
        });
      }
      list.style.display='block';
      input.setAttribute('aria-expanded','true');
    }
    input.addEventListener('focus',function(){showResults(input.value)});
    input.addEventListener('input',function(){showResults(input.value)});
    input.addEventListener('keydown',function(e){
      if(e.key==='Escape'){closeResults();return;}
      if(e.key==='Enter'){
        const first=list.querySelector('[role="option"]');
        if(first){e.preventDefault();selectCourt(first.textContent);}
      }
    });
    input.addEventListener('blur',function(){setTimeout(closeResults,150)});
  }

  function boot(){
    enhanceCaseCourt();
    const observer=new MutationObserver(function(){enhanceCaseCourt()});
    observer.observe(document.body,{childList:true,subtree:true});
    window.__advocateDeskCourtSearchObserver=observer;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
