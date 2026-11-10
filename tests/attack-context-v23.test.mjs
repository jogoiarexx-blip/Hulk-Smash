import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {findContextTank,spinThrowOrbit,impactRecoil,enemyCanTakeDamage,grabEligible,heavyHitCrossed} from '../src/combat.mjs';
const player={x:0,y:0,z:0},forward={x:0,z:1};
const mob=(kind,x,y,z,override={})=>({kind,alive:true,boss:false,held:false,thrown:false,group:{position:{x,y,z}},...override});
test('Contextual attack chooses the nearest viable tank in front, excludes boss and obstacles',()=>{
 const boss=mob('tank',0,0,2,{boss:true}),rear=mob('tank',0,0,-7);
 const other=[mob('drone',0,0,3),mob('tank',0,0,16),mob('tank',0,0,4,{held:true})];
 const farther=mob('tank',1,0,5),closer=mob('tank',1,0,3);
 assert.equal(findContextTank([boss,rear,...other,farther,closer],player,forward),closer);
 assert.equal(findContextTank([boss,rear,...other],player,forward),null);
 assert.equal(findContextTank([mob('tank',0,8,4)],player,forward),null);
 assert.equal(findContextTank([mob('tank',2,0,6)],player,{x:0,z:-1}),null);
});
test('Boss still respects both emitters and cannot be grabbed or context-crushed',()=>{
 const boss=mob('tank',0,0,2,{boss:true});
 assert.equal(enemyCanTakeDamage(boss,'boss',0),false);
 assert.equal(grabEligible(boss,player,forward),false);
 assert.equal(findContextTank([boss],player,forward),null);
});
test('Enemy makes two smooth full turns and stays in a finite radius',()=>{
 const start=spinThrowOrbit(0),half=spinThrowOrbit(.41),end=spinThrowOrbit(.82);
 assert.ok(Math.abs(start.z-3)<1e-9);
 assert.ok(Math.abs(half.angle-2*Math.PI)<1e-9);
 assert.ok(Math.abs(end.angle-4*Math.PI)<1e-9);
 assert.ok(Math.abs(end.z-start.z)<1e-9);
 for(let i=0;i<=100;i++){
  const v=spinThrowOrbit(.82*i/100);
  assert.ok(Object.values(v).every(Number.isFinite));
  assert.ok(Math.abs(v.x)<=3.001&&Math.abs(v.z)<=3.001);
 }
});
test('Physical recoil is reduced for armored tanks compared with lighter drones',()=>{
 const tank=impactRecoil({x:5,z:3},{x:0,z:0},250,'tank'),drone=impactRecoil({x:5,z:3},{x:0,z:0},250,'drone');
 assert.ok(Math.abs(tank.roll)<Math.abs(drone.roll));
 assert.ok(Math.abs(tank.pitch)<Math.abs(drone.pitch));
 assert.ok(Math.abs(drone.roll)<=.38&&Math.abs(tank.roll)<=.19);
});
test('Impact animation events occur exactly once at 30/60/144 FPS',()=>{
 for(const fps of [30,60,144])for(const [duration,at] of [[.76,.31],[.82,.23]]){
  let prev=duration,count=0;
  for(let i=0;i<fps*2;i++){
   const next=Math.max(0,prev-1/fps);
   if(heavyHitCrossed(prev,next,duration,at))count++;
   prev=next;
  }
  assert.equal(count,1,`${duration}s at ${fps}fps`);
 }
});
test('Both new GLB poses remain finite and distinct through 240 frames',async()=>{
 const {avatarPose,blendAvatarPose}=await import('../src/avatar-poses.mjs');
 const neutral={speed:0,walk:0,onGround:true,attack:0,attackHand:1};
 const crush=avatarPose({...neutral,tankCrushPose:.37},{time:0});
 const spin=avatarPose({...neutral,spinThrowPose:.42,spinAngle:Math.PI/2},{time:0,holdingEnemy:true,liftRatio:1});
 assert.equal(crush.mode,'tank-crush');assert.equal(spin.mode,'spin-throw');
 assert.ok(crush.hipsY<0&&crush.arms[0]<-1);
 assert.ok(Math.abs(spin.spineY)>.2);
 let old=null;
 for(let i=0;i<240;i++){
  const pose=avatarPose({...neutral,tankCrushPose:i<50?.76-i*.016:0,spinThrowPose:i>=60&&i<112?.82-(i-60)*.016:0,spinAngle:i*.2},{time:i/60});
  old=blendAvatarPose(old,pose,1/60);
  for(const v of Object.values(old)){
   if(typeof v==='number')assert.ok(Number.isFinite(v));
   if(Array.isArray(v))assert.ok(v.every(Number.isFinite));
  }
 }
});
test('Runtime binds T and H, resolves hit frames and updates HUD/cooldowns',()=>{
 const g=fs.readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
 const h=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
 for(const marker of ['function tankCrushAction()','function tankCrushImpact()','function spinThrowAction()','if(animation.pendingTankCrush&&heavyHitCrossed','if(animation.pendingSpinThrow&&heavyHitCrossed','throwGrabbedEnemy(true)','findContextTank([target],player.position,playerForward)','e.group.rotation.x=e.recoilPitch','e.group.rotation.z=e.recoilRoll','state.tankCooldown=Math.max(0','state.spinCooldown=Math.max(0'])assert.ok(g.includes(marker),marker);
 for(const key of ["e.code==='KeyT'","e.code==='KeyH'"])assert.ok(g.includes(key),key);
 for(const id of ['tankStatus','spinStatus'])assert.ok(h.includes('id="'+id+'"'),id);
});
