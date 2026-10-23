/* Browser-local, deterministic teaching model. No V74 physics or PPO connection. */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MissionDemo = factory();
}(typeof window === 'object' ? window : this, function () {
  'use strict';
  var sites = [
    ['A',140,110],['B',430,100],['C',670,200],
    ['D',550,420],['E',220,420],['F',690,75]
  ];
  var starts = [[160,320],[455,320],[345,400],[550,170]];
  function create(preset) {
    var mode = ['normal','shared','closed'].indexOf(preset) >= 0 ? preset : 'normal';
    var state = { time:0, preset:mode, events:[], pads:[], aircraft:[] };
    sites.forEach(function (s) { state.pads.push({id:s[0],x:s[1],y:s[2],open:!(mode==='closed'&&s[0]==='C'),occupant:null,reserved:null}); });
    starts.forEach(function (s,i) {
      state.aircraft.push({id:'V'+(i+1),x:s[0],y:s[1],heading:0,target:(mode==='shared'?['A','A','E','F']:['A','C','E','F'])[i],manualHold:false,status:'ready',trail:[[s[0],s[1]]]});
    });
    event('scenario',mode,'');
    function event(code,a,b) { state.events.unshift({time:state.time,code:code,a:a||'',b:b||''}); state.events=state.events.slice(0,8); }
    function aircraft(id) { return state.aircraft.find(function(v){return v.id===id;}); }
    function pad(id) { return state.pads.find(function(p){return p.id===id;}); }
    function release(v) { state.pads.forEach(function(p){if(p.reserved===v.id)p.reserved=null;}); }
    function status(v,next) { if(v.status!==next){v.status=next;event(next,v.id,v.target);} }
    function tick(dt) {
      state.time = Math.round((state.time+dt)*1000)/1000;
      state.aircraft.forEach(function(v) {
        if(v.status==='landed')return;
        var p=pad(v.target);
        if(v.manualHold){release(v);status(v,'hold');return;}
        if(!p.open){release(v);status(v,'closed');return;}
        if((p.occupant&&p.occupant!==v.id)||(p.reserved&&p.reserved!==v.id)){release(v);status(v,'waiting');return;}
        p.reserved=v.id; status(v,'approach');
        var dx=p.x-v.x,dy=p.y-v.y,d=Math.hypot(dx,dy),step=6*dt;
        v.heading=Math.atan2(dy,dx)*180/Math.PI+90;
        if(d<=step){v.x=p.x;v.y=p.y;p.occupant=v.id;p.reserved=null;status(v,'landed');}
        else {v.x+=dx/d*step;v.y+=dy/d*step;}
        var prev=v.trail[v.trail.length-1];
        if(Math.hypot(v.x-prev[0],v.y-prev[1])>=3||v.status==='landed'){
          v.trail.push([v.x,v.y]); if(v.trail.length>160)v.trail.shift();
        }
      });
    }
    return {
      snapshot:function(){return JSON.parse(JSON.stringify(state));},
      advance:function(seconds){
        if(!Number.isFinite(seconds)||seconds<0||seconds>600)throw new Error('Invalid demo step');
        var left=seconds; while(left>1e-8){var dt=Math.min(left,0.1);tick(dt);left-=dt;}
      },
      target:function(id,to){var v=aircraft(id);if(!v||!pad(to)||v.status==='landed')return false;release(v);v.target=to;status(v,'ready');event('target',id,to);return true;},
      hold:function(id){var v=aircraft(id);if(!v||v.status==='landed')return false;v.manualHold=!v.manualHold;release(v);status(v,v.manualHold?'hold':'ready');event(v.manualHold?'commandHold':'commandResume',id,v.target);return true;},
      togglePad:function(id){var p=pad(id);if(!p)return false;p.open=!p.open;if(!p.open)p.reserved=null;event(p.open?'openPad':'closePad',id,'');return true;}
    };
  }
  return {create:create};
}));
