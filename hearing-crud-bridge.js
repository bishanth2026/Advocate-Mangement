/* Hearing Save/Edit/Delete cloud bridge. */
(function(){
  'use strict';
  var KEY='advocateDeskData';
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return {};}}
  function modal(){return document.getElementById('modal');}
  function val(m,words){var els=m.querySelectorAll('input,select,textarea');for(var i=0;i<els.length;i++){var p=(els[i].parentElement?els[i].parentElement.innerText:'').toLowerCase();for(var j=0;j<words.length;j++)if(p.indexOf(words[j])>=0)return els[i];}return null;}
  function id(m){var e=m.querySelector('[data-hearing-id],input[name="hearing_id"],input[name="id"]');return e?(e.value||e.getAttribute('data-hearing-id')||''):'';}
  function rowFrom(m){var s=read(),a=Array.isArray(s.hearings)?s.hearings:[],rid=id(m);if(rid){var x=a.find(function(h){return String(h.id)===String(rid);});if(x)return x;}var d=val(m,['date']),t=val(m,['title','subject']);return a.slice().reverse().find(function(h){return (!d||!d.value||String(h.date)===String(d.value))&&(!t||!t.value||String(h.title||'').trim()===String(t.value||'').trim());})||a[a.length-1];}
  function sync(m){setTimeout(function(){var r=rowFrom(m);if(r&&window.ADHearingCloud&&window.ADHearingCloud.save)window.ADHearingCloud.save(r,r.id).catch(function(e){console.warn('[AdvocateDesk] hearing save failed',e.message);});},350);}
  function boot(){var m=modal();if(!m||m.dataset.hearingCrudBridge==='1')return;m.dataset.hearingCrudBridge='1';m.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button');if(!b)return;var t=(b.innerText||b.textContent||'').trim().toLowerCase();if(t==='save'||t.indexOf('save')===0)sync(m);if(t.indexOf('delete')>=0||t.indexOf('remove')>=0){var r=rowFrom(m);if(r&&r.id&&window.ADHearingCloud)window.ADHearingCloud.remove(r.id).catch(function(x){console.warn('[AdvocateDesk] hearing delete failed',x.message);});}},true);}
  new MutationObserver(boot).observe(document.body,{childList:true,subtree:true});boot();
})();
