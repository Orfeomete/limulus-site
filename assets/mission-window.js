(function(){
  'use strict';
  document.addEventListener('DOMContentLoaded',function(){
    var lang=new URLSearchParams(location.search).get('lang');
    if((lang==='tr'||lang==='en')&&typeof applyLang==='function')applyLang(lang);
    var button=document.getElementById('demo-browser-screen');
    function update(){if(!button)return;var active=Boolean(document.fullscreenElement),en=window.LANG==='en';document.title=en?'LIMULUS · Mission Workspace':'LIMULUS · Görev Alanı';button.textContent=active?(en?'Exit full screen':'Tam ekrandan çık'):(en?'⛶ Browser full screen':'⛶ Tarayıcı tam ekranı');button.setAttribute('aria-pressed',String(active));}
    if(button)button.addEventListener('click',function(){
      var request=document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen();
      if(request&&request.catch)request.catch(function(){var hint=document.getElementById('window-screen-hint');hint.hidden=false;hint.textContent=window.LANG==='en'?'This browser does not permit full-screen mode; the separate workspace remains open.':'Bu tarayıcı tam ekran kipine izin vermiyor; ayrı görev ekranı açık kalır.';});
    });
    document.addEventListener('fullscreenchange',update);document.addEventListener('langchange',update);update();
  });
}());
