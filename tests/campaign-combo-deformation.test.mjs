import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CAMPAIGN,chapterComplete,chapterProgress} from '../src/campaign.mjs';
import {nextChainStep,chainMultiplier,clapImpactTimerCrossed,throwLiftProgress} from '../src/combo.mjs';
import {dentValue,dentPose,applyCarDamage} from '../src/deformation.mjs';

test('Six campaign chapters include reachable goals and distinct missions',()=>{
 assert.equal(CAMPAIGN.length,6);
 const minBuildings=58; // City generator has 64 blocks with exactly 6 reserved parks.
 assert.ok(CAMPAIGN.at(-1).buildings<=minBuildings);
 assert.deepEqual(CAMPAIGN.map(x=>x.title).slice(3),['COMBOS DEVASTADORES','ARMAS IMPROVISADAS','TROVÃO FINAL']);
 for(let i=0;i<CAMPAIGN.length;i++){
  const goal=CAMPAIGN[i];
  assert.equal(chapterComplete(goal,{buildings:goal.buildings-1,kills:100,comboFinishers:100,throws:100,claps:100}),false);
  const stats={...goal,claps:goal.claps||0,throws:goal.throws||0,comboFinishers:goal.comboFinishers||0};
  assert.equal(chapterComplete(goal,stats),true);
  assert.equal(chapterProgress(goal,stats).fraction,1);
  assert.ok(chapterProgress(goal,{buildings:0,kills:0}).fraction<1);
  assert.ok(goal.wave>=0);
 }
 assert.equal(chapterComplete(CAMPAIGN[3],{buildings:35,kills:44,comboFinishers:1}),false);
 assert.equal(chapterComplete(CAMPAIGN[4],{buildings:43,kills:57,throws:1}),false);
 assert.equal(chapterComplete(CAMPAIGN[5],{buildings:51,kills:72,claps:2}),false);
});
test('Combos 1→2→3, reset after timeout and power scaling',()=>{
 assert.equal(nextChainStep(0,0),1);
 assert.equal(nextChainStep(1,.7),2);
 assert.equal(nextChainStep(2,.7),3);
 assert.equal(nextChainStep(3,.7),3);
 assert.equal(nextChainStep(2,0),1);
 assert.ok(chainMultiplier(3)>chainMultiplier(2));
 assert.ok(chainMultiplier(2)>chainMultiplier(1));
 let hit=0,t=.88;
 for(let i=0;i<80;i++){
  const next=Math.max(0,t-1/60);
  if(clapImpactTimerCrossed(t,next,.43))hit++;
  t=next;
 }
 assert.equal(hit,1);
});
test('Tank lifting is monotonic and finite across 240 frames',()=>{
 let last=0;
 for(let i=0;i<240;i++){
  const p=throwLiftProgress(i/60,.8);
  assert.ok(p>=last-1e-9&&p>=0&&p<=1);
  last=p;
 }
 assert.equal(last,1);
});
test('Deformation gradually dents a car before destruction',()=>{
 const car={alive:true,health:70,maxHealth:70};
 assert.equal(dentValue(70,70),0);
 const first=applyCarDamage(car,20),p1=dentPose(car.damageLevel);
 assert.equal(first.destroyed,false);
 assert.ok(p1.roofHeight<1&&p1.doorWidth<1);
 const second=applyCarDamage(car,20);
 assert.ok(second.level>first.level);
 assert.equal(second.destroyed,false);
 const third=applyCarDamage(car,30);
 assert.equal(third.destroyed,true);
 assert.ok(dentPose(third.level).hoodTilt>p1.hoodTilt);
 const invalid=applyCarDamage(car,-80);
 assert.equal(invalid.changed,false);
});
test('Integration: counters, pulse, articulated lift and HUD exist',()=>{
 const s=fs.readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
 const h=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
 for(const str of ['function updateHeldEnemy','function dentCar','function createClapShock','state.comboFinishers++','state.throws++','state.claps++','state.chainStep=nextChainStep','chapterComplete(stage','chapterProgress(stage','animation.clapPose=.88'])assert.ok(s.includes(str),str);
 for(const id of ['chainStatus','clapStatus','missionProgress','objectiveFill','avatarPanel'])assert.ok(h.includes('id="'+id+'"'),id);
 assert.ok(h.includes('src/game.js?v=1.9'));
 assert.ok(s.includes("import('./avatar.js?v=1.9')"));
});
