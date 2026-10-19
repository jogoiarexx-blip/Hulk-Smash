import assert from 'node:assert/strict';
import {avatarPose,blendAvatarPose} from '../src/avatar-poses.mjs';
import {resolveHulkSkeleton} from '../src/rig-map.mjs';
const base={speed:0,walk:0,attack:0,attackHand:1,clapPose:0,slamPose:0,throwPose:0,chargingJump:false,jumpCharge:0,onGround:true,climbing:false,jumpVelocity:0,airSmash:false,landTime:0};
const idle=avatarPose(base,{time:1});
assert.equal(idle.mode,'idle');
assert.equal(avatarPose({...base,climbing:true},{time:1}).mode,'climb-hold');
assert.equal(avatarPose({...base,climbing:true,speed:3},{time:1}).mode,'climb');
assert.equal(avatarPose({...base,onGround:false,jumpVelocity:-25}).mode,'jump-fall');
const clap=avatarPose({...base,clapPose:.32});
assert.ok(clap.spreads[0]>.35&&clap.spreads[1]<-.35);
let previous=idle;
for(let i=0;i<240;i++){const target=avatarPose({...base,speed:i<90?18:0,walk:i*.3,attack:i>100&&i<121?.18:0},{time:i/60});const next=blendAvatarPose(previous,target,1/60);for(const [k,v] of Object.entries(next)){if(typeof v==='number')assert.ok(Number.isFinite(v),k);if(Array.isArray(v))for(const n of v)assert.ok(Number.isFinite(n),k);}previous=next;}
const leftBones=Array.from({length:15},(_,i)=>({isBone:true,name:'mixamorigLeftHandIndex'+(i%3+1)+'_'+i}));
assert.ok(resolveHulkSkeleton(leftBones).fingers.left.length===15);
console.log('Animation v1.6: poses, transitions, and full finger chains OK');