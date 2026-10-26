import React,{useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

const STORE='vshape_human_model_v1';
const MODELS={male:{name:'Modelo masculino CC0',url:'https://www.innerscene.com/api/library/male-base-mesh-3d-person-rigged-a-pose-380e6d89/download',page:'https://www.innerscene.com/tools/library/3d-parts/male-base-mesh-3d-person-rigged-a-pose-380e6d89'},female:{name:'Modelo feminino CC0',url:'https://www.innerscene.com/api/library/female-base-mesh-3d-person-rigged-a-pose-dba97ed5/download',page:'https://www.innerscene.com/tools/library/3d-parts/female-base-mesh-3d-person-rigged-a-pose-dba97ed5'}};
function getSaved(){return new Promise((resolve,reject)=>{const req=indexedDB.open(STORE,1);req.onupgradeneeded=()=>req.result.createObjectStore('assets');req.onerror=()=>reject(req.error);req.onsuccess=()=>{const db=req.result;const tx=db.transaction('assets','readonly');const q=tx.objectStore('assets').get('body');q.onsuccess=()=>{db.close();resolve(q.result||null)};q.onerror=()=>{db.close();reject(q.error)}}})}
function saveAsset(file){return new Promise((resolve,reject)=>{const req=indexedDB.open(STORE,1);req.onupgradeneeded=()=>req.result.createObjectStore('assets');req.onerror=()=>reject(req.error);req.onsuccess=()=>{const db=req.result;const tx=db.transaction('assets','readwrite');tx.objectStore('assets').put(file,'body');tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}}})}
function removeAsset(){return new Promise((resolve,reject)=>{const req=indexedDB.open(STORE,1);req.onupgradeneeded=()=>req.result.createObjectStore('assets');req.onerror=()=>reject(req.error);req.onsuccess=()=>{const db=req.result;const tx=db.transaction('assets','readwrite');tx.objectStore('assets').delete('body');tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}}})}
export default function HumanModelViewer({sex='male',measurements}){
 const holder=useRef(null),[file,setFile]=useState(null),[status,setStatus]=useState('Carregue um modelo humano .glb para visualizar.'),[error,setError]=useState('');
 useEffect(()=>{let active=true;getSaved().then(f=>{if(active&&f)setFile(f)}).catch(()=>{if(active)setStatus('O armazenamento local não está disponível. Você ainda pode carregar um arquivo nesta sessão.')});return()=>{active=false}},[]);
 useEffect(()=>{
  if(!file||!holder.current)return;const node=holder.current;let renderer,controls,raf,model=null,disposed=false,objectURL;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setSize(node.clientWidth,420);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;node.appendChild(renderer.domElement)}
  catch(e){setError('WebGL indisponível neste dispositivo: '+e.message);return}
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x132232);
  const camera=new THREE.PerspectiveCamera(38,node.clientWidth/420,.01,100);camera.position.set(0,1.3,4.3);
  scene.add(new THREE.HemisphereLight(0xffffff,0x7186a1,2.2));
  const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(2,5,4);scene.add(light);
  const fill=new THREE.DirectionalLight(0xbedcff,1.5);fill.position.set(-3,2,-3);scene.add(fill);
  controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;
  controls.minDistance=.7;controls.maxDistance=12;
  objectURL=URL.createObjectURL(file);
  new GLTFLoader().load(objectURL,gltf=>{
   if(disposed)return;model=gltf.scene;scene.add(model);
   const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
   if(!Number.isFinite(size.length())||size.length()===0){setError('O modelo não possui geometria visível.');return}
   const max=Math.max(size.x,size.y,size.z),scale=2.9/max;model.scale.setScalar(scale);model.position.copy(center.multiplyScalar(-scale));
   controls.target.set(0,0,0);camera.position.set(0,.3,4.8);camera.lookAt(0,0,0);controls.update();setError('');setStatus('Modelo humano 3D carregado. Arraste para girar e use dois dedos para ampliar.');
  },undefined,e=>{if(!disposed){setError('Não foi possível abrir este GLB. Use um arquivo .glb completo, com texturas incorporadas.');console.error(e)}});
  const resize=new ResizeObserver(()=>{if(!node.clientWidth)return;renderer.setSize(node.clientWidth,420);camera.aspect=node.clientWidth/420;camera.updateProjectionMatrix()});resize.observe(node);
  const render=()=>{if(disposed)return;controls.update();renderer.render(scene,camera);raf=requestAnimationFrame(render)};render();
  return()=>{disposed=true;cancelAnimationFrame(raf);resize.disconnect();controls.dispose();if(model)model.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(mat=>{for(const v of Object.values(mat))if(v?.isTexture)v.dispose();mat.dispose()})}});renderer.dispose();renderer.domElement.remove();URL.revokeObjectURL(objectURL)};
 },[file]);
 async function downloadModel(){const item=MODELS[sex]||MODELS.male;setError('');setStatus('Obtendo '+item.name+'...');try{const response=await fetch(item.url);if(!response.ok)throw Error('HTTP '+response.status);const blob=await response.blob();if(blob.size<1000)throw Error('Arquivo inválido');const f=new File([blob],sex+'-base-mesh.glb',{type:'model/gltf-binary'});setFile(f);setStatus('Modelo anatômico CC0 carregado.');try{await saveAsset(f)}catch{setStatus('Modelo carregado, mas não foi possível armazená-lo no navegador.')}}catch(err){setError('O site do modelo não permitiu o carregamento direto. Baixe o GLB pela página de origem e importe abaixo.');setStatus('Importação manual disponível.')}}
 async function choose(e){const f=e.target.files?.[0];if(!f)return;if(!f.name.toLowerCase().endsWith('.glb')){setError('Selecione um arquivo .glb.');return}if(f.size>45*1024*1024){setError('Arquivo maior que 45 MB. Para celular, use um GLB otimizado.');return}setError('');setStatus('Carregando modelo...');setFile(f);try{await saveAsset(f)}catch{setStatus('Modelo carregado apenas nesta sessão; não foi possível salvar no aparelho.')}e.target.value=''}
 async function clear(){setFile(null);setError('');setStatus('Carregue um modelo humano .glb para visualizar.');try{await removeAsset()}catch{}}
 return <section className="card"><h2>Modelo humano 3D</h2><p className="hint">Visualizador de malha humana profissional (.glb). A anatomia depende do arquivo fornecido; medidas e gordura corporal ainda não deformam a malha.</p><button className="primary" onClick={downloadModel}>Carregar {MODELS[sex]?.name||MODELS.male.name}</button><p className="hint">Fonte: <a href={(MODELS[sex]||MODELS.male).page} target="_blank" rel="noopener noreferrer">baixar GLB CC0 na biblioteca Innerscene</a>. Se o carregamento direto falhar, faça o download e importe o arquivo aqui.</p><label className="hint">Importar modelo GLB<input className="formfield" type="file" accept=".glb,model/gltf-binary" onChange={choose}/></label>{file&&<><div ref={holder} className="human-model-canvas" style={{height:420,overflow:'hidden',borderRadius:14}}/><button className="outline" onClick={clear}>Remover modelo importado</button></>}{!file&&<p className="hint">Nenhum modelo importado. O avatar muscular provisório continua disponível abaixo.</p>}{error&&<p role="alert" style={{color:'#ffadad'}}>{error}</p>}<p className="hint">{status}</p><p className="hint">O arquivo é guardado localmente neste navegador, sem envio para servidores. Use somente modelos com licença que permita sua utilização.</p></section>
}
