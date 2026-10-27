import React,{useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {createMaleSkeletonV1} from './MaleSkeletonV1.js';

export default function MaleSkeletonViewer(){
 const holder=useRef(null),orbit=useRef(null);
 const [message,setMessage]=useState('');
 const [view,setView]=useState('front');
 useEffect(()=>{
  const node=holder.current;if(!node)return;
  let renderer,controls,resize,frame,disposed=false,model;
  const scene=new THREE.Scene();scene.background=new THREE.Color('#111b29');
  const camera=new THREE.PerspectiveCamera(38,1,.02,50);
  const hemi=new THREE.HemisphereLight(0xdceaff,0x78664d,2.4);scene.add(hemi);
  const key=new THREE.DirectionalLight(0xffefdc,3.1);key.position.set(3.4,5.4,5.8);scene.add(key);
  const rim=new THREE.DirectionalLight(0xb6d6ff,1.7);rim.position.set(-3.8,3,-4);scene.add(rim);
  try{
   renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'});
   renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
   renderer.outputColorSpace=THREE.SRGBColorSpace;
   renderer.toneMapping=THREE.ACESFilmicToneMapping;
   renderer.toneMappingExposure=1.2;
   node.appendChild(renderer.domElement);
   model=createMaleSkeletonV1();scene.add(model);
   controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;
   controls.enablePan=false;controls.minDistance=3.6;controls.maxDistance=9;
   controls.target.set(0,1.7,0);
   camera.position.set(0,1.74,6.0);controls.update();
   orbit.current={camera,controls};
   resize=()=>{const width=node.clientWidth||320;const height=Math.min(600,Math.max(385,width*1.4));
    renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix()};
   resize();window.addEventListener('resize',resize);
   const render=()=>{if(disposed)return;controls.update();renderer.render(scene,camera);frame=requestAnimationFrame(render)};render();
  }catch(error){console.error(error);setMessage('Não foi possível carregar o esqueleto 3D neste navegador.')}
  return()=>{disposed=true;cancelAnimationFrame(frame);window.removeEventListener('resize',resize);
   orbit.current=null;controls?.dispose();model?.userData.dispose?.();renderer?.dispose();renderer?.domElement?.remove()};
 },[]);
 const turn=(preset)=>{
  setView(preset);if(!orbit.current)return;
  const {camera,controls}=orbit.current;
  const angle={front:0,side:Math.PI/2,back:Math.PI}[preset]||0;
  camera.position.set(Math.sin(angle)*6,1.74,Math.cos(angle)*6);controls.update();
 };
 return <section className="card" style={{overflow:'hidden'}}>
  <h1>Esqueleto masculino</h1>
  <p className="hint">Avatar anatômico · estrutura óssea v1 · sem músculos, gordura, pele ou roupas.</p>
  <div ref={holder} style={{width:'100%',minHeight:385,borderRadius:16,overflow:'hidden',background:'#111b29'}} role="img" aria-label="Modelo tridimensional rotacionável de um esqueleto masculino"/>
  {message&&<p role="alert">{message}</p>}
  <div className="filters" style={{marginTop:14}}>
   <button className={view==='front'?'primary':'outline'} onClick={()=>turn('front')}>Frente</button>
   <button className={view==='side'?'primary':'outline'} onClick={()=>turn('side')}>Lado</button>
   <button className={view==='back'?'primary':'outline'} onClick={()=>turn('back')}>Costas</button>
  </div>
  <p className="hint">Arraste com o dedo ou mouse para girar. Use o zoom para observar ossos e articulações. Modelo ilustrativo inicial, não reconstrução médica.</p>
 </section>;
}
