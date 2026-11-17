import { localDate, dayKey, volume } from './progress.js'
export const monthKey = value => dayKey(value).slice(0,7)
export const completedSessions = (sessions,now=new Date()) => [...new Map(sessions.filter(s=>s && s.completada!==false && Number.isFinite(+localDate(s.fecha)) && localDate(s.fecha)<=now).map(s=>[s.id,s])).values()].sort((a,b)=>localDate(a.fecha)-localDate(b.fecha)||String(a.id).localeCompare(String(b.id)))
const bestSet = sets => sets.filter(s=>Number.isFinite(Number(s.peso)) && Number(s.peso)>=0 && Number(s.reps)>0).reduce((a,s)=>!a||Number(s.peso)>a.peso||(Number(s.peso)===a.peso&&Number(s.reps)>a.reps)?{peso:Number(s.peso),reps:Number(s.reps)}:a,null)
export function personalRecords(sessions,now=new Date()){
 const best=new Map(),records=[]
 for(const session of completedSessions(sessions,now)){
  const exercises=new Map();for(const e of session.ejercicios||[])exercises.set(e.nombre,[...(exercises.get(e.nombre)||[]),...(e.series||[])])
  for(const [name,sets] of exercises){const current=bestSet(sets);if(!current)continue;const previous=best.get(name)
   if(previous&&(current.peso>previous.peso||(current.peso===previous.peso&&current.reps>previous.reps)))records.push({id:`${session.id}:${name}`,sessionId:session.id,name,date:session.fecha,...current,previous,type:current.peso>previous.peso?'carga':'repeticiones'})
   if(!previous||current.peso>previous.peso||(current.peso===previous.peso&&current.reps>previous.reps))best.set(name,current)
  }
 }
 return records
}
export function monthlyWrapped(sessions,month,now=new Date()){
 const completed=completedSessions(sessions,now),rows=completed.filter(s=>monthKey(s.fecha)===month),counts=new Map()
 rows.forEach(s=>new Set((s.ejercicios||[]).map(e=>e.nombre)).forEach(name=>counts.set(name,(counts.get(name)||0)+1)))
 const favorite=[...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0]
 const records=personalRecords(completed,now).filter(r=>monthKey(r.date)===month)
 return {month,sessions:rows.length,days:new Set(rows.map(s=>dayKey(s.fecha))).size,series:rows.reduce((n,s)=>n+(s.ejercicios||[]).reduce((a,e)=>a+(e.series||[]).length,0),0),volume:rows.reduce((n,s)=>n+volume(s.ejercicios),0),records:records.length,favorite:favorite?.[0]||null,favoriteCount:favorite?.[1]||0,partial:month===monthKey(now)}
}
export const MISSIONS=[
 {id:'days8',title:'Volver es ganar',description:'Entrená 8 días distintos este mes.',target:8,kind:'days',badge:'CONSTANCIA'},
 {id:'days12',title:'Tu propio ritmo',description:'Entrená 12 días distintos este mes.',target:12,kind:'days',badge:'RITMO PROPIO'},
 {id:'weeks4',title:'Siempre presente',description:'Registrá entrenamientos en 4 semanas distintas del mes.',target:4,kind:'weeks',badge:'PRESENTE'},
]
export function missionProgress(sessions,month,mission,now=new Date()){
 const rows=completedSessions(sessions,now).filter(s=>monthKey(s.fecha)===month)
 const values=rows.map(s=>{const d=localDate(s.fecha);if(mission.kind==='weeks')d.setDate(d.getDate()-(d.getDay()+6)%7);return dayKey(d)})
 const actual=new Set(values).size
 return {actual,value:Math.min(mission.target,actual),complete:actual>=mission.target}
}
export const MUSCLES=[['chest','Pecho'],['back','Espalda'],['shoulders','Hombros'],['arms','Brazos'],['core','Core'],['quads','Cuádriceps'],['posterior','Glúteos e isquios'],['calves','Pantorrillas'],['other','Sin clasificar']]
export function muscleGroup(group=''){
 const g=group.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
 if(/pecho|chest|pectoral/.test(g))return 'chest'
 if(/hombro|deltoid|shoulder/.test(g))return 'shoulders'
 if(/brazo|bicep|tricep|antebrazo|forearm/.test(g))return 'arms'
 if(/pantorr|gemelo|soleo|calf|calves/.test(g))return 'calves'
 if(/isquio|glute|cadena posterior|hamstring/.test(g))return 'posterior'
 if(/cuadricep|pierna|quadricep|leg/.test(g))return 'quads'
 if(/espalda|dorsal|traccion|back/.test(g))return 'back'
 if(/core|abdom|oblic/.test(g))return 'core'
 return 'other'
}
export function muscleActivity(sessions,lookup,now=new Date()){
 const monday=new Date(now);monday.setHours(0,0,0,0);monday.setDate(monday.getDate()-(monday.getDay()+6)%7)
 const result=Object.fromEntries(MUSCLES.map(([id])=>[id,{sets:0,exercises:new Map()}]))
 completedSessions(sessions,now).filter(s=>localDate(s.fecha)>=monday).forEach(s=>(s.ejercicios||[]).forEach(e=>{const key=muscleGroup(lookup(e.nombre)?.grupo||e.grupo||'');const count=e.series?.length||0;result[key].sets+=count;result[key].exercises.set(e.nombre,(result[key].exercises.get(e.nombre)||0)+count)}))
 return result
}
