/* Archived UE5 views and visible-component descriptions; no simulation. */
(function(){
 'use strict';
 var image=document.getElementById('v74-view-image');if(!image)return;
 var selected='perspective',component='rotor';
 var views={perspective:['Perspektif','Perspective'],top:['Üstten','Top'],side:['Yandan','Side'],front:['Önden','Front']};
 var parts={
 rotor:{tr:['Kanallı rotor','Dört kanallı modülün her birinde iki eş eksenli rotor düzlemi bulunur. Bu arşiv görüntüleri beş pallı tasarımı gösterir.'],en:['Ducted rotor','Each of the four ducted modules contains two coaxial rotor planes. These archive images show the five-blade design.']},
 cockpit:{tr:['Kokpit','Tek koltuklu kabin, pilotun gövde içindeki yerleşimini gösterir. Araştırma modelinde pilot yükü 90 kg olarak alınır.'],en:['Cockpit','The single-seat cabin shows the pilot position within the fuselage. The research model uses a 90 kg pilot load.']},
 wing:{tr:['Kanat','Kanat yüzeyleri ve dört flaperon paneli, ileri uçuş için öngörülen taşıma ve kumanda düzeninin parçalarıdır.'],en:['Wing','The wing surfaces and four flaperon panels form part of the planned lift and control arrangement for forward flight.']},
 gear:{tr:['İniş takımı','Dört tekerlekli düzenin gövde içine katlanması öngörülür. Bu UE5 tasarım görüntülerinde iniş takımı açık gösterilir.'],en:['Landing gear','The four-wheel arrangement is intended to retract into the fuselage. These UE5 design images show the gear extended.']},
 tail:{tr:['V kuyruk','50° V kuyrukta iki ruddervator kumanda yüzeyi yer alır.'],en:['V-tail','The 50° V-tail carries two ruddervator control surfaces.']}
 };
 var points={perspective:{rotor:[50,62],cockpit:[56,51],wing:[39,54],gear:[67,74],tail:[39,32]},top:{rotor:[72,33],cockpit:[50,36],wing:[70,58],tail:[50,79]},side:{rotor:[71,51],cockpit:[70,43],gear:[47,67],tail:[17,38]},front:{rotor:[73,49],cockpit:[49,42],wing:[61,47],gear:[49,72],tail:[39,34]}};
 var keys=Object.keys(parts),markers=document.getElementById('component-markers');
 keys.forEach(function(key,i){var b=document.createElement('button');b.type='button';b.className='component-pin';b.dataset.pin=key;b.setAttribute('aria-controls','component-detail');b.innerHTML='<span aria-hidden="true">'+String(i+1).padStart(2,'0')+'</span>';b.addEventListener('click',function(){component=key;renderParts();});markers.appendChild(b);});
 function place(){
  if(!image.naturalWidth||!image.naturalHeight)return;
  var stage=document.querySelector('.view-stage'),w=stage.clientWidth,h=stage.clientHeight,scale=Math.min(w/image.naturalWidth,h/image.naturalHeight),pw=image.naturalWidth*scale,ph=image.naturalHeight*scale;
  markers.style.width=pw+'px';markers.style.height=ph+'px';markers.style.left=(w-pw)/2+'px';markers.style.top=(h-ph)/2+'px';
 }
 function renderParts(){
  var en=window.LANG==='en',copy=parts[component][en?'en':'tr'];
  document.getElementById('component-title').textContent=copy[0];document.getElementById('component-copy').textContent=copy[1];
  document.getElementById('component-visibility').textContent=points[selected][component]?'':(en?'This component is not visible in the selected view. Try another angle.':'Bu bileşen seçili görünüşte görülmüyor. Başka bir bakış açısı seçebilirsiniz.');
  document.querySelector('.component-list').setAttribute('aria-label',en?'Component selection':'Bileşen seçimi');markers.setAttribute('aria-label',en?'Components in view':'Görseldeki bileşenler');
  document.querySelectorAll('[data-component]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.component===component));});
  markers.querySelectorAll('[data-pin]').forEach(function(b){var key=b.dataset.pin,p=points[selected][key];b.hidden=!p;b.setAttribute('aria-label',parts[key][en?'en':'tr'][0]);b.setAttribute('aria-pressed',String(key===component));if(p){b.style.left=p[0]+'%';b.style.top=p[1]+'%';}});place();
 }
 function render(){
  var en=window.LANG==='en',label=views[selected][en?1:0],src='../assets/v74-view-'+selected+'.png';if(image.getAttribute('src')!==src)image.src=src;
  image.alt=en?'V74 '+label.toLowerCase()+' view, recorded UE5 image':'V74 '+label.toLocaleLowerCase('tr')+' görünüşü, kayıtlı UE5 görüntüsü';
  document.getElementById('v74-view-label').textContent=label;document.getElementById('v74-view-full').href=image.src;
  document.querySelector('.view-selector').setAttribute('aria-label',en?'View selection':'Görünüş seçimi');
  document.querySelectorAll('[data-view]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.view===selected));});renderParts();
 }
 document.querySelectorAll('[data-view]').forEach(function(b){b.addEventListener('click',function(){selected=b.dataset.view;render();});});
 document.querySelectorAll('[data-component]').forEach(function(b){b.addEventListener('click',function(){component=b.dataset.component;renderParts();});});
 image.addEventListener('load',place);if(window.ResizeObserver)new ResizeObserver(place).observe(document.querySelector('.view-stage'));else window.addEventListener('resize',place);
 document.addEventListener('langchange',render);render();
}());
