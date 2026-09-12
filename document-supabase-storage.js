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
  async function remove(path){if(!ready())throw new Error('Cloud session is not ready.');if(!path)return;var r=await window.ADsupabase.storage.from(BUCKET).remove([path]);if(r.error)throw r.error;}
  window.ADDocumentCloud={upload:upload,signedUrl:signedUrl,remove:remove,bucket:BUCKET};
})();
