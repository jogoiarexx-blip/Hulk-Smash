import test from 'node:test';
import assert from 'node:assert/strict';
import {heavyHitCrossed,grabEligible,throwStep,impactKnockback} from '../src/combat.mjs';
import {avatarPose,blendAvatarPose} from '../src/avatar-poses.mjs';
import fs from 'node:fs';

const player={x:0,y:0,z:0},forward={x:0,z:1};
const enemy=(kind,x,y,z)=>({kind,group:{position:{x,y,z}},alive:true,held:false,thrown:false});
test('Grab checks distance, facing and state — tank and reachable airborne drone',()=>{
 assert.equal(grabEligible(enemy('tank',1,0,5),player,forward),true);
 assert.equal(grabEligible(enemy('tank',1,0,-6),player,forward),false);
 assert.equal(grabEligible(enemy('tank',10,0,2),player,forward),false);
 assert.equal(grabEligible(enemy('drone',1,15,5),player,forward),false);
 assert.equal(grabEligible(enemy('drone',1,15,5),{x:0,y:9,z:0},forward),true);
 const captured=enemy('tank',0,0,3); captured.held=true;
 assert.equal(grabEligible(captured,player,forward),false);
 captured.held=false; captured.thrown=true;
 assert.equal(grabEligible(captured,player,forward),false);
});
test('Heavy smash impact occurs once when timer crosses threshold',()=>{
 let impacts=0, t=.82;
 for(let i=0;i<70;i++){const next=Math.max(0,t-.016);if(heavyHitCrossed(t,next))impacts++;t=next;}
 assert.equal(impacts,1);
 assert.equal(heavyHitCrossed(.22,.18),false);
});
test('Throwable trajectory, knockback bounds, finite values',()=>{
 let object={x:0,y:6,z:0,vx:40,vy:17,vz:5};
 for(let i=0;i<140;i++){const o=throwStep(object,1/60);assert.ok(Object.values(o).every(Number.isFinite));object={...object,...o};}
 assert.ok(object.y<0);
 const tank=impactKnockback({x:7,z:0},{x:0,z:0},250,'tank');
 const drone=impactKnockback({x:7,z:0},{x:0,z:0},250,'drone');
 assert.ok(drone.x>tank.x&&tank.x<=11);
 assert.ok(tank.stun>=.15&&tank.stun<=.8);
});
test('Double-arm smash and held enemy poses stay finite with blending',()=>{
 const a={onGround:true,attack:0,attackHand:1,walk:0,speed:0,doubleSmashPose:.42};
 let p=avatarPose(a,{time:1}),old=null;
 assert.equal(p.mode,'double-smash');
 assert.ok(p.arms[0]<-1 && p.arms[1]<-1);
 for(let i=0;i<180;i++){
  const candidate=avatarPose({...a,doubleSmashPose:Math.max(0,.82-i/60)}, {time:i/60,holdingEnemy:i>100});
  p=blendAvatarPose(old,candidate,1/60);old=p;
  assert.ok([...p.arms,...p.legs,...p.forearms,...p.handCurl].every(Number.isFinite));
 }
});
test('Game integration preserves restart, special attack, throw, AI disable and HUD hooks',()=>{
 const code=fs.readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
 for(const name of ['grabEnemyAction','throwGrabbedEnemy','resolveEnemyThrow','updateThrownEnemy','doubleSmash','doubleSmashImpact'])assert.ok(code.includes('function '+name+'('),name);
 for(const key of ['KeyG','KeyV'])assert.ok(code.includes("e.code==='"+key+"'"));
 assert.ok(code.includes('if(e.held)continue;'));
 assert.ok(code.includes('if(e.thrown){updateThrownEnemy(e,dt);continue;}'));
 assert.ok(code.includes('animation.doubleSmashPose=0;animation.pendingDoubleSmash=false'));
 assert.ok(code.includes('holdingEnemy=null;collapseSoundCooldown=0'));
 for(const id of ['doubleStatus','grabStatus'])assert.ok(html.includes('id="'+id+'"'));
});
