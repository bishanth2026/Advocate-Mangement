(function(){
  'use strict';
  const esc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const criminalPrefixes=['CC','CP','ST','MC'];
  window.casesFixCaseTypeChanged=function(){
    const type=document.getElementById('partyCase')?.value;
    const field=document.getElementById('caseNumberField');
    if(!field)return;
    const number=document.getElementById('partyNumber')?.value||'';
    const oldPrefix=document.getElementById('partyPrefix')?.value||'CC';
    const prefix=criminalPrefixes.includes(oldPrefix)?oldPrefix:'CC';
    const clean=number.replace(/^(CC|CP|ST|MC|OS|OP)\s*/i,'');
    const isCivil=type==='Civil';
    const isCriminal=type==='Criminal';
    const choices=isCriminal?criminalPrefixes:['OS','OP'];
    field.innerHTML='<label>Case Number<div class="case-number-wrap">'+((isCivil||isCriminal)?'<select id="partyPrefix" aria-label="Case number prefix">'+choices.map(p=>'<option value="'+p+'"'+(p===prefix?' selected':'')+'>'+p+'</option>').join('')+'</select>':'<input id="partyPrefix" type="hidden" value="">')+'<input id="partyNumber" value="'+esc(clean)+'" placeholder="123/2026"></div><small class="field-help">'+(isCivil?'For Civil cases select OS or OP, then enter the number/year.':isCriminal?'For Criminal cases select CC, CP, ST or MC, then enter the number/year.':'Enter the case number, e.g. 123/2026.')+'</small></label>';
  };
  const oldSave=window.casesFixSave;
  window.casesFixSave=function(type,index){
    const caseType=document.getElementById('partyCase')?.value;
    if(caseType!=='Criminal'){return oldSave(type,index);}
    const name=document.getElementById('partyName')?.value.trim();
    if(!name){alert('Please enter the full name.');return;}
    const prefix=document.getElementById('partyPrefix')?.value||'CC';
    const raw=document.getElementById('partyNumber')?.value.trim()||'';
    const d=JSON.parse(localStorage.getItem('advocateDeskData')||'{}');
    d.caseParties=Array.isArray(d.caseParties)?d.caseParties:[];
    const filtered=d.caseParties.filter(x=>x.type===type);
    const old=index>=0?filtered[index]:null;
    const record={...(old||{}),type,name,caseType,casePrefix:prefix,caseNumber:(prefix+' '+raw).trim(),court:document.getElementById('partyCourt')?.value.trim()||'',phone:document.getElementById('partyPhone')?.value.trim()||'',email:document.getElementById('partyEmail')?.value.trim()||'',address:document.getElementById('partyAddress')?.value.trim()||'',details:document.getElementById('partyDetails')?.value.trim()||'',updatedAt:new Date().toISOString()};
    if(index>=0){const pos=d.caseParties.indexOf(old);if(pos>=0)d.caseParties[pos]=record;else d.caseParties.push(record);}else d.caseParties.push(record);
    localStorage.setItem('advocateDeskData',JSON.stringify(d));
    alert('Details saved successfully.');
    window.casesFixOpen(type);
  };
})();
