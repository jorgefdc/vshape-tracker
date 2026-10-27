import * as THREE from 'three';

// Approximate internal bony anatomy for the V13 proportions (not a medical reconstruction).
// Coordinates are in the existing V13 body space, with the face pointing toward +Z.
export function buildInternalSkeleton({shoulderScale=1,hipScale=1,legScale=1,armScale=1,sex='male'}={}){
 const root=new THREE.Group();
 root.name='Internal skeleton (educational)';
 const ivory=new THREE.MeshStandardMaterial({color:0xe1d8c8,roughness:.83,metalness:0});
 const joint=new THREE.MeshStandardMaterial({color:0xd2c6b4,roughness:.86});
 const geometry=new THREE.SphereGeometry(1,12,9);
 const cylinder=new THREE.CylinderGeometry(1,1,1,10,1);
 const v=(x,y,z)=>new THREE.Vector3(x,y,z);
 function ellipsoid(name,p,r,material=ivory){
  const mesh=new THREE.Mesh(geometry,material);mesh.name=name;
  mesh.position.copy(v(...p));mesh.scale.set(...r);root.add(mesh);return mesh;
 }
 function shaft(name,p1,p2,r1,r2=r1){
  const a=v(...p1),b=v(...p2),distance=a.distanceTo(b);
  const g=new THREE.CylinderGeometry(r2,r1,distance,9,1);
  const m=new THREE.Mesh(g,ivory);m.name=name;m.position.copy(a).add(b).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(v(0,1,0),b.sub(a).normalize());
  root.add(m);return m;
 }
 function curved(name,points,radius=.012){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>v(...p)));
  const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,18,radius,7,false),ivory);
  mesh.name=name;root.add(mesh);return mesh;
 }
 // Head and spine are placed inside the skin mesh.
 ellipsoid('Crânio',[0,3.19,-.013],[.158,.207,.145]);
 ellipsoid('Mandíbula',[0,3.04,.041],[.112,.061,.099],joint);
 for(let i=0;i<15;i++){
  const t=i/14,y=2.84-t*1.31;
  const z=-.045-.038*Math.sin(t*Math.PI*1.4);
  ellipsoid('Vértebra '+(i+1),[0,y,z],[.047+(t>.65?.01:0),.041,.05],joint);
 }
 shaft('Sacro',[0,1.73,-.045],[0,1.53,-.025],.056,.045);
 // Sternum and 10 rib pairs, curved around a tapered thorax.
 shaft('Esterno',[0,2.64,.157],[0,2.30,.207],.032,.027);
 for(let i=0;i<10;i++){
  const y=2.66-i*.046,sideWidth=(.23+.10*Math.sin((i/10)*Math.PI))*(i>7?.94:1);
  const depth=.18+Math.sin((i/10)*Math.PI)*.019;
  for(const side of [-1,1]){
   curved('Costela '+(i+1),[
    [side*.025,y,-.115],[side*sideWidth*.54,y+.006,-depth*.83],
    [side*sideWidth,y-.022,-.003],[side*sideWidth*.78,y-.045,depth*.84],
    [side*.077,y-.055,depth]
   ],.008+(i<6?.001:0));
  }
 }
 // Clavicles and scapular plates (scapula rests on the posterior thorax).
 for(const side of [-1,1]){
  curved('Clavícula',[[side*.02,2.71,.16],[side*.14*shoulderScale,2.72,.162],[side*.31*shoulderScale,2.745,.095],[side*.39*shoulderScale,2.73,.035]],.019);
  const scapula=ellipsoid('Escápula',[side*.252*shoulderScale,2.49,-.17],[.096,.17,.024],joint);
  scapula.rotation.z=-side*.13;
  curved('Espinha da escápula',[[side*.18*shoulderScale,2.57,-.196],[side*.26*shoulderScale,2.59,-.191],[side*.34*shoulderScale,2.66,-.107]],.014);
 }
 // Iliac wings and pubic arch.
 const width=(sex==='female'?.245:.225)*hipScale;
 for(const side of [-1,1]){
  const ilium=ellipsoid('Ílio',[side*width,1.71,-.035],[.14,.125,.105],joint);
  ilium.rotation.z=-side*.16;
  curved('Crista ilíaca',[[side*.095,1.76,-.06],[side*width,1.81,-.07],[side*(width+.105),1.77,-.015]],.017);
  shaft('Ramo púbico',[side*.11,1.58,.07],[side*.027,1.52,.105],.026,.019);
 }
 // Upper/lower arms, forearm's paired radius and ulna.
 for(const side of [-1,1]){
  const sx=shoulderScale,ax=armScale;
  const shoulder=[side*.48*sx,2.64,0],elbow=[side*.58*sx,2.17,.019];
  const wrist=[side*.608*sx,1.7,.078];
  ellipsoid('Cabeça do úmero',shoulder,[.076*ax,.076,.075],joint);
  shaft('Úmero',shoulder,elbow,.043*ax,.034*ax);
  ellipsoid('Olecrano',elbow,[.044,.048,.05],joint);
  shaft('Rádio',[elbow[0]+side*.022,2.16,.046],[wrist[0]+side*.019,1.73,.098],.025*ax,.02*ax);
  shaft('Ulna',[elbow[0]-side*.021,2.16,-.012],[wrist[0]-side*.02,1.73,.04],.027*ax,.018*ax);
  ellipsoid('Carpo',wrist,[.048*ax,.039,.035],joint);
  for(let finger=0;finger<4;finger++){
   const x=wrist[0]+side*(finger-1.5)*.019;
   shaft('Metacarpo',[x,1.66,.091],[x,1.57,.101],.011,.009);
  }
 }
 // Femur, patella, fibula and tibia, with ankles aligned to the existing V13 mesh.
 for(const side of [-1,1]){
  const x=side*.205*hipScale;
  const hip=[x,1.62,.005],knee=[x, .855,.025],ankle=[x,.17,.04];
  ellipsoid('Cabeça femoral',[x-side*.06,1.68,-.015],[.07,.07,.071],joint);
  shaft('Fêmur',hip,knee,.065*legScale,.046*legScale);
  ellipsoid('Patela',[x,.847,.137],[.067*legScale,.072,.032],joint);
  shaft('Tíbia',[x-side*.014,.76,.063],[x-side*.006,.205,.057],.047*legScale,.032*legScale);
  shaft('Fíbula',[x+side*.093,.755,-.006],[x+side*.068,.202,-.008],.018*legScale,.014*legScale);
  ellipsoid('Maléolo medial',[x-side*.045,.174,.036],[.032,.04,.032],joint);
  ellipsoid('Maléolo lateral',[x+side*.083,.17,.015],[.03,.042,.03],joint);
  ellipsoid('Tarso',[x,.10,.13],[.08,.039,.105],joint);
 }
 root.userData.dispose=()=>{
  root.traverse(o=>{if(o.isMesh&&o.geometry!==geometry&&o.geometry!==cylinder)o.geometry.dispose()});
  geometry.dispose();cylinder.dispose();ivory.dispose();joint.dispose();
 };
 return root;
}
