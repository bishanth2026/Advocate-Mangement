(function(){
  'use strict';

  function readData(){
    try { return JSON.parse(localStorage.getItem('advocateDeskData') || '{}') || {}; }
    catch(e){ return {}; }
  }
  function esc(v){
    return String(v == null ? '' : v)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function norm(v){ return String(v == null ? '' : v).trim().toLowerCase(); }

  function getClient(c, data){
    var clients = Array.isArray(data.clients) ? data.clients : [];
    var ids = Array.isArray(c.clientIds) ? c.clientIds : (c.clientId ? [c.clientId] : []);
    var linked = clients.find(function(x){ return ids.indexOf(x.id) !== -1; });
    return linked || null;
  }

  function fillCase(modal, c){
    if(!c) return;
    var data = readData();
    var client = getClient(c, data);
    var title = modal.querySelector('#f4');
    var clientInput = modal.querySelector('#fClient');
    var court = modal.querySelector('#f5');
    var stage = modal.querySelector('#f6');

    if(title) title.value = c.title || '';
    if(clientInput) clientInput.value = client ? (client.name || '') : (c.client || '');
    if(court) court.value = c.court || '';
    if(stage) stage.value = c.stage || '';

    [title,clientInput,court,stage].forEach(function(el){
      if(el){
        el.dispatchEvent(new Event('input',{bubbles:true}));
        el.dispatchEvent(new Event('change',{bubbles:true}));
      }
    });

    var hidden = modal.querySelector('input[name="caseId"]');
    if(!hidden){
      hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = 'caseId';
      modal.querySelector('#modalBody').appendChild(hidden);
    }
    hidden.value = c.id || '';
    modal.dataset.hearingCaseId = c.id || '';
  }

  function enhance(){
    var modal = document.getElementById('modal');
    if(!modal || modal.classList.contains('hidden')) return;
    var heading = (modal.querySelector('#modalTitle') || {}).textContent || '';
    if(!/hearing/i.test(heading)) return;
    var existingWrap = modal.querySelector('.adv-hearing-case-typeahead');
    if(existingWrap) return;

    var data = readData();
    var cases = Array.isArray(data.cases) ? data.cases.filter(function(c){ return c && (c.id || c.number); }) : [];
    var select = modal.querySelector('#f3');
    if(!select || select.dataset.hearingTypeahead === '1') return;

    select.dataset.hearingTypeahead = '1';

    var wrap = document.createElement('div');
    wrap.className = 'adv-hearing-case-typeahead';
    wrap.style.cssText = 'position:relative;width:100%;z-index:20000;';

    var input = document.createElement('input');
    input.type = 'text';
    input.className = select.className || '';
    input.placeholder = 'Search case number, title, client or court';
    input.autocomplete = 'off';
    input.setAttribute('role','combobox');
    input.setAttribute('aria-expanded','false');
    input.setAttribute('aria-autocomplete','list');
    input.style.width = '100%';

    var menu = document.createElement('div');
    menu.className = 'adv-hearing-case-menu';
    menu.style.cssText = 'display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);z-index:30000;background:#fff;border:1px solid #d1d5db;border-radius:10px;max-height:260px;overflow:auto;box-shadow:0 12px 30px rgba(0,0,0,.18);';

    wrap.appendChild(input);
    wrap.appendChild(menu);
    select.parentNode.insertBefore(wrap, select);
    select.style.display = 'none';

    function optionText(c){ return (c.number || c.id || '') + ' — ' + (c.title || 'Untitled case'); }

    function render(){
      var q = norm(input.value);
      var filtered = cases.filter(function(c){
        return !q || [c.number,c.title,c.client,c.court,c.stage,c.id].some(function(v){ return norm(v).indexOf(q) !== -1; });
      });
      if(!filtered.length){
        menu.innerHTML = '<div style="padding:12px;color:#64748b">No cases found</div>';
      } else {
        menu.innerHTML = filtered.map(function(c){
          var client = getClient(c,data);
          var clientName = client ? client.name : (c.client || '');
          return '<button type="button" class="adv-hearing-case-option" data-case-id="' + esc(c.id || c.number) + '" style="display:block;width:100%;text-align:left;padding:11px 12px;border:0;border-bottom:1px solid #eef2f7;background:#fff;color:#172033;cursor:pointer;">' +
            '<strong style="display:block;font-size:14px;">' + esc(c.number || c.id || '—') + '</strong>' +
            '<span style="display:block;font-size:13px;margin-top:2px;">' + esc(c.title || 'Untitled case') + '</span>' +
            '<small style="display:block;color:#64748b;margin-top:3px;">' + esc([clientName,c.court].filter(Boolean).join(' • ') || 'Details unavailable') + '</small>' +
            '</button>';
        }).join('');
      }
      menu.style.display = 'block';
      input.setAttribute('aria-expanded','true');
    }

    function close(){
      menu.style.display = 'none';
      input.setAttribute('aria-expanded','false');
    }

    function choose(id){
      var c = cases.find(function(x){ return String(x.id) === String(id) || String(x.number) === String(id); });
      if(!c) return;
      select.value = c.id || '';
      input.value = optionText(c);
      input.dataset.caseId = c.id || c.number || '';
      if(typeof window.syncHearingCase === 'function') {
        try { window.syncHearingCase(); } catch(e) {}
      }
      fillCase(modal,c);
      close();
    }

    input.addEventListener('focus', render);
    input.addEventListener('click', render);
    input.addEventListener('input', function(){ input.dataset.caseId = ''; select.value = ''; render(); });
    input.addEventListener('keydown', function(e){
      if(e.key === 'Escape') close();
      if(e.key === 'ArrowDown'){
        e.preventDefault();
        var first = menu.querySelector('.adv-hearing-case-option');
        if(first) first.focus();
      }
    });
    menu.addEventListener('click', function(e){
      var option = e.target.closest('.adv-hearing-case-option');
      if(option) choose(option.getAttribute('data-case-id'));
    });
    document.addEventListener('click', function(e){ if(!wrap.contains(e.target)) close(); }, true);

    var currentId = select.value;
    var current = cases.find(function(c){ return String(c.id) === String(currentId); });
    if(current){
      input.value = optionText(current);
      input.dataset.caseId = current.id || '';
      fillCase(modal,current);
    }
  }

  function installSaveLinks(){
    if(window.__advHearingLinksInstalled) return;
    if(typeof window.addRecord !== 'function' || typeof window.updateRecord !== 'function') return;
    window.__advHearingLinksInstalled = true;

    var originalAdd = window.addRecord;
    window.addRecord = function(type){
      if(type !== 'hearing') return originalAdd.apply(this, arguments);
      var modal = document.getElementById('modal');
      var select = modal && modal.querySelector('#f3');
      var caseId = select ? select.value : (modal && modal.dataset.hearingCaseId) || '';
      var result = originalAdd.apply(this, arguments);
      if(caseId){
        var d = readData();
        var hearings = Array.isArray(d.hearings) ? d.hearings : [];
        for(var i=hearings.length-1;i>=0;i--){
          if(String(hearings[i].caseId || '') === String(caseId)) break;
          var selected = Array.isArray(d.cases) ? d.cases.find(function(c){return String(c.id)===String(caseId);}) : null;
          if(selected && hearings[i].case === selected.number){ hearings[i].caseId = selected.id; hearings[i].caseNumber = selected.number; break; }
        }
        localStorage.setItem('advocateDeskData',JSON.stringify(d));
      }
      return result;
    };

    var originalUpdate = window.updateRecord;
    window.updateRecord = function(type,index){
      var modal = document.getElementById('modal');
      var select = modal && modal.querySelector('#f3');
      var caseId = select ? select.value : (modal && modal.dataset.hearingCaseId) || '';
      var result = originalUpdate.apply(this, arguments);
      if(type === 'hearing' && caseId){
        var d = readData();
        if(Array.isArray(d.hearings) && d.hearings[index]){
          d.hearings[index].caseId = caseId;
          var c = Array.isArray(d.cases) ? d.cases.find(function(x){return String(x.id)===String(caseId);}) : null;
          if(c) d.hearings[index].caseNumber = c.number;
          localStorage.setItem('advocateDeskData',JSON.stringify(d));
        }
      }
      return result;
    };
  }

  new MutationObserver(function(){ enhance(); installSaveLinks(); }).observe(document.body,{childList:true,subtree:true});
  setTimeout(function(){ enhance(); installSaveLinks(); },100);
  setInterval(function(){ enhance(); installSaveLinks(); },500);
})();