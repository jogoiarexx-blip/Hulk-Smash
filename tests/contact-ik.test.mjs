import assert from 'node:assert/strict';
import {contactHands,dampWeight,footStance,reachLimit} from '../src/contact-ik.mjs';
import {resolveHulkSkeleton} from '../src/rig-map.mjs';
import fs from 'node:fs';
const actor={x:20,y:14,z:35};
for(const face of [{normalX:1,normalZ:0},{normalX:-1,normalZ:0},{normalX:0,normalZ:1},{normalX:0,normalZ:-1}]){
 const rest=contactHands(actor,face,0,0),still=contactHands(actor,face,8,0);
 assert.deepEqual(rest,still);
 const moving=contactHands(actor,face,.18,6);
 assert.ok(Math.abs(moving.left.y-moving.right.y)>.05);
}
assert.equal(reachLimit(100,1,2),2.955);
for(let i=0;i<100;i++)assert.ok(footStance(i*.1,'left',1)>=0&&footStance(i*.1,'right',1)<=1);
let v=0;for(let i=0;i<120;i++){v=dampWeight(v,1,1/60);assert.ok(v>=0&&v<=1);}
const b=fs.readFileSync(new URL('../assets/models/hulk.glb',import.meta.url)),j=JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12)));
const nodes=j.skins[0].joints.map(i=>({name:j.nodes[i].name,isBone:true})),rig=resolveHulkSkeleton(nodes);
for(const role of ['leftHand','rightHand','leftFoot','rightFoot'])assert.ok(rig.bones[role],role);
console.log('Contact v1.7: 4 facade orientations, ground poses and actual GLB joints OK');
