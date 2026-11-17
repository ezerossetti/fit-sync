import { useState } from 'react'
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react'
import MobileSheet from './MobileSheet'
import rutinasService from '../services/rutinas.service'
import '../progress.css'
export default function RoutineOrder({routines,onClose,onSaved}){
 const [rows,setRows]=useState([...routines]),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const move=(i,d)=>setRows(prev=>{const next=[...prev];[next[i],next[i+d]]=[next[i+d],next[i]];return next})
 async function save(){setBusy(true);setError('');try{await rutinasService.reorder(rows.map(r=>r.id));onSaved(rows);onClose()}catch(e){setError(e.response?.data?.message||'No pudimos guardar el orden. Reintentá.')}finally{setBusy(false)}}
 return <MobileSheet title="Ordenar rutinas" onClose={onClose} busy={busy}><div className="sheet-content"><p className="chart-note">Elegí el orden en que aparecen en Inicio, Rutinas y Entrenar.</p>{rows.map((r,i)=><div key={r.id} className="reorder-row"><GripVertical size={17} className="text-on-surface-variant"/><span>{i+1}. {r.nombre}</span><button disabled={!i||busy} aria-label={`Subir ${r.nombre}`} onClick={()=>move(i,-1)}><ArrowUp size={18}/></button><button disabled={i===rows.length-1||busy} aria-label={`Bajar ${r.nombre}`} onClick={()=>move(i,1)}><ArrowDown size={18}/></button></div>)}{error&&<p className="notice" role="alert">{error}</p>}</div><footer><button className="btn-primary w-full" disabled={busy} onClick={save}>{busy?'Guardando…':'Guardar orden'}</button></footer></MobileSheet>
}
