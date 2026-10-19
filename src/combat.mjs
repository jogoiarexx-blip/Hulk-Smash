// Deterministic combat geometry and state helpers (no WebGL dependencies).
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:a));
export function heavyHitCrossed(previous,next,duration=.82,at=.38){
 return previous>at&&next<=at&&previous<=duration+.0001;
}
export function grabEligible(e,player,forward){
 if(!e||!e.alive||e.held||e.thrown||!e.group||!player||!forward)return false;
 const p=e.group.position,dx=p.x-player.x,dz=p.z-player.z,d=Math.hypot(dx,dz);
 if(d>(e.kind==='tank'?7.4:9.7)||Math.abs(p.y-player.y)>(e.kind==='tank'?4.5:8.5))return false;
 return d<2||((dx*forward.x+dz*forward.z)/d)>-.3;
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
