import React,{useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {loadHumanModel} from './loadHumanModel.js';
export default function HumanAvatarPreview({url='/models/human-male.glb',measurements={}}){
 const host=useRef(null),[message,setMessage]=useState('Carregando...'),[fileUrl,setFileUrl]=useState(null);
 useEffect(()=>()=>{if(fileUrl)URL.revokeObjectURL(fileUrl)},[fileUrl]);
 useEffect(()=>{
  const node=host.current;let disposed=false,frame,model;
  const scene=new THREE.Scene();scene.background=new THREE.Color('#f2f2f2');
  const camera=new THREE.PerspectiveCamera(35,1,.1,100);
  const renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  node.appendChild(renderer.domElement);
  const controls=new OrbitControls(camera,renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xffffff,0x777777,3));
  const resize=()=>{const width=node.clientWidth||320;renderer.setSize(width,440);camera.aspect=width/440;camera.updateProjectionMatrix()};
  resize();window.addEventListener('resize',resize);
  const render=()=>{if(disposed)return;controls.update();renderer.render(scene,camera);frame=requestAnimationFrame(render)};render();
  loadHumanModel(fileUrl||url,measurements).then(result=>{
   if(disposed){result.root.traverse(o=>{if(o.isMesh)o.geometry?.dispose()});return}model=result.root;scene.add(model);
   const bounds=new THREE.Box3().setFromObject(model),center=bounds.getCenter(new THREE.Vector3()),height=bounds.getSize(new THREE.Vector3()).y;
   controls.target.copy(center);camera.position.set(center.x,center.y,center.z+Math.max(3,height*1.6));controls.update();
   setMessage('Modelo carregado. Controles ausentes: '+(result.morphStatus.missing.join(', ')||'nenhum'));
  }).catch(e=>{if(!disposed)setMessage('GLB não disponível: '+e.message)});
  return()=>{disposed=true;cancelAnimationFrame(frame);window.removeEventListener('resize',resize);controls.dispose();if(model)model.traverse(o=>{if(o.isMesh){o.geometry?.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m?.dispose())}});renderer.dispose();renderer.domElement.remove()};
 },[url,fileUrl,measurements]);
 return <section className="card"><h2>Laboratório de avatar humano</h2><label className="hint">Selecionar modelo GLB<input type="file" accept=".glb" onChange={e=>{const file=e.target.files?.[0];if(!file)return;if(!file.name.toLowerCase().endsWith('.glb')){setMessage('Selecione um arquivo GLB.');return}if(file.size>25*1024*1024){setMessage('Arquivo muito grande para o teste (máximo 25 MB).');return}setFileUrl(URL.createObjectURL(file))}}/></label><div ref={host}/><p className="hint">{message}</p></section>;
}
