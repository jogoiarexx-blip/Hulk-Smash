import assert from 'node:assert/strict';
import { avatarPose } from '../src/avatar-poses.mjs';
const base=()=>({speed:0,walk:0,attack:0,attackHand:1,clapPose:0,slamPose:0,throwPose:0,chargingJump:false,jumpCharge:0,onGround:true,climbing:false,airSmash:false});
const s={rageTime:0,time:1,holdingCar:false};
const pose=avatarPose(base(),s);
assert.equal(pose.mode,'idle');
assert.equal(avatarPose({...base(),speed:8,walk:2},s).mode,'walk');
assert.equal(avatarPose({...base(),speed:18,walk:2},s).mode,'run');
assert.equal(avatarPose({...base(),attack:.18,attackHand:-1},s).mode,'left-punch');
assert.equal(avatarPose({...base(),attack:.18,attackHand:1},s).mode,'right-punch');
assert.equal(avatarPose({...base(),clapPose:.32},s).mode,'thunderclap');
assert.equal(avatarPose({...base(),slamPose:.30},s).mode,'ground-smash');
assert.equal(avatarPose({...base(),chargingJump:true,jumpCharge:1.5},s).mode,'super-jump-charge');
assert.equal(avatarPose({...base(),climbing:true},s).mode,'climb');
assert.equal(avatarPose({...base(),onGround:false,airSmash:true},s).mode,'air-smash');
assert.equal(avatarPose({...base(),onGround:false},s).mode,'jump');
assert.equal(avatarPose({...base(),throwPose:.24},s).mode,'throw-grab');
assert.equal(avatarPose(base(),{...s,rageTime:5}).mode,'rage-idle');
assert.ok(avatarPose({...base(),attack:.18,attackHand:1},s).arms[1]<-1.0);
assert.ok(avatarPose({...base(),clapPose:.32},s).spreads[0]<-.8);
for(let i=0;i<1200;i++){
 const a={...base(),speed:Math.random()*20,walk:Math.random()*30,attack:Math.random()*.36,clapPose:Math.random()*.64,slamPose:Math.random()*.6,jumpCharge:Math.random()*2,chargingJump:Math.random()>.5,onGround:Math.random()>.5,climbing:Math.random()>.5};
 const p=avatarPose(a,{...s,time:i/60});
 for(const v of [...p.arms,...p.legs,...p.knees,...p.forearms,...p.spreads,p.spineX,p.spineY,p.spineZ,p.headX,p.jawX,p.hipsY,...p.handCurl])assert.ok(Number.isFinite(v));
}
console.log('13 motions & 1200 randomized stable avatar poses: OK');
