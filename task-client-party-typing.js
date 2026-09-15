(function(){'use strict';
var oldOpen=window.openModal,oldAdd=window.addRecord,chosenClient=null,chosenCase=null;
function data(){try{return JSON.parse(localStorage.getItem('advocateDeskData')||'null')||{}}catch(e){return{}}}
function clients(){var d=data();return Array.isArray(d.clients)?d.clients:[]}
function cases(){var d=data();return Array.isArray(d.cases)?d.cases:[]}
function caseNumber(c){return c.caseNumber||c.number||c.caseNo||c.case_number||c.id||''}
function caseLabel(c){return caseNumber(c)+(c.title||c.caseTitle?' — '+(c.title||c.caseTitle):'')}
function clientLabel(c){return c.name||c.clientName||c.title||c.id||''}
function makeField(after,label,idName,listName,placeholder,items,kind){
 var f=document.createElement('div');f.className='field';
 f.innerHTML='<label for="'+idName+'">'+label+'</label><input id="'+idName+'" type="text" list="'+listName+'" autocomplete="off" placeholder="'+placeholder+'"><datalist id="'+listName+'"></datalist>';
 var dl=f.querySelector('datalist');items.forEach(function(x){var o=document.createElement('option');o.value=kind==='case'?caseLabel(x):clientLabel(x);dl.appendChild(o)});
 after.insertAdjacentElement('afterend',f);var input=f.querySelector('input');
 function resolve(){var q=input.value.trim().toLowerCase();return items.find(function(x){var label=(kind==='case'?caseLabel(x):clientLabel(x)).toLowerCase();return label===q||String(kind==='case'?caseNumber(x):x.id||'').toLowerCase()===q||String(kind==='case'?(x.title||x.caseTitle||''):x.name||'').toLowerCase()===q})||null}
 input.addEventListener('input',function(){var x=resolve();if(kind==='client')chosenClient=x;else chosenCase=x});
 input.addEventListener('change',function(){var x=resolve();if(kind==='client')chosenClient=x;else chosenCase=x;if(x)input.value=kind==='case'?caseLabel(x):clientLabel(x)});
 return f;
}
function enhance(){
 var m=document.getElementById('modal'),t=document.getElementById('modalTitle');
 if(!m||!t||!/task/i.test(t.textContent||'')||document.getElementById('taskCaseTypeahead'))return;
 var fields=[].slice.call(m.querySelectorAll('.field'));
 var caseField=fields.find(function(f){var l=f.querySelector('label');return l&&/^case(\s*number)?$/i.test(l.textContent.trim())});
 if(!caseField)return;
 caseField.style.display='none';
 var cf=makeField(caseField,'Client / Party','taskClientTypeahead','taskClientOptions','Type client / party name...',clients(),'client');
 makeField(cf,'Case Number','taskCaseTypeahead','taskCaseOptions','Type case number or title...',cases(),'case');
}
window.openModal=function(type){var r=oldOpen.apply(this,arguments);if(type==='task')setTimeout(enhance,60);return r};
window.addRecord=function(type){
 if(type!=='task')return oldAdd.apply(this,arguments);
 var ci=document.getElementById('taskClientTypeahead'),ca=document.getElementById('taskCaseTypeahead');
 if(ci&&ci.value.trim()&&!chosenClient){alert('Please select a valid client / party from the dropdown.');return}
 if(ca&&ca.value.trim()&&!chosenCase){alert('Please select a valid case number from the dropdown.');return}
 var r=oldAdd.apply(this,arguments);
 try{var d=data();if(Array.isArray(d.tasks)&&d.tasks.length){var task=d.tasks[0];if(chosenClient){task.clientId=chosenClient.id||'';task.client=clientLabel(chosenClient);task.clientName=clientLabel(chosenClient)}if(chosenCase){task.caseId=chosenCase.id||chosenCase.caseId||caseNumber(chosenCase);task.caseNumber=caseNumber(chosenCase);task.caseTitle=chosenCase.title||chosenCase.caseTitle||''}localStorage.setItem('advocateDeskData',JSON.stringify(d))}}catch(e){}return r;
};
if(window.MutationObserver)new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true});
})();