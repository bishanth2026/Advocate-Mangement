(function(){
  function moveTypeAboveCaseNumber(){
    const modal=document.querySelector('.modal');
    if(!modal)return;
    const grid=modal.querySelector('.modal-body .form-grid');
    if(!grid)return;
    const typeField=document.getElementById('f6');
    const caseNumberField=document.getElementById('f1');
    if(!typeField||!caseNumberField)return;
    const typeLabel=typeField.closest('label');
    const caseNumberLabel=caseNumberField.closest('label');
    if(!typeLabel||!caseNumberLabel||typeLabel.parentElement!==grid||caseNumberLabel.parentElement!==grid)return;
    if(typeLabel!==grid.firstElementChild)grid.insertBefore(typeLabel,caseNumberLabel);
  }
  function boot(){
    moveTypeAboveCaseNumber();
    new MutationObserver(moveTypeAboveCaseNumber).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
