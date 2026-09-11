(function(){
  function addStageDropdown(){
    var modal=document.getElementById('modal');
    if(!modal)return;
    var f7=document.getElementById('f7');
    if(!f7)return;
    if(f7.tagName==='SELECT')return;
    if((f7.closest('label')?.innerText||'').toLowerCase().indexOf('stage')<0)return;
    var current=f7.value||'';
    var select=document.createElement('select');
    select.id='f7';
    [
      ['','Select stage'],['Filing','Filing'],['Notice','Notice'],['Pleadings','Pleadings'],
      ['Evidence','Evidence'],['Cross Examination','Cross Examination'],['Arguments','Arguments'],
      ['Judgment','Judgment'],['Order','Order'],['Mediation','Mediation'],['Admission','Admission'],
      ['Hearing','Hearing'],['Other','Other']
    ].forEach(function(o){var opt=document.createElement('option');opt.value=o[0];opt.textContent=o[1];if(o[0]===current)opt.selected=true;select.appendChild(opt)});
    f7.replaceWith(select);
  }
  var observer=new MutationObserver(addStageDropdown);
  function start(){var b=document.body;if(!b)return;observer.observe(b,{childList:true,subtree:true});addStageDropdown()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
