(function(){
  window.ADAuth={
    get:function(){try{return JSON.parse(localStorage.getItem('advocateDeskAuth')||'null')}catch(e){return null}},
    set:function(role,name,email){localStorage.setItem('advocateDeskAuth',JSON.stringify({role:role,name:name,email:email,loginAt:new Date().toISOString()}))},
    logout:function(){localStorage.removeItem('advocateDeskAuth');window.location.href='login.html'},
    require:function(){var a=this.get();if(!a){window.location.replace('login.html');return null}return a}
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
})();

(function(){
  function load(){
    if(document.querySelector('script[data-super-admin-control]'))return;
    var s=document.createElement('script');s.src='super-admin-control.js?v=20260908-3';s.async=false;s.setAttribute('data-super-admin-control','1');document.head.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
