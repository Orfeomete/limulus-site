/* Explanatory UI only: no model, simulation, telemetry or training connection. */
(function () {
  'use strict';
  var selectedVehicle = 'V1', selectedMethod = 'central';
  var vehicles = {
    V1: { tr:['İniş alanı paylaşımı','İnişe yaklaşan bir araç, hedef alanın erişilebilirliğini ve diğer araçların hareketini birlikte değerlendirmek zorunda.','Hedef alan · diğer araçlar','Uygun yaklaşma veya bekleme kararını öğrenmek'], en:['Sharing a landing site','An approaching aircraft must consider the accessibility of its target site alongside the movement of other aircraft.','Target site · other aircraft','Learn an appropriate approach or waiting decision'] },
    V2: { tr:['Enerji ve seçenekler','Görev ilerledikçe kalan enerji, hedefe devam etme ve yedek alana yönelme seçenekleri arasındaki ilişkiyi değiştirir.','Enerji rezervi · alan erişimi','Görev ve rezerv koşullarına uygun seçeneği öğrenmek'], en:['Energy and alternatives','As a mission progresses, remaining energy changes the relationship between continuing to the target and choosing an alternate site.','Energy reserve · site accessibility','Learn a choice consistent with mission and reserve conditions'] },
    V3: { tr:['Farklı deneyimlerden öğrenme','Her araç aynı görev ve arıza dağılımını görmez. Yerel deneyimlerin nasıl birleştirildiği, H1 ve H2 araştırma sorularının odağında.','Görev geçmişi · gözlenebilir arıza bağlamı','Yerel deneyimle politika güncellemek'], en:['Learning from different experiences','Aircraft do not encounter identical mission and failure distributions. How local experience is aggregated is central to H1 and H2.','Mission history · observable failure context','Update a policy using local experience'] },
    V4: { tr:['Ortak hava sahası','Bir aracın kararı diğerlerinin hareket alanını da etkiler. Tekil iniş ile dört aracın birlikte emniyetli görev tamamlaması ayrı sonuçlardır.','Ortak hava sahası · ayırma','Diğer araçlarla birlikte görev tamamlamayı öğrenmek'], en:['Shared airspace','One aircraft’s choice changes the room available to others. An individual landing and safe joint completion by four aircraft are distinct outcomes.','Shared airspace · separation','Learn mission completion alongside other aircraft'] }
  };
  var methods = {
    central: { tr:['MERKEZİ REFERANS','Deneyim tek havuzda.','Dört aracın deneyimi bir araya getirilir ve merkezi PPO güncellemesinde kullanılır. Bu düzen, federe yöntemler için karşılaştırma referansıdır.','Merkezi PPO güncellemesi','Toplanan deneyim → ortak öğrenme havuzu'], en:['CENTRALISED REFERENCE','Experience in one pool.','Experience from all four aircraft is pooled for a centralised PPO update. This arrangement provides the reference for the federated methods.','Centralised PPO update','Collected experience → shared learning pool'] },
    federated: { tr:['FEDERE REFERANS','Yerel öğrenme, ortak politika.','Her mantıksal istemci kendi aracının deneyimiyle yerel PPO güncellemesi yapar. Yerel ağ ağırlıkları birleştirilir; merkezi bir ham deneyim havuzu kurulmaz.','Yerel PPO → standart birleştirme','Yerel deneyim → yerel güncellemeler → ağ ağırlıkları'], en:['FEDERATED REFERENCE','Local learning, shared policy.','Each logical client performs a local PPO update using its aircraft’s experience. Local network weights are aggregated without constructing a central raw-experience pool.','Local PPO → standard aggregation','Local experience → local updates → network weights'] },
    context: { tr:['H2 / ANA ARAŞTIRMA','Birleştirmede görev bağlamı.','Bağlam Dengeli FedPPO, yerel güncellemeleri görev erişilebilirliği, enerji yeterliliği ve gözlenebilir arıza bağlamıyla ilişkilendirir. Amaç, farklı deneyim dağılımlarının etkisini sınamaktır; yöntem üstünlüğü henüz kurulmuş bir sonuç değildir.','Yerel PPO → bağlam dengeli birleştirme','Ağ ağırlıkları + gözlenebilir görev bağlamı'], en:['H2 / PRIMARY RESEARCH','Mission context in aggregation.','Context-balanced FedPPO relates local updates to mission accessibility, energy sufficiency and observable failure context. It tests the effect of differing experience distributions; method superiority is not an established result.','Local PPO → context-balanced aggregation','Network weights + observable mission context'] }
  };
  function set(id, value) { var el=document.getElementById(id); if(el) el.textContent=value; }
  function language() { return window.LANG==='en'?'en':'tr'; }
  function renderVehicle() {
    var copy=vehicles[selectedVehicle][language()];
    set('vehicle-name',selectedVehicle);set('vehicle-title',copy[0]);set('vehicle-description',copy[1]);set('vehicle-context',copy[2]);set('vehicle-task',copy[3]);
    document.getElementById('vehicle-name').style.color='var(--'+selectedVehicle.toLowerCase()+')';
    document.querySelectorAll('[data-vehicle]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.vehicle===selectedVehicle));});
    document.querySelectorAll('[data-route]').forEach(function(g){g.toggleAttribute('hidden',g.dataset.route!==selectedVehicle);});
    document.querySelectorAll('[data-aircraft]').forEach(function(g){g.classList.toggle('selected',g.dataset.aircraft===selectedVehicle);});
  }
  function renderMethod() {
    var copy=methods[selectedMethod][language()];
    set('method-kicker',copy[0]);set('method-title',copy[1]);set('method-description',copy[2]);set('learning-node',copy[3]);set('flow-caption',copy[4]);
    document.querySelectorAll('[data-method]').forEach(function(b){var active=b.dataset.method===selectedMethod;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
    document.getElementById('method-panel').setAttribute('aria-labelledby','tab-'+selectedMethod);
  }
  function render() {
    renderVehicle();renderMethod();
    document.title=language()==='en'?'LIMULUS-eVTOL · Learning together, measuring safety':'LIMULUS-eVTOL · Birlikte öğrenmek, emniyeti ölçmek';
    set('airspace-title',language()==='en'?'Four aircraft and six heliports':'Dört araç ve altı heliport');
    set('airspace-desc',language()==='en'?'Illustrative mission schematic, not to scale. No actual route, position, separation or flight record.':'Ölçeksiz ve temsili görev şeması. Gerçek rota, konum, ayırma veya uçuş kaydı içermez.');
    document.querySelector('.aircraft-switch').setAttribute('aria-label',language()==='en'?'Select aircraft':'Araç seçimi');
    document.querySelector('.method-tabs').setAttribute('aria-label',language()==='en'?'Learning methods':'Öğrenme yöntemleri');
  }
  document.querySelectorAll('[data-vehicle]').forEach(function(b){b.addEventListener('click',function(){selectedVehicle=b.dataset.vehicle;renderVehicle();});});
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
