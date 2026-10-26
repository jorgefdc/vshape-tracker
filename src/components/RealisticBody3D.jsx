import React,{useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {MarchingCubes} from 'three/examples/jsm/objects/MarchingCubes.js';
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
function skinTexture(){
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const ctx=canvas.getContext('2d'),im=ctx.createImageData(256,256);
 for(let i=0;i<im.data.length;i+=4){const n=(Math.random()-.5)*18;im.data[i]=216+n;im.data[i+1]=159+n;im.data[i+2]=131+n;im.data[i+3]=255}
 ctx.putImageData(im,0,0);const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,5);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function createFigure(m,sex,fat,definition,veins,compact=false){
 // Implicit surface: all limbs and torso blend into ONE continuous skin mesh.
 // No overlapping spheres/cylinders or visible seams at the joints.
 const group=new THREE.Group(),texture=skinTexture(),isFemale=sex==='female';
 const skin=new THREE.MeshPhysicalMaterial({color:0xffd2b6,map:texture,roughness:.82,metalness:0,clearcoat:.025,side:THREE.DoubleSide});
 const f=clamp(fat,8,50),mus=clamp(definition/100,0,1);
 const sh=clamp(val(m?.shoulders,112)/112,.75,1.35)*(isFemale?.91:1);
 const ch=clamp(val(m?.chest,98)/98,.75,1.35);
 const wa=clamp(val(m?.waist,82)/82,.7,1.6);
 const hi=clamp(val(m?.hips,95)/95,.75,1.5)*(isFemale?1.12:1);
 const ar=clamp(val(m?.arm,33)/33,.65,1.6);
 const th=clamp(val(m?.thigh,55)/55,.7,1.5);
 const ca=clamp(val(m?.calf,36)/36,.65,1.5);
 const bodyHeight=clamp(val(m?.height,175)/175,.85,1.15);
 const fatExpand=1+Math.max(0,f-19)*.011,definitionFactor=1+mus*.07;
 const effect=new MarchingCubes(compact?24:32,skin,true,false,40000);
 // UV buffer must be allocated by the constructor; toggling enableUvs later crashes update().effect.isolation=80;effect.reset();
 // addBall uses normalized [0..1] coordinates; mesh uses [-1..1] positions.
 // Several smaller, overlapping influences create smooth, continuous anatomical transitions.
 const add=(x,y,z,r,weight=1)=>{
   const nx=(x+2.25)/4.5,ny=(y+.45)/4.5,nz=(z+2.25)/4.5;
   const radius=r/4.5;
   effect.addBall(nx,ny,nz,Math.max(.02,92*radius*radius*weight),12);
 };
 const chain=(a,b,r1,r2,count=6)=>{
   for(let i=0;i<=count;i++){const t=i/count;add(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t,r1+(r2-r1)*t,1.3)}
 };
 // Anatomical core: shoulders transition continuously into chest, waist and pelvis.
 chain([0,2.73,0],[0,1.64,0],.40*sh,.37*hi,17);
 for(const [y,r,z] of [[2.72,.37*sh,0],[2.56,.42*ch,0],[2.42,.39*ch,0],[2.24,.33*wa*fatExpand,0],[2.04,.32*wa*fatExpand,.025],[1.82,.36*hi,0],[1.66,.37*hi,-.015]])add(0,y,z,r,1.5);
 // The head and neck blend with the upper torso rather than being separate parts.
 chain([0,2.78,0],[0,3.13,0],.15,.15,6);
 add(0,3.21,0,.245,1.65);add(0,3.30,.025,.195,1.35);
 // Paired anatomy. Every joint has an overlapping transition.
 for(const side of [-1,1]){
  const shoulderX=side*.39*sh,upperX=side*.50*sh;
  chain([side*.25*sh,2.72,0],[shoulderX,2.63,0],.24,.205*sh,6);
  chain([shoulderX,2.63,0],[upperX,2.17,.01],.20*ar,.135*ar,11);
  chain([upperX,2.17,.01],[side*.55*sh,1.67,.08],.135*ar,.095*ar,12);
  add(side*.47*sh,2.41,.025,.16*ar,1.3);
  // Thighs are attached to the pelvis through a broad hip transition.
  const legX=side*.215*hi;
  chain([legX,1.69,0],[legX,1.03,.025],.225*th,.155*th,16);
  chain([legX,1.03,.025],[legX,.22,.045],.16*ca,.105*ca,16);
  add(legX,.60,-.05,.145*ca,1.25);
  chain([legX,.19,.045],[legX,.10,.20],.12,.13,4);
  // Pectoral and gluteal volume is fused into the main mesh.
  add(side*.19*ch,2.51,.10,.17*ch,1.2);
  add(side*.20*hi,1.65,-.10,.19*hi,1.25);
 }
 if(f>25){
  const extra=(f-25)/25;
  add(0,2.03,.10,.26*wa*(1+extra*.75),1.25);
  if(f>37)add(0,1.85,.13,.24*wa*(1+extra*.65),1.1);
 }
 effect.update();
 effect.position.y=1.8;effect.scale.setScalar(2.25*bodyHeight);
 effect.castShadow=true;effect.receiveShadow=true;effect.userData.muscle='abdomen';group.add(effect);
 // Delicate non-structural skin details: no extra overlapping body meshes.
 const veinMaterial=new THREE.MeshStandardMaterial({color:0x8c7771,roughness:.9,transparent:true,opacity:.22});
 const details=[];
 if(veins&&f<18&&mus>.65)for(const side of [-1,1]){
  const curve=new THREE.CatmullRomCurve3([
   new THREE.Vector3(side*.49*sh,2.46,.155),
   new THREE.Vector3(side*.51*sh,2.32,.145),
   new THREE.Vector3(side*.53*sh,2.20,.12)
  ]);
  const line=new THREE.Mesh(new THREE.TubeGeometry(curve,16,.002,4,false),veinMaterial);group.add(line);details.push(line);
 }
 return {group,dispose(){effect.geometry.dispose();texture.dispose();skin.dispose();veinMaterial.dispose();details.forEach(d=>d.geometry.dispose())}};
}
export default function RealisticBody3D({measurements,sex='male',fat=22,definition=55,veins=false,compact=false,angle=0,onAngleChange,onChooseExercise}){
 const host=useRef(null),sceneRef=useRef(null),[selected,setSelected]=useState('ombros'),[error,setError]=useState('');
 useEffect(()=>{
  const node=host.current;if(!node)return;let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'})}catch{setError('Este aparelho ou navegador não oferece WebGL.');return}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.2));renderer.setSize(node.clientWidth,compact?300:440);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.4;node.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,node.clientWidth/(compact?300:440),.1,100);camera.position.set(0,2.1,7.9);
  scene.add(new THREE.HemisphereLight(0xffffff,0x564a49,2.5));
  const key=new THREE.DirectionalLight(0xffe6d2,3);key.position.set(2,5,5);scene.add(key);
  const rim=new THREE.DirectionalLight(0xc6d8ff,1.5);rim.position.set(-3,3,-4);scene.add(rim);
  let figure;try{figure=createFigure(measurements,sex,fat,definition,veins,compact);scene.add(figure.group)}catch(err){console.error('Falha no avatar 3D:',err);setError('Não foi possível gerar o avatar 3D: '+(err?.message||'erro desconhecido'));renderer.dispose();renderer.domElement.remove();return}
  const controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.enableZoom=false;controls.enableDamping=true;controls.minPolarAngle=Math.PI/2;controls.maxPolarAngle=Math.PI/2;controls.target.set(0,1.73,0);controls.update();
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
  function pointerDown(e){down={x:e.clientX,y:e.clientY}}
  function pointerUp(e){if(!down)return;const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y);down=null;if(moved>9)return;const rect=renderer.domElement.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(figure.group.children,true);const hit=hits[0];if(hit){const p=hit.point.clone();const y=p.y;const x=Math.abs(p.x);const z=p.z;let muscle='abdomen';if(y>2.58&&x>.31)muscle='ombros';else if(y>2.45&&z<-.06)muscle='costas';else if(y>2.35&&z>.06)muscle='peito';else if(y>2.6)muscle='trapezio';else if(y>2.05&&x>.43)muscle=z>0?'biceps':'triceps';else if(y>1.5&&z<-.1)muscle='gluteos';else if(y>1.5)muscle='abdomen';else if(y>.85)muscle=z<0?'posterior':'quadriceps';else muscle='panturrilhas';setSelected(muscle)}}
  renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp);
  const resize=new ResizeObserver(()=>{if(!node.clientWidth)return;renderer.setSize(node.clientWidth,compact?300:440);camera.aspect=node.clientWidth/(compact?300:440);camera.updateProjectionMatrix()});resize.observe(node);
  let active=true,id;function render(){if(!active)return;try{controls.update();renderer.render(scene,camera)}catch(err){console.error('Falha ao desenhar avatar:',err);setError('Erro ao desenhar o avatar 3D: '+(err?.message||'erro desconhecido'));active=false;return}id=requestAnimationFrame(render)}render();
  sceneRef.current={figure,controls,camera};return()=>{active=false;cancelAnimationFrame(id);resize.disconnect();renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointerup',pointerUp);controls.dispose();figure.dispose();renderer.dispose();renderer.domElement.remove();sceneRef.current=null};
 },[measurements,sex,fat,definition,veins,compact]);
 useEffect(()=>{if(!sceneRef.current)return;const theta=angle*Math.PI/180,dist=7.9;sceneRef.current.camera.position.set(Math.sin(theta)*dist,2.1,Math.cos(theta)*dist);sceneRef.current.controls.update()},[angle]);
 return <div className="real-body"><div ref={host} className="real-body-canvas"/>{error&&<p>{error}</p>}{!compact&&<><div className="avatar-turn"><button className="outline" onClick={()=>onAngleChange?.((angle+315)%360)}>↶ 45°</button><span>Gire o corpo com o dedo</span><button className="outline" onClick={()=>onAngleChange?.((angle+45)%360)}>45° ↷</button></div><p className="hint">Avatar 3D ilustrativo. Definição, veias e dobras são estimativas visuais, não reconstrução médica.</p><div className="muscle-chips">{Object.keys(EX).map(key=><button key={key} className={selected===key?'active':''} onClick={()=>setSelected(key)}>{NAMES[key]}</button>)}</div><h2>{NAMES[selected]} — exercícios</h2>{EX[selected].map(name=><div className="line" key={name}><span>{name}</span>{onChooseExercise&&<button className="outline" onClick={()=>onChooseExercise(name,selected)}>Adicionar</button>}</div>)}</>}</div>;
}
