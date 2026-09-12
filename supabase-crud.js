/* Organization-scoped Supabase CRUD helpers. No service-role key is used. */
(function(){
  'use strict';
  var TABLES={organizations:1,profiles:1,memberships:1,clients:1,cases:1,hearings:1,documents:1,payments:1,audit_logs:1,workspace_data:1};
  var ORG_TABLES={clients:1,cases:1,hearings:1,documents:1,payments:1,audit_logs:1,workspace_data:1};
  function session(){return window.AD_ACTIVE_SESSION||null}
  function ready(){var s=session();return !!(window.ADsupabase&&s&&s.organizationId&&s.userId)}
  function table(name){if(!TABLES[name])throw new Error('Unsupported table');return window.ADsupabase.from(name)}
  function scoped(row,name){var s=session()||{};var payload=Object.assign({},row||{});if(ORG_TABLES[name])payload.organization_id=s.organizationId;if(ORG_TABLES[name]&&!payload.created_by)payload.created_by=s.userId;return payload}
  function scopeQuery(q,name){var s=session()||{};if(ORG_TABLES[name])q=q.eq('organization_id',s.organizationId);return q}
  async function list(name,options){
    if(!ready())throw new Error('Supabase session is not ready');
    options=options||{};var q=scopeQuery(table(name).select(options.select||'*'),name);
    if(name==='memberships')q=q.eq('user_id',session().userId).eq('is_active',true);
    if(options.order)q=q.order(options.order,{ascending:options.ascending!==false});
    if(options.limit)q=q.limit(options.limit);
    var r=await q;if(r.error)throw r.error;return r.data||[];
  }
  async function insert(name,row){
    if(!ready())throw new Error('Supabase session is not ready');
    var r=await table(name).insert(scoped(row,name)).select().single();if(r.error)throw r.error;return r.data;
  }
  async function update(name,id,row){
    if(!ready())throw new Error('Supabase session is not ready');
    var r=scopeQuery(table(name).update(row||{}).eq('id',id),name);var result=await r.select().single();if(result.error)throw result.error;return result.data;
  }
  async function remove(name,id){
    if(!ready())throw new Error('Supabase session is not ready');
    var r=scopeQuery(table(name).delete().eq('id',id),name);if((await r).error)throw (await r).error;return true;
  }
  window.ADCloudCRUD={list:list,insert:insert,update:update,remove:remove,ready:ready};
})();
