// Avatar animation signals shared by the GLB skeleton adapter and pure regression tests.
// The combat collision timing is still owned by the original game; poses never deal damage.
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const pulse=(remaining,duration)=>Math.sin(Math.PI*clamp(remaining/duration));
export function avatarPose(a,s={}){
  const walking=clamp((a.speed||0)/11.5,0,1.55);
  const charged=a.chargingJump?clamp((a.jumpCharge||0)/1.65):0;
  const punch=pulse(a.attack||0,.36);
  const clap=pulse(a.clapPose||0,.64);
  const slam=pulse(a.slamPose||0,.60);
  const throwing=pulse(a.throwPose||0,.48);
  const holding=s.holdingCar?1:0;
  const climbing=!!a.climbing;
  const airborne=!a.onGround&&!climbing;
  const rage=(s.rageTime||0)>0;
  const strikeLeft=a.attackHand<0?punch:0;
  const strikeRight=a.attackHand>0?punch:0;
  const walkPhase=a.walk||0;
  const stride=Math.sin(walkPhase)*walking;
  const upperSpeed=clamp(walking/1.25);
  const climbWave=Math.sin((s.time||0)*9);
  const f=(v)=>Number.isFinite(v)?v:0;
  let mode='idle';
  if(walking>.1)mode=walking>1.13?'run':'walk';
  if(airborne)mode=a.airSmash?'air-smash':'jump';
  if(charged>0)mode='super-jump-charge';
  if(climbing)mode='climb';
  if(throwing>.05||holding)mode='throw-grab';
  if(slam>.05)mode='ground-smash';
  if(clap>.05)mode='thunderclap';
  if(punch>.05)mode=a.attackHand<0?'left-punch':'right-punch';
  if(rage&&mode==='idle')mode='rage-idle';

  const jumpLegL=airborne?-.28:0,jumpLegR=airborne?-.45:0;
  const legL=climbing?(-.52+climbWave*.5):(airborne?jumpLegL:stride*.51);
  const legR=climbing?(-.52-climbWave*.5):(airborne?jumpLegR:-stride*.51);
  const armL=climbing?(-2.25+climbWave*.43):(airborne?(a.airSmash?-2.3:-.85):(-stride*.34-strikeLeft*1.9-slam*1.55-clap*1.20-throwing*1.12-holding*2.50-charged*.4));
  const armR=climbing?(-2.25-climbWave*.43):(airborne?(a.airSmash?-2.3:-.85):(stride*.34-strikeRight*1.9-slam*1.55-clap*1.20-throwing*.85-holding*2.50-charged*.4));
  const forearmL=climbing?(-.48-climbWave*.12):(.12+strikeLeft*.75+clap*.45+charged*.35+holding*.5);
  const forearmR=climbing?(-.48+climbWave*.12):(.12+strikeRight*.75+clap*.45+charged*.35+holding*.5);
  return {
   mode,walking,charged,punch,clap,slam,rage,
   legs:[f(legL),f(legR)],knees:[f(climbing?.62:airborne?.9:Math.max(0,-Math.sin(walkPhase))*.64*walking+charged*.75),f(climbing?.62:airborne?.95:Math.max(0,Math.sin(walkPhase))*.64*walking+charged*.75)],
   arms:[f(armL),f(armR)],forearms:[f(forearmL),f(forearmR)],
   // +Z / -Z angles open or close the arms against the chest for each special action.
   spreads:[f(-.08-clap*1.07-slam*.32-strikeLeft*.22+holding*.25),f(.08+clap*1.07+slam*.32+strikeRight*.22-holding*.25)],
   shoulderLift: climbing?.22:clap*.2+slam*.18,
   spineX:f((climbing?-.24:(walking*.08+charged*.18+slam*.25+(airborne?-.14:0)))),
   spineY:f((strikeRight-strikeLeft)*.31+Math.sin(walkPhase)*.04*upperSpeed),
   spineZ:f(Math.sin(walkPhase)*.035*upperSpeed),
   hipsY:f(-charged*.12-(a.landTime>0?Math.sin(Math.PI*clamp(a.landTime/.26))*.07:0)),
   headX:f((a.airSmash?.16:0)+slam*.10),jawX:f((rage?.18:0)+slam*.24+clap*.15+punch*.08),
   handCurl:[f(strikeLeft*.28+clap*.14),f(strikeRight*.28+clap*.14)],
   // Model uses the same 6m world scale and gameplay collider as the original rig.
  };
}
