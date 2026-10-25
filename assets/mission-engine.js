/* Browser-local deterministic 2D teaching model. No V74 physics or PPO connection. */
(function(root,factory){
  'use strict';
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.MissionDemo=factory();
}(typeof window==='object'?window:this,function(){
  'use strict';
  var sites=[["A",-156.0,-429.0],["B",-50.0,461.0],["C",169.0,-468.0],["D",-461.0,84.0],["E",-49.0,-290.0],["F",-220.0,81.0]];
  var origins=['A','B','E','F'];
  function create(preset,plans,access,restored){
    var mode=['normal','shared','closed'].indexOf(preset)>=0?preset:'normal';
    var goals=mode==='shared'?['D','D','B','A']:['D','C','B','A'];
    var state={time:0,preset:mode,events:[],pads:[],aircraft:[]};
    sites.forEach(function(s){state.pads.push({id:s[0],x:s[1],y:s[2],open:access&&typeof access[s[0]]==='boolean'?access[s[0]]:!(mode==='closed'&&s[0]==='C'),occupant:null,reserved:null});});
    origins.forEach(function(from,i){
      var id='V'+(i+1),plan=plans&&plans.find(function(p){return p.id===id;}),origin=plan?plan.origin:from,target=plan?plan.target:goals[i];
      var source=pad(origin),destination=pad(target);
      if(!source||!destination||origin===target||source.occupant)throw new Error('Invalid demo route plan');
      source.occupant=id;
      state.aircraft.push({id:id,origin:origin,x:source.x,y:source.y,heading:Math.atan2(destination.y-source.y,destination.x-source.x)*180/Math.PI+90,target:target,departed:false,manualHold:false,status:'ready',trail:[[source.x,source.y]]});
    });
    event('scenario',mode,'');
    function event(code,a,b){state.events.unshift({time:state.time,code:code,a:a||'',b:b||''});state.events=state.events.slice(0,8);}
    function aircraft(id){return state.aircraft.find(function(v){return v.id===id;});}
    function pad(id){return state.pads.find(function(p){return p.id===id;});}
    function release(v){state.pads.forEach(function(p){if(p.reserved===v.id)p.reserved=null;});}
    function status(v,next){if(v.status!==next){v.status=next;event(next,v.id,v.target);}}
    function reserveAirborne(){
      state.aircraft.forEach(function(v){
        if(!v.departed||v.status==='landed')return;
        var p=pad(v.target);
        if(v.manualHold||!p.open){release(v);return;}
        if((!p.occupant||p.occupant===v.id)&&(!p.reserved||p.reserved===v.id))p.reserved=v.id;
      });
    }
    function departEligible(){
      var candidates=state.aircraft.filter(function(v){return !v.departed&&v.status!=='landed'&&!v.manualHold&&pad(v.origin).open&&pad(v.target).open;});
      var best=[];
      // Four vehicles only: consider simultaneous releases so A->B/B->A
      // does not deadlock solely because both origins are currently occupied.
      // Targets still have one reservation; deterministic ID order breaks ties.
      for(var mask=1;mask<(1<<candidates.length);mask++){
        var batch=candidates.filter(function(v,i){return Boolean(mask&(1<<i));}),ids=batch.map(function(v){return v.id;}),used=[];
        var valid=batch.every(function(v){var p=pad(v.target);if(used.indexOf(p.id)>=0||(p.reserved&&p.reserved!==v.id)||(p.occupant&&p.occupant!==v.id&&ids.indexOf(p.occupant)<0))return false;used.push(p.id);return true;});
        if(valid&&(batch.length>best.length||(batch.length===best.length&&ids.join(',')<best.map(function(v){return v.id;}).join(','))))best=batch;
      }
      best.forEach(function(v){var p=pad(v.origin);if(p.occupant===v.id)p.occupant=null;});
      best.forEach(function(v){v.departed=true;pad(v.target).reserved=v.id;event('depart',v.id,v.origin+' → '+v.target);});
    }
    function tick(dt){
      state.time=Math.round((state.time+dt)*1000)/1000;
      reserveAirborne();departEligible();
      state.aircraft.forEach(function(v){
        if(v.status==='landed')return;
        var p=pad(v.target);
        if(v.manualHold){release(v);status(v,'hold');return;}
        if(!v.departed&&!pad(v.origin).open){release(v);status(v,'originClosed');return;}
        if(!p.open){release(v);status(v,'closed');return;}
        if(!v.departed||(p.occupant&&p.occupant!==v.id)||(p.reserved&&p.reserved!==v.id)){release(v);status(v,'waiting');return;}
        p.reserved=v.id;status(v,'approach');
        var dx=p.x-v.x,dy=p.y-v.y,d=Math.hypot(dx,dy),step=6*dt;
        v.heading=Math.atan2(dy,dx)*180/Math.PI+90;
        if(d<=step){v.x=p.x;v.y=p.y;p.occupant=v.id;p.reserved=null;status(v,'landed');}
        else{v.x+=dx/d*step;v.y+=dy/d*step;}
        var previous=v.trail[v.trail.length-1];
        if(Math.hypot(v.x-previous[0],v.y-previous[1])>=3||v.status==='landed'){v.trail.push([v.x,v.y]);if(v.trail.length>160)v.trail.shift();}
      });
    }
    if(restored)state=restored;
    return {
      snapshot:function(){return JSON.parse(JSON.stringify(state));},
      advance:function(seconds){if(!Number.isFinite(seconds)||seconds<0||seconds>600)throw new Error('Invalid demo step');var left=seconds;while(left>1e-8){var dt=Math.min(left,.1);tick(dt);left-=dt;}},
      origin:function(id,from){
        var v=aircraft(id),p=pad(from);if(!v||!p||state.time>0||v.departed||!p.open||(p.occupant&&p.occupant!==id)||p.reserved||v.target===from)return false;
        var previous=pad(v.origin);if(previous.occupant===id)previous.occupant=null;
        v.origin=from;v.x=p.x;v.y=p.y;p.occupant=id;v.trail=[[p.x,p.y]];var target=pad(v.target);v.heading=Math.atan2(target.y-p.y,target.x-p.x)*180/Math.PI+90;status(v,v.manualHold?'hold':'ready');event('origin',id,from);return true;
      },
      target:function(id,to){var v=aircraft(id),p=pad(to);if(!v||!p||v.status==='landed'||to===v.origin)return false;release(v);v.target=to;status(v,v.manualHold?'hold':'ready');event('target',id,to);return true;},
      hold:function(id){var v=aircraft(id);if(!v||v.status==='landed')return false;v.manualHold=!v.manualHold;release(v);status(v,v.manualHold?'hold':'ready');event(v.manualHold?'commandHold':'commandResume',id,v.target);return true;},
      togglePad:function(id){var p=pad(id);if(!p)return false;p.open=!p.open;if(!p.open)p.reserved=null;event(p.open?'openPad':'closePad',id,'');return true;},
      reset:function(){var plans=state.aircraft.map(function(v){return {id:v.id,origin:v.origin,target:v.target};}),access={};state.pads.forEach(function(p){access[p.id]=p.open;});return create(mode,plans,access);}
    };
  }
  function restore(raw){
    if(!raw||!['normal','shared','closed'].includes(raw.preset)||!Number.isFinite(raw.time)||raw.time<0||raw.time>3600||!Array.isArray(raw.aircraft)||raw.aircraft.length!==4||!Array.isArray(raw.pads)||raw.pads.length!==6)throw new Error('Invalid saved demo');
    var validPoint=function(p){return Array.isArray(p)&&p.length===2&&p.every(function(x){return Number.isFinite(x)&&Math.abs(x)<=1000;});};
    var vehicles=raw.aircraft.map(function(v,i){
      if(v.id!=='V'+(i+1)||!sites.some(function(p){return p[0]===v.origin;})||!sites.some(function(p){return p[0]===v.target;})||v.origin===v.target||!validPoint([v.x,v.y])||!Number.isFinite(v.heading)||typeof v.manualHold!=='boolean'||typeof v.departed!=='boolean'||!['ready','approach','landed','hold','closed','waiting','originClosed'].includes(v.status)||!Array.isArray(v.trail)||v.trail.length>160||v.trail.length<1||!v.trail.every(validPoint))throw new Error('Invalid saved aircraft');
      return {id:v.id,origin:v.origin,target:v.target,x:v.x,y:v.y,heading:v.heading,departed:v.departed,manualHold:v.manualHold,status:v.status,trail:v.trail.map(function(p){return p.slice();})};
    });
    if(new Set(vehicles.map(function(v){return v.origin;})).size!==4)throw new Error('Invalid departure occupancy');
    var pads=raw.pads.map(function(p,i){var ref=sites[i];if(p.id!==ref[0]||p.x!==ref[1]||p.y!==ref[2]||typeof p.open!=='boolean'||[p.occupant,p.reserved].some(function(id){return id!==null&&!vehicles.some(function(v){return v.id===id;});}))throw new Error('Invalid saved site');return {id:p.id,x:p.x,y:p.y,open:p.open,occupant:p.occupant,reserved:p.reserved};});
    var occupants=pads.map(function(p){return p.occupant;}).filter(Boolean),reservations=pads.map(function(p){return p.reserved;}).filter(Boolean);
    if(new Set(occupants).size!==occupants.length||new Set(reservations).size!==reservations.length)throw new Error('Invalid duplicate occupancy');
    vehicles.forEach(function(v){var origin=pads.find(function(p){return p.id===v.origin;}),target=pads.find(function(p){return p.id===v.target;});if((!v.departed&&(origin.occupant!==v.id||v.x!==origin.x||v.y!==origin.y))||(v.status==='landed'&&(target.occupant!==v.id||v.x!==target.x||v.y!==target.y)))throw new Error('Invalid saved pose');});
    pads.forEach(function(p){if(p.occupant){var v=vehicles.find(function(v){return v.id===p.occupant;});if((!v.departed&&v.origin!==p.id)||(v.departed&&(v.status!=='landed'||v.target!==p.id)))throw new Error('Invalid occupant');}if(p.reserved){var v=vehicles.find(function(v){return v.id===p.reserved;});if(!v.departed||v.target!==p.id||v.status==='landed')throw new Error('Invalid reservation');}});
    var codes=['scenario','origin','depart','originClosed','ready','approach','landed','hold','closed','waiting','target','commandHold','commandResume','openPad','closePad'];
    if(!Array.isArray(raw.events)||raw.events.length>8)throw new Error('Invalid saved events');
    var events=raw.events.map(function(e){if(!Number.isFinite(e.time)||e.time<0||e.time>raw.time||!codes.includes(e.code)||typeof e.a!=='string'||e.a.length>40||typeof e.b!=='string'||e.b.length>100)throw new Error('Invalid saved event');return {time:e.time,code:e.code,a:e.a,b:e.b};});
    var access={};pads.forEach(function(p){access[p.id]=p.open;});
    return create(raw.preset,vehicles,access,{time:raw.time,preset:raw.preset,events:events,pads:pads,aircraft:vehicles});
  }
  return {create:create,restore:restore};
}));
