// Match GLTFLoader's sanitized names, including mixamorigLeftArm_024.
export const HULK_BONE_ALIASES=Object.freeze({
 hips:['hips','pelvis'],spine:['spine'],spine2:['spine2','spine02','chest','upperchest'],head:['head'],jaw:['jaw'],
 leftArm:['leftarm','leftupperarm'],rightArm:['rightarm','rightupperarm'],
 leftForearm:['leftforearm','leftlowerarm'],rightForearm:['rightforearm','rightlowerarm'],
 leftLeg:['leftupleg','leftupperleg','leftthigh'],rightLeg:['rightupleg','rightupperleg','rightthigh'],
 leftKnee:['leftleg','leftcalf','leftshin'],rightKnee:['rightleg','rightcalf','rightshin'],
 leftFoot:['leftfoot'],rightFoot:['rightfoot'],
 leftHand:['lefthand'],rightHand:['righthand'],
 leftToe:['lefttoeend','lefttoebase','lefttoe'],rightToe:['righttoeend','righttoebase','righttoe'],leftShoulder:['leftshoulder'],rightShoulder:['rightshoulder']
});
export const HULK_REQUIRED_BONES=Object.freeze(['hips','spine','head','leftArm','rightArm','leftForearm','rightForearm','leftLeg','rightLeg','leftKnee','rightKnee']);
export function normalizeBoneName(name){return String(name||'').trim().replace(/^.*[|:/\\]/,'').replace(/^mixamorig[_:\-]*/i,'').replace(/[_-]\d+$/,'').replace(/[^a-zA-Z0-9]/g,'').toLowerCase();}
const lookup=new Map();
for(const [role,names] of Object.entries(HULK_BONE_ALIASES))for(const n of names)if(!lookup.has(n))lookup.set(n,role);
export function resolveHulkSkeleton(objects){
 const bones={},fingers={left:[],right:[]},foundNames=[];
 for(const node of objects){if(!node?.isBone)continue;foundNames.push(node.name);
  const name=normalizeBoneName(node.name),role=lookup.get(name);
  if(role&&!bones[role])bones[role]=node;
  for(const side of ['left','right'])if(new RegExp('^'+side+'hand(index|middle|ring|pinky|thumb)[123]$').test(name))fingers[side].push(node);
 }
 return {bones,fingers,missing:HULK_REQUIRED_BONES.filter(role=>!bones[role]),foundNames};
}
