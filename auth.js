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
      if(window.ADsupabase&&window.ADsupabase.auth&&window.ADsupabase.auth.getSession){
        window.ADsupabase.auth.getSession().then(function(result){
          var session=result&&result.data&&result.data.session;
          if(!session||!session.user){
            localStorage.removeItem('advocateDeskAuth');
            localStorage.removeItem('advocateDeskCurrentOrganization');
            window.location.replace('login.html');
          }else{
            updateIdentity(session.user,a);
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

  function updateIdentity(user,stored){
    var name=(stored&&stored.name)||user.user_metadata&&user.user_metadata.full_name||user.email||'Account';
    var email=user.email||stored&&stored.email||'';
    var initial=(name.trim().charAt(0)||'A').toUpperCase();
    document.querySelectorAll('.profile-mini strong').forEach(function(node){node.textContent=name});
    document.querySelectorAll('.profile-mini small').forEach(function(node){node.textContent=email||'Authorized workspace'});
    document.querySelectorAll('.user-chip').forEach(function(node){
      var spans=node.querySelectorAll('span');
      if(spans.length)spans[0].textContent=name;
      node.setAttribute('aria-label','Account menu for '+name);
      var text=node.firstChild;
      if(text&&text.nodeType===3)text.nodeValue=initial+' ';
    });
    document.querySelectorAll('.avatar').forEach(function(node){node.textContent=initial});
  }

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
  function start(){
    installLogoutMenu();
    var stored=window.ADAuth.get();
    if(stored&&window.ADsupabase&&window.ADsupabase.auth&&window.ADsupabase.auth.getUser){
      window.ADsupabase.auth.getUser().then(function(result){if(result&&result.data&&result.data.user)updateIdentity(result.data.user,stored)}).catch(function(){});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  function syncCloudSession(){
    if(!window.ADsupabase)return;
    window.ADsupabase.auth.onAuthStateChange(function(_event,session){
      if(!session){localStorage.removeItem('advocateDeskAuth');localStorage.removeItem('advocateDeskCurrentOrganization')}
    });
  }
  syncCloudSession();
})();

(function(){
  function load(){
    if(document.querySelector('script[data-super-admin-control]'))return;
    var s=document.createElement('script');s.src='super-admin-control.js?v=20260908-4';s.async=false;s.setAttribute('data-super-admin-control','1');document.head.appendChild(s);
    var q=document.createElement('script');q.src='super-admin-settings.js?v=20260908-1';q.async=false;q.setAttribute('data-super-admin-settings','1');document.head.appendChild(q);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
