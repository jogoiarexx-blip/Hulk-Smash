// W3C standard gamepad layout covers Xbox and PlayStation when the browser reports "standard".
export const PAD=Object.freeze({
 jump:0,grabEnemy:1,punch:2,car:3,clap:4,slam:5,tankCrush:6,spinThrow:7,
 doubleSmash:8,pause:9,sprint:10,rage:11,climb:12
});
export function gamepadAxis(value,deadZone=.17){
 const x=Number.isFinite(value)?Math.max(-1,Math.min(1,value)):0;
 if(Math.abs(x)<=deadZone)return 0;
 return Math.sign(x)*(Math.abs(x)-deadZone)/(1-deadZone);
}
export function readGamepad(pad){
 if(!pad||pad.connected===false||pad.mapping!=='standard')return null;
 const axes=pad.axes||[],buttons=pad.buttons||[];
 return {
  id:String(pad.id||'Controle'),
  moveX:gamepadAxis(axes[0]),moveY:gamepadAxis(axes[1]),
  cameraX:gamepadAxis(axes[2]),cameraY:gamepadAxis(axes[3]),
  buttons:Array.from({length:17},(_,i)=>Boolean(buttons[i]?.pressed||buttons[i]?.value>=.65))
 };
}
export const buttonPressed=(before,after,index)=>Boolean(after?.buttons?.[index]&&!before?.buttons?.[index]);
export const buttonReleased=(before,after,index)=>Boolean(before?.buttons?.[index]&&!after?.buttons?.[index]);
