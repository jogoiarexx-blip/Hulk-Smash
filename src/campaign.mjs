// Campaign v2.0: each chapter has distinct geometry, mechanics and local state.
// Pure helper functions allow regression tests without Three.js or a browser.
export const CAMPAIGN=Object.freeze([
 {title:'SINAL NA CIDADE',kind:'jammers',target:3,wave:1,sky:'#b3d5de',tip:'Destrua os 3 bloqueadores de comunicação nas ruas. Ícones azuis no radar.',briefing:'A tropa instalou torres para rastrear Hulk. Destrua os transmissores sinalizados.'},
 {title:'COMBOIO BLINDADO',kind:'convoy',target:3,wave:2,sky:'#b9bbb7',tip:'Intercepte os 3 caminhões blindados que percorrem as avenidas.',briefing:'Uma caravana militar cruza a cidade. Impeça a retirada dos três transportes.'},
 {title:'ÚLTIMO ABRIGO',kind:'defense',target:28,wave:3,sky:'#9babb1',tip:'Defenda o abrigo por 28s. Fique na região marcada e afaste as patrulhas.',briefing:'Um abrigo improvisado precisa de tempo para retirar os moradores. Proteja-o da ofensiva.'},
 {title:'CAÇADA NOS TELHADOS',kind:'rooftops',target:3,wave:2,sky:'#c4a8a0',tip:'Salte ou escale até os 3 transmissores nos telhados e permaneça perto por 2s.',briefing:'Repetidores aéreos guiam os drones. Alcance os telhados e desative-os.'},
 {title:'O COLOSSO DE AÇO',kind:'boss',target:1,wave:3,sky:'#bc9c91',tip:'Destrua 2 geradores de escudo e derrote o tanque comandante.',briefing:'Um tanque comandante chegou com um campo de proteção. Derrube seus emissores.'},
 {title:'NÚCLEO DE SOBRECARGA',kind:'reactor',target:1,wave:4,sky:'#8d969d',tip:'Destrua 3 capacitores, depois o núcleo, antes do tempo acabar.',briefing:'O reator experimental vai detonar. Quebre os capacitores e esmague o núcleo a tempo.'}
]);
export const missionKinds=Object.freeze(CAMPAIGN.map(m=>m.kind));
export function missionTarget(stage){return Math.max(1,stage?.target||1);}
export function missionFraction(stage,m){
 const target=missionTarget(stage);
 if(!m)return 0;
 if(stage.kind==='defense')return Math.max(0,Math.min(1,(m.held||0)/target));
 if(stage.kind==='boss')return Math.max(0,Math.min(1,((m.shieldsBroken||0)/2)*.30+(m.bossDead?1:.7*(1-Math.max(0,m.bossHealth??1)/Math.max(1,m.bossMaxHealth??1)))));
 if(stage.kind==='reactor')return Math.max(0,Math.min(1,(m.capacitorsBroken||0)/3*.6+(m.coreDead?.4:0)));
 return Math.max(0,Math.min(1,(m.completed||0)/target));
}
export function chapterComplete(stage,m){
 if(!stage||!m)return false;
 if(stage.kind==='defense')return m.held>=stage.target&&(m.integrity||0)>0;
 if(stage.kind==='boss')return m.shieldsBroken>=2&&m.bossDead===true;
 if(stage.kind==='reactor')return m.capacitorsBroken>=3&&m.coreDead===true&&(m.timeLeft||0)>0;
 return (m.completed||0)>=stage.target;
}
export function chapterProgress(stage,m){
 const fraction=missionFraction(stage,m);
 if(!m)return {label:stage.tip,fraction:0};
 let label='';
 switch(stage.kind){
  case 'jammers':label=`Transmissores ${m.completed||0}/${stage.target}`;break;
  case 'convoy':label=`Transportes interceptados ${m.completed||0}/${stage.target}`;break;
  case 'defense':label=`Evacuação ${Math.floor(m.held||0)}/${stage.target}s · Abrigo ${Math.ceil(m.integrity||0)}%`;break;
  case 'rooftops':label=`Repetidores desligados ${m.completed||0}/${stage.target}`;break;
  case 'boss':label=`Escudos ${m.shieldsBroken||0}/2 · Chefe ${Math.ceil((m.bossHealth||0)/Math.max(1,m.bossMaxHealth||1)*100)}%`;break;
  case 'reactor':label=`Capacitores ${m.capacitorsBroken||0}/3 · Núcleo ${m.coreDead?'destruído':'ativo'} · ${Math.ceil(m.timeLeft||0)}s`;break;
 }
 return {label,fraction};
}
export function shouldDefenderFire(distance,stage,stunned=false){return stage?.kind==='defense'&&!stunned&&distance<24;}
export function escortAdvance(progress,dt,playerDistance,health){return progress+(health>0&&playerDistance<35?Math.max(0,dt):0);}
export function convoyPosition(initial,speed,elapsed,limit=126){
 const range=limit*2,progress=((initial+limit+speed*elapsed)%(2*range)+2*range)%(2*range);
 return -limit+(progress>range?2*range-progress:progress);
}
