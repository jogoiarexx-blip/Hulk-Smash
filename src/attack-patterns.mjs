// Deterministic encounter variants; pure helpers, no renderer dependency.
// Telegraph windows give the player time to react instead of instant unseen shots.
export function attackPattern(kind='tank',boss=false,sequence=0){
 const n=Math.max(0,Math.trunc(Number.isFinite(sequence)?sequence:0));
 if(boss)return n%3===2?{name:'siege',count:1,spread:0,speed:1.28,damage:1.35,warn:.9,cooldown:1.15}:{name:'barrage',count:3,spread:.15,speed:1.0,damage:.72,warn:.82,cooldown:1.0};
 if(kind==='drone'){
  const mode=n%3;
  if(mode===1)return {name:'fan',count:3,spread:.24,speed:.88,damage:.68,warn:.62,cooldown:1.28};
  if(mode===2)return {name:'dart',count:1,spread:0,speed:1.32,damage:.85,warn:.46,cooldown:.92};
  return {name:'pulse',count:1,spread:0,speed:1,damage:1,warn:.53,cooldown:1};
 }
 return n%3===1?{name:'double-cannon',count:2,spread:.12,speed:1.05,damage:.78,warn:.76,cooldown:1.22}:{name:'cannon',count:1,spread:0,speed:1,damage:1,warn:.65,cooldown:1};
}
export function volleyDirections(direction,pattern){
 const x=Number.isFinite(direction?.x)?direction.x:0,y=Number.isFinite(direction?.y)?direction.y:0,z=Number.isFinite(direction?.z)?direction.z:0;
 const length=Math.hypot(x,y,z)||1,n=Math.min(3,Math.max(1,Math.floor(pattern?.count||1))),spread=Math.max(0,Math.min(.5,pattern?.spread||0));
 return Array.from({length:n},(_,i)=>{
  const angle=(i-(n-1)/2)*spread,cos=Math.cos(angle),sin=Math.sin(angle);
  return {x:(x*cos-z*sin)/length,y:y/length,z:(x*sin+z*cos)/length};
 });
}
export function projectileThreat(projectile,point,limit=1.6,radius=3.0){
 if(!projectile||!point)return null;
 const p=projectile.position||projectile.mesh?.position,v=projectile.velocity;
 if(!p||!v)return null;
 const speedSq=v.x*v.x+v.y*v.y+v.z*v.z;
 if(!(speedSq>1e-6))return null;
 const diff={x:point.x-p.x,y:point.y-p.y,z:point.z-p.z};
 const time=(diff.x*v.x+diff.y*v.y+diff.z*v.z)/speedSq;
 if(!Number.isFinite(time)||time<0||time>limit)return null;
 const miss=Math.hypot(p.x+v.x*time-point.x,p.y+v.y*time-point.y,p.z+v.z*time-point.z);
 return miss<=radius?{time,miss}:null;
}
