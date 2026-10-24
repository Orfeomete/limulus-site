/* Archived UE5 exterior/pilot views; no flight or model state. */
(function(){
 'use strict';
 var image=document.getElementById('hero-ue5-image');if(!image)return;
 var selected='V1',camera='external';
 var views={
 V1:{src:'assets/v74-ue5-inci-video15.jpg',pilot:'assets/v74-ue5-inci-video15.jpg',tr:'V1 · İnci beyazı',en:'V1 · Pearl white'},
 V2:{src:'assets/v74-ue5-turuncu-video15.jpg',pilot:'assets/v74-ue5-turuncu-video15.jpg',tr:'V2 · Pastel turuncu',en:'V2 · Pastel orange'},
 V3:{src:'assets/v74-ue5-adacayi-hud.jpg',pilot:'assets/v74-ue5-adacayi-hud.jpg',tr:'V3 · Adaçayı yeşili',en:'V3 · Sage green'},
 V4:{src:'assets/v74-ue5-mercan-hud.jpg',pilot:'assets/v74-pilot-mercan.png',tr:'V4 · Pastel mercan',en:'V4 · Pastel coral'}
 };
 function render(){
  var en=window.LANG==='en',v=views[selected],pilot=camera==='pilot',label=en?v.en:v.tr;
  var cameraLabel=pilot?(en?'Pilot view':'Pilot gözü'):(en?'External view':'Dış kamera');
  var src=pilot?v.pilot:v.src;if(image.getAttribute('src')!==src)image.src=src;
  image.classList.toggle('pilot-archive',pilot&&selected!=='V4');
  image.alt=label+' · '+cameraLabel+(selected==='V3'?(en?' · recorded as V4 in the archive':' · arşivde V4 olarak kayıtlı'):'');
  document.getElementById('hero-frame-title').textContent=label+' · '+cameraLabel;
  var note=pilot?(en?'Recorded UE5 pilot camera; not a live flight.':'Kayıtlı UE5 pilot kamerası · canlı uçuş değildir.'):(en?'Archived UE5 frame; information boxes are a presentation layer.':'Arşiv UE5 karesi · bilgi kutuları sunum katmanıdır.');
  if(selected==='V1'||selected==='V2')note=pilot?(en?'Pilot window from the same Limulus 15 frame; not a live flight.':'Limulus 15’in aynı karesindeki pilot penceresi · canlı uçuş değildir.'):(en?'Recorded Limulus 15 frame · imitation learning, not a PPO/FedPPO result.':'Limulus 15’ten kayıtlı kare · taklit öğrenmesi; PPO/FedPPO sonucu değildir.');
  if(selected==='V3')note=pilot?(en?'Pilot-window crop from the archive video; originally labelled V4.':'Arşiv videonun pilot penceresinden kesit; özgün araç etiketi V4’tür.'):(en?'Archive-video frame; the original V4 label is retained.':'Arşiv video karesi; dönemin V4 etiketi korunmuştur.');
  document.getElementById('hero-frame-note').textContent=note;
  document.querySelector('.fleet-palette').setAttribute('aria-label',en?'V74 colour views':'V74 renk görünümü');
  document.querySelector('.hero-camera-switch').setAttribute('aria-label',en?'Camera selection':'Kamera seçimi');
  document.querySelectorAll('[data-gallery-vehicle]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.galleryVehicle===selected));b.setAttribute('aria-label',en?views[b.dataset.galleryVehicle].en:views[b.dataset.galleryVehicle].tr);});
  document.querySelectorAll('[data-gallery-camera]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.galleryCamera===camera));});
 }
 document.querySelectorAll('[data-gallery-vehicle]').forEach(function(b){b.addEventListener('click',function(){selected=b.dataset.galleryVehicle;render();});});
 document.querySelectorAll('[data-gallery-camera]').forEach(function(b){b.addEventListener('click',function(){camera=b.dataset.galleryCamera;render();});});
 document.addEventListener('langchange',render);render();
}());
