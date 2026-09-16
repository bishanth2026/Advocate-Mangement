(function(){
  'use strict';
  var mounted=new WeakMap();
  var active=null;
  function data(){try{return JSON.parse(localStorage.getItem('advocateDeskData')||'{}')||{};}catch(e){return {};}}
  function text(v){return v==null?'':String(v).trim();}
  function key(v){return text(v).toLowerCase();}
  function number(c){return text(c.number||c.caseNumber||c.case_no||c.caseNo||c.case_number||c.id);}
  function title(c){return text(c.title||c.caseTitle||c.name||c.case_name);}
  function label(c){return [number(c),title(c)].filter(Boolean).join(' — ')||number(c);}
  function cases(){return Array.isArray(data().cases)?data().cases:[];}
  function modal(){var m=document.getElementById('modal'),t=document.getElementById('modalTitle');return m&&!m.classList.contains('hidden')&&t&&/invoice|finance|payment/i.test(t.textContent||'')?m:null;}
  function findField(body){
    var labels=[].slice.call(body.querySelectorAll('label'));
    for(var i=0;i<labels.length;i++){
      if(!/^\s*case\s*$/i.test(labels[i].textContent||''))continue;
      var id=labels[i].htmlFor||labels[i].getAttribute('for');
      if(id){var el=document.getElementById(id);if(el)return el;}
      var p=labels[i].parentElement;
      var f=p&&p.querySelector('input:not([type=hidden]),select,textarea');
      if(f)return f;
    }
    var all=[].slice.call(body.querySelectorAll('input:not([type=hidden]),select,textarea'));
    return all.find(function(f){return /(^|[-_ ])case($|[-_ ])|case(number|id|no)/i.test((f.name||'')+' '+(f.id||'')+' '+(f.getAttribute('aria-label')||'')+' '+(f.placeholder||''));})||null;
  }
  function hide(item){if(item) item.menu.style.display='none';}
  function mount(){
    var m=modal();if(!m)return;
    var body=document.getElementById('modalBody');if(!body)return;
    var original=findField(body);if(!original||mounted.has(original))return;
    var parent=original.parentElement;if(!parent)return;
    var wrap=document.createElement('div');wrap.className='finance-case-autocomplete';wrap.style.cssText='position:relative;width:100%;';
    parent.insertBefore(wrap,original);wrap.appendChild(original);
    var isSelect=original.tagName.toLowerCase()==='select';
    var input=isSelect?document.createElement('input'):original;
    if(isSelect){original.style.display='none';input.type='text';input.className=original.className||'';input.placeholder='Type case number...';input.autocomplete='off';input.style.cssText='width:100%;box-sizing:border-box;';wrap.appendChild(input);}else{input.autocomplete='off';}
    var menu=document.createElement('div');menu.className='finance-case-results';menu.setAttribute('role','listbox');
    menu.style.cssText='position:fixed;display:none;z-index:2147483647;background:#fff;color:#111827;border:1px solid #cbd5e1;border-radius:8px;max-height:240px;overflow:auto;box-shadow:0 8px 24px rgba(0,0,0,.18);min-width:260px;';
    document.body.appendChild(menu);
    var item={original:original,input:input,menu:menu,wrap:wrap,isSelect:isSelect};mounted.set(original,item);
    function position(){var r=input.getBoundingClientRect();menu.style.left=Math.max(4,r.left)+'px';menu.style.top=(r.bottom+2)+'px';menu.style.width=r.width+'px';}
    function close(){menu.style.display='none';if(active===item)active=null;}
    function choose(c){
      var n=number(c);input.value=isSelect?label(c):n;
      if(isSelect){var opts=[].slice.call(original.options||[]);var opt=opts.find(function(o){return key(o.textContent)===key(label(c))||key(o.textContent).indexOf(key(n))===0||key(o.value)===key(c.id);});original.value=opt?opt.value:n;original.dispatchEvent(new Event('input',{bubbles:true}));original.dispatchEvent(new Event('change',{bubbles:true}));}
      else{input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));}
      close();
    }
    function render(){
      var q=key(input.value);menu.innerHTML='';
      cases().filter(function(c){var n=key(number(c)),t=key(title(c)),l=key(label(c));return !q||n.indexOf(q)>-1||t.indexOf(q)>-1||l.indexOf(q)>-1;}).slice(0,100).forEach(function(c){
        var b=document.createElement('button');b.type='button';b.textContent=label(c);b.setAttribute('role','option');b.style.cssText='display:block;width:100%;padding:10px 12px;text-align:left;border:0;background:#fff;color:#111827;font:inherit;cursor:pointer;';
        b.addEventListener('mousedown',function(e){e.preventDefault();choose(c);});b.addEventListener('click',function(e){e.preventDefault();choose(c);});menu.appendChild(b);
      });
      position();menu.style.display=menu.children.length?'block':'none';active=item;
    }
    ['focus','click','input','keyup'].forEach(function(ev){input.addEventListener(ev,render);});
    window.addEventListener('resize',function(){if(active===item&&menu.style.display!=='none')position();});
    if(isSelect&&original.selectedIndex>=0){var s=original.options[original.selectedIndex];if(s&&s.value)input.value=s.textContent||s.value;}
  }
  document.addEventListener('mousedown',function(e){if(active&&!active.wrap.contains(e.target)&&!active.menu.contains(e.target))hide(active);},true);
  function init(){if(!document.body)return;var o=new MutationObserver(mount);o.observe(document.body,{childList:true,subtree:true});mount();setInterval(mount,300);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();