(function(){
  'use strict';
  function enhance(){
    var modal=document.getElementById('modal');
    if(!modal || modal.classList.contains('hidden')) return;
    var heading=(modal.querySelector('#modalTitle')||{}).textContent||'';
    if(!/hearing/i.test(heading)) return;
    var data=JSON.parse(localStorage.getItem('advocateDeskData')||'null')||{};
    var cases=Array.isArray(data.cases)?data.cases:[];
    if(!cases.length) return;
    var selects=Array.from(modal.querySelectorAll('select'));
    var select=selects.find(function(s){
      var ctx=((s.name||'')+' '+(s.id||'')+' '+((s.previousElementSibling||{}).textContent||'')).toLowerCase();
      return /case|number/.test(ctx) || Array.from(s.options||[]).some(function(o){return cases.some(function(c){return o.textContent.trim()===c.number;});});
    });
    if(!select || select.dataset.hearingTypeahead==='1') return;
    select.dataset.hearingTypeahead='1';
    var options=cases.filter(function(c){return c.number;});
    var wrap=document.createElement('div'); wrap.style.cssText='position:relative;width:100%';
    var input=document.createElement('input'); input.type='text'; input.className=select.className||''; input.placeholder='Type case number...'; input.autocomplete='off';
    var menu=document.createElement('div'); menu.style.cssText='position:absolute;left:0;right:0;top:100%;z-index:9999;background:#fff;border:1px solid #d1d5db;border-radius:8px;max-height:240px;overflow:auto;display:none;box-shadow:0 8px 20px rgba(0,0,0,.12)';
    function fillRelated(c){
      var fields=Array.from(modal.querySelectorAll('input,textarea,select')).filter(function(el){return el!==select&&el!==input;});
      fields.forEach(function(el){
        var ctx=((el.name||'')+' '+(el.id||'')+' '+((el.previousElementSibling||{}).textContent||'')).toLowerCase();
        var val=null;
        if(/title|case name|matter/.test(ctx)) val=c.title;
        else if(/client|party|petitioner|respondent/.test(ctx)) val=c.client;
        else if(/court/.test(ctx)) val=c.court;
        else if(/type|category/.test(ctx)) val=c.type;
        if(val!=null && !el.value){el.value=val;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}
      });
    }
    function render(){
      var q=input.value.trim().toLowerCase(); menu.innerHTML='';
      options.filter(function(c){return !q||c.number.toLowerCase().includes(q)||String(c.title||'').toLowerCase().includes(q);}).forEach(function(c){
        var item=document.createElement('button'); item.type='button'; item.textContent=c.number+' — '+(c.title||''); item.style.cssText='display:block;width:100%;text-align:left;padding:10px 12px;border:0;background:#fff;cursor:pointer';
        item.addEventListener('click',function(){input.value=c.number;select.value=c.id;menu.style.display='none';fillRelated(c);}); menu.appendChild(item);
      }); menu.style.display=menu.children.length?'block':'none';
    }
    input.addEventListener('focus',render); input.addEventListener('input',function(){select.value='';render();});
    document.addEventListener('click',function(e){if(!wrap.contains(e.target))menu.style.display='none';});
    wrap.appendChild(input);wrap.appendChild(menu);select.style.display='none';select.parentNode.insertBefore(wrap,select);
  }
  new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true}); setTimeout(enhance,100);
})();
