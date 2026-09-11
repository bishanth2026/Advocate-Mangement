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
    if(typeof window.openModal!=="function" || window.__advocateDeskCourtListInstalled)return;
    window.__advocateDeskCourtListInstalled=true;
    const originalOpenModal=window.openModal;
    window.openModal=function(type,index){
      const result=originalOpenModal.apply(this,arguments);
      if(type!=="case")return result;
      const input=document.getElementById("f4");
      if(!input || input.tagName.toLowerCase()==="select")return result;
      const label=input.closest("label");
      if(!label)return result;
      const current=input.value||"";
      const select=document.createElement("select");
      select.id="f4";
      select.setAttribute("aria-label","Court");
      const placeholder=document.createElement("option");
      placeholder.value="";
      placeholder.textContent="-- Select Court --";
      select.appendChild(placeholder);
      COURTS.forEach(function(court){
        const option=document.createElement("option");
        option.value=court;
        option.textContent=court;
        if(court===current)option.selected=true;
        select.appendChild(option);
      });
      if(current && !COURTS.includes(current)){
        const custom=document.createElement("option");
        custom.value=current;
        custom.textContent=current+" (saved value)";
        custom.selected=true;
        select.insertBefore(custom,select.children[1]);
      }
      label.replaceChild(select,input);
      return result;
    };
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
  else install();
  setTimeout(install,0);
})();
