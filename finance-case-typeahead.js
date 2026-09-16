(function(){
  'use strict';
  var mounted=new WeakMap();
  var active=null;
  function read(){try{return JSON.parse(localStorage.getItem('advocateDeskData')||'{}')||{};}catch(e){return {};}}
  function str(v){return v==null?'':String(v).trim();}
  function low(v){return str(v).toLowerCase();}
  function num(c){return str(c.number||c.caseNumber||c.case_no||c.caseNo||c.case_number||c.id);}
  function title(c){return str(c.title||c.caseTitle||c.name||c.case_name);}
  function label(c){return [num(c),title(c)].filter(Boolean).join(' — ')||num(c);}
  function list(){var a=read().cases;return Array.isArray(a)?a:[];}
  function invoiceModal(){var m=document.getElementById('modal');if(!m||m.classList.contains('hidden'))return null;var t=document.getElementById('modalTitle');return t&&/invoice|finance|payment/i.test(t.textContent||'')?m:null;}
  function fieldByLabel(m){
    var labels=[].slice.call(m.querySelectorAll('label'));
    for(var i=0;i<labels.length;i++){
      var txt=low(labels[i].textContent);
      if(txt!=='case'&&!/^case\s*[:*]?$/i.test(txt))continue;
      var id=labels[i].htmlFor||labels[i].getAttribute('for');
      if(id){var el=document.getElementById(id);if(el)return el;}
      var p=labels[i].parentElement;
      var el=p&&p.querySelector('select,input:not([type="hidden"]),textarea');
      if(el)return el;
    }
    return null;
  }
  function findField(m){
    var f=fieldByLabel(m);if(f)return f;
    var fields=[].slice.call(m.querySelectorAll('select,input:not([type="hidden"]),textarea'));
    var candidates=fields.filter(function(x){return !/date|fee|charge|amount|status|client/i.test((x.name||'')+' '+(x.id||'')+' '+(x.placeholder||'')+' '+(x.className||''));});
    return candidates.length?candidates[0]:null;
  }
  function mount(){
    var m=invoiceModal();if(!m)return;
    var field=findField(m);if(!field||mounted.has(field))return;
    var parent=field.parentElement;if(!parent)return;
    var wrap=document.createElement('div');wrap.className='finance-case-autocomplete';wrap.style.cssText='position:relative;width:100%;';
    parent.insertBefore(wrap,field);wrap.appendChild(field);
    var select=field.tagName.toLowerCase()==='select';
    var input=select?document.createElement('input'):field;
    if(select){field.style.display='none';input.type='text';input.className=field.className||'';input.placeholder='Type case number...';input.autocomplete='off';input.style.cssText='width:100%;box-sizing:border-box;';wrap.appendChild(input);}else{input.autocomplete='off';input.placeholder=input.placeholder||'Type case number...';}
    var menu=document.createElement('div');menu.className='finance-case-results';menu.setAttribute('role','listbox');menu.style.cssText='position:fixed;display:none;z-index:2147483647;background:#fff;color:#111827;border:1px solid #cbd5e1;border-radius:8px;max-height:240px;overflow:auto;box-shadow:0 8px 24px rgba(0,0,0,.18);';document.body.appendChild(menu);
    var item={field:field,input:input,wrap:wrap,menu:menu,select:select};mounted.set(field,item);
    function position(){var r=input.getBoundingClientRect();menu.style.left=Math.max(4,r.left)+'px';menu.style.top=(r.bottom+2)+'px';menu.style.width=r.width+'px';}
    function close(){menu.style.display='none';if(active===item)active=null;}
    function choose(c){var n=num(c);input.value=select?label(c):n;if(select){var opts=[].slice.call(field.options||[]);var opt=opts.find(function(o){return low(o.textContent)===low(label(c))||low(o.textContent).indexOf(low(n))===0||low(o.value)===low(c.id);});field.value=opt?opt.value:n;field.dispatchEvent(new Event('change',{bubbles:true}));}else{input.dispatchEvent(new Event('change',{bubbles:true}));}close();}
    function render(){var q=low(input.value);menu.innerHTML='';list().filter(function(c){var s=low(num(c)+' '+title(c)+' '+label(c));return !q||s.indexOf(q)!==-1;}).slice(0,100).forEach(function(c){var b=document.createElement('button');b.type='button';b.textContent=label(c);b.setAttribute('role','option');b.style.cssText='display:block;width:100%;padding:10px 12px;text-align:left;border:0;background:#fff;color:#111827;font:inherit;cursor:pointer;';b.addEventListener('mousedown',function(e){e.preventDefault();choose(c);});b.addEventListener('click',function(e){e.preventDefault();choose(c);});menu.appendChild(b);});position();menu.style.display=menu.children.length?'block':'none';active=item;}
    ['focus','click','input','keyup'].forEach(function(ev){input.addEventListener(ev,render);});
    window.addEventListener('resize',function(){if(active===item&&menu.style.display!=='none')position();});
    if(select&&field.selectedIndex>=0){var s=field.options[field.selectedIndex];if(s&&s.value)input.value=s.textContent||s.value;}
  }
  document.addEventListener('mousedown',function(e){if(active&&!active.wrap.contains(e.target)&&!active.menu.contains(e.target))closeActive();},true);
  function closeActive(){if(active){active.menu.style.display='none';active=null;}}
  function init(){if(!document.body)return;new MutationObserver(mount).observe(document.body,{childList:true,subtree:true});mount();setTimeout(mount,100);setTimeout(mount,500);setTimeout(mount,1200);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();