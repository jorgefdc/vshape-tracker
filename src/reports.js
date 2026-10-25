const validDate=h=>{const d=new Date(h.date);return Number.isFinite(d.getTime())?d:null};
export function aggregate(history,getSets,period='week'){
 const groups=new Map();
 for(const h of history){const d=validDate(h);if(!d)continue;let key;
 if(period==='month')key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
 else {const monday=new Date(d.getFullYear(),d.getMonth(),d.getDate());monday.setDate(monday.getDate()-(monday.getDay()+6)%7);key=`${monday.getFullYear()}-${String(monday.getMonth()+1).padStart(2,'0')}-${String(monday.getDate()).padStart(2,'0')}`}
 const g=groups.get(key)||{key,workouts:0,sets:0,reps:0,volume:0,rests:[]};g.workouts++;
 for(const e of getSets(h)){g.sets++;g.reps+=e.reps;g.volume+=e.kg*e.reps;if(e.restMeasured!=null&&Number.isFinite(Number(e.restMeasured))&&Number(e.restMeasured)>=0)g.rests.push(Number(e.restMeasured))}
 groups.set(key,g)}
 return [...groups.values()].sort((a,b)=>b.key.localeCompare(a.key)).map(g=>({...g,avgRest:g.rests.length?Math.round(g.rests.reduce((a,b)=>a+b,0)/g.rests.length):null,rests:undefined}));
}
export const weeklySummary=(h,f)=>aggregate(h,f,'week');
export const monthlySummary=(h,f)=>aggregate(h,f,'month');
export function exerciseProgress(history,getSets){
 const m=new Map();
 for(const h of history)for(const e of getSets(h)){const v=m.get(e.exercise)||{name:e.exercise,maxKg:0,sets:0,sessions:0,dates:new Set()};v.maxKg=Math.max(v.maxKg,e.kg);v.sets++;v.dates.add(h.date);v.sessions=v.dates.size;m.set(e.exercise,v)}
 return [...m.values()].sort((a,b)=>a.name.localeCompare(b.name)).map(({dates,...v})=>v);
}
export function exportRows(history,getSets){
 const rows=[['data','treino','exercicio','serie','carga_kg','repeticoes','volume_kg_reps','descanso_real_segundos']];
 for(const h of history)for(const e of getSets(h))rows.push([h.date,h.day,e.exercise,e.key,e.kg,e.reps,e.kg*e.reps,e.restMeasured??'']);
 return rows;
}
export function formatCSV(rows){return rows.map(row=>row.map(v=>{const str=String(v??'');return /[;"\n\r]/.test(str)?'"'+str.replaceAll('"','""')+'"':str}).join(';')).join('\r\n')}
