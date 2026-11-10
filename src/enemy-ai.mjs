// Pure tactical steering: tanks maintain firing distance, drones strafe, and commanders advance.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,Number.isFinite(x)?x:a));
export function enemyTactics(kind,distance,time=0,stunned=false,boss=false,defending=false){
 if(stunned||!Number.isFinite(distance))return {forward:0,strafe:0,speed:0};
 const isTank=kind==='tank';
 const low=defending?8:isTank?(boss?12:18):15;
 const high=defending?15:isTank?(boss?25:35):27;
 const side=Math.sin(time*.6)>=0?1:-1;
 if(distance>high)return {forward:1,strafe:defending?0:side*.22,speed:1};
 if(distance<low)return {forward:defending?.28:-.7,strafe:defending?side*.3:side*.55,speed:isTank?.9:1.1};
 return {forward:defending?.35:0,strafe:side*(isTank?.68:1),speed:isTank?.66:.9};
}
export function threatMovement(forwardX,forwardZ,tactic){
 const x=forwardX*tactic.forward+forwardZ*tactic.strafe;
 const z=forwardZ*tactic.forward-forwardX*tactic.strafe;
 const length=Math.hypot(x,z);
 return length>.001?{x:x/length,z:z/length}: {x:0,z:0};
}
export function aiFireInterval(kind,boss=false,stage=0){
 const base=boss?1.5:kind==='tank'?3.3:2.7;
 return clamp(base-Math.max(0,stage)*.12,boss?1.1:1.45,base);
}
