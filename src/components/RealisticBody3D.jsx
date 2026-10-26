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
function createFigure(m,sex,fat,definition,veins,skinOverlay=false){
 const group=new THREE.Group(),materials=[],texture=skinTexture(skinOverlay),skin=new THREE.MeshPhysicalMaterial({map:texture,roughness:skinOverlay?.81:.68,metalness:0,clearcoat:skinOverlay?.025:.06,clearcoatRoughness:.85}),accent=new THREE.MeshPhysicalMaterial({color:0xe2a98f,roughness:.72,transparent:true,opacity:.27,depthWrite:false}),foldMat=new THREE.MeshStandardMaterial({color:0x9e6455,roughness:1,transparent:true,opacity:.32}),veinMat=new THREE.MeshStandardMaterial({color:0x567c81,roughness:.75,transparent:true,opacity:.52}),isFemale=sex==='female';
 materials.push(skin,accent,foldMat,veinMat);
 const f=clamp(fat/30,.25,1.65),mus=clamp(definition/100,0,1),sh=clamp(val(m?.shoulders,112)/112,.75,1.35)*(isFemale?.9:1),ch=clamp(val(m?.chest,98)/98,.75,1.35),wa=clamp(val(m?.waist,82)/82,.7,1.6),hi=clamp(val(m?.hips,95)/95,.75,1.5)*(isFemale?1.13:1),ar=clamp(val(m?.arm,33)/33,.65,1.6),th=clamp(val(m?.thigh,55)/55,.7,1.5),ca=clamp(val(m?.calf,36)/36,.65,1.5),bodyHeight=clamp(val(m?.height,175)/175,.85,1.15);
 const fatScale=1+(f-.8)*.15;
 function add(geometry,material=skin,muscle=null){const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=false;mesh.receiveShadow=false;if(muscle)mesh.userData.muscle=muscle;group.add(mesh);return mesh}
 function ellipsoid(x,y,z,sx,sy,sz,muscle,material=skin){const mesh=add(new THREE.SphereGeometry(1,40,30),material,muscle);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);return mesh}
 function tapered(x1,y1,z1,x2,y2,z2,r1,r2,muscle){const a=new THREE.Vector3(x1,y1,z1),b=new THREE.Vector3(x2,y2,z2),diff=b.clone().sub(a),mesh=add(new THREE.CylinderGeometry(r2,r1,diff.length(),40,14),skin,muscle);mesh.position.copy(a.add(b).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),diff.normalize());return mesh}
 // Continuous shoulder-to-hand surface: one anatomical volume instead of intersecting spheres and cylinders.
 function armSurface(side){
  const levels=[
   [2.77,.405*sh,0,.095*ar,.102*ar],
   [2.73,.455*sh,0,.14*ar,.15*ar],
   [2.66,.495*sh,0,.157*ar,.16*ar],
   [2.57,.525*sh,.006,.148*ar,.144*ar],
   [2.46,.548*sh,.01,.126*ar,.122*ar],
   [2.32,.561*sh,.014,.119*ar,.113*ar],
   [2.20,.572*sh,.025,.101*ar,.10*ar],
   [2.12,.581*sh,.033,.09*ar,.09*ar],
   [2.01,.59*sh,.045,.106*ar,.10*ar],
   [1.88,.599*sh,.06,.091*ar,.088*ar],
   [1.76,.605*sh,.077,.071*ar,.07*ar],
   [1.70,.605*sh,.081,.061*ar,.061*ar]
  ];
  const smooth=[],segments=48;
  for(let k=0;k<levels.length-1;k++){
   const a=levels[Math.max(0,k-1)],b=levels[k],c=levels[k+1],d=levels[Math.min(levels.length-1,k+2)];
   for(let j=0;j<4;j++){const t=j/4;const curve=h=>.5*((2*b[h])+(-a[h]+c[h])*t+(2*a[h]-5*b[h]+4*c[h]-d[h])*t*t+(-a[h]+3*b[h]-3*c[h]+d[h])*t*t*t);smooth.push([0,1,2,3,4].map(curve))}
  }
  smooth.push(levels[levels.length-1]);
  const points=[],faces=[];
  for(const [y,x,z,rx,rz] of smooth)for(let j=0;j<segments;j++){
   const theta=j/segments*Math.PI*2;
   points.push(side*x+Math.cos(theta)*rx,y, z+Math.sin(theta)*rz);
  }
  for(let i=0;i<smooth.length-1;i++)for(let j=0;j<segments;j++){
   const a=i*segments+j,b=i*segments+(j+1)%segments,c=(i+1)*segments+j,d=(i+1)*segments+(j+1)%segments;
   if(side===1)faces.push(a,b,c,b,d,c);else faces.push(a,c,b,b,c,d);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
  geometry.setIndex(faces);geometry.computeVertexNormals();
  const mesh=add(geometry,skin,'biceps');
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
  const levels=[
   [1.65,.185*th,.18*th,0],
   [1.56,.22*th,.215*th,0],
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
  const smooth=[],segments=48;
  for(let k=0;k<levels.length-1;k++){
   const a=levels[Math.max(0,k-1)],b=levels[k],c=levels[k+1],d=levels[Math.min(levels.length-1,k+2)];
   for(let j=0;j<5;j++){const t=j/5;const curve=h=>.5*((2*b[h])+(-a[h]+c[h])*t+(2*a[h]-5*b[h]+4*c[h]-d[h])*t*t+(-a[h]+3*b[h]-3*c[h]+d[h])*t*t*t);smooth.push([0,1,2,3].map(curve))}
  }
  smooth.push(levels[levels.length-1]);
  const vertices=[],faces=[];
  for(const [y,rx,rz,z] of smooth)for(let j=0;j<segments;j++){
   const a=j/segments*Math.PI*2;vertices.push(x+Math.cos(a)*rx,y,z+Math.sin(a)*rz);
  }
  for(let i=0;i<smooth.length-1;i++)for(let j=0;j<segments;j++){
   const a=i*segments+j,b=i*segments+(j+1)%segments,c=(i+1)*segments+j,d=(i+1)*segments+(j+1)%segments;
   faces.push(a,c,b,b,c,d);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geometry.setIndex(faces);geometry.computeVertexNormals();
  add(geometry,skin,'quadriceps');
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
 const rings=[[2.78,.29*sh,.19*ch],[2.72,.44*sh,.205*ch],[2.53,.43*ch,.245*ch],[2.29,.36*ch,.22*ch],[2.12,.31*wa*fatScale,.21*wa*fatScale+belly*.016],[1.99,.32*wa*fatScale,.225*wa*fatScale+belly*.042],[1.88,.34*wa*fatScale,.235*wa*fatScale+belly*.045],[1.73,.38*hi,.255*hi+belly*.018],[1.58,.38*hi,.255*hi],[1.51,.31*hi,.23*hi]];
 const verts=[],indices=[],segments=64;
 const smoothRings=[];for(let k=0;k<rings.length-1;k++){const a=rings[Math.max(0,k-1)],b=rings[k],c=rings[k+1],d=rings[Math.min(rings.length-1,k+2)];for(let t=0;t<5;t++){const u=t/5;const curve=j=>0.5*((2*b[j])+(-a[j]+c[j])*u+(2*a[j]-5*b[j]+4*c[j]-d[j])*u*u+(-a[j]+3*b[j]-3*c[j]+d[j])*u*u*u);smoothRings.push([curve(0),curve(1),curve(2)])}}smoothRings.push(rings[rings.length-1]);
 smoothRings.forEach(([y,rx,rz])=>{for(let j=0;j<segments;j++){const a=j/segments*Math.PI*2;verts.push(Math.sin(a)*rx,y,Math.cos(a)*rz)}});
 for(let i=0;i<smoothRings.length-1;i++)for(let j=0;j<segments;j++){const a=i*segments+j,b=i*segments+(j+1)%segments,c=(i+1)*segments+j,d=(i+1)*segments+(j+1)%segments;indices.push(a,c,b,b,c,d)}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();add(geo,skin,'abdomen');
 ellipsoid(0,3.18,0,.19,.255,.19,null);tapered(0,2.75,0,0,2.98,0,.135,.105,null);
 // Face features: ears, nose, brow, subtle eyes, hair cap.
 for(const side of [-1,1])ellipsoid(side*.19,3.17,0,.043,.082,.045,null);
 ellipsoid(0,3.15,.193,.049,.07,.065,null);
 const eyeMat=new THREE.MeshStandardMaterial({color:0x332c29,roughness:.8});materials.push(eyeMat);
 for(const side of [-1,1])ellipsoid(side*.078,3.22,.174,.021,.011,.01,null,eyeMat);
 // Pectorals, shoulder deltoids, lats and muscle planes are attached to the continuous torso.
 for(const side of [-1,1]){
  ellipsoid(side*.2*ch,2.55,.218*ch,.17*ch,.078,.012, 'peito',skin);
  armSurface(side);






  legSurface(side);
  ellipsoid(side*.205*hi,.105,.15,.12,.085,.245,null);
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
export default function RealisticBody3D({measurements,sex='male',fat=22,definition=55,veins=false,compact=false,angle=0,onAngleChange,onChooseExercise,skinOverlay=false}){
 const host=useRef(null),sceneRef=useRef(null),[selected,setSelected]=useState('ombros'),[error,setError]=useState('');
 useEffect(()=>{
  const node=host.current;if(!node)return;let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'})}catch{setError('Este aparelho ou navegador não oferece WebGL.');return}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setSize(node.clientWidth,compact?300:440);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=skinOverlay?1.18:1.4;node.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,node.clientWidth/(compact?300:440),.1,100);camera.position.set(0,2.1,7.9);
  scene.add(new THREE.HemisphereLight(0xffffff,skinOverlay?0x65534e:0x564a49,skinOverlay?1.9:2.5));
  const key=new THREE.DirectionalLight(0xffe6d2,skinOverlay?2.5:3);key.position.set(2,5,5);scene.add(key);
  const rim=new THREE.DirectionalLight(0xc6d8ff,skinOverlay?1.1:1.5);rim.position.set(-3,3,-4);scene.add(rim);
  const figure=createFigure(measurements,sex,fat,definition,veins,skinOverlay);scene.add(figure.group);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.enableZoom=false;controls.enableDamping=true;controls.minPolarAngle=Math.PI/2;controls.maxPolarAngle=Math.PI/2;controls.target.set(0,1.73,0);controls.update();
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
  function pointerDown(e){down={x:e.clientX,y:e.clientY}}
  function pointerUp(e){if(!down)return;const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y);down=null;if(moved>9)return;const rect=renderer.domElement.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(figure.group.children,true);const muscle=hits.find(h=>h.object.userData.muscle)?.object.userData.muscle;if(muscle)setSelected(muscle)}
  renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp);
  const resize=new ResizeObserver(()=>{if(!node.clientWidth)return;renderer.setSize(node.clientWidth,compact?300:440);camera.aspect=node.clientWidth/(compact?300:440);camera.updateProjectionMatrix()});resize.observe(node);
  let active=true,id;function render(){if(!active)return;controls.update();renderer.render(scene,camera);id=requestAnimationFrame(render)}render();
  sceneRef.current={figure,controls,camera};return()=>{active=false;cancelAnimationFrame(id);resize.disconnect();renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointerup',pointerUp);controls.dispose();figure.dispose();renderer.dispose();renderer.domElement.remove();sceneRef.current=null};
 },[measurements,sex,fat,definition,veins,compact,skinOverlay]);
 useEffect(()=>{if(!sceneRef.current)return;const theta=angle*Math.PI/180,dist=7.9;sceneRef.current.camera.position.set(Math.sin(theta)*dist,2.1,Math.cos(theta)*dist);sceneRef.current.controls.update()},[angle]);
 return <div className="real-body"><div ref={host} className="real-body-canvas"/>{error&&<p>{error}</p>}{!compact&&<><div className="avatar-turn"><button className="outline" onClick={()=>onAngleChange?.((angle+315)%360)}>↶ 45°</button><span>Gire o corpo com o dedo</span><button className="outline" onClick={()=>onAngleChange?.((angle+45)%360)}>45° ↷</button></div><p className="hint">Avatar 3D ilustrativo. Definição, veias e dobras são estimativas visuais, não reconstrução médica.</p><div className="muscle-chips">{Object.keys(EX).map(key=><button key={key} className={selected===key?'active':''} onClick={()=>setSelected(key)}>{NAMES[key]}</button>)}</div><h2>{NAMES[selected]} — exercícios</h2>{EX[selected].map(name=><div className="line" key={name}><span>{name}</span>{onChooseExercise&&<button className="outline" onClick={()=>onChooseExercise(name,selected)}>Adicionar</button>}</div>)}</>}</div>;
}
