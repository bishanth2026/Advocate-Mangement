(function(){
  'use strict';
  var mounted=new WeakSet();
  var menus=[];
  function getState(){try{return JSON.parse(localStorage.getItem('advocateDeskData')||'{}')||{};}catch(e){return {};}}
  function str(v){return String(v==null?'':v).trim();}
  function norm(v){return str(v).toLowerCase();}
  function caseNo(c){return str(c&&(c.number||c.caseNumber||c.case_no||c.caseNo||c.case_number||c.id));}
  function caseTitle(c){return str(c&&(c.title||c.caseTitle||c.name||c.case_name));}
  function caseLabel(c){return [caseNo(c),caseTitle(c)].filter(Boolean).join(' — ')||caseNo(c);}
  function invoiceOpen(){var modal=document.getElementById('modal'),title=document.getElementById('modalTitle');return !!(modal&&!modal.classList.contains('hidden')&&title&&/invoice|finance|payment/i.test(title.textContent||''));}
  function fieldLabel(field){
    var id=field.id;
    if(id){var linked=document.querySelector('label[for="'+CSS.escape(id)+'"]');if(linked)return str(linked.textContent);}
    var p=field.parentElement;
    for(var i=0;p&&i<4;i++,p=p.parentElement){
      var label=p.querySelector('label');
      if(label)return str(label.textContent);
    }
    return '';
  }
  function findCaseInput(body){
    var all=[].slice.call(body.querySelectorAll('input,select,textarea'));
    var named=all.find(function(f){return /case|case number|case no/i.test((f.name||'')+' '+(f.id||'')+' '+fieldLabel(f));});
    if(named)return named;
    var labels=[].slice.call(body.querySelectorAll('label'));
    for(var i=0;i<labels.length;i++){
      if(/\bcase\b/i.test(labels[i].textContent||'')){
        var parent=labels[i].parentElement;
        var found=parent&&parent.querySelector('input,select,textarea');
        if(found)return found;
      }
    }
    return null;
  }
  function closeMenu(menu){if(menu)menu.style.display='none';}
  function mount(){
    if(!invoiceOpen())return;
    var body=document.getElementById('modalBody');if(!body)return;
    var field=findCaseInput(body);if(!field||mounted.has(field))return;
    mounted.add(field);
    var host=field.parentElement;
    if(!host)return;
    if(getComputedStyle(host).position==='static')host.style.position='relative';
    var menu=document.createElement('div');
    menu.setAttribute('role','listbox');
    menu.style.cssText='position:absolute;left:0;right:0;top:100%;z-index:99999;background:#fff;border:1px solid #d1d5db;border-radius:8px;max-height:240px;overflow-y:auto;display:none;box-shadow:0 8px 20px rgba(0,0,0,.12);';
    host.appendChild(menu);menus.push(menu);
    function hide(){closeMenu(menu);}
    function choose(c){
      field.value=caseNo(c);
      field.dispatchEvent(new Event('input',{bubbles:true}));
      field.dispatchEvent(new Event('change',{bubbles:true}));
      hide();
    }
    function render(){
      var cases=getState().cases;
      if(!Array.isArray(cases))cases=[];
      var q=norm(field.value);
      menu.innerHTML='';
      cases.filter(function(c){var label=caseLabel(c);return !q||norm(label).indexOf(q)!==-1||norm(caseNo(c)).indexOf(q)!==-1;}).slice(0,100).forEach(function(c){
        var button=document.createElement('button');
        button.type='button';button.setAttribute('role','option');button.textContent=caseLabel(c);
        button.style.cssText='display:block;width:100%;text-align:left;padding:10px 12px;border:0;background:#fff;color:#111827;cursor:pointer;font:inherit;';
        button.addEventListener('mousedown',function(e){e.preventDefault();e.stopPropagation();choose(c);});
        button.addEventListener('touchstart',function(e){e.preventDefault();e.stopPropagation();choose(c);},{passive:false});
        menu.appendChild(button);
      });
      menu.style.display=menu.children.length?'block':'none';
    }
    field.addEventListener('focus',render);
    field.addEventListener('input',render);
    field.addEventListener('keyup',render);
    field.addEventListener('click',render);
    document.addEventListener('mousedown',function(e){if(!host.contains(e.target))hide();});
    document.addEventListener('touchstart',function(e){if(!host.contains(e.target))hide();},{passive:true});
  }
  var observer=new MutationObserver(function(){setTimeout(mount,30);});
  function init(){
    if(!document.body)return;
    observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
    setTimeout(mount,0);setTimeout(mount,100);setTimeout(mount,500);setTimeout(mount,1000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();