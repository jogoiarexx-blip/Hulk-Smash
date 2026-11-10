import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {enemyCanTakeDamage,enemyRenderScale,slamImpactCrossed,grabEligible} from '../src/combat.mjs';
const boss={boss:true,alive:true,held:false,thrown:false,kind:'tank',group:{position:{x:0,y:0,z:3}},blink:0};
test('boss is protected by both shield generators',()=>{
 assert.equal(enemyCanTakeDamage(boss,'boss',0),false);
 assert.equal(enemyCanTakeDamage(boss,'boss',1),false);
 assert.equal(enemyCanTakeDamage(boss,'boss',2),true);
 assert.equal(enemyCanTakeDamage({boss:false},'boss',0),true);
});
test('boss cannot bypass objective through grab and throw',()=>{
 assert.equal(grabEligible(boss,{x:0,y:0,z:0},{x:0,z:1}),false);
 assert.equal(grabEligible({...boss,boss:false},{x:0,y:0,z:0},{x:0,z:1}),true);
});
test('boss size persists in regular and damage-flash frames',()=>{
 assert.equal(enemyRenderScale(boss),1.4);
 assert.ok(enemyRenderScale({...boss,blink:.2})>1.4);
 assert.equal(enemyRenderScale({...boss,boss:false}),1);
});
test('ground smash fires exactly once on impact keyframe',()=>{
 let hits=0,t=.60;
 for(let i=0;i<75;i++){const n=Math.max(0,t-1/60);if(slamImpactCrossed(t,n))hits++;t=n;}
 assert.equal(hits,1);
 assert.equal(slamImpactCrossed(.6,.55),false);
});
test('runtime references corrected boss and slam flow',()=>{
 const g=fs.readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
 assert.ok(g.includes('if(!enemyCanTakeDamage(enemy,mission?.kind,mission?.shieldsBroken||0))return;'));
 assert.ok(g.includes('e.group.scale.setScalar(enemyRenderScale(e));'));
 assert.ok(g.includes('if(animation.pendingSlam&&slamImpactCrossed('));
 assert.ok(g.includes('animation.airSmash=false;slam(15+Math.min(animation.airPeak*.2,6),true);'));
 assert.ok(g.includes('animation.pendingSlam=false;animation.slamRadius=15.5;'));
 assert.ok(g.includes('const hits=applyAreaDamage('));
});
