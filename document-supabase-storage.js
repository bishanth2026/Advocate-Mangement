/* Secure Supabase Storage bridge for the existing Documents screen. */
(function(){
  'use strict';
  var BUCKET='case-documents';
  function ready(){return !!(window.ADsupabase&&window.ADCloudCRUD&&window.ADCloudCRUD.ready&&window.ADCloudCRUD.ready());}
  function session(){return window.AD_ACTIVE_SESSION||{};}
  async function upload(file,meta){
    if(!ready())throw new Error('Cloud session is not ready.');
    if(!file)throw new Error('Choose a file.');
    if(file.size>10*1024*1024)throw new Error('Maximum file size is 10 MB.');
    var s=session(),path=s.organizationId+'/'+s.userId+'/'+Date.now()+'-'+String(file.name).replace(/[^a-zA-Z0-9._-]/g,'_');
    var up=await window.ADsupabase.storage.from(BUCKET).upload(path,file,{contentType:file.type||'application/octet-stream',upsert:false});
    if(up.error)throw up.error;
    var row=await window.ADCloudCRUD.insert('documents',{case_id:null,client_id:meta&&meta.clientId||null,file_name:file.name,storage_path:path,mime_type:file.type||null,file_size:file.size});
    return row;
  }
  async function signedUrl(path){if(!ready())throw new Error('Cloud session is not ready.');var r=await window.ADsupabase.storage.from(BUCKET).createSignedUrl(path,300);if(r.error)throw r.error;return r.data.signedUrl;}
  window.ADDocumentCloud={upload:upload,signedUrl:signedUrl,bucket:BUCKET};

  var originalSave=window.p1SaveDocument;
  var originalDownload=window.p1DownloadDocument;
  window.p1SaveDocument=async function(i){
    if(!window.P1){return originalSave&&originalSave(i);}
    var s=P1.state(),file=document.getElementById('p1dfile')?.files?.[0]||null,old=i==null?null:s.documents[i];
    var name=(document.getElementById('p1dn')?.value||'').trim();
    if(!name&&!file){alert('Enter a document name or choose a file.');return;}
    var c=s.clients.find(x=>String(x.id)===String(document.getElementById('p1dclient')?.value||''));
    var base={id:old?.id||'DOC-'+Date.now(),name:name||file?.name||old?.fileName||'Document',case:document.getElementById('p1dc')?.value||old?.case||'',clientId:c?.id||old?.clientId||'',clientName:c?.name||old?.clientName||'',description:(document.getElementById('p1ddesc')?.value||'').trim(),fileName:file?.name||old?.fileName||name,fileType:file?.type||old?.fileType||'',fileSize:file?.size||old?.fileSize||0,createdAt:old?.createdAt||new Date().toISOString(),dataUrl:old?.dataUrl||'',storagePath:old?.storagePath||''};
    try{
      if(file&&window.ADDocumentCloud&&ready()){
        var row=await window.ADDocumentCloud.upload(file,{clientId:base.clientId});
        base.storagePath=row.storage_path||'';base.cloudId=row.id||'';base.dataUrl='';
      }else if(file){
        if(file.size>2*1024*1024){alert('Cloud upload is not ready. Keep local files below 2 MB.');return;}
        var reader=new FileReader();reader.onload=function(){base.dataUrl=reader.result;if(i==null)s.documents.push(base);else s.documents[i]=base;P1.save(s);p1CloseModal();p1Documents();};reader.readAsDataURL(file);return;
      }
      if(i==null)s.documents.push(base);else s.documents[i]=base;
      P1.save(s);p1CloseModal();p1Documents();
    }catch(err){console.error(err);alert('Document upload failed: '+(err.message||err));}
  };
  window.p1DownloadDocument=async function(i){
    var d=P1.state().documents[i];
    if(d&&d.storagePath&&window.ADDocumentCloud){try{var url=await window.ADDocumentCloud.signedUrl(d.storagePath);window.open(url,'_blank','noopener');return;}catch(err){alert('Unable to open cloud document: '+(err.message||err));return;}}
    if(typeof originalDownload==='function')return originalDownload(i);
  };
})();
