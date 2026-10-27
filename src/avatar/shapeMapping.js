// Morph targets must be authored in the GLB with these names.
// Normalized values are conservative: calibration requires a reference body.
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const numeric=(value,fallback)=>Number.isFinite(Number(value))&&Number(value)>0?Number(value):fallback;
const REFERENCE={shoulders:112,chest:98,waist:82,hips:95,arm:33,thigh:55,calf:36};
export const MORPH_TARGETS={
 shoulders:'shoulder_width',chest:'chest_size',waist:'waist_size',
 hips:'hip_width',arm:'arm_size',thigh:'thigh_size',calf:'calf_size'
};
export function measurementsToMorphs(measurements={}){
 return Object.fromEntries(Object.entries(MORPH_TARGETS).map(([key,target])=>{
  const ratio=numeric(measurements[key],REFERENCE[key])/REFERENCE[key];
  return [target,clamp((ratio-1)*2.5,-.75,.75)];
 }));
}
export function applyMorphs(root,morphs){
 const found=new Set();
 root.traverse(object=>{
  if(!object.isMesh||!object.morphTargetDictionary||!object.morphTargetInfluences)return;
  for(const [name,value] of Object.entries(morphs)){
   const dictionary=object.morphTargetDictionary;
   const positive=dictionary[name+'_larger']??dictionary[name];
   const negative=dictionary[name+'_smaller'];
   if(positive!==undefined)object.morphTargetInfluences[positive]=Math.max(0,value);
   if(negative!==undefined)object.morphTargetInfluences[negative]=Math.max(0,-value);
   if(value>=0&&positive!==undefined||value<0&&negative!==undefined)found.add(name);
  }
 });
 return {found:[...found],missing:Object.keys(morphs).filter(key=>!found.has(key))};
}
