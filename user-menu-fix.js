(function(){
  'use strict';

  function closeMenu(){
    const menu=document.getElementById('profileMenu');
    const chip=document.querySelector('.user-chip');
    if(menu) menu.classList.remove('open');
    if(chip) chip.setAttribute('aria-expanded','false');
  }

  function openMenu(){
    const menu=document.getElementById('profileMenu');
    const chip=document.querySelector('.user-chip');
    if(!menu) return;
    menu.classList.toggle('open');
    if(chip) chip.setAttribute('aria-expanded',String(menu.classList.contains('open')));
  }

  function buildMenu(){
    const chip=document.querySelector('.user-chip');
    const topActions=document.querySelector('.top-actions');
    if(!chip||!topActions||document.getElementById('profileMenu')) return;

    chip.type='button';
    chip.setAttribute('aria-haspopup','menu');
    chip.setAttribute('aria-expanded','false');
    chip.title='Account menu';

    const menu=document.createElement('div');
    menu.id='profileMenu';
    menu.className='profile-menu';
    menu.setAttribute('role','menu');
    menu.innerHTML='<div class="profile-menu-head"><strong>Advocate Admin</strong><small>Office Administrator</small></div>'+
      ''+
      '<button type="button" class="profile-menu-item danger" data-profile-action="logout">↪ Logout</button>';
    topActions.appendChild(menu);

    chip.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      openMenu();
    });

    menu.addEventListener('click',function(e){
      const item=e.target.closest('[data-profile-action]');
      if(!item) return;
      const action=item.getAttribute('data-profile-action');
      if(action==='logout'){
        closeMenu();
        const confirmed=window.confirm('Are you sure you want to logout from AdvocateDesk?');
        if(confirmed && window.ADAuth && typeof window.ADAuth.logout==='function') window.ADAuth.logout();
      }else if(action==='profile'){
        closeMenu();
      }
    });

    document.addEventListener('click',function(e){
      if(!e.target.closest('#profileMenu')&&!e.target.closest('.user-chip')) closeMenu();
    });
    document.addEventListener('keydown',function(e){if(e.key==='Escape') closeMenu();});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',buildMenu); else buildMenu();
  setTimeout(buildMenu,100);
  setTimeout(buildMenu,500);
})();