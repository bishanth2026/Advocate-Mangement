(function(){
  function removeDashboardNewButton(){
    var dashboard=document.querySelector('.nav-item[data-page="dashboard"]');
    var active=dashboard && dashboard.classList.contains('active');
    if(!active)return;
    var title=document.querySelector('.page-title');
    if(!title)return;
    var heading=title.querySelector('h1');
    if(!heading || !/^Good morning\s*,/i.test(heading.textContent.trim()))return;
    var buttons=title.querySelectorAll('button');
    buttons.forEach(function(button){
      if(/new/i.test(button.textContent.trim()))button.remove();
    });
  }
  function schedule(){setTimeout(removeDashboardNewButton,0);setTimeout(removeDashboardNewButton,80);setTimeout(removeDashboardNewButton,250);}
  schedule();
  document.addEventListener('click',function(event){
    var nav=event.target.closest && event.target.closest('.nav-item[data-page="dashboard"]');
    if(nav)schedule();
  },true);
})();
