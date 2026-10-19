import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { avatarPose, blendAvatarPose } from './avatar-poses.mjs?v=2.0';
import { resolveHulkSkeleton } from './rig-map.mjs?v=2.0';
import { contactHands, dampWeight, footStance, reachLimit } from './contact-ik.mjs?v=2.0';

// Loads and validates the *actual bundled* GLB before swapping out the legacy mesh.
// Failures are propagated to the game UI. Never report success for just finding the file.
const AXES={x:new THREE.Vector3(1,0,0),y:new THREE.Vector3(0,1,0),z:new THREE.Vector3(0,0,1)};
const qParent=new THREE.Quaternion(),qGame=new THREE.Quaternion(),qLocal=new THREE.Quaternion();
const worldAxis=new THREE.Vector3();
function rotateBone(bone,axis,angle,rig){
 if(!bone||Math.abs(angle)<.0001)return;
 rig.getWorldQuaternion(qGame);
 worldAxis.copy(AXES[axis]).applyQuaternion(qGame);
 bone.parent.getWorldQuaternion(qParent);
 worldAxis.applyQuaternion(qParent.invert()).normalize();
 qLocal.setFromAxisAngle(worldAxis,angle);
 bone.quaternion.premultiply(qLocal);
}

// Lightweight constrained two-link CCD, in world space, applied after animation blending.
// It drives real skinned bones; no mesh-space deformation or arm lengthening.
const ikPivot=new THREE.Vector3(),ikEnd=new THREE.Vector3(),ikGoal=new THREE.Vector3();
const ikA=new THREE.Vector3(),ikB=new THREE.Vector3(),ikCross=new THREE.Vector3();
const ikQuat=new THREE.Quaternion(),ikParent=new THREE.Quaternion(),ikWorld=new THREE.Quaternion();
function aimJoint(joint,tip,target,blend,maxTurn=.22){
 if(!joint||!tip||blend<=.005)return;
 joint.updateWorldMatrix(true,true);
 joint.getWorldPosition(ikPivot);tip.getWorldPosition(ikEnd);
 ikA.subVectors(ikEnd,ikPivot);ikB.subVectors(target,ikPivot);
 if(ikA.lengthSq()<1e-6||ikB.lengthSq()<1e-6)return;
 ikA.normalize();ikB.normalize();
 const theta=Math.acos(THREE.MathUtils.clamp(ikA.dot(ikB),-1,1));
 ikCross.crossVectors(ikA,ikB);
 if(ikCross.lengthSq()<1e-9||theta<1e-4)return;
 ikCross.normalize();
 joint.parent.getWorldQuaternion(ikParent);
 joint.getWorldQuaternion(ikWorld);
 ikQuat.setFromAxisAngle(ikCross,Math.min(theta*blend,maxTurn));
 ikWorld.premultiply(ikQuat); // rotate the animated limb in world space
 joint.quaternion.copy(ikParent.invert().multiply(ikWorld)).normalize();
 joint.updateWorldMatrix(true,true);
}
function solveTwoLink(upper,lower,tip,worldTarget,weight,iterations=3){
 if(!upper||!lower||!tip||weight<=.005)return;
 upper.updateWorldMatrix(true,true);
 const a=upper.getWorldPosition(new THREE.Vector3());
 const b=lower.getWorldPosition(new THREE.Vector3());
 const c=tip.getWorldPosition(new THREE.Vector3());
 const lenA=a.distanceTo(b),lenB=b.distanceTo(c);
 if(lenA<.03||lenB<.03)return;
 const direction=worldTarget.clone().sub(a),distance=direction.length();
 if(distance<.001)return;
 ikGoal.copy(a).addScaledVector(direction,distance>0?reachLimit(distance,lenA,lenB)/distance:0);
 for(let i=0;i<iterations;i++){
  aimJoint(lower,tip,ikGoal,weight,.22);
  aimJoint(upper,tip,ikGoal,weight,.22);
 }
}
export async function loadHulkAvatar({rig,legacyParts,url='./assets/models/hulk.glb',onStatus=()=>{}}){
 const fullUrl=new URL(url,document.baseURI);
 onStatus('fetch','Lendo hulk.glb (1,08 MB)...');
 const response=await fetch(fullUrl.href,{cache:'no-store'});
 if(!response.ok)throw new Error(`GLB HTTP ${response.status} — ${fullUrl.pathname}. Extraia todas as pastas do ZIP e use JOGAR-WINDOWS.bat.`);
 const raw=await response.arrayBuffer();
 const view=new DataView(raw);
 if(raw.byteLength<20||view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==raw.byteLength){
  throw new Error('O arquivo recebido não é um GLB 2.0 válido. Verifique assets/models/hulk.glb.');
 }
 onStatus('parse',`Arquivo GLB íntegro (${(raw.byteLength/1024/1024).toFixed(2)} MB). Interpretando malha, textura e esqueleto...`);
 const gltf=await new GLTFLoader().parseAsync(raw,new URL('./',fullUrl.href).href);
 if(!gltf.scene)throw new Error('O GLB não contém uma cena tridimensional.');
 const meshes=[];
 const skeletonNodes=[];
 gltf.scene.traverse(o=>{
  if(o.isMesh){
   meshes.push(o);
   o.visible=true;
   o.castShadow=true;o.receiveShadow=true;
   o.frustumCulled=false;
   if(o.material){for(const m of (Array.isArray(o.material)?o.material:[o.material])){
    if(m.map)m.map.colorSpace=THREE.SRGBColorSpace;
    m.side=THREE.DoubleSide;
    m.needsUpdate=true;
   }}
  }
  if(o.isBone)skeletonNodes.push(o);
 });
 if(!meshes.length)throw new Error('A cena GLB não contém nenhuma malha 3D visível.');
 const {bones,fingers,missing,foundNames}=resolveHulkSkeleton(skeletonNodes);
 if(missing.length){
  const preview=foundNames.slice(0,7).join(', ')||'nenhum nó marcado como Bone';
  throw new Error(`Esqueleto incompatível: faltam ${missing.join(', ')}. ${skeletonNodes.length} ossos encontrados, exemplos: ${preview}`);
 }
 onStatus('rig',`${skeletonNodes.length} ossos detectados; ${Object.keys(bones).length} articulações mapeadas. Preparando animações...`);
 const mixer=new THREE.AnimationMixer(gltf.scene);
 const idle=gltf.animations.find(c=>c.name==='Anim_Hulk_Idle_Upright')||gltf.animations[0];
 if(idle)mixer.clipAction(idle).setLoop(THREE.LoopRepeat).play();
 mixer.update(0);
 gltf.scene.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(gltf.scene);
 const size=bounds.getSize(new THREE.Vector3());
 if(!Number.isFinite(size.y)||size.y<=.01||!Number.isFinite(size.x))throw new Error('Limites do modelo inválidos: geometria fora de escala.');
 // Normalize for the legacy collision/animation height while keeping proportions.
 const scale=THREE.MathUtils.clamp(6.15/size.y,.06,30);
 const center=bounds.getCenter(new THREE.Vector3());
 const root=new THREE.Group();root.name='Hulk_GLB_Original';
 root.userData.sourceName='assets/models/hulk.glb';
 root.add(gltf.scene);
 root.scale.setScalar(scale);
 root.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
 root.visible=true;
 // Capture bind/idle transformations so additive poses never accumulate on unkeyed joints.
 const posedBones=[...new Set([...Object.values(bones),...fingers.left,...fingers.right])];
 const baseRot=posedBones.map(b=>b.quaternion.clone());
 const basePos=posedBones.map(b=>b.position.clone());
 let blendedPose=null;
 let climbIK=0;const footIK={left:0,right:0};
 const adapter={
  root,mixer,bones,scale,jointCount:skeletonNodes.length,meshCount:meshes.length,vertexCount:meshes.reduce((s,m)=>s+(m.geometry?.getAttribute('position')?.count||0),0),
  clips:gltf.animations.map(c=>c.name),height:6.15,modelUrl:fullUrl.href,
  mode:'idle',visible:true,forwardFlip:false,
  get status(){return 'ready';},
  showModel(value){this.visible=!!value;root.visible=this.visible;legacyParts.forEach(p=>p.visible=!this.visible);},
  flipFacing(){this.forwardFlip=!this.forwardFlip;root.rotation.y=this.forwardFlip?Math.PI:0;},
  update(dt,a,s){
   if(!this.visible)return;
   // Restore unkeyed bone transforms before the idle animation is applied.
   posedBones.forEach((b,i)=>{b.quaternion.copy(baseRot[i]);b.position.copy(basePos[i]);});
   mixer.update(Math.min(dt,.05));
   const target=avatarPose(a,s);
   const p=blendAvatarPose(blendedPose,target,dt);blendedPose=p;this.mode=target.mode;
   bones.hips.position.y+=(p.hipsY+p.breath)/scale/1.91;
   rotateBone(bones.hips,'y',p.hipsYaw,rig);
   rotateBone(bones.spine,'x',p.spineX*.63,rig);
   rotateBone(bones.spine2,'x',p.spineX*.45,rig);
   rotateBone(bones.spine2,'y',p.spineY,rig);
   rotateBone(bones.spine,'z',p.spineZ,rig);
   rotateBone(bones.head,'x',p.headX,rig);
   rotateBone(bones.head,'y',p.headY,rig);
   rotateBone(bones.jaw,'x',p.jawX,rig);
   rotateBone(bones.leftShoulder,'z',-p.shoulderLift,rig);
   rotateBone(bones.rightShoulder,'z',p.shoulderLift,rig);
   rotateBone(bones.leftArm,'x',p.arms[0]*.87,rig);
   rotateBone(bones.rightArm,'x',p.arms[1]*.87,rig);
   rotateBone(bones.leftArm,'z',p.spreads[0]*.85,rig);
   rotateBone(bones.rightArm,'z',p.spreads[1]*.85,rig);
   rotateBone(bones.leftForearm,'x',p.forearms[0]*.76,rig);
   rotateBone(bones.rightForearm,'x',p.forearms[1]*.76,rig);
   rotateBone(bones.leftLeg,'x',p.legs[0]*.87,rig);
   rotateBone(bones.rightLeg,'x',p.legs[1]*.87,rig);
   rotateBone(bones.leftKnee,'x',p.knees[0]*.8,rig);
   rotateBone(bones.rightKnee,'x',p.knees[1]*.8,rig);
   rotateBone(bones.leftFoot,'x',-p.knees[0]*.25+p.footAngles[0],rig);
   rotateBone(bones.rightFoot,'x',-p.knees[1]*.25+p.footAngles[1],rig);
   for(const finger of fingers.left)rotateBone(finger,'x',p.handCurl[0],rig);
   for(const finger of fingers.right)rotateBone(finger,'x',p.handCurl[1],rig);
   // Correct against physical wall surface AFTER the procedural clip (not before).
   const climbTargets=a.climbing?contactHands(s.worldPosition,s.climbFace,s.time||0,a.speed||0):null;
   climbIK=dampWeight(climbIK,climbTargets?1:0,dt,climbTargets?10:14);
   if(climbTargets&&climbIK>.01){
    solveTwoLink(bones.leftArm,bones.leftForearm,bones.leftHand,new THREE.Vector3(climbTargets.left.x,climbTargets.left.y,climbTargets.left.z),climbIK*.76);
    solveTwoLink(bones.rightArm,bones.rightForearm,bones.rightHand,new THREE.Vector3(climbTargets.right.x,climbTargets.right.y,climbTargets.right.z),climbIK*.76);
   }
   // Ankle grounding on flat city streets and roofs. Airborne legs are untouched.
   const mayPlant=a.onGround&&!a.climbing&&!a.chargingJump&&(a.speed||0)>.3;
   for(const side of ['left','right']){
    const stance=mayPlant?footStance(a.walk||0,side,(a.speed||0)/11.5):0;
    footIK[side]=dampWeight(footIK[side],stance,dt,14);
    if(footIK[side]>.04 && s.worldPosition){
     const leg=bones[side+'Leg'],knee=bones[side+'Knee'],foot=bones[side+'Foot'];
     if(leg&&knee&&foot){
      foot.updateWorldMatrix(true,true);
      const ankle=foot.getWorldPosition(new THREE.Vector3());
      const groundY=s.worldPosition.y+.34;
      const correction=THREE.MathUtils.clamp(groundY-ankle.y,-.65,.65);
      const goal=ankle.clone().add(new THREE.Vector3(0,correction,0));
      solveTwoLink(leg,knee,foot,goal,footIK[side]*.56,2);
     }
    }
   }

  }
 };
 // Perform the swap only when the GLB has passed all validation.
 rig.add(root);
 gltf.scene.updateMatrixWorld(true);
 adapter.showModel(true);
 onStatus('ready',adapter);
 return adapter;
}
