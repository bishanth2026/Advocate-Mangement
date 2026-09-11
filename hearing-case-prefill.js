(function(){
  function prefillFromCase(){
    var select=document.getElementById('f3');
    if(!select)return;
    var cases=window.P1&&P1.state?P1.state().cases:null;
    if(!Array.isArray(cases))return;
    var c=cases.find(function(x){return String(x.number)===String(select.value)});
    if(!c)return;
    var date=document.getElementById('f1');
    var title=document.getElementById('f4');
    var client=document.getElementById('f5');
    var court=document.getElementById('f6');
    if(date&&c.next)date.value=c.next;
    if(title)title.value=c.title||'';
    if(client)client.value=c.client||'';
    if(court)court.value=c.court||'';
  }
  function hook(){
    var modal=document.getElementById('modal');
    if(!modal)return;
    var select=document.getElementById('f3');
    if(!select||select.getAttribute('data-case-prefill'))return;
    select.setAttribute('data-case-prefill','1');
    select.addEventListener('change',prefillFromCase);
    if(select.value)prefillFromCase();
  }
  var original=window.openModal;
  if(typeof original==='function'){
    window.openModal=function(type,index){
      var result=original.apply(this,arguments);
      if(type==='hearing')setTimeout(hook,0);
      return result;
    };
  }
})();
