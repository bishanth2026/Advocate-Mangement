/* Cloud-first document save override. Keeps the existing Documents UI and removes data-URL storage for new uploads. */
(function(){
  'use strict';
  const originalDownload=window.p1DownloadDocument;
  window.p1SaveDocument=async function(i){
    const s=P1.state();
    const file=document.getElementById('p1dfile')?.files?.[0]||null;
    const old=i==null?null:s.documents[i];
    const name=(document.getElementById('p1dn')?.value||'').trim();
    if(!name&&!file){alert('Enter a document name or choose a file.');return;}
    const c=s.clients.find(x=>String(x.id)===String(document.getElementById('p1dclient')?.value||''));
    const base={id:old?.id||'DOC-'+Date.now(),name:name||file?.name||old?.fileName||'Document',case:document.getElementById('p1dc')?.value||old?.case||'',clientId:c?.id||old?.clientId||'',clientName:c?.name||old?.clientName||'',description:(document.getElementById('p1ddesc')?.value||'').trim(),fileName:file?.name||old?.fileName||name,fileType:file?.type||old?.fileType||'',fileSize:file?.size||old?.fileSize||0,createdAt:old?.createdAt||new Date().toISOString(),dataUrl:old?.dataUrl||'',storagePath:old?.storagePath||''};
    try{
      if(file&&window.ADDocumentCloud?.upload&&window.ADCloudCRUD?.ready?.()){
        const uuid=v=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v||''))?v:null;
        const row=await window.ADDocumentCloud.upload(file,{caseId:uuid(base.caseId),clientId:uuid(base.clientId)});
        base.storagePath=row.storage_path||'';base.cloudId=row.id||'';base.dataUrl='';
      }else if(file){
        if(file.size>2*1024*1024){alert('Cloud upload is not ready. Keep local files below 2 MB.');return;}
        const reader=new FileReader();reader.onload=()=>{base.dataUrl=reader.result;if(i==null)s.documents.push(base);else s.documents[i]=base;P1.save(s);p1CloseModal();p1Documents()};reader.readAsDataURL(file);return;
      }
      if(i==null)s.documents.push(base);else s.documents[i]=base;
      P1.save(s);p1CloseModal();p1Documents();
    }catch(err){console.error(err);alert('Document upload failed: '+(err.message||err));}
  };
  window.p1DownloadDocument=async function(i){
    const d=P1.state().documents[i];
    if(d?.storagePath&&window.ADDocumentCloud?.signedUrl){try{const url=await window.ADDocumentCloud.signedUrl(d.storagePath);window.open(url,'_blank','noopener');return;}catch(err){alert('Unable to open cloud document: '+(err.message||err));return;}}
    if(typeof originalDownload==='function')return originalDownload(i);
  };
})();
