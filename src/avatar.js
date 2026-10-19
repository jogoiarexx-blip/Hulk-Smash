import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { avatarPose, blendAvatarPose } from './avatar-poses.mjs';
import { resolveHulkSkeleton } from './rig-map.mjs';

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
export async function loadHulkAvatar({rig,legacyParts,url='./assets/models/hulk.glb',onStatus=()=>{}}){
 const fullUrl=new URL(url,document.baseURI);
 onStatus('fetch','Lendo hulk.glb (1,08 MB)...');
 const response=await fetch(fullUrl.href,{cache:'no-store'});
 if(!response.ok)throw Error('GLB HTTP '+response.status+' — '+fullUrl.pathname);
 const raw=await response.arrayBuffer(),view=new DataView(raw);
 if(raw.byteLength<20||view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==raw.byteLength)throw Error('Arquivo hulk.glb inválido ou incompleto.');
 onStatus('parse','Arquivo GLB íntegro ('+(raw.byteLength/1048576).toFixed(2)+' MB). Interpretando textura e esqueleto...');
 const gltf=await new GLTFLoader().parseAsync(raw,new URL('./',fullUrl.href).href);
 if(!gltf.scene)throw Error('GLB sem cena tridimensional.');
 const meshes=[],skeletonNodes=[];
 gltf.scene.traverse(o=>{
  if(o.isMesh){meshes.push(o);o.visible=true;o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;
   for(const m of (Array.isArray(o.material)?o.material:[o.material]).filter(Boolean)){if(m.map)m.map.colorSpace=THREE.SRGBColorSpace;m.side=THREE.DoubleSide;m.needsUpdate=true;}
  }
  if(o.isBone)skeletonNodes.push(o);
 });
 if(!meshes.length)throw Error('GLB sem malhas 3D visíveis.');
 const {bones,fingers,missing,foundNames}=resolveHulkSkeleton(skeletonNodes);
 if(missing.length)throw Error('Esqueleto incompatível: faltam '+missing.join(', ')+'. Ossos encontrados: '+skeletonNodes.length+'; exemplos: '+foundNames.slice(0,7).join(', '));
 onStatus('rig',skeletonNodes.length+' ossos; '+Object.keys(bones).length+' articulações mapeadas.');
 const mixer=new THREE.AnimationMixer(gltf.scene);
 const idle=gltf.animations.find(c=>c.name==='Anim_Hulk_Idle_Upright')||gltf.animations[0];
 if(idle)mixer.clipAction(idle).setLoop(THREE.LoopRepeat).play();
 mixer.update(0);
 gltf.scene.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(gltf.scene),size=bounds.getSize(new THREE.Vector3());
 if(!Number.isFinite(size.y)||size.y<=.01||!Number.isFinite(size.x))throw Error('Dimensões inválidas no GLB.');
 const scale=THREE.MathUtils.clamp(6.15/size.y,.06,30),center=bounds.getCenter(new THREE.Vector3());
 const root=new THREE.Group();root.name='Hulk_GLB_Original';root.userData.sourceName='assets/models/hulk.glb';
 root.add(gltf.scene);root.scale.setScalar(scale);
 root.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
 const posedBones=[...new Set([...Object.values(bones),...fingers.left,...fingers.right])];
 const baseRot=posedBones.map(b=>b.quaternion.clone()),basePos=posedBones.map(b=>b.position.clone());
 let blendedPose=null;
 const adapter={
  root,mixer,bones,scale,clips:gltf.animations.map(c=>c.name),height:6.15,
  jointCount:skeletonNodes.length,meshCount:meshes.length,vertexCount:meshes.reduce((s,m)=>s+(m.geometry?.getAttribute('position')?.count||0),0),
  modelUrl:fullUrl.href,mode:'idle',visible:true,forwardFlip:false,
  get status(){return 'ready';},
  showModel(value){this.visible=!!value;root.visible=this.visible;legacyParts.forEach(p=>p.visible=!this.visible);},
  flipFacing(){this.forwardFlip=!this.forwardFlip;root.rotation.y=this.forwardFlip?Math.PI:0;},
  update(dt,a,s){
   if(!this.visible)return;
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
  }
 };
 rig.add(root);
 gltf.scene.updateMatrixWorld(true);
 adapter.showModel(true);
 onStatus('ready',adapter);
 return adapter;
}
