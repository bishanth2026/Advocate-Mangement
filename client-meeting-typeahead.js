(function(){
  'use strict';
  function enhance(){
    var modal=document.getElementById('modal');
    if(!modal || modal.classList.contains('hidden')) return;
    var heading=(modal.querySelector('#modalTitle')||{}).textContent||'';
    if(!/meeting/i.test(heading) && !/schedule/i.test(modal.textContent||'')) return;
    modal.querySelectorAll('select').forEach(function(select){
      if(select.dataset.clientTypeahead==='1') return;
      var options=Array.from(select.options||[]).filter(function(o){return o.value && o.textContent.trim();});
      if(options.length<1) return;
      var names=options.map(function(o){return o.textContent.trim();});
      var likely=/client|party|contact/i.test((select.name||'')+' '+(select.id||'')+' '+(select.previousElementSibling||{}).textContent);
      if(!likely && !names.some(function(n){return /rahman|fathima|traders|shameer/i.test(n);})) return;
      select.dataset.clientTypeahead='1';
      var input=document.createElement('input');
      input.type='text'; input.className=select.className||''; input.placeholder='Type client name...';
      input.setAttribute('list','client-meeting-options');
      input.autocomplete='off';
      input.value=select.options[select.selectedIndex] ? select.options[select.selectedIndex].textContent.trim() : '';
      var list=document.getElementById('client-meeting-options')||document.createElement('datalist');
      list.id='client-meeting-options';
      if(!list.parentNode) document.body.appendChild(list);
      list.innerHTML=options.map(function(o){return '<option value="'+String(o.textContent.trim()).replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'"></option>';}).join('');
      input.addEventListener('input',function(){
        var value=input.value.trim().toLowerCase();
        var match=options.find(function(o){return o.textContent.trim().toLowerCase()===value;}) || options.find(function(o){return o.textContent.trim().toLowerCase().indexOf(value)===0;});
        if(match) select.value=match.value;
        else if(!value) select.value='';
      });
      select.style.display='none';
      select.parentNode.insertBefore(input,select);
    });
  }
  var observer=new MutationObserver(enhance);
  observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',function(){setTimeout(enhance,0);});
  setTimeout(enhance,100);
})();
