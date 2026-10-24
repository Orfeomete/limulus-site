/* Research method explanations; mission demo is isolated in mission-ui.js. */
(function () {
  'use strict';
  var selectedMethod = 'central';
  var methods = {
    central: { tr:['MERKEZİ REFERANS','Deneyim tek havuzda.','Dört aracın deneyimi bir araya getirilir ve merkezi PPO güncellemesinde kullanılır. Bu düzen, federe yöntemler için karşılaştırma referansıdır.','Merkezi PPO güncellemesi','Toplanan deneyim → ortak öğrenme havuzu'], en:['CENTRALISED REFERENCE','Experience in one pool.','Experience from all four aircraft is pooled for a centralised PPO update. This arrangement provides the reference for the federated methods.','Centralised PPO update','Collected experience → shared learning pool'] },
    federated: { tr:['FEDERE REFERANS','Yerel öğrenme, ortak politika.','Her mantıksal istemci kendi aracının deneyimiyle yerel PPO güncellemesi yapar. Yerel ağ ağırlıkları birleştirilir; merkezi bir ham deneyim havuzu kurulmaz.','Yerel PPO → standart birleştirme','Yerel deneyim → yerel güncellemeler → ağ ağırlıkları'], en:['FEDERATED REFERENCE','Local learning, shared policy.','Each logical client performs a local PPO update using its aircraft’s experience. Local network weights are aggregated without constructing a central raw-experience pool.','Local PPO → standard aggregation','Local experience → local updates → network weights'] },
    context: { tr:['H2 / ANA ARAŞTIRMA','Birleştirmede görev bağlamı.','Bağlam Dengeli FedPPO, yerel güncellemeleri görev erişilebilirliği, enerji yeterliliği ve gözlenebilir arıza bağlamıyla ilişkilendirir. Amaç, farklı deneyim dağılımlarının etkisini sınamaktır; yöntem üstünlüğü henüz kurulmuş bir sonuç değildir.','Yerel PPO → bağlam dengeli birleştirme','Ağ ağırlıkları + gözlenebilir görev bağlamı'], en:['H2 / PRIMARY RESEARCH','Mission context in aggregation.','Context-balanced FedPPO relates local updates to mission accessibility, energy sufficiency and observable failure context. It tests the effect of differing experience distributions; method superiority is not an established result.','Local PPO → context-balanced aggregation','Network weights + observable mission context'] }
  };
  function set(id, value) { var el=document.getElementById(id); if(el) el.textContent=value; }
  function language() { return window.LANG==='en'?'en':'tr'; }
  function renderMethod() {
    var copy=methods[selectedMethod][language()];
    set('method-kicker',copy[0]);set('method-title',copy[1]);set('method-description',copy[2]);set('learning-node',copy[3]);set('flow-caption',copy[4]);
    document.querySelectorAll('[data-method]').forEach(function(b){var active=b.dataset.method===selectedMethod;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
    document.getElementById('method-panel').setAttribute('aria-labelledby','tab-'+selectedMethod);
  }
  function render() {
    renderMethod();
    document.title=language()==='en'?"LIMULUS-eVTOL · Reinforcement learning for multi-aircraft flight missions":"LIMULUS-eVTOL · Çok araçlı uçuş görevlerinde pekiştirmeli öğrenme";
    set('airspace-title',language()==='en'?'Four aircraft and six heliports':'Dört araç ve altı heliport');
    set('airspace-desc',language()==='en'?'Browser-local illustrative 2D mission demo. No real flight, physics or PPO data.':'Tarayıcıda çalışan temsili 2B görev gösterimi. Gerçek uçuş, fizik veya PPO verisi içermez.');
    document.querySelector('.aircraft-switch').setAttribute('aria-label',language()==='en'?'Select aircraft':'Araç seçimi');
    document.querySelector('.method-tabs').setAttribute('aria-label',language()==='en'?'Learning methods':'Öğrenme yöntemleri');
  }
  var tabs=Array.from(document.querySelectorAll('[data-method]'));
  tabs.forEach(function(b,i){
    b.addEventListener('click',function(){selectedMethod=b.dataset.method;renderMethod();});
    b.addEventListener('keydown',function(e){
      var next=i;
      if(e.key==='ArrowRight')next=(i+1)%tabs.length;
      else if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;
      else if(e.key==='Home')next=0;
      else if(e.key==='End')next=tabs.length-1;
      else return;
      e.preventDefault();selectedMethod=tabs[next].dataset.method;renderMethod();tabs[next].focus();
    });
  });
  document.addEventListener('langchange',render);
  // Preserve existing bookmarks without retaining the removed manuscripts section.
  if(location.hash==='#makaleler') location.replace('#dogrulama');
  render();
}());
