(function(){
  'use strict';
  const criminalPrefixes=['CC','CP','ST','MC'];
  const civilPrefixes=['OS','OP'];
  const esc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#39;');
  function enhance(){
    const type=document.getElementById('partyCase');
    const field=document.getElementById('caseNumberField');
    if(!type||!field)return;
    const selected=type.value;
    const number=document.getElementById('partyNumber');
    const current=number?number.value:'';
    const existingPrefix=(document.getElementById('partyPrefix')||{}).value||'';
    const wanted=selected==='Civil'?civilPrefixes:selected==='Criminal'?criminalPrefixes:null;
    if(!wanted){
      if(!document.getElementById('partyNumber'))return;
      return;
    }
    const prefix=wanted.includes(existingPrefix)?existingPrefix:wanted[0];
    const clean=current.replace(/^(OS|OP|CC|CP|ST|MC)\s*/i,'');
    field.innerHTML='<label>Case Number<div class="case-number-wrap"><select id="partyPrefix" aria-label="Case number prefix">'+wanted.map(p=>'<option value="'+p+'"'+(p===prefix?' selected':'')+'>'+p+'</option>').join('')+'</select><input id="partyNumber" value="'+esc(clean)+'" placeholder="123/2026"></div><small class="field-help">Select the case number type, then enter the number/year.</small></label>';
  }
  const originalChanged=window.casesFixCaseTypeChanged;
  window.casesFixCaseTypeChanged=function(){
    if(typeof originalChanged==='function')originalChanged();
    enhance();
  };
  const originalSave=window.casesFixSave;
  window.casesFixSave=function(type,index){
    const caseType=document.getElementById('partyCase')&&document.getElementById('partyCase').value;
    const prefix=document.getElementById('partyPrefix')&&document.getElementById('partyPrefix').value;
    const number=document.getElementById('partyNumber')&&document.getElementById('partyNumber').value.trim();
    if((caseType==='Civil'||caseType==='Criminal')&&prefix&&number){
      const input=document.getElementById('partyNumber');
      const original=input.value;
      input.value=prefix+' '+number;
      try{return originalSave(type,index);}finally{input.value=original;}
    }
    return originalSave(type,index);
  };
  const observer=new MutationObserver(enhance);
  observer.observe(document.getElementById('content')||document.body,{childList:true,subtree:true});
  document.addEventListener('change',function(e){if(e.target&&e.target.id==='partyCase')enhance();});
  enhance();
})();
