import React,{useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {loadHumanModel} from './loadHumanModel.js';
import {buildInternalSkeleton} from './InternalSkeleton3D.js';
export default function HumanAvatarPreview({url='/models/human-male.glb',measurements={}}){
 const host=useRef(null),[message,setMessage]=useState('Carregando...'),[fileUrl,setFileUrl]=useState(null);
 const [showBones,setShowBones]=useState(false),[skinTone,setSkinTone]=useState('medio'),[skinDetail,setSkinDetail]=useState(.55);
 useEffect(()=>()=>{if(fileUrl)URL.revokeObjectURL(fileUrl)},[fileUrl]);
 useEffect(()=>{
  const node=host.current;let disposed=false,frame,model,skeleton;
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
  loadHumanModel(fileUrl||url,measurements,{skinTone,skinDetail}).then(result=>{
   if(disposed){result.root.traverse(o=>{if(o.isMesh)o.geometry?.dispose()});return}model=result.root;scene.add(model);
   const bounds=new THREE.Box3().setFromObject(model),center=bounds.getCenter(new THREE.Vector3()),height=bounds.getSize(new THREE.Vector3()).y;
   if(showBones){
    skeleton=buildInternalSkeleton({sex:'male'});
    const factor=height/3.4;
    skeleton.scale.setScalar(factor);
    skeleton.position.set(center.x,bounds.min.y,center.z);
    scene.add(skeleton);
    model.traverse(o=>{if(o.isMesh){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(m){m.transparent=true;m.opacity=.19;m.depthWrite=false;m.needsUpdate=true}})}});
   }
   controls.target.copy(center);camera.position.set(center.x,center.y,center.z+Math.max(3,height*1.6));controls.update();
   setMessage('GLB carregado · '+(result.proportionalStatus?'deformação proporcional experimental':'morph targets')+' · '+(showBones?'esqueleto interno visível':'pele externa')+'.');
  }).catch(e=>{if(!disposed)setMessage('GLB não disponível: '+e.message)});
  return()=>{disposed=true;cancelAnimationFrame(frame);window.removeEventListener('resize',resize);controls.dispose();if(skeleton){scene.remove(skeleton);skeleton.userData.dispose?.()};if(model)model.traverse(o=>{if(o.isMesh){o.geometry?.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m?.dispose())}});renderer.dispose();renderer.domElement.remove()};
 },[url,fileUrl,measurements,showBones,skinTone,skinDetail]);
 return <section className="card"><h2>Laboratório de avatar humano</h2><label className="hint">Selecionar modelo GLB<input type="file" accept=".glb" onChange={e=>{const file=e.target.files?.[0];if(!file)return;if(!file.name.toLowerCase().endsWith('.glb')){setMessage('Selecione um arquivo GLB.');return}if(file.size>25*1024*1024){setMessage('Arquivo muito grande para o teste (máximo 25 MB).');return}setFileUrl(URL.createObjectURL(file))}}/></label><label className="hint">Tom de pele<select className="formfield" value={skinTone} onChange={e=>setSkinTone(e.target.value)}><option value="claro">Claro</option><option value="medio">Médio</option><option value="moreno">Moreno</option><option value="escuro">Escuro</option></select></label><label className="hint">Textura da pele: {Math.round(skinDetail*100)}%<input type="range" min="0" max="1" step=".05" value={skinDetail} onChange={e=>setSkinDetail(Number(e.target.value))}/></label><label className="hint"><input type="checkbox" checked={showBones} onChange={e=>setShowBones(e.target.checked)}/> Inspecionar esqueleto interno</label><div ref={host}/><p className="hint">{message}</p><p className="hint">Prévia experimental: as proporções ainda não são reconstruções clínicas nem medidas calibradas em centímetros.</p></section>;
}
