export const localDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value)
export const dayKey = value => { const d=localDate(value); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
export const volume = exercises => (exercises || []).reduce((sum,e)=>sum+(e.series || []).reduce((n,s)=>n+Number(s.peso||0)*Number(s.reps||0),0),0)
export function exercisePoints(sessions, name, days=0, now=new Date()) {
 const cutoff=new Date(now);cutoff.setHours(0,0,0,0);if(days)cutoff.setDate(cutoff.getDate()-days+1)
 return sessions.filter(s=>s.completada!==false && Number.isFinite(+localDate(s.fecha)) && localDate(s.fecha)<=now && (!days || localDate(s.fecha)>=cutoff)).flatMap(session=>{
  const sets=(session.ejercicios || []).filter(e=>e.nombre===name).flatMap(e=>e.series || []).filter(s=>Number.isFinite(Number(s.peso)) && Number(s.peso)>=0 && Number(s.reps)>0)
  if(!sets.length)return []
  const best=sets.reduce((a,b)=>Number(b.peso)>Number(a.peso) || (Number(b.peso)===Number(a.peso) && Number(b.reps)>Number(a.reps)) ? b:a)
  const estimates=sets.filter(s=>s.peso>0 && s.reps<=10).map(s=>s.reps===1 ? Number(s.peso) : Number(s.peso)*(1+Number(s.reps)/30))
  return [{id:session.id,date:session.fecha,time:+localDate(session.fecha),weight:Number(best.peso),reps:Number(best.reps),volume:sets.reduce((n,s)=>n+Number(s.peso)*Number(s.reps),0),estimate:estimates.length?Math.max(...estimates):null,sets:sets.length}]
 }).sort((a,b)=>a.time-b.time || String(a.id).localeCompare(String(b.id)))
}
export function weeklyActivity(sessions, now=new Date()) {
 const monday=new Date(now);monday.setHours(0,0,0,0);monday.setDate(monday.getDate()-(monday.getDay()+6)%7)
 return Array.from({length:7},(_,i)=>{const date=new Date(monday);date.setDate(date.getDate()+(i-6)*7);const end=new Date(date);end.setDate(end.getDate()+7);const rows=sessions.filter(s=>s.completada!==false && localDate(s.fecha)>=date && localDate(s.fecha)<end && localDate(s.fecha)<=now);return {date,days:new Set(rows.map(s=>dayKey(s.fecha))).size,sessions:rows.length,volume:rows.reduce((n,s)=>n+volume(s.ejercicios),0)}})
}
export function csvHistory(sessions) {
 const escape=v=>{let s=String(v??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'}
 const rows=[['fecha','rutina','ejercicio','serie','peso_kg','reps','rpe','notas']]
 sessions.forEach(s=>(s.ejercicios||[]).forEach(e=>(e.series||[]).forEach((set,i)=>rows.push([s.fecha,s.rutina_nombre,e.nombre,i+1,set.peso,set.reps,set.rpe,s.notas]))))
 return '\ufeff'+rows.map(row=>row.map(escape).join(',')).join('\r\n')
}
export function downloadFile(data,name,type) {
 const url=URL.createObjectURL(new Blob([data],{type}));const link=document.createElement('a');link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)
}
