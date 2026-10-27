import test from 'node:test';
import assert from 'node:assert/strict';
import {buildInternalSkeleton} from '../components/InternalSkeleton3D.js';

test('V13 skeleton includes head, torso, pelvis and paired limbs',()=>{
 const skeleton=buildInternalSkeleton();
 const names=[];
 skeleton.traverse(node=>{if(node.isMesh)names.push(node.name)});
 for(const name of ['Crânio','Vértebra 1','Esterno','Clavícula','Escápula','Ílio','Úmero','Fêmur','Patela','Tíbia','Fíbula']){
  assert.ok(names.includes(name),'Expected skeletal part: '+name);
 }
 assert.equal(names.filter(name=>name==='Clavícula').length,2);
 assert.equal(names.filter(name=>name==='Fêmur').length,2);
 assert.ok(names.filter(name=>name==='Costela 1').length===2);
 assert.ok(typeof skeleton.userData.dispose==='function');
 skeleton.userData.dispose();
});

test('Changing proportions builds a new internal skeleton',()=>{
 const first=buildInternalSkeleton();
 const second=buildInternalSkeleton({shoulderScale:1.25,hipScale:.9,armScale:1.1});
 const a=first.children.find(x=>x.name==='Clavícula');
 const b=second.children.find(x=>x.name==='Clavícula');
 assert.notEqual(a.geometry.boundingSphere,b.geometry.boundingSphere);
 assert.notEqual(a.position.x,b.position.x);
 first.userData.dispose();second.userData.dispose();
});
