// Three-hit combat chain with timing window and optional input buffering.
export function nextChainStep(step,remaining){return remaining>0?Math.min(3,(step||0)+1):1;}
export function chainMultiplier(step){return [0,1,1.35,2.05][Math.max(1,Math.min(3,Math.round(step)||1))];}
export function clapImpactTimerCrossed(previous,next,impactAt=.31){return previous>impactAt&&next<=impactAt;}
export function throwLiftProgress(elapsed,duration=.72){
 const t=Math.max(0,Math.min(1,(elapsed||0)/duration));
 return t*t*(3-2*t);
}
