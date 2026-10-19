// Pure targets for Hulk's constrained CCD contact system, in game world coordinates.
export const bound=(x,lo,hi)=>Math.max(lo,Math.min(hi,Number.isFinite(x)?x:lo));
export function dampWeight(current,target,dt,rate=8){
 return current+(bound(target,0,1)-current)*(1-Math.exp(-bound(dt,0,.08)*rate));
}
export function reachLimit(distance,first,second){
 const maximum=Math.max(.01,first+second)*.985;
 const minimum=Math.max(.01,Math.abs(first-second)+.025);
 return bound(distance,minimum,maximum);
}
export function contactHands(actor,face,time,speed=0){
 if(!actor||!face||!(Math.abs(face.normalX)+Math.abs(face.normalZ)>0))return null;
 const nx=face.normalX,nz=face.normalZ,moving=bound(speed/4,0,1);
 const cycle=Math.sin(time*8.5)*moving,wallDistance=1.55;
 const middleX=actor.x-nx*wallDistance,middleZ=actor.z-nz*wallDistance;
 const tangentX=-nz,tangentZ=nx;
 return {
  left:{x:middleX-tangentX*.93,y:actor.y+4.45+cycle*.56,z:middleZ-tangentZ*.93},
  right:{x:middleX+tangentX*.93,y:actor.y+4.45-cycle*.56,z:middleZ+tangentZ*.93}
 };
}
export function footStance(phase,side,walking){
 if(!(walking>.08))return 0;
 const swing=Math.sin(phase+(side==='right'?Math.PI:0));
 return bound((-swing+.18)*2,0,1)*bound(walking/.55,0,1);
}
