import test from 'node:test';
import assert from 'node:assert/strict';
import {measurementsToMorphs,applyMorphs} from './shapeMapping.js';

test('reference measurements produce neutral morphs',()=>{
 const values=measurementsToMorphs({shoulders:112,chest:98,waist:82,hips:95,arm:33,thigh:55,calf:36});
 assert.ok(Object.values(values).every(v=>v===0));
});
test('larger and smaller morphs use distinct shape keys',()=>{
 const mesh={isMesh:true,morphTargetDictionary:{waist_size_larger:0,waist_size_smaller:1},morphTargetInfluences:[0,0]};
 const root={traverse(fn){fn(mesh)}};
 const result=applyMorphs(root,{waist_size:-.4});
 assert.deepEqual(mesh.morphTargetInfluences,[0,.4]);
 assert.deepEqual(result.missing,[]);
});
test('missing smaller morph is reported',()=>{
 const mesh={isMesh:true,morphTargetDictionary:{waist_size:0},morphTargetInfluences:[0]};
 const root={traverse(fn){fn(mesh)}};
 assert.deepEqual(applyMorphs(root,{waist_size:-.3}).missing,['waist_size']);
});
