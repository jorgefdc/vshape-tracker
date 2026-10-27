import * as THREE from 'three';

// V1 standalone male skeleton: illustrative anatomy, separate from all V13 avatars.
// Units are normalized to ~3.4 scene units for a ~1.75 m adult.
export function createMaleSkeletonV1(){
 const root=new THREE.Group();root.name='Esqueleto masculino · base v1';
 const boneMat=new THREE.MeshStandardMaterial({color:'#e8dcc5',roughness:.77,metalness:0});
 const jointMat=new THREE.MeshStandardMaterial({color:'#c8b99f',roughness:.9});
 const ballGeo=new THREE.SphereGeometry(1,16,12);
 const vec=p=>new THREE.Vector3(...p);
 const ball=(name,p,r,mat=boneMat)=>{
  const o=new THREE.Mesh(ballGeo,mat);o.name=name;o.position.set(...p);o.scale.set(...r);root.add(o);return o;
 };
 const limb=(name,from,to,r=.027,end=.028)=>{
  const a=vec(from),b=vec(to),delta=b.clone().sub(a),g=new THREE.CylinderGeometry(end,r,delta.length(),12,4);
  const o=new THREE.Mesh(g,boneMat);o.name=name;o.position.copy(a).add(b).multiplyScalar(.5);
  o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());root.add(o);return o;
 };
 const arc=(name,points,r=.011)=>{
  const curve=new THREE.CatmullRomCurve3(points.map(vec));
  const o=new THREE.Mesh(new THREE.TubeGeometry(curve,28,r,8,false),boneMat);
  o.name=name;root.add(o);return o;
 };
 const sideTri=(name,points)=>{
  const shape=new THREE.BufferGeometry();
  const [a,b,c,d]=points.map(vec);
  const positions=new Float32Array([...a.toArray(),...b.toArray(),...c.toArray(),...a.toArray(),...c.toArray(),...d.toArray()]);
  shape.setAttribute('position',new THREE.BufferAttribute(positions,3));shape.computeVertexNormals();
  const mat=new THREE.MeshStandardMaterial({color:'#e0d4bf',roughness:.83,side:THREE.DoubleSide});
  const obj=new THREE.Mesh(shape,mat);obj.name=name;root.add(obj);return obj;
 };
 // Skull (cranium, face plane, mandible). Front points toward +Z.
 ball('Crânio',[0,3.145,-.008],[.165,.205,.142]);
 ball('Osso facial',[0,3.10,.105],[.105,.095,.058]);
 limb('Osso nasal',[0,3.137,.153],[0,3.075,.19],.012,.007);
 arc('Mandíbula',[[-.11,3.043,.11],[-.08,2.982,.13],[0,2.96,.15],[.08,2.982,.13],[.11,3.043,.11]],.014);
 for(const side of [-1,1]){
  ball('Órbita ocular',[side*.069,3.155,.155],[.049,.037,.016],jointMat);
  arc('Arco zigomático',[[side*.07,3.123,.157],[side*.141,3.102,.083],[side*.135,3.05,.045]],.01);
 }
 // 7 cervical, 12 thoracic and 5 lumbar vertebrae, shaped along a natural slight S-curve.
 for(let i=0;i<24;i++){
  const cervical=i<7,thoracic=i>=7&&i<19;
  const y=cervical?2.90-i*.033:thoracic?2.66-(i-7)*.048:2.077-(i-19)*.077;
  const z=cervical?-.013:thoracic?-.045-.025*Math.sin((i-7)/12*Math.PI):-.035+(i-19)*.008;
  ball((cervical?'Cervical ':thoracic?'Torácica ':'Lombar ')+(cervical?i+1:thoracic?i-6:i-18),[0,y,z],[cervical?.035:thoracic?.046:.057,.027,.045],jointMat);
  if(!cervical)arc('Processo espinhoso',[[0,y,z-.03],[0,y-.021,z-.073]],.009);
 }
 ball('Sacro',[0,1.64,-.029],[.079,.13,.063]);
 arc('Cóccix',[[0,1.55,-.042],[0,1.49,-.024],[0,1.465,.003]],.012);
 // Sternum with manubrium and distal xiphoid.
 ball('Manúbrio',[0,2.685,.175],[.045,.06,.026]);
 limb('Esterno',[0,2.67,.179],[0,2.27,.198],.03,.018);
 ball('Processo xifoide',[0,2.25,.198],[.027,.048,.019]);
 // Twelve bilateral pairs of curved ribs (last two floating).
 for(let i=0;i<12;i++){
  const y=2.64-i*.046,wide=(.215+.10*Math.sin((i+1)/13*Math.PI))*(i>8?1-(i-8)*.07:1);
  for(const side of [-1,1]){
   const ending=i<7?[side*.043,y-.065,.17]:i<10?[side*.13,y-.075,.13]:[side*wide*.79,y-.055,.048];
   arc('Costela '+(i+1)+' '+(side<0?'E':'D'),[
    [side*.04,y,-.11],[side*wide*.69,y+.005,-.14],[side*wide,y-.018,-.008],
    [side*wide*.86,y-.049,.11],ending
   ],i<8?.009:.0075);
  }
 }
 // Shoulder girdle, scapular blades and clavicles.
 for(const side of [-1,1]){
  arc('Clavícula '+side,[[side*.025,2.72,.178],[side*.17,2.735,.164],[side*.31,2.755,.073],[side*.40,2.738,.015]],.021);
  sideTri('Escápula '+side,[[side*.17,2.65,-.127],[side*.393,2.70,-.055],[side*.275,2.29,-.173],[side*.20,2.52,-.167]]);
  arc('Espinha escapular',[[side*.18,2.62,-.159],[side*.28,2.62,-.168],[side*.385,2.69,-.082]],.014);
  ball('Articulação do ombro',[side*.47,2.645,.006],[.06,.06,.065],jointMat);
 }
 // Male pelvic ring: narrow iliac flare, acetabula and pubic arch.
 for(const side of [-1,1]){
  const ilium=ball('Ílio '+side,[side*.23,1.72,-.033],[.13,.12,.083]);
  ilium.rotation.z=-side*.28;
  arc('Crista ilíaca '+side,[[side*.11,1.785,-.060],[side*.22,1.836,-.071],[side*.34,1.765,-.037]],.023);
  arc('Ísquio '+side,[[side*.29,1.74,-.04],[side*.24,1.56,-.073],[side*.118,1.50,.037],[side*.035,1.535,.089]],.036);
  ball('Acetábulo '+side,[side*.20,1.64,-.009],[.066,.078,.056],jointMat);
  arc('Ramo púbico '+side,[[side*.17,1.61,.05],[side*.09,1.55,.096],[0,1.54,.096]],.022);
 }
 // Appendicular skeleton, with paired forearm and lower-leg bones.
 for(const side of [-1,1]){
  const shoulder=[side*.47,2.65,.008],elbow=[side*.59,2.13,.03],wrist=[side*.66,1.65,.082];
  ball('Cabeça do úmero '+side,shoulder,[.066,.071,.066],jointMat);
  limb('Úmero '+side,shoulder,elbow,.051,.038);
  ball('Côndilos do cotovelo '+side,elbow,[.055,.051,.048],jointMat);
  limb('Rádio '+side,[side*.608,2.11,.055],[side*.682,1.67,.105],.027,.018);
  limb('Ulna '+side,[side*.569,2.11,.003],[side*.639,1.67,.043],.026,.020);
  ball('Carpo '+side,wrist,[.054,.042,.038],jointMat);
  for(let finger=0;finger<4;finger++){
   const delta=(finger-1.5)*.026,x=wrist[0]+side*delta;
   limb('Metacarpo '+side+' '+finger,[x,1.61,.09],[x,1.52,.102],.012,.009);
   limb('Falange '+side+' '+finger,[x,1.52,.102],[x,1.46+finger*.005,.113],.009,.006);
  }
  arc('Polegar '+side,[[wrist[0]-side*.047,1.65,.10],[wrist[0]-side*.092,1.58,.15],[wrist[0]-side*.108,1.54,.18]],.011);
  const hip=[side*.205,1.61,0],knee=[side*.217,.87,.026],ankle=[side*.227,.17,.052];
  ball('Cabeça femoral '+side,[side*.171,1.63,-.03],[.070,.075,.071],jointMat);
  limb('Fêmur '+side,hip,knee,.075,.054);
  ball('Côndilos femorais '+side,knee,[.081,.065,.077],jointMat);
  ball('Patela '+side,[knee[0],.857,.129],[.065,.069,.029]);
  limb('Tíbia '+side,[knee[0]-side*.024,.78,.056],[ankle[0]-side*.018,.195,.063],.051,.033);
  limb('Fíbula '+side,[knee[0]+side*.085,.775,-.006],[ankle[0]+side*.058,.176,.003],.021,.015);
  ball('Maléolo medial '+side,[ankle[0]-side*.038,.166,.063],[.029,.037,.03],jointMat);
  ball('Maléolo lateral '+side,[ankle[0]+side*.077,.159,.035],[.031,.044,.029],jointMat);
  ball('Tarso '+side,[ankle[0],.091,.115],[.079,.042,.098],jointMat);
  for(let toe=0;toe<5;toe++){
   const dx=(toe-2)*.031,x=ankle[0]+dx;
   limb('Metatarso '+side+' '+toe,[x,.075,.12],[x,.052,.285-(toe>2?(toe-2)*.025:0)],.012,.009);
  }
 }
 root.userData.dispose=()=>{
  const geos=new Set([ballGeo]),mats=new Set([boneMat,jointMat]);
  root.traverse(o=>{if(o.isMesh){geos.add(o.geometry);if(Array.isArray(o.material))o.material.forEach(m=>mats.add(m));else mats.add(o.material)}});
  geos.forEach(g=>g?.dispose());mats.forEach(m=>m?.dispose());
 };
 return root;
}
