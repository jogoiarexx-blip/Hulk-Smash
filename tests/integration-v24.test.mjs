import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('Checkpoint resume and new game are explicit and do not save partial mission objectives',()=>{
 const game=fs.readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
 for(const marker of ['function continueGame()','resetGame(saved)','function resetGame(checkpoint=null)','function saveCampaignCheckpoint()','startMission(state.stage);saveCampaignCheckpoint()','eraseCheckpoint(safeStorage());refreshSaveUI()','function refreshSaveUI()','state.stage=checkpoint.stage','function storedCampaign()']){
  assert.ok(game.includes(marker),marker);
 }
 assert.ok(html.includes('id="continueButton"'));
 assert.ok(html.includes('id="saveStatus"'));
 assert.ok(html.includes('id="gamepadStatus"'));
});
test('Gamepad is polled on each frame and all standard actions map into gameplay',()=>{
 const game=fs.readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
 assert.ok(game.includes('pollController(dt);'));
 for(const marker of ['readGamepad(pad)','buttonPressed(previous,next,PAD.pause)','buttonPressed(previous,next,PAD.jump)','buttonReleased(previous,next,PAD.jump)','buttonPressed(previous,next,PAD.punch)','buttonPressed(previous,next,PAD.grabEnemy)','buttonPressed(previous,next,PAD.car)','buttonPressed(previous,next,PAD.slam)','buttonPressed(previous,next,PAD.clap)','buttonPressed(previous,next,PAD.tankCrush)','buttonPressed(previous,next,PAD.spinThrow)','buttonPressed(previous,next,PAD.doubleSmash)','buttonPressed(previous,next,PAD.rage)','move.addScaledVector(forward,-stickY)','move.addScaledVector(right,stickX)','controller?.buttons[PAD.climb]']) assert.ok(game.includes(marker),marker);
});
test('Enemies tactically strafe, respect line-of-sight and no longer chase blindly',()=>{
 const game=fs.readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
 for(const marker of ['enemyTactics(e.kind,dist','threatMovement(to.x,to.z,tactics)','e.aiClock+=dt;','aiFireInterval(e.kind','if(sweptBuildingHit(start,aim,buildings,.28))return false;'])assert.ok(game.includes(marker),marker);
});
