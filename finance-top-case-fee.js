(function(){
  function addTopCaseFee(){
    var content=document.getElementById('content');
    if(!content)return;
    var headings=content.querySelectorAll('h1,h2,h3');
    var finance=false;
    for(var i=0;i<headings.length;i++){if((headings[i].innerText||'').trim().toLowerCase()==='finance'){finance=true;break}}
    if(!finance)return;
    if(content.querySelector('[data-top-add-case-fee]'))return;
    var buttons=content.querySelectorAll('button');
    var addTx=null;
    for(var j=0;j<buttons.length;j++){
      var t=(buttons[j].innerText||buttons[j].textContent||'').trim().toLowerCase();
      if(t.indexOf('add transaction')!==-1){addTx=buttons[j];break}
    }
    if(!addTx)return;
    var b=document.createElement('button');
    b.type='button';
    b.className=addTx.className;
    b.setAttribute('data-top-add-case-fee','1');
    b.textContent='＋ Add Case Fee';
    b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();if(typeof window.p1FeeSetup==='function')window.p1FeeSetup();});
    var parent=addTx.parentElement;
    if(parent){parent.insertBefore(b,addTx);if(getComputedStyle(parent).display==='flex')b.style.marginRight='8px';}
  }
  function boot(){
    var content=document.getElementById('content');
    if(!content)return;
    var observer=new MutationObserver(function(){addTopCaseFee()});
    observer.observe(content,{childList:true,subtree:true});
    addTopCaseFee();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
