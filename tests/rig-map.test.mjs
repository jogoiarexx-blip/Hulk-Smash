import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBoneName,resolveHulkSkeleton} from '../src/rig-map.mjs';
test('GLTFLoader sanitized mixamo bones',()=>{
 assert.equal(normalizeBoneName('mixamorig:LeftArm_024'),'leftarm');
 assert.equal(normalizeBoneName('mixamorigLeftArm_024'),'leftarm');
 const names=['Hips','Spine','Head','LeftArm','RightArm','LeftForeArm','RightForeArm','LeftUpLeg','RightUpLeg','LeftLeg','RightLeg','LeftHandIndex1','RightHandThumb1'];
 const nodes=names.map((n,i)=>({isBone:true,name:'mixamorig'+n+'_'+String(i).padStart(3,'0')}));
 const result=resolveHulkSkeleton(nodes);
 assert.deepEqual(result.missing,[]);
 assert.equal(result.fingers.left.length,1);
 assert.equal(result.fingers.right.length,1);
});
