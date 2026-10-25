/* Fixed recorded UE camera. Only the presentation projection lives here. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory;
  else root.MissionScene=factory(root.MissionSceneData);
}(typeof window==='object'?window:this,function(data){
  'use strict';
  var ns='http://www.w3.org/2000/svg',camera=data.camera,eye=camera.location_m;
  function dot(a,b){return a.reduce(function(s,x,i){return s+x*b[i];},0);}
  function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
  function unit(a){var l=Math.hypot.apply(null,a);return a.map(function(x){return x/l;});}
  var forward=unit(camera.target_m.map(function(x,i){return x-eye[i];})),right=unit(cross([0,0,1],forward)),up=cross(forward,right);
  var focal=data.width/(2*Math.tan(camera.fov*Math.PI/360));
  function project(p){var d=p.map(function(x,i){return x-eye[i];}),depth=dot(d,forward);return [data.width/2+focal*dot(d,right)/depth,data.height/2-focal*dot(d,up)/depth];}
  function pad(id){return data.pads.find(function(p){return p.id===id;});}
  function position(a){
    var from=pad(a.origin).center_m,to=pad(a.target).center_m,total=Math.hypot(to[0]-from[0],to[1]-from[1]);
    var fraction=Math.min(1,Math.max(0,Math.hypot(a.x-from[0],a.y-from[1])/Math.max(total,.001)));
    // A drawing layer interpolated between rooftop elevations, not flight altitude.
    return [a.x,a.y,from[2]+(to[2]-from[2])*fraction+2];
  }
  function svg(tag,attrs,parent){var e=document.createElementNS(ns,tag);Object.keys(attrs).forEach(function(k){e.setAttribute(k,attrs[k]);});if(parent)parent.appendChild(e);return e;}
  function ringPoints(x,y,z,r,n){var out=[];for(var i=0;i<n;i++){var a=2*Math.PI*i/n;out.push([x+r*Math.cos(a),y+r*Math.sin(a),z]);}return out;}
  function points(ps){return ps.map(function(p){return p.map(function(x){return x.toFixed(2);}).join(',');}).join(' ');}
  function mountPads(parent){data.pads.forEach(function(p){
    var c=p.center_m,pt=project(c),g=svg('g',{class:'heliport','data-map-pad':p.id},parent);
    svg('polygon',{class:'ue-pad-outline',points:points(ringPoints(c[0],c[1],c[2],p.diameter_m/2,48).map(project))},g);
    var hp=[[-2.5,-3],[-2.5,3],[2.5,-3],[2.5,3],[-2.5,0],[2.5,0]].map(function(q){return project([c[0]+q[0],c[1]+q[1],c[2]]);});
    svg('path',{class:'ue-pad-h',d:[0,2,4].map(function(i){return 'M'+hp[i][0]+' '+hp[i][1]+'L'+hp[i+1][0]+' '+hp[i+1][1];}).join('')},g);
    svg('circle',{class:'ue-pad-halo',cx:pt[0],cy:pt[1],r:24},g);
    svg('path',{class:'pad-cross',d:'M'+(pt[0]-13)+' '+(pt[1]-13)+'l26 26m0-26l-26 26'},g);
    svg('path',{class:'ue-pad-leader',d:'M'+(pt[0]+15)+' '+(pt[1]-12)+'l22-25'},g);
    var badge=svg('g',{class:'ue-pad-badge',transform:'translate('+(pt[0]+37)+' '+(pt[1]-54)+')'},g);
    svg('rect',{x:-17,y:-18,width:34,height:36,rx:6},badge);var t=svg('text',{'text-anchor':'middle',y:7},badge);t.textContent=p.id;
  });}
  function tint(hex,v){var c=hex.replace('#','');return '#'+[0,2,4].map(function(i){var x=parseInt(c.slice(i,i+2),16);return Math.round(Math.max(0,Math.min(255,x*v))).toString(16).padStart(2,'0');}).join('');}
  function model(){
    var faces=[];
    function face(p,color){faces.push({p:p,color:color||'shell'});}
    function plate(p,t){face(p.map(function(v){return [v[0],v[1],v[2]+t];}));for(var i=0;i<p.length;i++){var j=(i+1)%p.length;face([p[i],p[j],[p[j][0],p[j][1],p[j][2]+t],[p[i][0],p[i][1],p[i][2]+t]]);}}
    plate([[-4,0,1],[-26,9,1],[-26,15,1],[-4,12,1]],1.2);plate([[4,0,1],[26,9,1],[26,15,1],[4,12,1]],1.2);
    plate([[-3,25,2],[-12,34,12],[-8,35,12],[0,30,2]],.7);plate([[3,25,2],[12,34,12],[8,35,12],[0,30,2]],.7);
    var sections=[[-36,.05,1,.1],[-29,2.8,2.5,2],[-17,5,3.5,4],[2,4.8,3,3.8],[22,3.4,1.8,2.2],[35,.1,.8,.2]],rings=sections.map(function(s){var ps=[];for(var k=0;k<12;k++){var a=k*Math.PI/6;ps.push([s[1]*Math.sin(a),s[0],s[2]+s[3]*Math.cos(a)]);}return ps;});
    for(var j=0;j<rings.length-1;j++)for(var i=0;i<12;i++)face([rings[j][i],rings[j][(i+1)%12],rings[j+1][(i+1)%12],rings[j+1][i]]);
    // Long tandem canopy follows the V74 fuselage, with no generic quadcopter body.
    var canopy=[[-26,2.1,5.8],[-17,3.8,7.1],[-3,3.3,6.7],[2,1.2,6.1]];
    for(var j=0;j<canopy.length-1;j++){
      var a=canopy[j],b=canopy[j+1];face([[-a[1],a[0],a[2]],[0,a[0],a[2]+.9],[0,b[0],b[2]+.9],[-b[1],b[0],b[2]]],'#10222d');face([[0,a[0],a[2]+.9],[a[1],a[0],a[2]],[b[1],b[0],b[2]],[0,b[0],b[2]+.9]],'#213d4a');
    }
    [[-15,-14,10.5,4.5],[15,-14,10.5,4.5],[-13.4,23,8.3,3],[13.4,23,8.3,3]].forEach(function(f){
      var x=f[0],y=f[1],r=f[2],z=f[3],top=ringPoints(x,y,z+2.6,r,24),bottom=ringPoints(x,y,z,r,24),inner=ringPoints(x,y,z+2.6,r-.85,24);
      face(ringPoints(x,y,z+1.5,r-.7,24),'#10212b');
      for(var i=0;i<24;i++){var k=(i+1)%24;face([bottom[i],bottom[k],top[k],top[i]]);face([top[i],top[k],inner[k],inner[i]]);}
      for(var b=0;b<5;b++){var a=b*2*Math.PI/5;face([[x,y,z+1.8],[x+Math.cos(a)*r*.82,y+Math.sin(a)*r*.82,z+1.8],[x+Math.cos(a+.22)*r*.77,y+Math.sin(a+.22)*r*.77,z+1.8],[x-Math.sin(a)*1.2,y+Math.cos(a)*1.2,z+1.8]],'#40505a');}
      face(ringPoints(x,y,z+2,1.6,12),'#8a9ca4');
    });
    return faces;
  }
  var mesh=model(),light=unit([-.4,-.6,1]);
  function aircraft(parent,heading,color){
    var theta=heading*Math.PI/180,ct=Math.cos(theta),st=Math.sin(theta);
    function rotate(p){return [ct*p[0]-st*p[1],st*p[0]+ct*p[1],p[2]];}
    var rendered=mesh.map(function(f){var p=f.p.map(rotate),a=p[1].map(function(x,i){return x-p[0][i];}),b=p[2].map(function(x,i){return x-p[0][i];}),n=unit(cross(a,b)),normal=Number.isFinite(n[0])?n:[0,0,1],shade=.62+.38*Math.abs(dot(normal,light));return {p:p,depth:p.reduce(function(s,q){return s+dot(q,forward);},0)/p.length,color:f.color==='shell'?tint(color,shade):f.color};}).sort(function(a,b){return b.depth-a.depth;});
    var group=document.createDocumentFragment();
    rendered.forEach(function(f){svg('polygon',{points:points(f.p.map(function(p){return [dot(p,right)*2.1,-dot(p,up)*2.1];})),fill:f.color,stroke:f.color,'stroke-width':'.28','stroke-linejoin':'round'},group);});
    parent.replaceChildren(group);
  }
  return {project:project,position:position,mountPads:mountPads,aircraft:aircraft,pad:pad,data:data};
}));
