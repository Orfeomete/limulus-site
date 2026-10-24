/* Archived UE5 colour views; no flight or model state. */
(function () {
  'use strict';
  var image=document.getElementById('hero-ue5-image');
  if(!image)return;
  var selected='V1';
  var views={
    V1:{src:'assets/v74-ue5-inci-hud.jpg',tr:['V1 · İnci beyazı','İnci beyazı V74 aracının kayıtlı UE5 heliport görünümü'],en:['V1 · Pearl white','Recorded UE5 heliport view of the pearl-white V74']},
    V2:{src:'assets/v74-ue5-turuncu-hud.jpg',tr:['V2 · Pastel turuncu','Pastel turuncu V74 aracının kayıtlı UE5 dış kamera görünümü'],en:['V2 · Pastel orange','Recorded UE5 external-camera view of the pastel-orange V74']},
    V3:{src:'assets/v74-ue5-adacayi-hud.jpg',tr:['V3 · Adaçayı yeşili','Adaçayı V74 görünümü; arşiv videoda V4 etiketiyle gösterilmiştir'],en:['V3 · Sage green','Sage V74 view, labelled V4 in the archive video']},
    V4:{src:'assets/v74-ue5-mercan-hud.jpg',tr:['V4 · Pastel mercan','Pastel mercan V74 aracının kayıtlı UE5 heliport görünümü'],en:['V4 · Pastel coral','Recorded UE5 heliport view of the pastel-coral V74']}
  };
  var buttons=Array.from(document.querySelectorAll('[data-gallery-vehicle]'));
  function render(){
    var en=window.LANG==='en';var view=views[selected];var copy=en?view.en:view.tr;
    if(image.getAttribute('src')!==view.src)image.setAttribute('src',view.src);
    image.alt=copy[1];
    document.getElementById('hero-frame-title').textContent=copy[0];
    document.getElementById('hero-frame-note').textContent=selected==='V3'?(en?'Archive-video frame; the original V4 label is retained.':'Arşiv video karesi; dönemin V4 etiketi korunmuştur.'):(en?'Archived UE5 frame; information boxes are a presentation layer.':'Arşiv UE5 karesi · bilgi kutuları sunum katmanıdır.');
    document.querySelector('.fleet-palette').setAttribute('aria-label',en?'V74 colour views':'V74 renk görünümü');
    buttons.forEach(function(b){var key=b.dataset.galleryVehicle;b.setAttribute('aria-pressed',String(key===selected));b.setAttribute('aria-label',en?views[key].en[0]:views[key].tr[0]);});
  }
  buttons.forEach(function(b){b.addEventListener('click',function(){selected=b.dataset.galleryVehicle;render();});});
  document.addEventListener('langchange',render);
  render();
}());
