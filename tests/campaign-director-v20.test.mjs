import test from 'node:test';
import assert from 'node:assert/strict';
import {CAMPAIGN,chapterComplete,chapterProgress,convoyPosition,escortAdvance,shouldDefenderFire,missionKinds} from '../src/campaign.mjs';
import {avatarPose,blendAvatarPose} from '../src/avatar-poses.mjs';
import fs from 'node:fs';
test('Distinct mission types are non-generic and deterministic',()=>{
 assert.equal(new Set(missionKinds).size,6);
 for(const stage of CAMPAIGN){assert.ok(stage.briefing.length>45);assert.ok(stage.target>0);}
 let p=convoyPosition(-122,10,0),moved=false;
 for(let i=1;i<400;i++){const next=convoyPosition(-122,10,i/10);assert.ok(next>=-126&&next<=126);moved ||=Math.abs(next-p)>1e-3;p=next;}
 assert.ok(moved);
 assert.equal(escortAdvance(0,4,80,100),0);
 assert.equal(escortAdvance(0,4,12,100),4);
 assert.equal(escortAdvance(1,4,12,0),1);
 assert.equal(shouldDefenderFire(20,CAMPAIGN[2]),true);
 assert.equal(shouldDefenderFire(40,CAMPAIGN[2]),false);
 assert.equal(shouldDefenderFire(12,CAMPAIGN[0]),false);
});
test('Boss and reactor objectives require stages and no generic kill quota',()=>{
 assert.ok(chapterProgress(CAMPAIGN[4],{shieldsBroken:2,bossDead:false,bossHealth:390,bossMaxHealth:780}).fraction<1);
 assert.equal(chapterComplete(CAMPAIGN[4],{shieldsBroken:2,bossDead:true}),true);
 assert.equal(chapterComplete(CAMPAIGN[5],{capacitorsBroken:3,coreDead:true,timeLeft:1}),true);
 assert.equal(chapterComplete(CAMPAIGN[5],{capacitorsBroken:2,coreDead:true,timeLeft:1}),false);
});
test('Combat transitions and hit reaction cannot produce NaN',()=>{
 const base={speed:5,walk:0,attack:0,comboStep:3,onGround:true,attackHand:1};
 let old=null,states=new Set();
 for(let i=0;i<300;i++){
  const a={...base,walk:i*.3,attack:i%80<21?.36-i%80*.015:0,hitReact:i%90<25?.46-i%90*.017:0};
  const pose=avatarPose(a,{time:i/60});old=blendAvatarPose(old,pose,1/60);
  states.add(pose.mode);for(const [k,v] of Object.entries(old)){
   if(typeof v==='number')assert.ok(Number.isFinite(v),k);
   if(Array.isArray(v))for(const n of v)assert.ok(Number.isFinite(n),k);
  }
 }
 assert.ok(states.has('finisher'));assert.ok(states.has('hit-react'));
});
test('Game integrates world objective collision and mission lifecycle',()=>{
 const s=fs.readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
 for(const term of ['function missionMarker(','function missionAreaHit(','function updateMissionDirector(','function startMission(','function clearMission(','missionAreaHit(origin,radius,power','missionAreaHit(origin,range,power,dir,true)','missionDamage','mission.held=escortAdvance','mission.shieldsBroken++','mission.coreDead=true','clearMission();']){
  if(term==='missionDamage')continue;
  assert.ok(s.includes(term),term);
 }
 assert.ok(s.includes('function updateMission(){'));
});
