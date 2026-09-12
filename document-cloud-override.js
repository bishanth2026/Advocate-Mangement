/* Cloud-first document save, download and delete bridge. */
(function(){
  'use strict';
  const originalDownload=window.p1DownloadDocument;
  const originalDocuments=window.p1Documents;
  const originalDelete=window.p1DeleteDocument;

  window.p1SaveDocument=async function(i){
    const s=P1.state();
    const file=document.getElementById('p1dfile')?.files?.[0]||null;
    const old=i==null?null:s.documents[i];
    const name=(document.getElementById('p1dn')?.value||'').trim();
    if(!name&&!file){alert('Enter a document name or choose a file.');return;}
    const c=s.clients.find(x=>String(x.id)===String(document.getElementById('p1dclient')?.value||''));
    const base={id:old?.id||'DOC-'+Date.now(),name:name||file?.name||old?.fileName||'Document',case:document.getElementById('p1dc')?.value||old?.case||'',clientId:c?.id||old?.clientId||'',clientName:c?.name||old?.clientName||'',description:(document.getElementById('p1ddesc')?.value||'').trim(),fileName:file?.name||old?.fileName||name,fileType:file?.type||old?.fileType||'',fileSize:file?.size||old?.fileSize||0,createdAt:old?.createdAt||new Date().toISOString(),dataUrl:old?.dataUrl||'',storagePath:old?.storagePath||'',cloudId:old?.cloudId||''};
    try{
      if(file&&window.ADDocumentCloud?.upload&&window.ADCloudCRUD?.ready?.()){
        const row=await window.ADDocumentCloud.upload(file,{caseId:null,clientId:null});
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

  window.p1Documents=function(){
    if(typeof originalDocuments==='function')originalDocuments();
    const docs=P1.state().documents||[];
    const rows=document.querySelectorAll('#content table tbody tr');
    docs.forEach((d,i)=>{
      const cell=rows[i]?.lastElementChild;
      if(cell&&d.storagePath&&!cell.querySelector('[data-cloud-download]')){
        const b=document.createElement('button');
        b.type='button';b.textContent='Download';b.setAttribute('data-cloud-download','1');
        b.onclick=()=>window.p1DownloadDocument(i);cell.prepend(b);
      }
    });
  };

  window.p1DeleteDocument=async function(i){
    const d=P1.state().documents[i];
    if(!confirm('Delete this document?'))return;
    try{
      if(d?.storagePath&&window.ADDocumentCloud?.remove)await window.ADDocumentCloud.remove(d.storagePath);
      if(d?.cloudId&&window.ADCloudCRUD?.remove)await window.ADCloudCRUD.remove('documents',d.cloudId);
    }catch(err){alert('Cloud delete failed: '+(err.message||err));return;}
    if(typeof originalDelete==='function)return originalDelete(i);
    const s=P1.state();s.documents.splice(i,1);P1.save(s);p1Documents();
  };
})();
