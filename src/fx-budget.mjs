// Rendering-side budgets. Game physics, damage and objectives are never throttled.
export function particleQuota(distance,activeCount=0,limit=170){
 const d=Number.isFinite(distance)?Math.max(0,distance):Infinity;
 if(d<42)return 1; // Always prioritize nearby explosion feedback.
 if(d>115)return 0;
 if(activeCount>=limit*.80)return d<65?.35:0;
 if(activeCount>=limit*.60)return d<75?.5:.25;
 return d<85?1:.5;
}
export function rubbleDustCount(distance,active=0){
 const d=Number.isFinite(distance)?Math.max(0,distance):Infinity;
 if(d<35)return active>140?7:12;
 if(d<85)return active>120?3:6;
 return active>85?0:2;
}
export function shouldRenderStructuralDust(distance,active=0){
 return distance<95&&active<160;
}
