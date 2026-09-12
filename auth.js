(function(){
  'use strict';
  window.ADAuth={
    get:function(){try{return JSON.parse(localStorage.getItem('advocateDeskAuth')||'null')}catch(e){return null}},
    set:function(role,name,email){localStorage.setItem('advocateDeskAuth',JSON.stringify({role:role,name:name,email:email,loginAt:new Date().toISOString()}))},
    logout:async function(){
      try{if(window.ADsupabase)await window.ADsupabase.auth.signOut()}catch(e){console.warn('Supabase signout failed',e)}
      localStorage.removeItem('advocateDeskAuth');localStorage.removeItem('advocateDeskCurrentOrganization');window.location.href='login.html'
    },
    require:function(){
      var a=this.get();
      if(!a){window.location.replace('login.html');return null}
      // localStorage is display state only. When Supabase is available, validate the
      // real cloud session in the background so copied/forged browser state is rejected.
      if(window.ADsupabase&&window.ADsupabase.auth&&window.ADsupabase.auth.getSession){
        window.ADsupabase.auth.getSession().then(function(result){
          var session=result&&result.data&&result.data.session;
          if(!session||!session.user){
            localStorage.removeItem('advocateDeskAuth');
            localStorage.removeItem('advocateDeskCurrentOrganization');
            window.location.replace('login.html');
          }
        }).catch(function(){
          localStorage.removeItem('advocateDeskAuth');
          localStorage.removeItem('advocateDeskCurrentOrganization');
          window.location.replace('login.html');
        });
      }
      return a;
    }
  };

  function installLogoutMenu(){
    var chip=document.querySelector('.user-chip');
    if(!chip||chip.getAttribute('data-logout-menu-ready')==='1')return;
    chip.setAttribute('data-logout-menu-ready','1');chip.type='button';chip.setAttribute('aria-haspopup','menu');chip.setAttribute('aria-expanded','false');
    var wrap=chip.parentElement;if(!wrap)return;wrap.style.position='relative';
    var menu=document.createElement('div');menu.id='accountMenu';menu.setAttribute('role','menu');menu.style.cssText='position:absolute;right:0;top:calc(100% + 8px);min-width:190px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 12px 30px rgba(15,23,42,.14);padding:6px;z-index:2000;display:none;';
    menu.innerHTML='<button type="button" role="menuitem" data-account-logout style="display:flex;align-items:center;width:100%;border:0;background:transparent;padding:11px 12px;border-radius:7px;cursor:pointer;text-align:left;font:inherit;color:#111827;">🚪 <span style="margin-left:9px;font-weight:600;">Logout</span></button>';wrap.appendChild(menu);
    function close(){menu.style.display='none';chip.setAttribute('aria-expanded','false')}
    function toggle(e){if(e){e.preventDefault();e.stopPropagation()}var open=menu.style.display==='block';if(open)close();else{menu.style.display='block';chip.setAttribute('aria-expanded','true')}}
    chip.addEventListener('click',toggle);chip.addEventListener('touchend',function(e){e.preventDefault();toggle(e)},{passive:false});menu.querySelector('[data-account-logout]').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();window.ADAuth.logout()});document.addEventListener('click',function(e){if(!wrap.contains(e.target))close()});document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installLogoutMenu,{once:true});else installLogoutMenu();

  // Keep the legacy local session in sync with the cloud Auth session. Page authorization
  // is enforced by Supabase Auth + RLS; localStorage is display state only.
  function syncCloudSession(){
    if(!window.ADsupabase)return;
    window.ADsupabase.auth.onAuthStateChange(function(_event,session){
      if(!session){localStorage.removeItem('advocateDeskAuth');localStorage.removeItem('advocateDeskCurrentOrganization')}
    });
  }
  function start(){syncCloudSession()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

(function(){
  function load(){
    if(document.querySelector('script[data-super-admin-control]'))return;
    var s=document.createElement('script');s.src='super-admin-control.js?v=20260908-4';s.async=false;s.setAttribute('data-super-admin-control','1');document.head.appendChild(s);
    var q=document.createElement('script');q.src='super-admin-settings.js?v=20260908-1';q.async=false;q.setAttribute('data-super-admin-settings','1');document.head.appendChild(q);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
