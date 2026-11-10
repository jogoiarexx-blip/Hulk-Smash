import test from 'node:test';
import assert from 'node:assert/strict';
import {attackPattern,volleyDirections,projectileThreat} from '../src/attack-patterns.mjs';
import {particleQuota,rubbleDustCount,shouldRenderStructuralDust} from '../src/fx-budget.mjs';
test('Tanks alternate between cannon and double cannon; drones fan, pulse and dart',()=>{
 assert.equal(attackPattern('tank',false,0).name,'cannon');
 assert.equal(attackPattern('tank',false,1).count,2);
 assert.equal(attackPattern('tank',false,2).name,'cannon');
 assert.equal(attackPattern('drone',false,1).count,3);
 assert.equal(attackPattern('drone',false,2).name,'dart');
 assert.equal(attackPattern('tank',true,2).name,'siege');
 assert.equal(attackPattern('tank',true,0).count,3);
 for(const kind of ['tank','drone'])for(let i=0;i<100;i++){
  const a=attackPattern(kind,false,i);
  assert.ok(a.warn>=.4&&a.count>=1&&a.count<=3&&a.damage>0&&a.speed>0);
 }
});
test('Volley spreads projectiles without exploding speed or assigning nonfinite vectors',()=>{
 const unit={x:0,y:0,z:1};
 const pattern=attackPattern('drone',false,1);
 const v=volleyDirections(unit,pattern);
 assert.equal(v.length,3);
 assert.ok(v[0].x>0&&v[2].x<0&&Math.abs(v[1].x)<1e-10);
 for(const vector of v)assert.ok(Math.abs(Math.hypot(vector.x,vector.y,vector.z)-1)<.00001);
 for(const vector of volleyDirections({x:0,y:.5,z:1},attackPattern('tank',true,0)))assert.ok(Object.values(vector).every(Number.isFinite));
});
test('Projectile warning triggers only for future near misses within the predicted interval',()=>{
 const p={position:{x:0,y:2,z:0},velocity:{x:0,y:0,z:20}};
 assert.ok(projectileThreat(p,{x:0,y:2,z:15},1.6,2.5)?.time>.7);
 assert.equal(projectileThreat(p,{x:8,y:2,z:15},1.6,2.5),null);
 assert.equal(projectileThreat(p,{x:0,y:2,z:-5},1.6,2.5),null);
 assert.equal(projectileThreat({...p,velocity:{x:0,y:0,z:0}},{x:0,y:2,z:5}),null);
 assert.equal(projectileThreat(p,{x:0,y:2,z:80},1.6,2.5),null);
});
test('Large destruction reduces distant particles but preserves near effects',()=>{
 assert.equal(particleQuota(10,169),1);
 assert.equal(particleQuota(120,5),0);
 assert.equal(particleQuota(72,150),0);
 assert.ok(particleQuota(70,100)<=1);
 assert.equal(rubbleDustCount(12,12),12);
 assert.equal(rubbleDustCount(150,12),2);
 assert.equal(rubbleDustCount(150,90),0);
 assert.equal(shouldRenderStructuralDust(20,10),true);
 assert.equal(shouldRenderStructuralDust(180,10),false);
});
test('Game connects telegraphs, patterns, warnings and recycling with hard GPU caps',async()=>{
 const fs=await import('node:fs');
 const game=fs.readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
 for(const marker of ['function startEnemyTelegraph(e,aim)','function updateEnemyTelegraph(e,dt)','function updateDangerWarning()','volleyDirections(direction,pattern)','attackPattern(e.kind,!!e.boss,e.attackCount++)','projectileThreat(p,player.position.clone().add(vec(0,2.6,0)))','particlePool.pop()','particleQuota(distance,particles.length)','geometry.ring','function releaseParticle(p)'])assert.ok(game.includes(marker),marker);
 for(const id of ['dangerIndicator','dangerLabel'])assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(html,/V2\.5/);
});
