import { useMemo, useState, useId } from 'react'
import { ArrowUpRight, ChevronLeft, ChevronRight, Flame, Trophy, Activity } from 'lucide-react'
import { exercisePoints, weeklyActivity, dayKey, localDate } from '../utils/progress'
const number=n=>Number(n).toLocaleString('es-AR',{maximumFractionDigits:1})
const date=d=>localDate(d).toLocaleDateString('es-AR',{day:'numeric',month:'short'})
const metrics={weight:{label:'Mejor carga',unit:'kg'},volume:{label:'Volumen',unit:'kg'},estimate:{label:'1RM estimado',unit:'kg'}}

function Evolution({sessions}) {
 const names=useMemo(()=>[...new Set(sessions.flatMap(s=>(s.ejercicios||[]).map(e=>e.nombre)))].sort(),[sessions])
 const [chosen,setChosen]=useState(''),[range,setRange]=useState(28),[metric,setMetric]=useState('weight'),[selection,setSelection]=useState(null)
 const name=names.includes(chosen)?chosen:names[0]
 const all=useMemo(()=>exercisePoints(sessions,name,range),[sessions,name,range])
 const points=all.filter(p=>p[metric]!=null)
 const active=points.find(p=>p.id===selection)||points.at(-1)
 const last=points.at(-1),first=points[0]
 const diff=last&&points.length>1?last[metric]-first[metric]:null
 const maximum=Math.max(1,...points.map(p=>p[metric]))*1.16
 const start=first?.time||0,span=(last?.time||0)-start
 const coords=points.map((p,i)=>({...p,x:span?42+((p.time-start)/span)*270:177,y:174-p[metric]/maximum*140}))
 const line=coords.map((p,i)=>`${i?'L':'M'} ${p.x} ${p.y}`).join(' ')
 const activeCoord=coords.find(p=>p.id===active?.id)
 const id=useId().replaceAll(':','')
 return <section className="evolution-card">
  <div className="progress-section-title"><span className="eyebrow">TU FUERZA, EN PERSPECTIVA</span><Activity size={18}/></div>
  <label className="exercise-select"><span className="sr-only">Ejercicio para ver su progreso</span><select value={name||''} onChange={e=>{setChosen(e.target.value);setSelection(null)}}>{names.map(n=><option key={n}>{n}</option>)}</select></label>
  <div className="period-picker" aria-label="Período">{[[28,'4 semanas'],[90,'3 meses'],[0,'Todo']].map(([v,label])=><button key={v} aria-pressed={range===v} onClick={()=>{setRange(v);setSelection(null)}}>{label}</button>)}</div>
  <div className="evolution-value"><div><p>{metrics[metric].label} · {active?date(active.date):'sin registros'}</p><strong>{active?number(active[metric]):'—'}<small> {metrics[metric].unit}</small></strong></div>{diff!==null && <span className={diff>=0?'delta positive':'delta'}>{diff>0?'+':''}{number(diff)} kg<small>primera → última</small></span>}</div>
  {points.length ? <>
   <svg className="depth-chart" viewBox="0 0 340 205" role="img" aria-label={`${metrics[metric].label} por sesión de ${name}. Detalle debajo del gráfico.`}>
    <defs><linearGradient id={`${id}fill`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#53dcef" stopOpacity=".34"/><stop offset="1" stopColor="#53dcef" stopOpacity=".01"/></linearGradient><linearGradient id={`${id}line`}><stop stopColor="#4e9fff"/><stop offset="1" stopColor="#79fff0"/></linearGradient><filter id={`${id}glow`} x="-25%" y="-60%" width="150%" height="220%"><feGaussianBlur stdDeviation="4"/></filter></defs>
    <path d="M42 174L312 174L328 190L58 190Z" fill="#253f58" opacity=".3"/>
    {[0,.5,1].map(t=><g key={t}><line x1="42" x2="312" y1={174-140*t} y2={174-140*t} stroke="#47617c" strokeOpacity=".3" strokeDasharray="3 6"/><text x="0" y={178-140*t} fill="#9ab2c9" fontSize="10">{number(maximum*t)}</text></g>)}
    {points.length>1 && <><path d={`${line} L${coords.at(-1).x} 174 L${coords[0].x} 174 Z`} fill={`url(#${id}fill)`}/><path d={line} transform="translate(0 8)" fill="none" stroke="#08101a" strokeWidth="5" opacity=".6"/><path d={line} fill="none" stroke="#53dcef" strokeWidth="6" opacity=".35" filter={`url(#${id}glow)`}/><path d={line} fill="none" stroke={`url(#${id}line)`} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/></>}
    {activeCoord && <line x1={activeCoord.x} x2={activeCoord.x} y1="24" y2="174" stroke="#a4f9ff" strokeOpacity=".35" strokeDasharray="3 4"/>}
    {coords.map((p,i)=><g key={p.id} onClick={()=>setSelection(p.id)}><circle cx={p.x} cy={p.y} r={p.id===active?.id?7:3.5} fill={p.id===active?.id?'#d0ffff':'#7be7ee'} stroke="#162b40" strokeWidth="2"/><circle cx={p.x} cy={p.y} r="14" fill="transparent"><title>{date(p.date)}: {number(p[metric])} kg</title></circle></g>)}
    <text x="42" y="203" fill="#9ab2c9" fontSize="10">{date(first.date)}</text><text x="312" y="203" textAnchor="end" fill="#9ab2c9" fontSize="10">{points.length>1?date(last.date):'Primera sesión'}</text>
   </svg>
   {points.length>1 && <label className="chart-scrubber"><span>Deslizá para explorar · {points.length} sesiones</span><input aria-label="Explorar sesiones del gráfico" type="range" min="0" max={points.length-1} value={Math.max(0,points.findIndex(p=>p.id===active?.id))} onChange={e=>setSelection(points[Number(e.target.value)].id)}/></label>}
   <div className="point-detail" aria-live="polite"><b>{date(active.date)}</b><span>{number(active.weight)} kg × {active.reps} reps</span><span>{active.sets} series</span></div>
  </> : <div className="chart-empty">{metric==='estimate'?'Necesitás series con carga y entre 1 y 10 repeticiones para estimar el 1RM.':'No hay sesiones con este ejercicio en el período. Probá «Todo».'}</div>}
  <div className="metric-picker" aria-label="Métrica del gráfico">{Object.entries(metrics).map(([key,m])=><button key={key} aria-pressed={metric===key} onClick={()=>{setMetric(key);setSelection(null)}}>{m.label}</button>)}</div>
  <p className="chart-note">{metric==='estimate'?'Estimación Epley con series de 1–10 reps; no es un máximo medido.':metric==='volume'?'Suma de peso × repeticiones de este ejercicio en cada sesión.':'Carga más alta de cada sesión. Compará también las repeticiones.'}</p>
  {all.length>1 && <div className="comparison-strip"><div><small>AL PRINCIPIO</small><b>{number(all[0].weight)} <span>kg × {all[0].reps}</span></b></div><ArrowUpRight size={22}/><div><small>ÚLTIMA SESIÓN</small><b>{number(all.at(-1).weight)} <span>kg × {all.at(-1).reps}</span></b></div></div>}
 </section>
}

function Calendar({sessions,goal}) {
 const [offset,setOffset]=useState(0),[selected,setSelected]=useState(null)
 const today=new Date(),month=new Date(today.getFullYear(),today.getMonth()+offset,1),days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate()
 const counts=new Map();sessions.forEach(s=>{const key=dayKey(s.fecha);counts.set(key,(counts.get(key)||0)+1)})
 const week=weeklyActivity(sessions).at(-1)
 return <section className="consistency-card" data-tour="historial-heatmap"><div className="progress-section-title"><h2>Tu constancia</h2><Flame size={20}/></div><div className="weekly-goal"><strong>{week.days}<span> / {goal} días</span></strong><p>{week.days>=goal?'Meta semanal cumplida.':'Cada día suma.'}</p></div><div className="goal-track"><i style={{width:`${Math.min(100,week.days/goal*100)}%`}}/></div>
  <div className="calendar-heading"><button aria-label="Mes anterior" onClick={()=>{setOffset(n=>n-1);setSelected(null)}}><ChevronLeft size={18}/></button><b>{month.toLocaleDateString('es-AR',{month:'long',year:'numeric'})}</b><button aria-label="Mes siguiente" disabled={offset>=0} onClick={()=>{setOffset(n=>n+1);setSelected(null)}}><ChevronRight size={18}/></button></div>
  <div className="activity-calendar">{['L','M','M','J','V','S','D'].map((d,i)=><small key={`w${i}`}>{d}</small>)}{Array.from({length:(month.getDay()+6)%7},(_,i)=><span key={`empty${i}`}/>)}{Array.from({length:days},(_,i)=>{const d=new Date(month.getFullYear(),month.getMonth(),i+1),key=dayKey(d),count=counts.get(key)||0;return <button key={key} disabled={d>today} aria-label={`${date(d)}: ${count} entrenamientos`} aria-pressed={selected===key} className={`${count?'trained':''} ${key===dayKey(today)?'today':''}`} onClick={()=>setSelected(key)}>{i+1}{count>0&&<i/>}</button>})}</div><p className="chart-note" aria-live="polite">{selected?`${date(selected)} · ${counts.get(selected)||0} entrenamientos registrados`:'Tocá un día para ver su actividad.'}</p>
 </section>
}

export default function ProgressDashboard({sessions,goal=3}) {
 const weeks=weeklyActivity(sessions),max=Math.max(1,...weeks.map(w=>w.days)),current=weeks.at(-1)
 const [weekIndex,setWeekIndex]=useState(6),week=weeks[weekIndex]
 const recordNames=[...new Set(sessions.flatMap(s=>(s.ejercicios||[]).map(e=>e.nombre)))].map(name=>{const points=exercisePoints(sessions,name);const best=points.reduce((a,b)=>!a||b.weight>a.weight||(b.weight===a.weight&&b.reps>a.reps)?b:a,null);return {name,best}}).filter(r=>r.best).sort((a,b)=>b.best.time-a.best.time).slice(0,3)
 return <div className="progress-dashboard"><div className="progress-intro"><div className="progress-orb"><Activity size={26}/></div><div><p>ESTA SEMANA</p><strong>{current.sessions} <span>{current.sessions===1?'entrenamiento':'entrenamientos'}</span></strong></div><span className="live-dot"/></div><Evolution sessions={sessions}/>
  <section className="weekly-depth"><div className="progress-section-title"><div><p className="eyebrow">EL HÁBITO SE CONSTRUYE</p><h2>Semana a semana</h2></div><span className="depth-badge">7 semanas</span></div><div className="week-readout" aria-live="polite"><b>{week.days} {week.days===1?'día':'días'}</b><span>Semana del {date(week.date)} · {week.sessions} sesiones</span></div><div className="depth-bars">{weeks.map((w,i)=><button key={i} aria-label={`Semana del ${date(w.date)}: ${w.days} días entrenados`} aria-pressed={weekIndex===i} onClick={()=>setWeekIndex(i)}><span className="bar-space"><i className={`bar-prism ${weekIndex===i?'selected':''}`} style={{height:w.days?`${w.days/max*96}%`:'3px'}}><em>{w.days}</em></i></span><small>{date(w.date)}</small></button>)}</div><p className="chart-note">Días distintos entrenados; dos sesiones en un día cuentan como un día.</p></section>
  <Calendar sessions={sessions} goal={goal}/>
  {!!recordNames.length&&<section className="records-panel"><div className="progress-section-title"><h2>Tus mejores marcas</h2><Trophy size={20}/></div>{recordNames.map(({name,best})=><div className="record-row" key={name}><span className="record-icon"><Trophy size={16}/></span><div><b>{name}</b><small>{date(best.date)} · mayor carga registrada</small></div><strong>{number(best.weight)}<small>kg × {best.reps}</small></strong></div>)}</section>}
 </div>
}
