import * as THREE from 'three';

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const num=(v,f)=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)&&n>0?n:f};
const reference={shoulders:112,chest:98,waist:82,hips:95,arm:33,thigh:55,calf:36};
export function normalizedBodyFactors(measures={}){
 return Object.fromEntries(Object.entries(reference).map(([key,base])=>[key,clamp(num(measures[key],base)/base,.65,1.55)]));
}
const bell=(x,c,r)=>Math.exp(-Math.pow((x-c)/r,2));

// A non-destructive proportional preview when the supplied GLB has no authored shape keys.
// These are illustrative zones, not centimeter-accurate anatomical reconstruction.
export function deformHumanMesh(root,measurements={}){
 const bounds=new THREE.Box3().setFromObject(root);
 const size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
 if(size.y<=0||size.x<=0)return {meshes:0,vertices:0};
 const factors=normalizedBodyFactors(measurements);
 root.updateWorldMatrix(true,true);
 const inverse=new THREE.Matrix4(),p=new THREE.Vector3(),local=new THREE.Vector3();
 let meshes=0,vertices=0;
 root.traverse(node=>{
  if(!node.isMesh||!node.geometry?.attributes?.position)return;
  // Skinned geometry must be shaped by authored morph targets, not by moving bind-pose vertices.
  if(node.isSkinnedMesh)return;
  const geometry=node.geometry.clone();
  node.geometry=geometry;
  const attr=geometry.attributes.position;
  inverse.copy(node.matrixWorld).invert();
  for(let i=0;i<attr.count;i++){
   p.fromBufferAttribute(attr,i).applyMatrix4(node.matrixWorld);
   const nx=(p.x-center.x)/(size.x*.5),ny=(p.y-bounds.min.y)/size.y;
   const absX=Math.abs(nx);
   const chest=bell(ny,.69,.11),waist=bell(ny,.51,.09),hip=bell(ny,.40,.10);
   const shoulder=bell(ny,.82,.09);
   const thigh=bell(ny,.29,.12),calf=bell(ny,.125,.082);
   const armWeight=clamp((absX-.63)*3.2,0,1)*bell(ny,.63,.25);
   const torsoWeight=1-armWeight;
   const sx=1+torsoWeight*((factors.shoulders-1)*shoulder*.60+(factors.chest-1)*chest*.52+
     (factors.waist-1)*waist*.56+(factors.hips-1)*hip*.58+
     (factors.thigh-1)*thigh*.27+(factors.calf-1)*calf*.16)+
     armWeight*(factors.arm-1)*.25;
   const sz=1+torsoWeight*((factors.chest-1)*chest*.65+(factors.waist-1)*waist*.58+
     (factors.hips-1)*hip*.44+(factors.thigh-1)*thigh*.18+(factors.calf-1)*calf*.16)+
     armWeight*(factors.arm-1)*.25;
   p.x=center.x+(p.x-center.x)*clamp(sx,.7,1.4);
   p.z=center.z+(p.z-center.z)*clamp(sz,.7,1.4);
   local.copy(p).applyMatrix4(inverse);
   attr.setXYZ(i,local.x,local.y,local.z);
  }
  attr.needsUpdate=true;geometry.computeVertexNormals();
  geometry.computeBoundingBox();geometry.computeBoundingSphere();
  meshes++;vertices+=attr.count;
 });
 return {meshes,vertices,factors};
}

export function applyHumanMaterials(root,{skinTone='medio',skinDetail=.55}={}){
 const tones={claro:'#e2b18f',medio:'#b9815c',moreno:'#865536',escuro:'#513526'};
 const tone=new THREE.Color(tones[skinTone]||tones.medio);
 let updated=0;
 root.traverse(mesh=>{
  if(!mesh.isMesh)return;
  const source=Array.isArray(mesh.material)?mesh.material:[mesh.material];
  const replacements=source.map(original=>{
   if(!original)return original;
   // Preserve original normal maps, UVs, and texture maps when available.
   const material=original.clone();
   if(material.color)material.color.copy(tone);
   if('roughness' in material)material.roughness=.87-.22*clamp(Number(skinDetail)||0,0,1);
   if('metalness' in material)material.metalness=0;
   material.side=THREE.FrontSide;
   material.needsUpdate=true;
   return material;
  });
  mesh.material=Array.isArray(mesh.material)?replacements:replacements[0];
  updated++;
 });
 return updated;
}
