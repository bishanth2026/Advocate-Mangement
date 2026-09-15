(function(){
  'use strict';
  function findFieldByLabel(root, text){
    var labels = root.querySelectorAll('label, .field-label, .form-label, .label');
    for(var i=0;i<labels.length;i++){
      if((labels[i].textContent||'').trim().toLowerCase()===text.toLowerCase()){
        return labels[i].closest('.field, .form-group, .form-field, .input-group') || labels[i].parentElement;
      }
    }
    return null;
  }
  function apply(){
    var modal=document.getElementById('modal');
    if(!modal || modal.classList.contains('hidden')) return;
    var title=document.getElementById('modalTitle');
    if(!title || (title.textContent||'').trim().toLowerCase()!=='create invoice') return;
    var body=document.getElementById('modalBody');
    if(!body || body.dataset.invoiceCaseFirst==='1') return;
    var client=findFieldByLabel(body,'Client');
    var caseField=findFieldByLabel(body,'Case');
    if(!client || !caseField) return;
    var items=Array.prototype.slice.call(body.children);
    var clientIndex=items.indexOf(client), caseIndex=items.indexOf(caseField);
    if(clientIndex<0 || caseIndex<0) return;
    if(caseIndex>clientIndex){
      body.insertBefore(caseField,client);
    }
    body.dataset.invoiceCaseFirst='1';
  }
  document.addEventListener('click',function(){setTimeout(apply,0);setTimeout(apply,80);},true);
  var modal=document.getElementById('modal');
  if(modal){new MutationObserver(function(){setTimeout(apply,0);}).observe(modal,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});}
})();
