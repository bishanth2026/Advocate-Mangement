(function(){
  function addButton(){
    var content=document.getElementById('content');if(!content)return;
    var heads=content.querySelectorAll('h1,h2,h3,h4');
    for(var i=0;i<heads.length;i++){
      if((heads[i].innerText||'').trim().toLowerCase()!=='case fee details')continue;
      var panel=heads[i].closest('.panel');if(!panel)return;
      if(panel.querySelector('[data-add-case-fee]'))return;
      var head=panel.querySelector('.panel-head');if(!head)return;
      var box=head.lastElementChild;
      var btn=document.createElement('button');btn.type='button';btn.className='secondary';btn.setAttribute('data-add-case-fee','1');btn.textContent='＋ Add Case Fee';btn.style.marginLeft='8px';btn.onclick=function(){if(typeof window.p1FeeSetup==='function')window.p1FeeSetup(null);else alert('Add Case Fee is loading. Please try again.');};
      if(box)box.appendChild(btn);else head.appendChild(btn);
      return;
    }
  }
  function boot(){var c=document.getElementById('content');if(!c)return;var o=new MutationObserver(addButton);o.observe(c,{childList:true,subtree:true});addButton();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();