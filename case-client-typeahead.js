(function(){
  'use strict';

  // Searchable multi-select for the Create/Edit Case "Clients / Parties" field.
  // The original <select id="f2" multiple> remains in the DOM (hidden) and is
  // kept synchronized, so the existing addRecord/update logic is unchanged.
  var STYLE_ID='case-client-typeahead-style';
  var ROOT_CLASS='case-client-typeahead';

  function installStyles(){
    if(document.getElementById(STYLE_ID)) return;
    var s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=''
      +'.'+ROOT_CLASS+'{position:relative;width:100%;font-size:16px}'
      +'.'+ROOT_CLASS+' .cct-control{min-height:112px;box-sizing:border-box;border:1px solid #cfd8e6;border-radius:10px;background:#fff;padding:8px 10px;cursor:text;transition:border-color .15s,box-shadow .15s}'
      +'.'+ROOT_CLASS+' .cct-control:focus-within{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.10)}'
      +'.'+ROOT_CLASS+' .cct-input{width:100%;box-sizing:border-box;border:0;outline:0;background:transparent;padding:3px 2px 8px;font:inherit;color:#172033}'
      +'.'+ROOT_CLASS+' .cct-input::placeholder{color:#7b8799}'
      +'.'+ROOT_CLASS+' .cct-selected{display:flex;flex-wrap:wrap;gap:6px;max-height:62px;overflow:auto}'
      +'.'+ROOT_CLASS+' .cct-chip{display:inline-flex;align-items:center;gap:6px;padding:5px 8px;border-radius:7px;background:#eef4ff;color:#173b8f;border:1px solid #d8e4ff;font-size:13px;line-height:1.2}'
      +'.'+ROOT_CLASS+' .cct-chip button{border:0;background:transparent;color:#52627a;cursor:pointer;font-size:16px;line-height:1;padding:0 0 0 2px}'
      +'.'+ROOT_CLASS+' .cct-options{position:absolute;z-index:10020;left:0;right:0;top:calc(100% + 5px);max-height:220px;overflow:auto;background:#fff;border:1px solid #d7dfeb;border-radius:10px;box-shadow:0 12px 30px rgba(20,35,60,.16);padding:5px;display:none}'
      +'.'+ROOT_CLASS+' .cct-options.open{display:block}'
      +'.'+ROOT_CLASS+' .cct-option{display:block;width:100%;text-align:left;border:0;background:#fff;padding:10px 11px;border-radius:7px;cursor:pointer;color:#172033;font:inherit}'
      +'.'+ROOT_CLASS+' .cct-option:hover,.'+ROOT_CLASS+' .cct-option.active{background:#eef4ff}'
      +'.'+ROOT_CLASS+' .cct-option.is-selected{font-weight:600;color:#173b8f}'
      +'.'+ROOT_CLASS+' .cct-option small{display:block;color:#6b7890;font-size:12px;margin-top:2px}'
      +'.'+ROOT_CLASS+' .cct-empty{padding:10px 11px;color:#718096;font-size:13px}'
      +'.'+ROOT_CLASS+' .cct-hint{margin-top:5px;color:#718096;font-size:12px}'
      +'.'+ROOT_CLASS+' + .muted{display:none}';
    document.head.appendChild(s);
  }

  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]});
  }

  function enhanceSelect(select){
    if(!select || select.tagName!=='SELECT' || !select.multiple || select.id!=='f2') return;
    if(select.dataset.cctEnhanced==='1') return;

    var field=select.closest('.field');
    if(!field) return;
    var label=field.querySelector('label');
    if(!label || !/clients?\s*\/\s*parties/i.test(label.textContent||'')) return;

    installStyles();
    select.dataset.cctEnhanced='1';
    select.style.display='none';

    var root=document.createElement('div');
    root.className=ROOT_CLASS;
    root.innerHTML='<div class="cct-control" tabindex="-1">'
      +'<input class="cct-input" type="text" autocomplete="off" placeholder="Type client / party name...">'
      +'<div class="cct-selected"></div>'
      +'</div>'
      +'<div class="cct-options" role="listbox" aria-multiselectable="true"></div>'
      +'<div class="cct-hint">Type to search and select one or more clients / parties.</div>';
    select.insertAdjacentElement('afterend',root);

    var input=root.querySelector('.cct-input');
    var selectedBox=root.querySelector('.cct-selected');
    var optionsBox=root.querySelector('.cct-options');
    var activeIndex=-1;

    function options(){
      return Array.prototype.filter.call(select.options,function(o){return o.value;});
    }
    function selectedValues(){
      return options().filter(function(o){return o.selected}).map(function(o){return o.value});
    }
    function renderSelected(){
      var selected=options().filter(function(o){return o.selected});
      selectedBox.innerHTML=selected.map(function(o){
        return '<span class="cct-chip" data-value="'+esc(o.value)+'"><span>'+esc(o.textContent.trim())+'</span><button type="button" aria-label="Remove '+esc(o.textContent.trim())+'" data-remove="'+esc(o.value)+'">×</button></span>';
      }).join('');
    }
    function renderOptions(query){
      var q=String(query||'').trim().toLowerCase();
      var list=options().filter(function(o){return !q || o.textContent.toLowerCase().indexOf(q)!==-1});
      activeIndex=-1;
      optionsBox.innerHTML=list.length?list.map(function(o,i){
        var sel=o.selected?' is-selected':'';
        return '<button type="button" class="cct-option'+sel+'" data-value="'+esc(o.value)+'" data-index="'+i+'" role="option" aria-selected="'+(o.selected?'true':'false')+'">'+esc(o.textContent.trim())+(o.selected?' ✓':'')+'</button>';
      }).join(''):'<div class="cct-empty">No matching client / party found.</div>';
      optionsBox.classList.add('open');
    }
    function sync(){
      select.dispatchEvent(new Event('change',{bubbles:true}));
      renderSelected();
      renderOptions(input.value);
    }
    function choose(value){
      var opt=options().find(function(o){return String(o.value)===String(value)});
      if(!opt) return;
      opt.selected=!opt.selected;
      sync();
      input.value='';
      input.focus();
    }

    input.addEventListener('focus',function(){renderOptions(input.value)});
    input.addEventListener('input',function(){renderOptions(input.value)});
    input.addEventListener('keydown',function(e){
      var list=optionsBox.querySelectorAll('.cct-option');
      if(e.key==='ArrowDown' && list.length){e.preventDefault();activeIndex=Math.min(activeIndex+1,list.length-1);list.forEach(function(x){x.classList.remove('active')});list[activeIndex].classList.add('active');list[activeIndex].scrollIntoView({block:'nearest'});}
      else if(e.key==='ArrowUp' && list.length){e.preventDefault();activeIndex=Math.max(activeIndex-1,0);list.forEach(function(x){x.classList.remove('active')});list[activeIndex].classList.add('active');list[activeIndex].scrollIntoView({block:'nearest'});}
      else if(e.key==='Enter' && activeIndex>=0 && list[activeIndex]){e.preventDefault();choose(list[activeIndex].dataset.value);}
      else if(e.key==='Escape'){optionsBox.classList.remove('open');}
      else if(e.key==='Backspace' && !input.value){var vals=selectedValues();if(vals.length){var last=vals[vals.length-1];var opt=options().find(function(o){return o.value===last});if(opt){opt.selected=false;renderSelected();renderOptions('');input.focus();}}}
    });
    optionsBox.addEventListener('mousedown',function(e){
      var btn=e.target.closest('.cct-option');
      if(btn){e.preventDefault();choose(btn.dataset.value);}
    });
    selectedBox.addEventListener('click',function(e){
      var btn=e.target.closest('[data-remove]');
      if(!btn)return;
      e.preventDefault();
      var opt=options().find(function(o){return o.value===btn.dataset.remove});
      if(opt){opt.selected=false;select.dispatchEvent(new Event('change',{bubbles:true}));renderSelected();renderOptions(input.value);input.focus();}
    });
    root.querySelector('.cct-control').addEventListener('click',function(e){if(e.target!==input)input.focus()});

    document.addEventListener('mousedown',function(e){
      if(!root.contains(e.target)) optionsBox.classList.remove('open');
    });

    // If the edit-case form preselected clients, show them immediately.
    renderSelected();
  }

  function scan(){
    var modal=document.getElementById('modal');
    if(!modal) return;
    var select=modal.querySelector('select#f2[multiple]');
    if(select) enhanceSelect(select);
  }

  if(window.MutationObserver){
    new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('button');
    if(b && /create new case|edit case|new case/i.test(document.getElementById('modalTitle')?.textContent||'')) setTimeout(scan,20);
  },true);
  setTimeout(scan,0);
})();
