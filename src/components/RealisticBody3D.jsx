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
 // Smooth lofted torso with continuous shoulder, waist and pelvis contours.
 const rings=[[2.78,.29*sh,.19*ch],[2.72,.44*sh,.205*ch],[2.53,.43*ch,.245*ch],[2.29,.36*ch,.22*ch],[2.12,.31*wa*fatScale,.21*wa*fatScale],[1.92,.33*wa*fatScale,.23*wa*fatScale],[1.73,.38*hi,.255*hi],[1.58,.38*hi,.255*hi],[1.51,.31*hi,.23*hi]];
 const verts=[],indices=[],segments=64;
 const smoothRings=[];for(let k=0;k<rings.length-1;k++){const a=rings[Math.max(0,k-1)],b=rings[k],c=rings[k+1],d=rings[Math.min(rings.length-1,k+2)];for(let t=0;t<5;t++){const u=t/5;const curve=j=>0.5*((2*b[j])+(-a[j]+c[j])*u+(2*a[j]-5*b[j]+4*c[j]-d[j])*u*u+(-a[j]+3*b[j]-3*c[j]+d[j])*u*u*u);smoothRings.push([curve(0),curve(1),curve(2)])}}smoothRings.push(rings[rings.length-1]);
 smoothRings.forEach(([y,rx,rz])=>{for(let j=0;j<segments;j++){const a=j/segments*Math.PI*2;verts.push(Math.sin(a)*rx,y,Math.cos(a)*rz)}});
 for(let i=0;i<smoothRings.length-1;i++)for(let j=0;j<segments;j++){const a=i*segments+j,b=i*segments+(j+1)%segments,c=(i+1)*segments+j,d=(i+1)*segments+(j+1)%segments;indices.push(a,c,b,b,c,d)}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();add(geo,skin,'abdomen');
 ellipsoid(0,3.18,0,.19,.255,.19,null);tapered(0,2.77,0,0,2.98,0,.11,.105,null);
 // Face features: ears, nose, brow, subtle eyes, hair cap.
 for(const side of [-1,1])ellipsoid(side*.19,3.17,0,.043,.082,.045,null);
 ellipsoid(0,3.15,.193,.049,.07,.065,null);
 const eyeMat=new THREE.MeshStandardMaterial({color:0x332c29,roughness:.8});materials.push(eyeMat);
 for(const side of [-1,1])ellipsoid(side*.078,3.22,.174,.021,.011,.01,null,eyeMat);
 // Pectorals, shoulder deltoids, lats and muscle planes are attached to the continuous torso.
 for(const side of [-1,1]){
  ellipsoid(side*.2*ch,2.55,.185*ch,.18*ch,.093,.042, 'peito',skin);
  ellipsoid(side*.36*sh,2.69,.005,.148*sh,.129,.133,'ombros');
  ellipsoid(side*.28*ch,2.51,-.206,.137,.25,.031,'costas');
  ellipsoid(side*.12,2.73,-.15,.132,.097,.05,'trapezio');
  tapered(side*.48*sh,2.64,0,side*.56*sh,2.20,.015,.145*ar,.12*ar,'biceps');
  ellipsoid(side*.56*sh,2.41,.075,.087*ar,.175,.075*ar,'biceps');
  ellipsoid(side*.56*sh,2.4,-.073,.085*ar,.17,.073*ar,'triceps');
  tapered(side*.56*sh,2.20,.015,side*.6*sh,1.72,.08,.112*ar,.072*ar,'triceps');
  ellipsoid(side*.205*hi,1.58,-.135,.21*hi,.18,.12,'gluteos');
  tapered(side*.205*hi,1.52,0,side*.205*hi,.84,.03,.22*th,.13*th,'quadriceps');
  ellipsoid(side*.205*hi,1.19,.095,.14*th,.265,.076*th,'quadriceps');
  ellipsoid(side*.205*hi,1.19,-.1,.13*th,.255,.075*th,'posterior');
  tapered(side*.205*hi,.84,.03,side*.205*hi,.14,.045,.12*ca,.075*ca,'panturrilhas');
  ellipsoid(side*.205*hi,.58,-.042,.099*ca,.2,.087*ca,'panturrilhas');
  ellipsoid(side*.205*hi,.105,.15,.12,.085,.245,null);
 }
 // Subtle abdominal definition appears at lower fat and greater muscular definition.
 if(fat<30&&mus>.35)for(const side of [-1,1])for(let j=0;j<3;j++){
  const mesh=ellipsoid(side*.11,2.34-j*.145,.207*wa,.075,.047,.005,'abdomen',accent);mesh.material=accent;
 }
 // Fat-dependent lower abdominal apron and fold shadows; approximation, not diagnosis.
 if(fat>25){
  const volume=clamp((fat-25)/25,0,1);
  ellipsoid(0,1.97,.19*wa+volume*.045,.3*wa*fatScale,.13+volume*.12,.095+volume*.14,'abdomen');
  for(let j=0;j<(fat>38?2:1);j++){
   const points=[];for(let i=0;i<=32;i++){const x=(i/32-.5)*.53*wa*fatScale;points.push(new THREE.Vector3(x,1.88-j*.11+Math.cos(x*5)*.015,.29*wa+volume*.12))}
   const curve=new THREE.CatmullRomCurve3(points);add(new THREE.TubeGeometry(curve,36,.005+volume*.004,5,false),foldMat,'abdomen');
  }
 }
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
