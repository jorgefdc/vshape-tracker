import React,{useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
const EX={
 ombros:['Elevação lateral','Desenvolvimento com halteres','Crucifixo inverso'],
 peito:['Supino reto','Supino inclinado','Crossover na polia'],
 costas:['Barra fixa','Puxada alta','Remada apoiada','Remada unilateral'],
 trapezio:['Encolhimento com halteres','Face pull'],
 biceps:['Rosca direta','Rosca martelo'],
 triceps:['Tríceps na polia','Tríceps francês'],
 abdomen:['Prancha','Abdominal na polia','Elevação de pernas'],
 gluteos:['Elevação pélvica','Afundo','Agachamento livre'],
 quadriceps:['Agachamento livre','Leg press','Cadeira extensora'],
 posterior:['Terra romeno','Mesa flexora'],
 panturrilhas:['Panturrilha em pé','Panturrilha sentado']
};
const NAMES={ombros:'Ombros',peito:'Peito',costas:'Costas',trapezio:'Trapézio',biceps:'Bíceps',triceps:'Tríceps',abdomen:'Abdômen',gluteos:'Glúteos',quadriceps:'Quadríceps',posterior:'Posterior de coxa',panturrilhas:'Panturrilhas'};
const val=(v,d)=>{const n=Number(v);return Number.isFinite(n)&&n>0?n:d},clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function skinTexture(enhanced=false){
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const ctx=canvas.getContext('2d'),im=ctx.createImageData(256,256);
 for(let i=0;i<im.data.length;i+=4){const n=(Math.random()-.5)*(enhanced?11:18),freckle=enhanced&&Math.random()<.0015?-22:0;im.data[i]=216+n+freckle;im.data[i+1]=159+n+freckle;im.data[i+2]=131+n+freckle;im.data[i+3]=255}
 ctx.putImageData(im,0,0);const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,5);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function createFigure(m,sex,fat,definition,veins,skinOverlay=false,style={}){
 const group=new THREE.Group(),materials=[],texture=skinTexture(skinOverlay),skin=new THREE.MeshPhysicalMaterial({map:texture,roughness:skinOverlay?.87:.82,metalness:0,clearcoat:skinOverlay?.01:.015,clearcoatRoughness:.85}),accent=new THREE.MeshPhysicalMaterial({color:0xe2a98f,roughness:.72,transparent:true,opacity:.27,depthWrite:false}),foldMat=new THREE.MeshStandardMaterial({color:0x9e6455,roughness:1,transparent:true,opacity:.32}),veinMat=new THREE.MeshStandardMaterial({color:0x567c81,roughness:.75,transparent:true,opacity:.52}),isFemale=sex==='female';
 // Procedural visual skin layer: follows each mesh in 360 degrees without a flat image.
 // This is a stylized material, not the photorealistic mesh from the concept illustration.
 if(skinOverlay){
  skin.map=null;
  skin.color.set(0xd8a486);
  skin.roughness=.78;
  skin.clearcoat=.035;
  skin.onBeforeCompile=shader=>{
   shader.vertexShader=shader.vertexShader.replace(
    '#include <common>',
    '#include <common>\nvarying vec3 vSkinLocal;'
   ).replace(
    '#include <begin_vertex>',
    '#include <begin_vertex>\nvSkinLocal=position;'
   );
   shader.fragmentShader=shader.fragmentShader.replace(
    '#include <common>',
    '#include <common>\nvarying vec3 vSkinLocal;'
   ).replace(
    '#include <color_fragment>',
    `#include <color_fragment>
    float skinNoise=sin(vSkinLocal.x*91.0+sin(vSkinLocal.y*57.0))*sin(vSkinLocal.z*83.0-vSkinLocal.y*39.0);
    float skinTone=0.986+0.014*skinNoise;
    diffuseColor.rgb*=skinTone;
    `
   );
  };
  skin.customProgramCacheKey=()=> 'vshape-skin-v2';
 }
 const tones={claro:'#f2c9a8',medio:'#c68d64',moreno:'#95613e',escuro:'#593b2e'};
 skin.color.set(tones[style.skinTone]||tones.medio);
 if(skinOverlay)skin.map=null;
 const shirtMat=new THREE.MeshStandardMaterial({color:style.shirtColor||'#2563eb',roughness:.94,side:THREE.DoubleSide});
 const shortsMat=new THREE.MeshStandardMaterial({color:style.shortsColor||'#222c3e',roughness:.91,side:THREE.DoubleSide});
 materials.push(skin,accent,foldMat,veinMat,shirtMat,shortsMat);
 const muscleMode=style?.muscleSkin===true;
 const bump=(v,c,w)=>Math.exp(-Math.pow((v-c)/w,2));
 const muscleMat=new THREE.MeshStandardMaterial({color:0xb33d38,roughness:.88,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 const muscleDark=new THREE.MeshStandardMaterial({color:0x7f2928,roughness:.94,side:THREE.DoubleSide});
 materials.push(muscleMat,muscleDark);
 const f=clamp(fat/30,.25,1.65),mus=clamp(definition/100,0,1),sh=clamp(val(m?.shoulders,112)/112,.75,1.35)*(isFemale?.9:1),ch=clamp(val(m?.chest,98)/98,.75,1.35),wa=clamp(val(m?.waist,82)/82,.7,1.6),hi=clamp(val(m?.hips,95)/95,.75,1.5)*(isFemale?1.13:1),ar=clamp(val(m?.arm,33)/33,.65,1.6),th=clamp(val(m?.thigh,55)/55,.7,1.5),ca=clamp(val(m?.calf,36)/36,.65,1.5),bodyHeight=clamp(val(m?.height,175)/175,.85,1.15);
 const relief=muscleMode?(.025+.075*mus)*clamp((34-fat)/20,.35,1.35):0;
 if(muscleMode){skin.roughness=.92;skin.clearcoat=0;}
 const fatScale=1+(f-.8)*.15;
 function add(geometry,material=skin,muscle=null){const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=false;mesh.receiveShadow=false;if(muscle)mesh.userData.muscle=muscle;group.add(mesh);return mesh}
 function ellipsoid(x,y,z,sx,sy,sz,muscle,material=skin){const mesh=add(new THREE.SphereGeometry(1,64,48),material,muscle);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);return mesh}
 function tapered(x1,y1,z1,x2,y2,z2,r1,r2,muscle){const a=new THREE.Vector3(x1,y1,z1),b=new THREE.Vector3(x2,y2,z2),diff=b.clone().sub(a),mesh=add(new THREE.CylinderGeometry(r2,r1,diff.length(),40,14),skin,muscle);mesh.position.copy(a.add(b).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),diff.normalize());return mesh}
 // Continuous shoulder-to-hand surface: one anatomical volume instead of intersecting spheres and cylinders.
 function armSurface(side){
  const levels=[
   [2.77,.385*sh,0,.11*ar,.11*ar],
   [2.73,.435*sh,0,.155*ar,.155*ar],
   [2.66,.49*sh,0,.169*ar,.168*ar],
   [2.57,.525*sh,.006,.148*ar,.144*ar],
   [2.46,.548*sh,.01,.126*ar,.122*ar],
   [2.32,.561*sh,.014,.119*ar,.113*ar],
   [2.20,.572*sh,.025,.101*ar,.10*ar],
   [2.12,.581*sh,.033,.09*ar,.09*ar],
   [2.01,.59*sh,.045,.106*ar,.10*ar],
   [1.88,.599*sh,.06,.091*ar,.088*ar],
   [1.76,.605*sh,.077,.071*ar,.07*ar],
   [1.70,.605*sh,.081,.061*ar,.061*ar],
   [1.63,.607*sh,.087,.065*ar,.047*ar],
   [1.57,.607*sh,.094,.058*ar,.034*ar],
   [1.53,.606*sh,.096,.035*ar,.022*ar]
  ];
  const smooth=[],segments=80;
  for(let k=0;k<levels.length-1;k++){
   const a=levels[Math.max(0,k-1)],b=levels[k],c=levels[k+1],d=levels[Math.min(levels.length-1,k+2)];
   for(let j=0;j<4;j++){const t=j/4;const curve=h=>.5*((2*b[h])+(-a[h]+c[h])*t+(2*a[h]-5*b[h]+4*c[h]-d[h])*t*t+(-a[h]+3*b[h]-3*c[h]+d[h])*t*t*t);smooth.push([0,1,2,3,4].map(curve))}
  }
  smooth.push(levels[levels.length-1]);
  const points=[],faces=[];
  for(const [y,x,z,rx,rz] of smooth)for(let j=0;j<segments;j++){
   const theta=j/segments*Math.PI*2;
   const swell=relief*(.8*bump(y,2.66,.13)+.6*bump(y,2.42,.16)+.35*bump(y,2.01,.15));
   points.push(side*x+Math.cos(theta)*(rx+swell),y,z+Math.sin(theta)*(rz+swell));
  }
  for(let i=0;i<smooth.length-1;i++)for(let j=0;j<segments;j++){
   const a=i*segments+j,b=i*segments+(j+1)%segments,c=(i+1)*segments+j,d=(i+1)*segments+(j+1)%segments;
   faces.push(a,b,c,b,d,c);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
  geometry.setIndex(faces);geometry.computeVertexNormals();
  const mesh=add(geometry,skin,'biceps');
  if(false){
   // Raised anatomical bands follow the parametric arm surface, rather than floating spheres.
   for(const [top,bottom,arc,muscle] of [[2.69,2.49,1.35,'ombros'],[2.47,2.19,.92,'biceps'],[2.13,1.87,.85,'biceps']]){
    const vv=[],ff=[],n=18;
    const rows=smooth.filter(q=>q[0]<=top&&q[0]>=bottom);
    for(const [y,x,z,rx,rz] of rows)for(let j=0;j<=n;j++){
     const a=-arc/2+arc*j/n;
     vv.push(side*x+Math.cos(a)*(rx+.007),y,z+Math.sin(a)*(rz+.007));
    }
    for(let i=0;i<rows.length-1;i++)for(let j=0;j<n;j++){const a=i*(n+1)+j,b=a+1,d=a+n+1;ff.push(a,b,d,b,d+1,d)}
    if(ff.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vv,3));g.setIndex(ff);g.computeVertexNormals();add(g,muscleMat,muscle)}
   }
  }
  if(style.clothing==='casual'&&!muscleMode){
   const sleeveVertices=[],sleeveFaces=[];
   for(const [y,x,z,rx,rz] of smooth)for(let j=0;j<segments;j++){const theta=j/segments*Math.PI*2;sleeveVertices.push(side*x+Math.cos(theta)*rx*1.09,y,z+Math.sin(theta)*rz*1.09)}
   for(let i=0;i<smooth.length-1;i++)if(smooth[i][0]<=2.76&&smooth[i+1][0]>=2.47)for(let j=0;j<segments;j++){const a=i*segments+j,b=i*segments+(j+1)%segments,c=(i+1)*segments+j,d=(i+1)*segments+(j+1)%segments;sleeveFaces.push(a,b,c,b,d,c)}
   const sleeveGeo=new THREE.BufferGeometry();sleeveGeo.setAttribute('position',new THREE.Float32BufferAttribute(sleeveVertices,3));sleeveGeo.setIndex(sleeveFaces);sleeveGeo.computeVertexNormals();add(sleeveGeo,shirtMat);
  }
  // Hit areas preserve muscle-specific interaction without adding visible seams.
  const hitMaterial=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false});
  materials.push(hitMaterial);
  const hit=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),hitMaterial);
  hit.position.set(side*.49*sh,2.66,0);hit.scale.set(.15*ar,.145,.15*ar);
  hit.userData.muscle='ombros';group.add(hit);
  return mesh;
 }
 // Continuous hip-to-ankle mesh with gradually varying thigh, knee and calf volume.
 function legSurface(side){
  const x=side*.205*hi;
  // Extend upper thigh inside pelvis to hide the former flat joint seam.
  const levels=[
   [1.80,.155*th,.155*th,-.005],
   [1.74,.192*th,.185*th,-.005],
   [1.65,.225*th,.212*th,0],
   [1.56,.235*th,.22*th,0],
   [1.43,.225*th,.205*th,.01],
   [1.28,.208*th,.19*th,.015],
   [1.12,.183*th,.167*th,.02],
   [.96,.157*th,.15*th,.025],
   [.85,.13*th,.128*th,.03],
   [.76,.119*ca,.12*ca,.035],
   [.65,.133*ca,.14*ca,.025],
   [.54,.147*ca,.15*ca,.01],
   [.42,.13*ca,.134*ca,.015],
   [.30,.108*ca,.109*ca,.025],
   [.18,.086*ca,.089*ca,.035],
   [.11,.08*ca,.085*ca,.04]
  ];
  const smooth=[],segments=80;
  for(let k=0;k<levels.length-1;k++){
   const a=levels[Math.max(0,k-1)],b=levels[k],c=levels[k+1],d=levels[Math.min(levels.length-1,k+2)];
   for(let j=0;j<5;j++){const t=j/5;const curve=h=>.5*((2*b[h])+(-a[h]+c[h])*t+(2*a[h]-5*b[h]+4*c[h]-d[h])*t*t+(-a[h]+3*b[h]-3*c[h]+d[h])*t*t*t);smooth.push([0,1,2,3].map(curve))}
  }
  smooth.push(levels[levels.length-1]);
  const vertices=[],faces=[];
  for(const [y,rx,rz,z] of smooth)for(let j=0;j<segments;j++){
   const a=j/segments*Math.PI*2;const swell=relief*(.8*bump(y,1.35,.24)+.65*bump(y,.56,.16));vertices.push(x+Math.cos(a)*(rx+swell),y,z+Math.sin(a)*(rz+swell));
  }
  for(let i=0;i<smooth.length-1;i++)for(let j=0;j<segments;j++){
   const a=i*segments+j,b=i*segments+(j+1)%segments,c=(i+1)*segments+j,d=(i+1)*segments+(j+1)%segments;
   faces.push(a,b,c,b,d,c);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geometry.setIndex(faces);geometry.computeVertexNormals();
  add(geometry,skin,'quadriceps');
  if(false){
   const bands=[{top:1.52,bottom:.99,angle:Math.PI/2,span:1.25,muscle:'quadriceps'},{top:.68,bottom:.36,angle:Math.PI/2,span:1.05,muscle:'panturrilhas'}];
   for(const band of bands){const rows=smooth.filter(q=>q[0]<=band.top&&q[0]>=band.bottom),vv=[],ff=[],n=24;
    for(const [y,rx,rz,z] of rows)for(let j=0;j<=n;j++){const a=band.angle-band.span/2+band.span*j/n;vv.push(x+Math.cos(a)*(rx+.009),y,z+Math.sin(a)*(rz+.009))}
    for(let i=0;i<rows.length-1;i++)for(let j=0;j<n;j++){const a=i*(n+1)+j,b=a+1,d=a+n+1;ff.push(a,d,b,b,d,d+1)}
    if(ff.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vv,3));g.setIndex(ff);g.computeVertexNormals();add(g,muscleMat,band.muscle)}
   }
  }
  if(style.clothing==='casual'&&!muscleMode){
   const shortVertices=[],shortFaces=[];
   const hem=1.02,waist=1.78;
   const shortRings=smooth.filter(([y])=>y<=waist&&y>=hem);
   // Build a loose fabric tube from hip to mid-thigh, not skin-tight anatomical paint.
   for(const [y,rx,rz,z] of shortRings){
    const ease=.045+Math.max(0,(1.5-y))*.035;
    for(let j=0;j<segments;j++){const a=j/segments*Math.PI*2;shortVertices.push(x+Math.cos(a)*(rx+ease),y,z+Math.sin(a)*(rz+ease))}
   }
   for(let i=0;i<shortRings.length-1;i++)for(let j=0;j<segments;j++){const a=i*segments+j,b=i*segments+(j+1)%segments,c=(i+1)*segments+j,d=(i+1)*segments+(j+1)%segments;shortFaces.push(a,b,c,b,d,c)}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(shortVertices,3));g.setIndex(shortFaces);g.computeVertexNormals();add(g,shortsMat);
  }
  // Invisible hit regions keep posterior and calf selection available.
  const hitMaterial=new THREE.MeshBasicMaterial({visible:false});
  materials.push(hitMaterial);
  for(const [muscle,y,z,rx,ry,rz] of [['posterior',1.18,-.15,.17,.3,.13],['panturrilhas',.55,0,.14,.22,.14],['gluteos',1.58,-.12,.2,.16,.13]]){
   const hit=new THREE.Mesh(new THREE.SphereGeometry(1,12,10),hitMaterial);
   hit.position.set(x,y,z);hit.scale.set(rx,ry,rz);hit.userData.muscle=muscle;group.add(hit);
  }
 }
 // Smooth lofted torso with continuous shoulder, waist and pelvis contours.
 const belly=clamp((fat-19)/24,0,1.3);
 const rings=[[2.78,.29*sh,.19*ch],[2.72,.44*sh,.205*ch],[2.53,.43*ch,.245*ch],[2.29,.36*ch,.22*ch],[2.12,.31*wa*fatScale,.21*wa*fatScale+belly*.016],[1.99,.32*wa*fatScale,.225*wa*fatScale+belly*.042],[1.88,.34*wa*fatScale,.235*wa*fatScale+belly*.045],[1.73,.38*hi,.255*hi+belly*.018],[1.62,.375*hi,.25*hi],[1.54,.34*hi,.225*hi],[1.48,.29*hi,.195*hi],[1.43,.24*hi,.16*hi]];
 const verts=[],indices=[],segments=96;
 const smoothRings=[];for(let k=0;k<rings.length-1;k++){const a=rings[Math.max(0,k-1)],b=rings[k],c=rings[k+1],d=rings[Math.min(rings.length-1,k+2)];for(let t=0;t<5;t++){const u=t/5;const curve=j=>0.5*((2*b[j])+(-a[j]+c[j])*u+(2*a[j]-5*b[j]+4*c[j]-d[j])*u*u+(-a[j]+3*b[j]-3*c[j]+d[j])*u*u*u);smoothRings.push([curve(0),curve(1),curve(2)])}}smoothRings.push(rings[rings.length-1]);
 smoothRings.forEach(([y,rx,rz])=>{for(let j=0;j<segments;j++){const a=j/segments*Math.PI*2;const front=Math.max(0,Math.cos(a)),back=Math.max(0,-Math.cos(a));const pec=bump(y,2.44,.14)*bump(Math.abs(Math.sin(a)),.48,.3)*front;const abs=bump(y,2.04,.29)*bump(Math.abs(Math.sin(a)),.25,.22)*(1-.22*Math.cos((y-1.83)*35))*front;const lat=bump(y,2.37,.28)*bump(Math.abs(Math.sin(a)),.62,.25)*back;const scapula=bump(y,2.54,.17)*bump(Math.abs(Math.sin(a)),.38,.17)*back;const erector=bump(y,2.02,.42)*bump(Math.abs(Math.sin(a)),.14,.12)*back;const swell=relief*(pec*1.3+abs*.48+lat*.92+scapula*.38+erector*.36);verts.push(Math.sin(a)*(rx+swell),y,Math.cos(a)*(rz+swell))}});
 for(let i=0;i<smoothRings.length-1;i++)for(let j=0;j<segments;j++){const a=i*segments+j,b=i*segments+(j+1)%segments,c=(i+1)*segments+j,d=(i+1)*segments+(j+1)%segments;indices.push(a,c,b,b,c,d)}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();add(geo,skin,'abdomen');
 if(false){
  // Muscle plates conform to the torso loft. Separate curved regions form pectorals, abdominals and back.
  function torsoRegion(yTop,yBottom,center,halfWidth,muscle,material=muscleMat){
   const rows=smoothRings.filter(q=>q[0]<=yTop&&q[0]>=yBottom),vv=[],ff=[],n=24;
   for(const [y,rx,rz] of rows)for(let j=0;j<=n;j++){
    const a=center-halfWidth+2*halfWidth*j/n;
    vv.push(Math.sin(a)*(rx+.012),y,Math.cos(a)*(rz+.012));
   }
   for(let i=0;i<rows.length-1;i++)for(let j=0;j<n;j++){const a=i*(n+1)+j,b=a+1,d=a+n+1;ff.push(a,d,b,b,d,d+1)}
   if(ff.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vv,3));g.setIndex(ff);g.computeVertexNormals();add(g,material,muscle)}
  }
  for(const side of [-1,1]){
   torsoRegion(2.58,2.32,side*.53,.47,'peito');
   torsoRegion(2.28,1.94,side*.30,.26,'abdomen');
   torsoRegion(1.91,1.73,side*.31,.27,'abdomen');
   torsoRegion(2.62,2.24,side*2.63,.47,'costas');
   torsoRegion(2.24,1.91,side*2.69,.40,'costas');
  }
 }
 if(style.clothing==='casual'&&!muscleMode){
  // Independent fabric silhouette: smooth waist and hem, with room for chest and abdomen.
  const shirtRings=[];
  for(const [y,rx,rz] of smoothRings){
   if(y>2.74||y<1.57)continue;
   const extra=.055+(y<2.12?.035:0);
   shirtRings.push([y,rx+extra,rz+extra]);
  }
  const shirtVerts=[],shirtFaces=[];
  for(const [y,rx,rz] of shirtRings)for(let j=0;j<segments;j++){const a=j/segments*Math.PI*2;shirtVerts.push(Math.sin(a)*rx,y,Math.cos(a)*rz)}
  for(let i=0;i<shirtRings.length-1;i++)for(let j=0;j<segments;j++){const a=i*segments+j,b=i*segments+(j+1)%segments,c=(i+1)*segments+j,d=(i+1)*segments+(j+1)%segments;shirtFaces.push(a,c,b,b,c,d)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(shirtVerts,3));g.setIndex(shirtFaces);g.computeVertexNormals();add(g,shirtMat);
 }
 ellipsoid(0,3.18,0,.19,.255,.19,null);tapered(0,2.75,0,0,2.98,0,.135,.105,null);
 // Face features: ears, nose, brow, subtle eyes, hair cap.
 for(const side of [-1,1])ellipsoid(side*.19,3.17,0,.043,.082,.045,null);
 ellipsoid(0,3.15,.193,.049,.07,.065,null);
 const eyeMat=new THREE.MeshStandardMaterial({color:0x332c29,roughness:.8});materials.push(eyeMat);
 for(const side of [-1,1])ellipsoid(side*.078,3.22,.174,.021,.011,.01,null,eyeMat);
 // Pectorals, shoulder deltoids, lats and muscle planes are attached to the continuous torso.
 for(const side of [-1,1]){
  // Anatomical transition layer: embedded blended volumes reduce hard silhouette gaps.
 // The surface remains parametric so measurements still drive body proportions.
 // Soft junction volumes: embedded beneath the torso/limb surface to fill abrupt gaps.
  // Keep these small and mostly intersecting so they round silhouettes without creating visible balls.
  // Avoid intersecting transition spheres: they create hard visible contour seams.
  // The arm, torso and thigh lofts now provide the visible transition.
  armSurface(side);






  legSurface(side);
  const foot=ellipsoid(side*.205*hi,.105,.15,.115,.075,.235,null);
  foot.rotation.y=side*.055;
 }
 // Subtle abdominal definition appears at lower fat and greater muscular definition.
 if(fat<30&&mus>.35)for(const side of [-1,1])for(let j=0;j<3;j++){
  // Abdominal definition is indicated by lighting rather than raised disconnected plates.
 }
 // Abdominal volume is integrated into the continuous torso rings, avoiding detached belly meshes.
 // Vascular detail only when low body-fat and user explicitly enables it.
 if(veins&&fat<19&&mus>.55){
  for(const side of [-1,1]){
   for(let k=0;k<2;k++){
    const p=[new THREE.Vector3(side*(.52*sh+k*.014),2.48,.12),new THREE.Vector3(side*(.57*sh+k*.01),2.29,.135),new THREE.Vector3(side*(.58*sh+k*.01),2.12,.11)];
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p),18,.0025,5,false),veinMat,'biceps');
   }
  }
 }
 group.scale.setScalar(bodyHeight);return {group,dispose(){group.traverse(o=>{if(o.geometry)o.geometry.dispose()});materials.forEach(x=>x.dispose());texture.dispose()}};
}
export default function RealisticBody3D({measurements,sex='male',fat=22,definition=55,veins=false,compact=false,angle=0,onAngleChange,onChooseExercise,skinOverlay=false,style={}}){
 const host=useRef(null),sceneRef=useRef(null),[selected,setSelected]=useState('ombros'),[error,setError]=useState('');
 useEffect(()=>{
  const node=host.current;if(!node)return;let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'})}catch{setError('Este aparelho ou navegador não oferece WebGL.');return}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setSize(node.clientWidth,compact?300:440);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=skinOverlay?1.18:1.28;node.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,node.clientWidth/(compact?300:440),.1,100);camera.position.set(0,2.1,7.9);
  scene.add(new THREE.HemisphereLight(0xffffff,0x9c8b81,skinOverlay?2.25:2.65));
  const key=new THREE.DirectionalLight(0xffe6d2,skinOverlay?1.25:1.45);key.position.set(2,5,5);scene.add(key);
  const rim=new THREE.DirectionalLight(0xffe6d8,skinOverlay?.75:.9);rim.position.set(-3,3,-4);scene.add(rim);
  let figure;try{figure=createFigure(measurements,sex,fat,definition,veins,skinOverlay,style);scene.add(figure.group)}catch(e){console.error('Avatar 3D:',e);setError('Não foi possível gerar o avatar 3D. Tente o Modelo simples.');renderer.dispose();renderer.domElement.remove();return}
  const controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.enableZoom=false;controls.enableDamping=true;controls.minPolarAngle=Math.PI/2;controls.maxPolarAngle=Math.PI/2;controls.target.set(0,1.73,0);controls.update();
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
  function pointerDown(e){down={x:e.clientX,y:e.clientY}}
  function pointerUp(e){if(!down)return;const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y);down=null;if(moved>9)return;const rect=renderer.domElement.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(figure.group.children,true);const hit=hits.find(h=>h.object.userData.muscle);if(hit){let muscle=hit.object.userData.muscle;if(muscle==='abdomen'&&hit.point.z<0)muscle='costas';else if(muscle==='abdomen'&&hit.point.y>2.28)muscle='peito';setSelected(muscle)}}
  renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp);
  const resize=new ResizeObserver(()=>{if(!node.clientWidth)return;renderer.setSize(node.clientWidth,compact?300:440);camera.aspect=node.clientWidth/(compact?300:440);camera.updateProjectionMatrix()});resize.observe(node);
  let active=true,id;function render(){if(!active)return;try{controls.update();renderer.render(scene,camera);id=requestAnimationFrame(render)}catch(e){active=false;console.error('Renderização do avatar:',e);setError('Falha na renderização 3D. As medidas continuam salvas.')}}render();
  sceneRef.current={figure,controls,camera};return()=>{active=false;cancelAnimationFrame(id);resize.disconnect();renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointerup',pointerUp);controls.dispose();figure.dispose();renderer.dispose();renderer.domElement.remove();sceneRef.current=null};
 },[measurements,sex,fat,definition,veins,compact,skinOverlay,style?.skinTone,style?.clothing,style?.shirtColor,style?.shortsColor,style?.muscleSkin]);
 useEffect(()=>{if(!sceneRef.current)return;const theta=angle*Math.PI/180,dist=7.9;sceneRef.current.camera.position.set(Math.sin(theta)*dist,2.1,Math.cos(theta)*dist);sceneRef.current.controls.update()},[angle]);
 return <div className="real-body"><div ref={host} className="real-body-canvas"/>{error&&<p>{error}</p>}{!compact&&<><div className="avatar-turn"><button className="outline" onClick={()=>onAngleChange?.((angle+315)%360)}>↶ 45°</button><span>Gire o corpo com o dedo</span><button className="outline" onClick={()=>onAngleChange?.((angle+45)%360)}>45° ↷</button></div><p className="hint">Avatar 3D ilustrativo. Definição, veias e dobras são estimativas visuais, não reconstrução médica.</p><div className="muscle-chips">{Object.keys(EX).map(key=><button key={key} className={selected===key?'active':''} onClick={()=>setSelected(key)}>{NAMES[key]}</button>)}</div><h2>{NAMES[selected]} — exercícios</h2>{EX[selected].map(name=><div className="line" key={name}><span>{name}</span>{onChooseExercise&&<button className="outline" onClick={()=>onChooseExercise(name,selected)}>Adicionar</button>}</div>)}</>}</div>;
}
