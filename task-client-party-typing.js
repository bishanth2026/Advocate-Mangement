(function(){
  'use strict';
  function labelText(el){
    var p=el.parentElement; return ((p&&p.innerText)||'').toLowerCase();
  }
  function enhance(){
    var modal=document.getElementById('modal');
    if(!modal||modal.classList.contains('hidden')) return;
    var title=(document.getElementById('modalTitle')||{}).textContent||'';
    if(!/task/i.test(title)) return;
    modal.querySelectorAll('select').forEach(function(sel){
      if(sel.dataset.clientTyping==='1') return;
      var text=labelText(sel);
      var nearby=(sel.closest('.field,.form-group,.form-row,.form-control,div')||sel.parentElement);
      text+=' '+(((nearby&&nearby.innerText)||'').toLowerCase());
      if(!/(client|party|client\/party)/i.test(text)) return;
      var options=Array.from(sel.options).filter(function(o){return o.value;});
      if(!options.length) return;
      sel.dataset.clientTyping='1';
      var input=document.createElement('input');
      input.type='text'; input.className='client-party-typeahead';
      input.placeholder='Type to select client / party...';
      input.setAttribute('list','client-party-options-'+Date.now());
      input.autocomplete='off';
      input.value=sel.options[sel.selectedIndex]&&sel.options[sel.selectedIndex].value?sel.options[sel.selectedIndex].text:'';
      var list=document.createElement('datalist'); list.id=input.getAttribute('list');
      options.forEach(function(o){var op=document.createElement('option');op.value=o.text;list.appendChild(op);});
      sel.style.display='none';
      sel.parentNode.insertBefore(input,sel);
      sel.parentNode.insertBefore(list,sel);
      input.addEventListener('input',function(){
        var q=input.value.trim().toLowerCase();
        var match=options.find(function(o){return o.text.toLowerCase()===q;})||options.find(function(o){return o.text.toLowerCase().indexOf(q)===0;});
        if(match){sel.value=match.value;sel.dispatchEvent(new Event('change',{bubbles:true}));}
      });
      input.addEventListener('change',function(){
        var match=options.find(function(o){return o.text.toLowerCase()===input.value.trim().toLowerCase();});
        if(match){sel.value=match.value;sel.dispatchEvent(new Event('change',{bubbles:true}));input.value=match.text;}
      });
    });
  }
  var observer=new MutationObserver(enhance);
  observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',function(){setTimeout(enhance,30);setTimeout(enhance,200);},true);
  setTimeout(enhance,300);
})();
