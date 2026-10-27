import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {measurementsToMorphs,applyMorphs} from './shapeMapping.js';
import {deformHumanMesh,applyHumanMaterials} from './humanAppearance.js';

// Independent prototype adapter. It does not replace RealisticBody3D (V13).
export async function loadHumanModel(url,measurements={},options={}){
 if(!url||(!url.startsWith('blob:')&&!url.toLowerCase().split('?')[0].endsWith('.glb')))throw new Error('Informe o caminho de um modelo .glb');
 const loader=new GLTFLoader();
 const gltf=await loader.loadAsync(url);
 const root=gltf.scene;
 // Some rigged meshes are authored with body width on the Z axis.
 const initialBox=new THREE.Box3().setFromObject(root);
 const initialSize=initialBox.getSize(new THREE.Vector3());
 if(initialSize.z>initialSize.x*1.5){root.rotation.y=-Math.PI/2;root.updateWorldMatrix(true,true)}
 root.traverse(node=>{
  if(node.isMesh){node.castShadow=false;node.receiveShadow=false;node.frustumCulled=false}
 });
 const morphStatus=applyMorphs(root,measurementsToMorphs(measurements));
 const proportionalStatus=morphStatus.found.length===0?deformHumanMesh(root,measurements):null;
 const materialStatus=applyHumanMaterials(root,options);
 if(options.heightCm){
  const scale=Number(options.heightCm)/175;
  if(Number.isFinite(scale)&&scale>.6&&scale<1.5)root.scale.multiplyScalar(scale);
 }
 const bounds=new THREE.Box3().setFromObject(root);
 if(bounds.isEmpty())throw new Error('O GLB não contém uma malha visível');
 return {root,morphStatus,proportionalStatus,materialStatus,animations:gltf.animations};
}
