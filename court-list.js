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

  function install(){
    if(typeof window.openModal!=="function" || window.__advocateDeskCourtSearchInstalled)return;
    window.__advocateDeskCourtSearchInstalled=true;
    const originalOpenModal=window.openModal;

    window.openModal=function(type,index){
      const result=originalOpenModal.apply(this,arguments);
      if(type!=="case")return result;

      const input=document.getElementById("f4");
      if(!input || input.tagName.toLowerCase()!=="input")return result;
      if(input.closest(".court-search-wrap"))return result;

      const label=input.closest("label");
      if(!label)return result;

      const current=input.value||"";
      const wrap=document.createElement("div");
      wrap.className="court-search-wrap";
      wrap.style.cssText="position:relative;width:100%;display:block;min-width:0;";

      input.placeholder="Search court by name or word...";
      input.setAttribute("autocomplete","off");
      input.setAttribute("role","combobox");
      input.setAttribute("aria-expanded","false");
      input.setAttribute("aria-autocomplete","list");
      input.style.cssText="display:block!important;width:100%!important;height:42px!important;min-height:42px!important;box-sizing:border-box!important;margin:0!important;border:1px solid #dfe3ea!important;border-radius:8px!important;padding:10px 12px!important;outline:0!important;background:#fff!important;font-size:12px!important;color:#18243a!important;line-height:20px!important;visibility:visible!important;opacity:1!important;";

      const list=document.createElement("div");
      list.className="court-search-results";
      list.setAttribute("role","listbox");
      list.style.cssText="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:230px;overflow-y:auto;background:#fff;border:1px solid #dfe3ea;border-radius:9px;box-shadow:0 12px 30px rgba(15,23,42,.16);z-index:1000;padding:5px;box-sizing:border-box;";

      wrap.appendChild(input);
      wrap.appendChild(list);
      label.replaceChild(wrap,input);

      function closeResults(){
        list.style.display="none";
        input.setAttribute("aria-expanded","false");
      }

      function selectCourt(court){
        input.value=court;
        closeResults();
        input.dispatchEvent(new Event("input",{bubbles:true}));
        input.dispatchEvent(new Event("change",{bubbles:true}));
      }

      function showResults(query){
        const q=String(query||"").trim().toLowerCase();
        const matches=q?COURTS.filter(c=>c.toLowerCase().includes(q)):COURTS;
        list.innerHTML="";

        if(!matches.length){
          const empty=document.createElement("div");
          empty.textContent="No matching court found";
          empty.style.cssText="padding:11px 10px;color:#667085;font-size:12px;";
          list.appendChild(empty);
        }else{
          matches.forEach(function(court){
            const option=document.createElement("div");
            option.textContent=court;
            option.setAttribute("role","option");
            option.style.cssText="padding:10px 11px;border-radius:7px;cursor:pointer;font-size:12px;line-height:1.35;color:#18243a;";
            option.addEventListener("mouseenter",function(){option.style.background="#eef4fb"});
            option.addEventListener("mouseleave",function(){option.style.background="transparent"});
            option.addEventListener("mousedown",function(e){e.preventDefault();selectCourt(court)});
            list.appendChild(option);
          });
        }
        list.style.display="block";
        input.setAttribute("aria-expanded","true");
      }

      input.addEventListener("focus",function(){showResults(input.value)});
      input.addEventListener("input",function(){showResults(input.value)});
      input.addEventListener("keydown",function(e){
        if(e.key==="Escape"){closeResults();return;}
        if(e.key==="Enter"){
          const first=list.querySelector('[role="option"]');
          if(first){e.preventDefault();selectCourt(first.textContent);}
        }
      });

      document.addEventListener("mousedown",function(e){
        if(!wrap.contains(e.target))closeResults();
      });

      if(current)input.value=current;
      return result;
    };
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
  else install();
  setTimeout(install,0);
})();
