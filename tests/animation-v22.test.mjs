import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {avatarPose,blendAvatarPose} from '../src/avatar-poses.mjs';
const base={speed:0,walk:Math.PI/2,attack:0,attackHand:1,onGround:true,climbing:false,jumpVelocity:0,landTime:0};
const state={time:1,rageTime:0,holdingCar:false,holdingEnemy:false};
test('Heavy run produces longer stride and stronger forward lean',()=>{
 const walking=avatarPose({...base,speed:8},state),running=avatarPose({...base,speed:18},state);
 assert.equal(running.mode,'run');assert.equal(walking.mode,'walk');
 assert.ok(running.runWeight>.95);assert.ok(running.spineX>walking.spineX+.1);
 assert.ok(Math.abs(running.legs[0])>Math.abs(walking.legs[0]));
 assert.ok(running.handCurl[0]>walking.handCurl[0]);
});
test('Punch direction rotates torso and counter rotates hips',()=>{
 const left=avatarPose({...base,attack:.18,attackHand:-1},state);
 const right=avatarPose({...base,attack:.18,attackHand:1},state);
 assert.ok(left.spineY<0&&right.spineY>0);
 assert.ok(left.hipsYaw>0&&right.hipsYaw<0);
 assert.ok(right.spineX>avatarPose(base,state).spineX);
});
test('Lifting enemies braces low then raises hands and torso',()=>{
 const low=avatarPose({...base,grabEnemyPose:.7},{...state,holdingEnemy:true,liftRatio:0});
 const high=avatarPose({...base,grabEnemyPose:.1},{...state,holdingEnemy:true,liftRatio:1});
 assert.equal(low.mode,'tank-lift');
 assert.ok(low.spineX>high.spineX+.2);
 assert.ok(low.hipsY<high.hipsY-.12);
 assert.ok(high.arms[0]<low.arms[0]);
});
test('Fall height makes heavy landings visibly stronger',()=>{
 const soft=avatarPose({...base,landTime:.13,landingPower:.45},state);
 const heavy=avatarPose({...base,landTime:.13,landingPower:1.5},state);
 assert.equal(soft.mode,'land');assert.equal(heavy.mode,'heavy-land');
 assert.ok(heavy.landingWeight>soft.landingWeight);
 assert.ok(heavy.hipsY<soft.hipsY-.14);
 assert.ok(heavy.spineX>soft.spineX+.2);
});
test('Pose blending stays numerically finite for 720 continuous frames',()=>{
 let old=null;
 for(let i=0;i<720;i++){
  const t=i/60,phase=i%180;
  const pose=avatarPose({...base,walk:t*11,speed:(Math.sin(t*1.7)+1)*9,
   attack:i%90<23?.36-i%90*.014:0,attackHand:phase<90?1:-1,
   landTime:phase<17?.26-phase*.015:0,landingPower:1.5,
   grabEnemyPose:i%200<40?.95-i%200*.02:0},
   {...state,time:t,holdingEnemy:i%200<40,liftRatio:(i%200)/40});
  old=blendAvatarPose(old,pose,1/60);
  for(const [name,value] of Object.entries(old)){
   if(typeof value==='number')assert.ok(Number.isFinite(value),name);
   else if(Array.isArray(value))for(const n of value)assert.ok(Number.isFinite(n),name);
  }
 }
});
test('Runtime applies landing strength and avoids planted foot IK while compressing',()=>{
 const game=fs.readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
 const avatar=fs.readFileSync(new URL('../src/avatar.js',import.meta.url),'utf8');
 assert.ok(game.includes('animation.landingPower=clamp(.45+animation.airPeak/30,.45,1.55);'));
 assert.ok(game.includes("import('./avatar.js?v=2.2')"));
 assert.ok(avatar.includes('!(a.landTime>0)'));
 assert.ok(avatar.includes("from './avatar-poses.mjs?v=2.2'"));
});
