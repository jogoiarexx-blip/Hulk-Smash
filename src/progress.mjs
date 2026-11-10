// Persistent campaign checkpoints. Only stage boundaries are saved: world state is regenerated.
export const CHECKPOINT_KEY='hulk-smash-city-checkpoint-v1';
const finite=(v,fallback=0)=>Number.isFinite(v)?v:fallback;
const limit=(n,min,max)=>Math.max(min,Math.min(max,n));
export function createCheckpoint(stage,stats,stageCount,now=Date.now()){
 if(!Number.isInteger(stage)||stage<1||stage>=stageCount||!stats)return null;
 return {
  version:1,campaignLength:stageCount,stage,
  score:limit(finite(stats.score),0,1e9),
  health:limit(finite(stats.health,100),1,100),
  rage:limit(finite(stats.rage),0,100),
  kills:limit(finite(stats.kills),0,1e7),
  destroyed:limit(finite(stats.destroyed),0,1e7),
  throws:limit(finite(stats.throws),0,1e7),
  comboFinishers:limit(finite(stats.comboFinishers),0,1e7),
  claps:limit(finite(stats.claps),0,1e7),
  tankCrushes:limit(finite(stats.tankCrushes),0,1e7),
  spinThrows:limit(finite(stats.spinThrows),0,1e7),
  savedAt:limit(finite(now),0,Number.MAX_SAFE_INTEGER)
 };
}
export function parseCheckpoint(json,stageCount){
 if(typeof json!=='string'||json.length>4096)return null;
 try{
  const data=JSON.parse(json);
  if(!data||data.version!==1||data.campaignLength!==stageCount||!Number.isInteger(data.stage)||data.stage<1||data.stage>=stageCount)return null;
  if(!Number.isFinite(data.health)||data.health<=0||!Number.isFinite(data.score))return null;
  return createCheckpoint(data.stage,data,stageCount,data.savedAt);
 }catch{return null;}
}
export function loadCheckpoint(storage,stageCount){
 try{return parseCheckpoint(storage?.getItem(CHECKPOINT_KEY),stageCount);}catch{return null;}
}
export function storeCheckpoint(storage,checkpoint){
 if(!checkpoint)return false;
 try{storage?.setItem(CHECKPOINT_KEY,JSON.stringify(checkpoint));return !!storage;}catch{return false;}
}
export function eraseCheckpoint(storage){
 try{storage?.removeItem(CHECKPOINT_KEY);return !!storage;}catch{return false;}
}
