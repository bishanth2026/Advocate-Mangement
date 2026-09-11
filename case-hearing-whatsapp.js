(function(){
  function normalize(phone){var d=String(phone||'').replace(/\D/g,'');if(d.indexOf('00')===0)d=d.slice(2);if(d.length===10&&/^[6-9]/.test(d))d='91'+d;return d}
  function data(){try{return JSON.parse(localStorage.getItem('advocateDeskData')||'null')||{}}catch(e){return {}}}
  function clientById(s,id){return (s.clients||[]).find(function(c){return String(c.id)===String(id)})||null}
  function value(id){var el=document.getElementById(id);return el?String(el.value||'').trim():''}
  function selectedClientIds(){var sel=document.getElementById('f3');if(!sel)return[];return Array.prototype.slice.call(sel.selectedOptions||[]).map(function(o){return o.value}).filter(Boolean)}
  function openWA(phone,message){var n=normalize(phone);if(!n){alert('No valid WhatsApp/mobile number is available for the selected client. Please update the client phone number.');return false}window.open('https://wa.me/'+n+'?text='+encodeURIComponent(message),'_blank','noopener,noreferrer');return true}
  function caseHandler(save){
    var s=data(),ids=selectedClientIds(),clients=ids.map(function(id){return clientById(s,id)}).filter(Boolean);
    var number=value('f1'),title=value('f2'),date=value('f5');
    if(!number||!title||!clients.length)return;
    var c=clients[0];
    var msg='Dear '+c.name+',\n\nThis is a case update from AdvocateDesk.\nCase: '+number+'\nCase Title: '+title+(date?'\nNext Hearing Date: '+date:'')+'\n\nPlease contact the advocate\'s office for further information.';
    save();
    setTimeout(function(){openWA(c.phone,msg)},80);
  }
  function hearingHandler(save){
    var s=data(),caseNo=value('f3'),date=value('f1'),time=value('f2'),court=value('f6'),stage=value('f7');
    var c=(s.cases||[]).find(function(x){return String(x.number)===String(caseNo)});
    if(!c||!date)return;
    var ids=Array.isArray(c.clientIds)&&c.clientIds.length?c.clientIds:[c.clientId];
    var client=clientById(s,ids[0]);
    if(!client){alert('No client is linked to this hearing.');return}
    var msg='Dear '+client.name+',\n\nThis is a hearing reminder from AdvocateDesk.\nCase: '+c.number+'\nCase Title: '+(c.title||'')+'\nHearing Date: '+date+(time?'\nHearing Time: '+time:'')+(court?'\nCourt: '+court:'')+(stage?'\nStage: '+stage:'')+'\n\nPlease contact the advocate\'s office for any further information.';
    save();
    setTimeout(function(){openWA(client.phone,msg)},80);
  }
  function enhance(){
    var modal=document.getElementById('modal');if(!modal||modal.classList.contains('hidden'))return;
    var heading=(modal.innerText||'').toLowerCase();
    var isCase=heading.indexOf('new case')>=0;
    var isHearing=heading.indexOf('new hearing')>=0;
    if(!isCase&&!isHearing)return;
    var buttons=Array.prototype.slice.call(modal.querySelectorAll('.form-actions button'));
    var save=buttons.find(function(b){var t=(b.innerText||b.textContent||'').trim().toLowerCase();return t==='save'||t==='save case'||t==='save hearing'});
    if(!save||save.dataset.saveWhatsappBound)return;
    save.dataset.saveWhatsappBound='1';
    save.textContent='Save & WhatsApp';
    save.className='secondary';
    save.onclick=null;
    save.addEventListener('click',function(e){
      e.preventDefault();e.stopImmediatePropagation();
      if(isCase)caseHandler(function(){if(window.saveCase)window.saveCase(null)});
      else hearingHandler(function(){if(window.saveHearing)window.saveHearing(null)});
    },true);
  }
  function start(){var o=new MutationObserver(enhance);o.observe(document.body,{childList:true,subtree:true});enhance()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();