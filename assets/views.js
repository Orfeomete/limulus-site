/* Four archived UE5 frames; no simulation or model execution. */
(function () {
  'use strict';
  var image=document.getElementById('v74-view-image');
  if(!image)return;
  var selected='perspective';
  var views={perspective:['Perspektif','Perspective'],top:['Üstten','Top'],side:['Yandan','Side'],front:['Önden','Front']};
  function render(){
    var en=window.LANG==='en',label=views[selected][en?1:0];
    image.src='../assets/v74-view-'+selected+'.png';
    image.alt=en?'V74 '+label.toLowerCase()+' view, recorded UE5 image':'V74 '+label.toLocaleLowerCase('tr')+' görünüşü, kayıtlı UE5 görüntüsü';
    document.getElementById('v74-view-label').textContent=label;
    document.getElementById('v74-view-full').href=image.src;
    document.querySelector('.view-selector').setAttribute('aria-label',en?'View selection':'Görünüş seçimi');
    document.querySelectorAll('[data-view]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.view===selected));});
  }
  document.querySelectorAll('[data-view]').forEach(function(b){b.addEventListener('click',function(){selected=b.dataset.view;render();});});
  document.addEventListener('langchange',render);
  render();
}());
