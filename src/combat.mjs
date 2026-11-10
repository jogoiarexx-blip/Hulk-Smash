// Deterministic combat geometry and state helpers (no WebGL dependencies).
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:a));
export function heavyHitCrossed(previous,next,duration=.82,at=.38){
 return previous>at&&next<=at&&previous<=duration+.0001;
}
export function enemyCanTakeDamage(enemy,missionKind,shieldsBroken=0){
 return !enemy?.boss || missionKind!=='boss' || shieldsBroken>=2;
}
export function enemyRenderScale(enemy){
 return (enemy?.boss?1.4:1)*(enemy?.blink>0?1.08:1);
}
export function slamImpactCrossed(previous,next,at=.30){
 return previous>at && next<=at;
}
// Commanders cannot be grabbed and thrown past their shield generators.
export function grabEligible(e,player,forward){
 if(!e||!e.alive||e.boss||e.held||e.thrown||!e.group||!player||!forward)return false;
 const p=e.group.position,dx=p.x-player.x,dz=p.z-player.z,d=Math.hypot(dx,dz);
 if(d>(e.kind==='tank'?7.4:9.7)||Math.abs(p.y-player.y)>(e.kind==='tank'?4.5:8.5))return false;
 return d<2||((dx*forward.x+dz*forward.z)/d)>-.3;
}
// Select the closest ordinary tank in front of the Hulk; commanders are never eligible.
export function findContextTank(enemies,player,forward,maxDistance=9.5){
 if(!enemies||!player||!forward)return null;
 let nearest=null,shortest=Infinity;
 for(const e of enemies){
  if(!e||e.kind!=='tank'||e.boss||!e.alive||e.held||e.thrown||!e.group)continue;
  const p=e.group.position,dx=p.x-player.x,dz=p.z-player.z,d=Math.hypot(dx,dz);
  if(!Number.isFinite(d)||d>maxDistance||Math.abs(p.y-player.y)>3.4)continue;
  if(d>2.6&&(dx*forward.x+dz*forward.z)/Math.max(d,.001)<.12)continue;
  if(d<shortest){nearest=e;shortest=d;}
 }
 return nearest;
}
// Two complete horizontal revolutions around the character's torso.
export function spinThrowOrbit(elapsed,duration=.82){
 const t=clamp((elapsed||0)/duration,0,1),angle=4*Math.PI*t;
 return {x:Math.sin(angle)*3,y:5.45+Math.sin(Math.PI*t)*.35,z:Math.cos(angle)*3,angle};
}
export function impactRecoil(target,origin,amount,kind='tank'){
 const dx=(target?.x||0)-(origin?.x||0),dz=(target?.z||0)-(origin?.z||0),length=Math.hypot(dx,dz)||1;
 const strength=clamp(amount*.002,.025,kind==='tank'?.19:.38);
 return {pitch:clamp(-dz/length*strength,-.4,.4),roll:clamp(dx/length*strength,-.4,.4)};
}
export function throwStep(body,dt,gravity=37){
 const h=clamp(dt,0,.05),vy=body.vy-gravity*h;
 return {x:body.x+body.vx*h,y:body.y+vy*h,z:body.z+body.vz*h,vy};
}
export function impactKnockback(target,origin,amount,kind='tank'){
 const dx=target.x-origin.x,dz=target.z-origin.z,length=Math.hypot(dx,dz)||1;
 const strength=Math.min(kind==='tank'?11:20,Math.max(1,amount*.10));
 return {x:strength*dx/length,z:strength*dz/length,stun:clamp(.15+amount*.003,.15,.8)};
}
