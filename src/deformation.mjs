// Progressive stylized crumpling of vehicles; deterministic geometry-free helper.
export function dentValue(health,maxHealth){
 if(!Number.isFinite(health)||!(maxHealth>0))return 0;
 return Math.min(1,Math.max(0,1-health/maxHealth));
}
export function dentPose(level){
 const t=Math.min(1,Math.max(0,Number(level)||0));
 return {roofHeight:1-t*.42,roofTilt:t*.13,hoodTilt:t*.34,
  doorWidth:1-t*.40,doorShift:t*.35,bumperDepth:1-t*.58,
  glassOpacity:Math.max(.32,1-t*.6),bodyRoll:t*.10};
}
export function applyCarDamage(car,amount){
 if(!car.alive||!Number.isFinite(amount)||amount<=0)return {destroyed:false,changed:false};
 car.health=Math.max(0,car.health-amount);
 car.damageLevel=dentValue(car.health,car.maxHealth||70);
 return {destroyed:car.health<=0,changed:true,level:car.damageLevel};
}
