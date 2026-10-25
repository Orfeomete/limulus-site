/* Interactive illustration only. No network, stored flight data, learned controller or training API. */
(function () {
  'use strict';
  var host=document.getElementById('mission-demo');
  if(!host||!window.MissionDemo)return;
  var engine=window.MissionDemo.create('normal'),selected='V1',playing=false,speed=1,last=0,frame=0,lastDraw=0;
  var colors=['#edece6','#efb088','#a4b6a2','#efa89b'];
  var routeColors=['#597489','#b97845','#5e7f63','#ba6f65'];
  var words={
    tr:{ready:'Hazır',approach:'Yaklaşmada',landed:'İndi · gösterim',hold:'Elle bekletiliyor',closed:'Hedef kapalı',waiting:'Alan dolu / ayrılmış',start:'▶ Başlat',pause:'Ⅱ Duraklat',holdCommand:'Beklet',resumeCommand:'Devam ettir',open:'Açık',closedPad:'Kapalı',free:'Serbest',reserved:'Yaklaşma',occupied:'Yerde',target:'Hedef',completed:'Gösterim tamamlandı',paused:'Duraklatıldı',running:'Gösterim çalışıyor',standby:'Başlatmaya hazır',descriptions:{normal:'Dört ayrı hedef. Başlatın; araçları seçerek yaklaşmalarını izleyin.',shared:'V1 ve V2, A alanını paylaşıyor. Bekleyen aracı seçip boş bir alana yönlendirin.',closed:'C alanı kapalı. V2 için başka bir hedef seçin veya C alanını açın.'},events:{scenario:'Senaryo hazır',ready:'Yeni komut bekleniyor',approach:'Yaklaşma başladı',landed:'Gösterimde iniş',hold:'Bekliyor',closed:'Kapalı hedefte bekliyor',waiting:'Dolu / ayrılmış hedefte bekliyor',target:'Hedef değişti',commandHold:'Beklet komutu',commandResume:'Devam komutu',openPad:'Alan açıldı',closePad:'Alan kapatıldı'},presets:{normal:'Ayrı hedefler',shared:'Ortak hedef',closed:'Kapalı alan'},hint:'Hedef değişikliği konumu sıçratmaz. İnen araç alanı dolu tutar; yeniden denemek için sıfırlayın.'},
    en:{ready:'Ready',approach:'Approaching',landed:'Landed · demo',hold:'Manual hold',closed:'Target closed',waiting:'Site occupied / reserved',start:'▶ Start',pause:'Ⅱ Pause',holdCommand:'Hold',resumeCommand:'Resume',open:'Open',closedPad:'Closed',free:'Available',reserved:'Approach',occupied:'On ground',target:'Target',completed:'Demo complete',paused:'Paused',running:'Demo running',standby:'Ready to start',descriptions:{normal:'Four different targets. Start, then select an aircraft to follow its approach.',shared:'V1 and V2 share site A. Select the waiting aircraft and assign an available site.',closed:'Site C is closed. Assign another target for V2 or reopen C.'},events:{scenario:'Scenario ready',ready:'Awaiting a new command',approach:'Approach started',landed:'Demo landing',hold:'Holding',closed:'Holding: target closed',waiting:'Holding: target occupied / reserved',target:'Target changed',commandHold:'Hold command',commandResume:'Resume command',openPad:'Site opened',closePad:'Site closed'},presets:{normal:'Separate targets',shared:'Shared target',closed:'Closed site'},hint:'Changing a target does not move an aircraft instantly. Landed aircraft keep their sites occupied; reset to try again.'}
  };
  function copy(){return words[window.LANG==='en'?'en':'tr'];}
  function by(id){return document.getElementById(id);}
  function text(id,t){by(id).textContent=t;}
  function stamp(t){var s=Math.floor(t);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
  var ns='http://www.w3.org/2000/svg';
  function svg(tag,attrs,parent){var el=document.createElementNS(ns,tag);Object.keys(attrs).forEach(function(k){el.setAttribute(k,attrs[k]);});parent.appendChild(el);return el;}
  var views={};
  engine.snapshot().aircraft.forEach(function(v,i){
    var route=svg('path',{class:'demo-route',stroke:routeColors[i]},by('demo-routes'));
    var trail=svg('polyline',{class:'demo-trail',stroke:routeColors[i]},by('demo-trails'));
    var group=svg('g',{class:'map-aircraft','data-aircraft':v.id,style:'color:'+colors[i],role:'button',tabindex:'0'},by('demo-aircraft'));
    svg('circle',{class:'selection-ring',r:43},group);
    var shape=svg('g',{},group);svg('use',{href:'#v74-symbol'},shape);
    var label=svg('text',{x:32,y:-26},group);label.textContent=v.id;
    views[v.id]={route:route,trail:trail,group:group,shape:shape};
    group.addEventListener('click',function(){selected=v.id;render();});
    group.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();selected=v.id;render();}});
  });
  function render(){
    var s=engine.snapshot(),w=copy(),v=s.aircraft.find(function(a){return a.id===selected;}),allLanded=s.aircraft.every(function(a){return a.status==='landed';});
    text('demo-clock',stamp(s.time));
    text('demo-count',s.aircraft.filter(function(a){return a.status==='landed';}).length+' / 4');
    text('demo-run-state',allLanded?w.completed:playing?w.running:s.time?w.paused:w.standby);
    text('demo-play',playing?w.pause:w.start); by('demo-play').setAttribute('aria-pressed',String(playing));by('demo-play').disabled=allLanded;
    text('demo-scenario-copy',w.descriptions[s.preset]);
    text('vehicle-name',selected);text('demo-vehicle-status',w[v.status]);
    text('demo-target-value',v.target);text('demo-hint',w.hint);
    by('demo-target').value=v.target;by('demo-target').disabled=v.status==='landed';
    by('demo-hold').disabled=v.status==='landed';text('demo-hold',v.manualHold?w.resumeCommand:w.holdCommand);
    by('demo-hold').setAttribute('aria-pressed',String(v.manualHold));
    host.style.setProperty('--selected-vehicle',colors[Number(selected.slice(1))-1]);
    host.querySelectorAll('[data-target-site]').forEach(function(b){var p=s.pads.find(function(h){return h.id===b.dataset.targetSite;});b.setAttribute('aria-pressed',String(b.dataset.targetSite===v.target));b.disabled=v.status==='landed';b.setAttribute('aria-label',w.target+' '+p.id+' · '+(p.open?w.open:w.closedPad));b.classList.toggle('target-closed',!p.open);});
    host.querySelectorAll('[data-vehicle]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.vehicle===selected));});
    host.querySelectorAll('[data-preset]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.preset===s.preset));});
    host.querySelectorAll('[data-speed]').forEach(function(b){b.setAttribute('aria-pressed',String(Number(b.dataset.speed)===speed));});
    s.pads.forEach(function(p){
      var b=host.querySelector('[data-pad-toggle="'+p.id+'"]'),state=p.open?(p.occupant?w.occupied+' '+p.occupant:p.reserved?w.reserved+' '+p.reserved:w.open):w.closedPad;
      b.querySelector('span').textContent=state;b.setAttribute('aria-pressed',String(!p.open));
      b.setAttribute('aria-label',p.id+' · '+state+' · '+(p.open?w.closedPad:w.open));
      b.classList.toggle('closed',!p.open);b.classList.toggle('occupied',Boolean(p.occupant));
      var map=host.querySelector('[data-map-pad="'+p.id+'"]');map.classList.toggle('closed',!p.open);map.classList.toggle('occupied',Boolean(p.occupant));
      Array.from(by('demo-target').options).forEach(function(o){if(o.value===p.id)o.textContent=p.id+' · '+(p.open?(p.occupant?w.occupied+' '+p.occupant:p.reserved?w.reserved+' '+p.reserved:w.free):w.closedPad);});
    });
    s.aircraft.forEach(function(a){
      var view=views[a.id],p=s.pads.find(function(h){return h.id===a.target;}),isSelected=a.id===selected;
      view.group.setAttribute('transform','translate('+a.x.toFixed(2)+' '+a.y.toFixed(2)+')');view.shape.setAttribute('transform','rotate('+a.heading.toFixed(2)+')');
      view.group.setAttribute('aria-label',a.id+' · '+w[a.status]+' · '+w.target+' '+a.target);view.group.setAttribute('aria-pressed',String(isSelected));
      view.group.classList.toggle('selected',isSelected);view.group.classList.toggle('landed',a.status==='landed');
      view.route.setAttribute('d','M'+a.x+' '+a.y+' L'+p.x+' '+p.y);view.route.style.opacity=a.status==='landed'?'0':isSelected?'.85':'.4';
      view.trail.setAttribute('points',a.trail.map(function(pt){return pt.map(function(n){return n.toFixed(1);}).join(',');}).join(' '));
      text('demo-status-'+a.id,w[a.status]);text('demo-site-'+a.id,'→ '+a.target);
    });
    by('demo-events').replaceChildren();
    s.events.slice(0,5).forEach(function(e){var li=document.createElement('li'),time=document.createElement('time'),body=document.createElement('span');time.textContent=stamp(e.time);body.textContent=(e.a==='normal'||e.a==='shared'||e.a==='closed'?'':e.a?e.a+' · ':'')+w.events[e.code]+(e.code==='scenario'?' · '+w.presets[e.a]:e.b?' → '+e.b:'');li.append(time,body);by('demo-events').appendChild(li);});
  }
  function stop(){playing=false;cancelAnimationFrame(frame);frame=0;last=0;render();}
  function animate(now){
    if(!playing)return;
    if(last)engine.advance(Math.min((now-last)/1000,.1)*speed);last=now;
    if(now-lastDraw>70){render();lastDraw=now;}
    if(engine.snapshot().aircraft.every(function(v){return v.status==='landed';})){stop();return;}
    frame=requestAnimationFrame(animate);
  }
  by('demo-play').addEventListener('click',function(){if(playing){stop();return;}playing=true;last=0;render();frame=requestAnimationFrame(animate);});
  by('demo-step').addEventListener('click',function(){stop();engine.advance(10);render();});
  by('demo-reset').addEventListener('click',function(){var preset=engine.snapshot().preset;stop();engine=window.MissionDemo.create(preset);render();});
  host.querySelectorAll('[data-target-site]').forEach(function(b){b.addEventListener('click',function(){engine.target(selected,b.dataset.targetSite);render();});});
  by('demo-target').addEventListener('change',function(e){engine.target(selected,e.target.value);render();});
  by('demo-hold').addEventListener('click',function(){engine.hold(selected);render();});
  host.querySelectorAll('[data-vehicle]').forEach(function(b){b.addEventListener('click',function(){selected=b.dataset.vehicle;render();});});
  host.querySelectorAll('[data-speed]').forEach(function(b){b.addEventListener('click',function(){speed=Number(b.dataset.speed);render();});});
  host.querySelectorAll('[data-preset]').forEach(function(b){b.addEventListener('click',function(){stop();engine=window.MissionDemo.create(b.dataset.preset);render();});});
  host.querySelectorAll('[data-pad-toggle]').forEach(function(b){b.addEventListener('click',function(){engine.togglePad(b.dataset.padToggle);render();});});
  document.addEventListener('langchange',render);
  document.addEventListener('visibilitychange',function(){if(document.hidden&&playing)stop();});
  if('IntersectionObserver' in window)new IntersectionObserver(function(entries){if(!entries[0].isIntersecting&&playing)stop();},{threshold:0}).observe(host);
  render();
}());
