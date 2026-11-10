import test from 'node:test';
import assert from 'node:assert/strict';
import {createCheckpoint,parseCheckpoint,loadCheckpoint,storeCheckpoint,eraseCheckpoint,CHECKPOINT_KEY} from '../src/progress.mjs';
import {PAD,gamepadAxis,readGamepad,buttonPressed,buttonReleased} from '../src/gamepad.mjs';
import {enemyTactics,threatMovement,aiFireInterval} from '../src/enemy-ai.mjs';

test('checkpoints restore stage and stats and never preserve half-completed objectives',()=>{
 const stats={score:2700,health:73,rage:62,kills:11,destroyed:4,throws:3,comboFinishers:2,tankCrushes:1};
 const cp=createCheckpoint(3,stats,6,1720);
 assert.deepEqual({stage:cp.stage,score:cp.score,health:cp.health,rage:cp.rage,kills:cp.kills,savedAt:cp.savedAt},
 {stage:3,score:2700,health:73,rage:62,kills:11,savedAt:1720});
 assert.equal(cp.completed,undefined);
 assert.equal(cp.targets,undefined);
 assert.deepEqual(parseCheckpoint(JSON.stringify(cp),6),cp);
});
test('invalid, corrupt, old or out-of-range saves are ignored',()=>{
 assert.equal(createCheckpoint(0,{},6),null);
 assert.equal(createCheckpoint(6,{},6),null);
 assert.equal(parseCheckpoint('wrong',6),null);
 assert.equal(parseCheckpoint(JSON.stringify({...createCheckpoint(1,{health:45,score:1},6),campaignLength:7}),6),null);
 assert.equal(parseCheckpoint(JSON.stringify({...createCheckpoint(1,{health:45,score:1},6),health:-2}),6),null);
 assert.equal(parseCheckpoint(JSON.stringify({...createCheckpoint(1,{health:45,score:1},6),stage:99}),6),null);
});
test('storage persists valid checkpoints and safely handles restricted localStorage',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 const cp=createCheckpoint(2,{score:440,health:92},6,123);
 assert.equal(storeCheckpoint(storage,cp),true);
 assert.equal(values.has(CHECKPOINT_KEY),true);
 assert.deepEqual(loadCheckpoint(storage,6),cp);
 assert.equal(eraseCheckpoint(storage),true);
 assert.equal(loadCheckpoint(storage,6),null);
 const denied={getItem:()=>{throw Error('SecurityError')},setItem:()=>{throw Error('QuotaExceeded')},removeItem:()=>{throw Error('SecurityError')}};
 assert.equal(loadCheckpoint(denied,6),null);
 assert.equal(storeCheckpoint(denied,cp),false);
 assert.equal(eraseCheckpoint(denied),false);
});
test('standard Xbox/PlayStation buttons, analog deadzone and edges are stable',()=>{
 const snapshot={connected:true,mapping:'standard',id:'Wireless Controller',axes:[0,-1,0.15,.5],buttons:Array.from({length:17},()=>({pressed:false}))};
 let s=readGamepad(snapshot);
 assert.equal(s.moveY,-1);assert.equal(s.cameraX,0);assert.ok(s.cameraY>0);
 assert.equal(gamepadAxis(.1),0);assert.equal(gamepadAxis(-1),-1);
 assert.equal(PAD.punch,2);assert.equal(PAD.pause,9);assert.equal(PAD.climb,12);
 snapshot.buttons[PAD.jump]={pressed:true};
 const next=readGamepad(snapshot);
 assert.equal(buttonPressed(s,next,PAD.jump),true);
 assert.equal(buttonPressed(next,next,PAD.jump),false);
 assert.equal(buttonReleased(next,s,PAD.jump),true);
 assert.equal(readGamepad({...snapshot,mapping:''}),null);
 assert.equal(readGamepad(null),null);
});
test('tactical AI circles, retreats, advances and respects stun/defense',()=>{
 const far=enemyTactics('tank',65,0);
 const close=enemyTactics('tank',5,0);
 const inRange=enemyTactics('drone',22,1);
 assert.ok(far.forward>0&&close.forward<0&&inRange.strafe!==0);
 assert.equal(enemyTactics('tank',35,0,true).speed,0);
 assert.ok(enemyTactics('tank',4,0,false,false,true).forward>=0);
 assert.ok(aiFireInterval('tank',true,4)<aiFireInterval('tank',false,0));
 const move=threatMovement(0,1,inRange);
 assert.ok(Math.abs(Math.hypot(move.x,move.z)-1)<1e-9);
});
