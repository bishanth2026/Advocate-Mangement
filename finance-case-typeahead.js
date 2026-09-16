(function(){
  'use strict';
  var mounted=new WeakSet();
  function readState(){try{return JSON.parse(localStorage.getItem('advocateDeskData')||'{}')||{};}catch(e){return {};}}
  function text(v){return String(v==null?'':v).trim();}
  function norm(v){return text(v).toLowerCase();}
  function caseNo(c){return text(c&&(c.number||c.caseNumber||c.caseNo||c.case_number||c.id));}
  function caseLabel(c){return [caseNo(c),text(c&&(c.title||c.caseTitle||c.name))].filter(Boolean).join(' — ')||caseNo(c);}
  function active(){var m=document.getElementById('modal'),t=document.getElementById('modalTitle');return !!(m&&!m.classList.contains('hidden')&&t&&/invoice|finance|payment/i.test(t.textContent||''));}
  function findCaseField(body){
    var labels=[].slice.call(body.querySelectorAll('label'));
    for(var i=0;i<labels.length;i++){
      if(/\bcase\b|case\s*(number|no)/i.test(labels[i].textContent||'')){
        var p=labels[i].parentElement, f=p&&p.querySelector('input,select,textarea');
        if(f)return f;
      }
    }
    var fields=[].slice.call(body.querySelectorAll('input,select,textarea'));
    return fields.find(function(f){return /case\s*(number|no)?/i.test((f.name||'')+' '+(f.id||'')+' '+((f.parentElement&&f.parentElement.textContent)||''));})||null;
  }
  function findClientField(body){
    var labels=[].slice.call(body.querySelectorAll('label'));
    for(var i=0;i<labels.length;i++){
      if(/^\s*client\s*:?\s*$/i.test(labels[i].textContent||'')){
        var p=labels[i].parentElement, f=p&&p.querySelector('select,input');
        if(f)return f;
      }
    }
    return null;
  }
  function mount(){
    if(!active())return;
    var body=document.getElementById('modalBody');if(!body)return;
    var field=findCaseField(body);if(!field||mounted.has(field))return;
    var cases=readState().cases;if(!Array.isArray(cases)||!cases.length)return;
    mounted.add(field);
    var original=field;
    var wrap=document.createElement('div');wrap.style.cssText='position:relative;width:100%;';
    original.parentNode.insertBefore(wrap,original);wrap.appendChild(original);
    var menu=document.createElement('div');
    menu.setAttribute('role','listbox');
    menu.style.cssText='position:absolute;left:0;right:0;top:100%;z-index:10000;background:#fff;border:1px solid #d1d5db;border-radius:8px;max-height:240px;overflow-y:auto;display:none;box-shadow:0 8px 20px rgba(0,0,0,.12);';
    function close(){menu.style.display='none';}
    function choose(c){
      original.value=caseNo(c);
      original.dispatchEvent(new Event('input',{bubbles:true}));
      original.dispatchEvent(new Event('change',{bubbles:true}));
      var client=findClientField(body), clients=readState().clients||[];
      if(client){
        var wanted=[c.clientId,c.client_id,c.client,c.party,c.clientName].filter(Boolean).map(norm);
        var related=clients.find(function(cl){return wanted.indexOf(norm(cl.id))>=0||wanted.indexOf(norm(cl.clientId))>=0||wanted.indexOf(norm(cl.name))>=0;});
        if(related){client.value=related.id||related.clientId||'';client.dispatchEvent(new Event('input',{bubbles:true}));client.dispatchEvent(new Event('change',{bubbles:true}));}
      }
      close();
    }
    function render(){
      var q=norm(original.value);menu.innerHTML='';
      cases.filter(function(c){return !q||norm(caseNo(c)).indexOf(q)!==-1||norm(caseLabel(c)).indexOf(q)!==-1;}).slice(0,100).forEach(function(c){
        var b=document.createElement('button');b.type='button';b.setAttribute('role','option');b.textContent=caseLabel(c);
        b.style.cssText='display:block;width:100%;text-align:left;padding:10px 12px;border:0;background:#fff;color:#111827;cursor:pointer;';
        b.addEventListener('mousedown',function(e){e.preventDefault();e.stopPropagation();choose(c);});
        b.addEventListener('touchstart',function(e){e.preventDefault();choose(c);},{passive:false});
        menu.appendChild(b);
      });
      menu.style.display=menu.children.length?'block':'none';
    }
    original.addEventListener('focus',render);
    original.addEventListener('input',render);
    original.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
    document.addEventListener('mousedown',function(e){if(!wrap.contains(e.target))close();});
    document.addEventListener('touchstart',function(e){if(!wrap.contains(e.target))close();},{passive:true});
    wrap.appendChild(menu);
  }
  var observer=new MutationObserver(function(){setTimeout(mount,50);});
  function init(){if(document.body)observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});setTimeout(mount,100);setTimeout(mount,500);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();