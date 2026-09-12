/* Organization-scoped Supabase CRUD helpers. No service-role key is used. */
(function(){
  'use strict';
  var TABLES={organizations:1,profiles:1,memberships:1,clients:1,cases:1,hearings:1,documents:1,payments:1,audit_logs:1,workspace_data:1};
  function ready(){return !!(window.ADsupabase&&window.AD_ACTIVE_SESSION&&window.AD_ACTIVE_SESSION.organizationId)}
  function table(name){if(!TABLES[name])throw new Error('Unsupported table');return window.ADsupabase.from(name)}
  function scoped(row){var s=window.AD_ACTIVE_SESSION||{};return Object.assign({},row,{organization_id:s.organizationId})}
  async function list(name,options){
    if(!ready())throw new Error('Supabase session is not ready');
    options=options||{};var q=table(name).select(options.select||'*');
    if(name!=='organizations'&&name!=='profiles'&&name!=='memberships')q=q.eq('organization_id',window.AD_ACTIVE_SESSION.organizationId);
    if(options.order)q=q.order(options.order,{ascending:options.ascending!==false});
    if(options.limit)q=q.limit(options.limit);
    var r=await q;if(r.error)throw r.error;return r.data||[];
  }
  async function insert(name,row){
    if(!ready())throw new Error('Supabase session is not ready');
    var payload=scoped(row||{});if(!payload.created_by)payload.created_by=window.AD_ACTIVE_SESSION.userId;
    var r=await table(name).insert(payload).select().single();if(r.error)throw r.error;return r.data;
  }
  async function update(name,id,row){
    if(!ready())throw new Error('Supabase session is not ready');
    var r=await table(name).update(row||{}).eq('id',id).eq('organization_id',window.AD_ACTIVE_SESSION.organizationId).select().single();if(r.error)throw r.error;return r.data;
  }
  async function remove(name,id){
    if(!ready())throw new Error('Supabase session is not ready');
    var r=await table(name).delete().eq('id',id).eq('organization_id',window.AD_ACTIVE_SESSION.organizationId);if(r.error)throw r.error;return true;
  }
  window.ADCloudCRUD={list:list,insert:insert,update:update,remove:remove,ready:function(){return ready()}};
})();
