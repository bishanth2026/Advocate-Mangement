/* Direct Supabase persistence for New/Edit Hearing forms. */
(function(){
  'use strict';
  var active=false;
  function ready(){return !!(window.ADCloudCRUD&&window.ADCloudCRUD.ready&&window.ADCloudCRUD.ready());}
  function modal(){return document.querySelector('.modal');}
  function isHearingModal(m){var h=m&&m.querySelector('h1,h2,h3,.modal-title,.modal-header strong');var t=((h&&h.textContent)||'').replace(/\s+/g,' ').toLowerCase();return t.indexOf('hearing')>=0;}
  function field(m,label){var ls=m.querySelectorAll('label');for(var i=0;i<ls.length;i++){if((ls[i].textContent||'').trim().toLowerCase().indexOf(label.toLowerCase())===0)return ls[i].querySelector('input,textarea,select');}return null;}
  function val(m,label){var e=field(m,label);return e?String(e.value||'').trim():'';}
  function payload(m){return {hearing_date:val(m,'Hearing Date')||val(m,'Date')||null,purpose:val(m,'Purpose')||val(m,'Stage'),court_room:val(m,'Court Room')||val(m,'Court'),status:val(m,'Status')||'Scheduled',notes:[val(m,'Hearing Time')?'Time: '+val(m,'Hearing Time'):'',val(m,'Notes')].filter(Boolean).join('\n')};}
  function id(m){var e=m.querySelector('[data-hearing-id]');return e&&e.dataset.hearingId||null;}
  async function save(m){var p=payload(m);if(!p.hearing_date){alert('Please enter the hearing date.');return true;}try{if(id(m))await ADCloudCRUD.update('hearings',id(m),p);else await ADCloudCRUD.insert('hearings',p);alert('Hearing saved securely to Supabase.');location.reload();}catch(e){alert('Could not save hearing: '+(e.message||e));}return true;}
  function boot(){if(active)return;active=true;document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button'),m=modal();if(!b||!m||!isHearingModal(m)||!ready())return;if((b.textContent||'').trim().toLowerCase()==='save'){e.preventDefault();e.stopImmediatePropagation();save(m);}},true);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
