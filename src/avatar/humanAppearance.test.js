import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {normalizedBodyFactors,deformHumanMesh,applyHumanMaterials} from './humanAppearance.js';

test('normalizes body measurements and ignores empty values',()=>{
 const factors=normalizedBodyFactors({chest:'117,6',waist:''});
 assert.ok(Math.abs(factors.chest-1.2)<.0001);
 assert.equal(factors.waist,1);
});
test('creates a modified copy of body geometry',()=>{
 const original=new THREE.BoxGeometry(1,2,.6,5,15,5);
 const mesh=new THREE.Mesh(original,new THREE.MeshStandardMaterial());
 const root=new THREE.Group();root.add(mesh);
 const before=Array.from(original.attributes.position.array);
 const status=deformHumanMesh(root,{chest:132,waist:105});
 assert.equal(status.meshes,1);
 assert.notEqual(mesh.geometry,original);
 assert.deepEqual(Array.from(original.attributes.position.array),before);
 assert.notDeepEqual(Array.from(mesh.geometry.attributes.position.array),before);
 mesh.geometry.dispose();original.dispose();mesh.material.dispose();
});
test('skin material can be changed without mutating original',()=>{
 const original=new THREE.MeshStandardMaterial({color:0xffffff});
 const body=new THREE.Mesh(new THREE.BoxGeometry(1,2,1),original);
 const group=new THREE.Group();group.add(body);
 assert.equal(applyHumanMaterials(group,{skinTone:'escuro'}),1);
 assert.notEqual(body.material,original);
 assert.equal(original.color.getHex(),0xffffff);
 body.geometry.dispose();body.material.dispose();original.dispose();
});
