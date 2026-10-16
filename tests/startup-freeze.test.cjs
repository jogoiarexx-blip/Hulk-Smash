// Regression for v1.4: updatePlayer() threw ReferenceError before the first gameplay frame.
// Exercises the actual updatePlayer source with lightweight geometry/movement doubles.
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const code=fs.readFileSync(path.join(__dirname,'../src/game.js'),'utf8');
const first=code.indexOf('function updatePlayer(dt){');
const last=code.indexOf('\nfunction airSlam(){',first);
assert(first>=0&&last>first,'Could not find updatePlayer');
const updateCode=code.slice(first,last);
const joint=()=>({rotation:{x:0,y:0,z:0},scale:{y:1},position:{y:0}});
class Vec {constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z});}
 set(x,y,z){Object.assign(this,{x,y,z});return this;}
 clone(){return new Vec(this.x,this.y,this.z);}
 add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this;}
 sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this;}
 lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z;}
 normalize(){const l=Math.sqrt(this.lengthSq())||1;this.x/=l;this.y/=l;this.z/=l;return this;}
}
function contextFactory(){
 let punchHits=0, clapHits=0;
 const animation={velocity:new Vec(),speed:0,walk:0,climbLock:0,climbing:false,chargingJump:false,jumpCharge:0,
  onGround:true,jumpVelocity:0,airStartY:0,airPeak:0,landTime:0,airSmash:false,
  leftLeg:joint(),rightLeg:joint(),leftShin:joint(),rightShin:joint(),
  leftArm:joint(),rightArm:joint(),leftForearm:joint(),rightForearm:joint(),
  body:joint(),rig:joint(),torso:joint(),head:joint(),jaw:joint(),
  shadow:{position:{y:0},scale:{setScalar(n){this.value=n;}},material:{opacity:1}},
  attack:0,attackHand:1,pendingPunch:false,pendingClap:false,clapPose:0,slamPose:0,throwPose:0};
 const keys=new Set(),state={camYaw:0,rageTime:0,time:0};
 const player={position:new Vec()},playerRig={rotation:{y:0}};
 const ctx={Math,keys,state,animation,player,playerRig,playerForward:new Vec(0,0,-1),
  SETTINGS:{playerRadius:1.26,gravity:37,world:159},holdingCar:null,buildings:[],
  footsteps:0,smooth:(_,target)=>target,clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
  vec:(x=0,y=0,z=0)=>new Vec(x,y,z),
  roofAt:()=>0,solidObstacleList:()=>[],moveCircleSlide:(x,z,dx,dz)=>({x:x+dx,z:z+dz,collisions:0}),
  updateClimb:()=>{},beginClimb:()=>{},findClimbWall:()=>null,
  chargeRatio:v=>Math.min(1,v/1.65), rand:(a,b)=>(a+b)/2, particle:()=>{},
  shouldPlayPunchImpact:(before,after)=>before>.16&&after<=.16,
  executePunchImpact:()=>punchHits++,thunderclapImpact:()=>clapHits++,
  landingHeight:()=>null,slam:()=>{},shockRing:()=>{},playSound:()=>{},cameraShake:()=>{}};
 vm.createContext(ctx);vm.runInContext(updateCode+'\nthis.updatePlayer=updatePlayer;',ctx);
 return {ctx,animation,keys,state,player,hits:()=>[punchHits,clapHits]};
}
const t=contextFactory();
assert.doesNotThrow(()=>t.ctx.updatePlayer(.016),'Initial gameplay frame must not freeze');
t.keys.add('KeyW');for(let i=0;i<30;i++){t.state.time+=.016;t.ctx.updatePlayer(.016);}assert(t.animation.speed>0);
t.keys.clear();t.animation.chargingJump=true;t.animation.jumpCharge=0;
assert.doesNotThrow(()=>t.ctx.updatePlayer(.2));assert(t.animation.jumpCharge>.1);
t.animation.chargingJump=false;t.animation.onGround=false;t.animation.jumpVelocity=15;t.player.position.y=5;
assert.doesNotThrow(()=>t.ctx.updatePlayer(.016),'In-air animation');
t.animation.climbing=true;t.animation.jumpVelocity=0;
assert.doesNotThrow(()=>t.ctx.updatePlayer(.016),'Climbing animation');
t.animation.climbing=false;t.animation.pendingPunch=true;t.animation.attack=.17;
t.animation.pendingClap=true;t.animation.clapPose=.32;
assert.doesNotThrow(()=>t.ctx.updatePlayer(.02),'Punch / clap hit frames');
assert.deepEqual(t.hits(),[1,1]);
for(let i=0;i<200;i++)t.ctx.updatePlayer(.016);
assert.match(code,/catch \(error\) \{\s*state\.mode='error';[\s\S]*?fatal\(error\)/,
  'Frame loop should report runtime failures instead of retrying forever');
console.log('OK: startup, walking, charge, air, climb, attack, clap and 200 frames; recovery guard present.');
