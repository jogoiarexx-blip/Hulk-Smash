// Six increasingly demanding chapters in one persistent city. No WebGL dependency.
export const CAMPAIGN=Object.freeze([
 {title:'CAOS URBANO',buildings:8,kills:6,tip:'Destrua prédios e detenha as primeiras patrulhas',wave:0,sky:'#b6d2de'},
 {title:'CIDADE EM PÂNICO',buildings:17,kills:18,tip:'Domine o centro e enfrente novos tanques',wave:2,sky:'#c0cbd0'},
 {title:'FÚRIA IMPARÁVEL',buildings:28,kills:32,tip:'Aguente a ofensiva mecanizada',wave:3,sky:'#aab4c0'},
 {title:'COMBOS DEVASTADORES',buildings:35,kills:44,comboFinishers:2,tip:'Complete 2 sequências de 3 socos (F)',wave:4,sky:'#c7a6a1'},
 {title:'ARMAS IMPROVISADAS',buildings:43,kills:57,throws:2,tip:'Arremesse 2 tanques ou drones com G',wave:4,sky:'#bc9a8a'},
 {title:'TROVÃO FINAL',buildings:51,kills:72,claps:3,tip:'Acerte 3 palmadas em alvos com X',wave:5,sky:'#929fa9'}
]);
export function chapterComplete(stage,stats){
 if(!stage)return false;
 return Object.entries({buildings:stage.buildings,kills:stage.kills,comboFinishers:stage.comboFinishers||0,throws:stage.throws||0,claps:stage.claps||0})
   .every(([key,amount])=>(stats[key]||0)>=amount);
}
export function chapterProgress(stage,stats){
 const goals=[['Prédios','buildings'],['Inimigos','kills'],['Combos ×3','comboFinishers'],['Arremessos','throws'],['Palmadas','claps']]
  .filter(([,k])=>(stage[k]||0)>0);
 const label=goals.map(([name,key])=>`${name} ${Math.min(stats[key]||0,stage[key])}/${stage[key]}`).join(' · ');
 const fraction=goals.reduce((total,[,key])=>total+Math.min(1,(stats[key]||0)/stage[key]),0)/goals.length;
 return {label,fraction};
}
