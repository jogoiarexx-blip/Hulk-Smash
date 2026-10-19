// Hulk v1.6 — deterministic full-body pose curves. Pure module, no WebGL dependency.
// Combat damage and collisions remain exclusively controlled by game.js.
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:0));
const smoothstep=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
const phase=(remaining,duration)=>1-clamp(remaining/duration);
const action=(remaining,duration,attack=.18,hold=.64)=>{
  if(!(remaining>0))return 0;
  const t=phase(remaining,duration);
  return smoothstep(.08,attack,t)*(1-smoothstep(hold,1,t));
};
const anticipation=(remaining,duration)=>{
  if(!(remaining>0))return 0;
  const t=phase(remaining,duration);
  return Math.sin(Math.PI*clamp(t/.24))*(1-smoothstep(.18,.42,t));
};

export function avatarPose(a={},s={}){
  const walking=clamp((a.speed||0)/11.5,0,1.55);
  const charged=a.chargingJump?clamp((a.jumpCharge||0)/1.65):0;
  const punch=action(a.attack||0,.36,.43,.61)*(1+(Math.max(1,Math.min(3,a.comboStep||1))-1)*.11),punchWind=anticipation(a.attack||0,.36);
  const clap=action(a.clapPose||0,.88,.50,.75),clapWind=anticipation(a.clapPose||0,.88);
  const slam=action(a.slamPose||0,.60,.45,.78),slamWind=anticipation(a.slamPose||0,.60);
  const throwing=action(a.throwPose||0,.48,.38,.70);
  const holding=s.holdingCar||s.holdingEnemy?1:0;
  const lift=s.holdingEnemy?clamp(s.liftRatio):0;
  const grabWind=anticipation(a.grabEnemyPose||0,.95);
  const double=action(a.doubleSmashPose||0,.82,.43,.66),doubleWind=anticipation(a.doubleSmashPose||0,.82);
  const climbing=!!a.climbing;
  const airborne=!a.onGround&&!climbing;
  const rage=(s.rageTime||0)>0;
  const strikeLeft=a.attackHand<0?punch:0,strikeRight=a.attackHand>0?punch:0;
  const windLeft=a.attackHand<0?punchWind:0,windRight=a.attackHand>0?punchWind:0;
  const gait=a.walk||0,swing=Math.sin(gait),cos=Math.cos(gait),stride=swing*walking;
  const moveClimb=climbing?clamp((a.speed||0)/2.8,0,1):0;
  const climbWave=Math.sin((s.time||0)*8.5)*moveClimb;
  const launching=airborne?clamp((a.jumpVelocity||0)/28):0;
  const falling=airborne?clamp(-(a.jumpVelocity||0)/30):0;
  const landing=a.landTime>0?Math.sin(Math.PI*clamp((a.landTime||0)/.26)):0;
  const breathing=Math.sin((s.time||0)*2.05);
  const sway=Math.sin(gait)*clamp(walking/.95);
  let mode='idle';
  if(walking>.1)mode=walking>1.13?'run':'walk';
  if(airborne)mode=a.airSmash?'air-smash':launching>.12?'jump-rise':falling>.15?'jump-fall':'jump';
  if(a.chargingJump)mode='super-jump-charge';
  if(climbing)mode=moveClimb>.05?'climb':'climb-hold';
  if(throwing>.05||holding)mode=s.holdingEnemy&&lift<.99?'tank-lift':'throw-grab';
  if(slam>.05)mode='ground-smash';
  if(clap>.05)mode='thunderclap';
  if(double>.05)mode='double-smash';
  if(punch>.05)mode=a.attackHand<0?'left-punch':'right-punch';
  if(rage&&mode==='idle')mode='rage-idle';
  const armL=climbing?-2.10+climbWave*.60:
    airborne?(a.airSmash?-2.2:-.65-launching*.40):
    -stride*.37+windLeft*.38-strikeLeft*2.1-slam*1.70+slamWind*.15-clap*1.80+clapWind*.47-throwing*1.25-holding*(s.holdingEnemy?(1.12+lift*1.40):2.42)+grabWind*.28-charged*.5-double*2.1+doubleWind*.32;
  const armR=climbing?-2.10-climbWave*.60:
    airborne?(a.airSmash?-2.2:-.65-launching*.40):
    stride*.37+windRight*.38-strikeRight*2.1-slam*1.70+slamWind*.15-clap*1.80+clapWind*.47-throwing*1.15-holding*(s.holdingEnemy?(1.12+lift*1.40):2.42)+grabWind*.28-charged*.5-double*2.1+doubleWind*.32;
  const legL=climbing?(-.48+climbWave*.51):(airborne?-.27-launching*.18+falling*.09:stride*.54);
  const legR=climbing?(-.48-climbWave*.51):(airborne?-.44+falling*.12:-stride*.54);
  return {
    mode,walking,charged,punch,clap,slam,rage,
    legs:[legL,legR],
    knees:[climbing?.62+clamp(-climbWave)*.20:airborne?.72+falling*.12:Math.max(0,-swing)*.73*walking+charged*.86+landing*.28,
           climbing?.62+clamp(climbWave)*.20:airborne?.88+falling*.08:Math.max(0,swing)*.73*walking+charged*.86+landing*.28],
    arms:[armL,armR],
    forearms:[climbing?-.38-climbWave*.14:.14+windLeft*.25+strikeLeft*.56+clap*.94+charged*.36+holding*.44+double*.52,
              climbing?-.38+climbWave*.14:.14+windRight*.25+strikeRight*.56+clap*.94+charged*.36+holding*.44+double*.52],
    // During the thunderclap the arms converge in front of the chest.
    spreads:[-.12+clap*.91-clapWind*.47-slam*.22-strikeLeft*.16+holding*.18+double*.30,
              .12-clap*.91+clapWind*.47+slam*.22+strikeRight*.16-holding*.18-double*.30],
    shoulderLift:climbing?.20:clap*.19+slam*.18+punchWind*.07,
    spineX:climbing?-.26:walking*.095+(s.holdingEnemy?(1-lift)*.31:0)+charged*.30+slam*.30+double*.34+landing*.23+(airborne?-.16+launching*.10:0),
    spineY:(strikeRight-strikeLeft)*.38+(windLeft-windRight)*.13+sway*.045,
    spineZ:climbing?0:sway*.045,
    hipsYaw:sway*-.065+(strikeRight-strikeLeft)*-.13,
    hipsY:-charged*.24-landing*.18-(s.holdingEnemy?(1-lift)*.13:0)+(climbing?Math.sin((s.time||0)*17)*.015*moveClimb:Math.sin(gait*2)*.035*walking),
    headX:(a.airSmash?.16:0)+slam*.15+clap*.06-charged*.13-falling*.09,
    headY:(strikeLeft-strikeRight)*.11,
    jawX:(rage?.16:0)+slam*.19+clap*.22+punch*.065+double*.11,
    handCurl:[.19+(strikeLeft+clap+slam+holding+charged+double)*.24+rage*.08,
              .19+(strikeRight+clap+slam+holding+charged+double)*.24+rage*.08],
    footAngles:[climbing?-.22+climbWave*.24:airborne?-.28+falling*.18:Math.max(0,cos)*.20*walking-charged*.22,
                climbing?-.22-climbWave*.24:airborne?-.23+falling*.18:Math.max(0,-cos)*.20*walking-charged*.22],
    breath:breathing*.013*(1-clamp(walking*.5)),
  };
}

// Framerate-independent damped blending. This lives outside the GLTF animation mixer:
// every frame uses original idle animation + a blended additive procedural pose.
export function blendAvatarPose(previous,target,dt){
  if(!previous||!(dt>0))return target;
  const combat=/punch|clap|smash|thunderclap|throw-grab|tank-lift/.test(target.mode);
  const climbing=target.mode.startsWith('climb');
  const speed=combat?20:climbing?11:(target.walking>.1?12:8);
  const alpha=1-Math.exp(-clamp(dt,0,.08)*speed);
  const result={...target};
  for(const [key,value] of Object.entries(target)){
    const older=previous[key];
    if(typeof value==='number'&&typeof older==='number')result[key]=older+(value-older)*alpha;
    else if(Array.isArray(value)&&Array.isArray(older)&&value.length===older.length)
      result[key]=value.map((v,i)=>Number.isFinite(v)&&Number.isFinite(older[i])?older[i]+(v-older[i])*alpha:v);
  }
  return result;
}
