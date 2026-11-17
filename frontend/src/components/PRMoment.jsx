import { useState } from 'react'
import { Trophy, ChevronLeft, ChevronRight } from 'lucide-react'
import MomentShare from './MomentShare'
import '../moments.css'
const n=value=>Number(value).toLocaleString('es-AR',{maximumFractionDigits:1})
export default function PRMoment({records}){
 const [index,setIndex]=useState(0);const record=records[Math.min(index,records.length-1)];if(!record)return null
 const date=new Date(/^\d{4}-\d{2}-\d{2}$/.test(record.date)?record.date+'T00:00:00':record.date).toLocaleDateString('es-AR',{day:'numeric',month:'long',year:'numeric'})
 const previous=`Antes: ${n(record.previous.peso)} kg × ${record.previous.reps} reps`
 const card={eyebrow:`PR MOMENT · ${date}`,title:record.name,value:n(record.peso),unit:`kg × ${record.reps} repeticiones`,details:[record.type==='carga'?'Nueva marca de carga registrada.':'Más repeticiones con tu mayor carga.',previous]}
 return <section className="pr-moment"><div className="moment-overline"><Trophy size={18}/><span>PR MOMENT</span><span className="moment-tag">{record.type==='carga'?'NUEVA CARGA':'NUEVAS REPS'}</span></div><p className="pr-kicker">Ese esfuerzo tiene nombre.</p><h2>{record.name}</h2><div className="pr-number">{n(record.peso)}<span> kg <b>× {record.reps}</b></span></div><p className="pr-previous">{previous}</p><p className="moment-caption">{date} · Comparado con tus registros anteriores.</p><MomentShare key={record.id} data={card} label="Compartir mi PR"/>{records.length>1&&<div className="moment-pagination"><button aria-label="Récord anterior" disabled={index===0} onClick={()=>setIndex(i=>i-1)}><ChevronLeft size={18}/></button><span>{index+1} de {records.length}</span><button aria-label="Récord siguiente" disabled={index>=records.length-1} onClick={()=>setIndex(i=>i+1)}><ChevronRight size={18}/></button></div>}</section>
}
