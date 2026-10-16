import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { avatarPose } from './avatar-poses.mjs';

// Fully skinned Hulk GLB. Original idle clip plays as a foundation; all additional
// motions are procedural/additive bone poses driven by the game's existing state.
// This avoids external FBX files, animation downloads and timing desynchronization.
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
const aliases={
 hips:'Hips_',spine:'Spine_',spine2:'Spine2_',head:'Head_',jaw:'Jaw_',
 leftArm:'LeftArm_',rightArm:'RightArm_',leftForearm:'LeftForeArm_',rightForearm:'RightForeArm_',
 leftLeg:'LeftUpLeg_',rightLeg:'RightUpLeg_',leftKnee:'LeftLeg_',rightKnee:'RightLeg_',
 leftFoot:'LeftFoot_',rightFoot:'RightFoot_',leftShoulder:'LeftShoulder_',rightShoulder:'RightShoulder_'
};
const fingerStem=['HandIndex1_','HandMiddle1_','HandRing1_','HandPinky1_','HandThumb1_'];

export async function loadHulkAvatar({rig,legacyParts,url='./assets/models/hulk.glb',onStatus=()=>{}}){
 const loader=new GLTFLoader();
 const gltf=await loader.loadAsync(url);
 if(!gltf.scene)throw new Error('O arquivo GLB não tem uma cena 3D.');
 const root=new THREE.Group();root.name='HulkAvatar_v1_5';root.add(gltf.scene);
 gltf.scene.traverse(o=>{
  if(o.isSkinnedMesh||o.isMesh){
   o.castShadow=true;o.receiveShadow=true;
   o.frustumCulled=false; // Protect the animated skin from incorrect static bone bounds.
   if(o.material){for(const m of (Array.isArray(o.material)?o.material:[o.material])){
    if(m.map)m.map.colorSpace=THREE.SRGBColorSpace;
    m.needsUpdate=true;
   }}
  }
 });
 const bones={};
 gltf.scene.traverse(o=>{if(!o.isBone)return;for(const [key,prefix] of Object.entries(aliases)){
  if(o.name.startsWith('mixamorig:'+prefix))bones[key]=o;
 }});
 for(const [key,prefix] of Object.entries(aliases)){
  if(!bones[key])throw new Error('O GLB não tem o osso necessário: '+prefix);
 }
 const fingers={left:[],right:[]};
 gltf.scene.traverse(o=>{if(!o.isBone)return;
  for(const side of ['Left','Right'])if(fingerStem.some(stem=>o.name.startsWith(`mixamorig:${side}${stem}`)))fingers[side.toLowerCase()].push(o);
 });
 const mixer=new THREE.AnimationMixer(gltf.scene);
 const idle=gltf.animations.find(c=>c.name==='Anim_Hulk_Idle_Upright')||gltf.animations[0];
 if(idle)mixer.clipAction(idle).setLoop(THREE.LoopRepeat).play();
 mixer.update(0);
 root.updateMatrixWorld(true);
 let bounds=new THREE.Box3().setFromObject(gltf.scene);
 const modelHeight=bounds.max.y-bounds.min.y;
 if(!Number.isFinite(modelHeight)||modelHeight<=.01)throw new Error('Dimensões do modelo GLB inválidas.');
 // Auto-normalize the Sketchfab source transform: the model matches the 6.2m character
 // regardless of its internal FBX / Sketchfab transform scale.
 const scale=THREE.MathUtils.clamp(6.15/modelHeight,.06,30);
 const center=bounds.getCenter(new THREE.Vector3());
 root.scale.setScalar(scale);root.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
 root.userData.sourceName='hulk.glb';
 rig.add(root);
 for(const oldPart of legacyParts)oldPart.visible=false;
 let enabled=true,lastMode='idle';
 const adapter={
  root,mixer,bones,clips:gltf.animations.map(c=>c.name),scale,height:6.15,
  get status(){return 'ready';},get mode(){return lastMode;},
  showModel(value){enabled=!!value;root.visible=enabled;legacyParts.forEach(p=>p.visible=!enabled);},
  update(dt,a,s){
   if(!enabled)return;
   mixer.update(Math.min(dt,.05)); // Rebuild the original animation pose before each additive overlay.
   const p=avatarPose(a,s);lastMode=p.mode;
   // Root locomotion, jump and charge remain controlled by the existing player object.
   // Only the new GLB skeleton gets these offsets; hitboxes stay unchanged.
   bones.hips.position.y+=p.hipsY/scale/1.91;
   rotateBone(bones.spine,'x',p.spineX*.63,rig);
   rotateBone(bones.spine2,'x',p.spineX*.45,rig);
   rotateBone(bones.spine2,'y',p.spineY,rig);
   rotateBone(bones.spine,'z',p.spineZ,rig);
   rotateBone(bones.head,'x',p.headX,rig);
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
   rotateBone(bones.leftFoot,'x',-p.knees[0]*.25,rig);
   rotateBone(bones.rightFoot,'x',-p.knees[1]*.25,rig);
   for(const finger of fingers.left)rotateBone(finger,'x',p.handCurl[0],rig);
   for(const finger of fingers.right)rotateBone(finger,'x',p.handCurl[1],rig);
  }
 };
 onStatus('ready',adapter);
 return adapter;
}
