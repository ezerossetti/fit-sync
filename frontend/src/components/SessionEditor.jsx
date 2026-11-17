import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import MobileSheet from './MobileSheet'
import sesionesService from '../services/sesiones.service'
import { dayKey } from '../utils/progress'
export default function SessionEditor({session,onClose,onSaved}) {
 const [draft,setDraft]=useState(()=>({...session,fecha:dayKey(session.fecha),duracion_min:session.duracion_min??'',notas:session.notas||'',ejercicios:structuredClone(session.ejercicios)}))
 const [saving,setSaving]=useState(false),[error,setError]=useState(''),[dirty,setDirty]=useState(false),[discard,setDiscard]=useState(false)
 const change=(key,value)=>{setDirty(true);setDraft(d=>({...d,[key]:value}))}
 function setValue(ei,si,key,value){setDirty(true);setDraft(d=>({...d,ejercicios:d.ejercicios.map((e,i)=>i===ei?{...e,series:e.series.map((s,j)=>j===si?{...s,[key]:value}:s)}:e)}))}
 async function save(e){
  e.preventDefault();setError('');setSaving(true)
  try {
   const ejercicios=draft.ejercicios.map(ex=>({...ex,series:ex.series.map(s=>({...s,peso:Number(s.peso),reps:Number(s.reps),rpe:s.rpe==null||s.rpe===''?null:Number(s.rpe)}))}))
   if(draft.ejercicios.some(ex=>ex.series.some(s=>s.peso===''||s.reps==='')))throw new Error('Completá peso y repeticiones en todas las series.')
   const data={rutina_nombre:draft.rutina_nombre.trim(),fecha:draft.fecha===dayKey(session.fecha)?session.fecha:draft.fecha,ejercicios,duracion_min:draft.duracion_min===''?null:Number(draft.duracion_min),notas:draft.notas}
   const updated=await sesionesService.update(session.id,data);onSaved(updated);onClose()
  }catch(err){setError(err.response?.data?.message||err.message||'No pudimos guardar. Tus cambios siguen acá.')}finally{setSaving(false)}
 }
 return <MobileSheet title="Editar entrenamiento" busy={saving} onClose={()=>dirty?setDiscard(true):onClose()}><form onSubmit={save} className="sheet-form"><div className="sheet-content">
  {discard?<div className="discard-prompt" role="alert"><p>Tenés cambios sin guardar.</p><button type="button" className="btn-secondary" onClick={()=>setDiscard(false)}>Seguir editando</button><button type="button" className="text-error" onClick={onClose}>Descartar cambios</button></div>:null}
  <label>Nombre<input className="input-field" required maxLength={200} value={draft.rutina_nombre} onChange={e=>change('rutina_nombre',e.target.value)}/></label>
  <div className="editor-meta"><label>Fecha<input className="input-field" type="date" required max={dayKey(new Date())} value={draft.fecha} onChange={e=>change('fecha',e.target.value)}/></label><label>Minutos<input className="input-field" type="number" min="0" step="1" placeholder="Sin dato" value={draft.duracion_min} onChange={e=>change('duracion_min',e.target.value)}/></label></div>
  {draft.ejercicios.map((ex,ei)=><section className="edit-exercise" key={ei}><h3>{ex.nombre}</h3><div className="edit-set labels"><span>#</span><span>kg</span><span>Reps</span><span>RPE</span><span/></div>{ex.series.map((s,si)=><div className="edit-set" key={si}><span>{si+1}</span><input aria-label={`${ex.nombre}, serie ${si+1}, peso`} type="number" inputMode="decimal" required min="0" max="5000" step="0.01" value={s.peso} onChange={e=>setValue(ei,si,'peso',e.target.value)}/><input aria-label={`${ex.nombre}, serie ${si+1}, repeticiones`} type="number" inputMode="numeric" required min="1" max="10000" step="1" value={s.reps} onChange={e=>setValue(ei,si,'reps',e.target.value)}/><input aria-label={`${ex.nombre}, serie ${si+1}, esfuerzo`} type="number" inputMode="decimal" min="1" max="10" step="0.5" placeholder="—" value={s.rpe??''} onChange={e=>setValue(ei,si,'rpe',e.target.value)}/><button type="button" aria-label={`Quitar serie ${si+1} de ${ex.nombre}`} disabled={ex.series.length===1} onClick={()=>change('ejercicios',draft.ejercicios.map((item,i)=>i===ei?{...item,series:item.series.filter((_,j)=>j!==si)}:item))}><Trash2 size={16}/></button></div>)}<button className="add-set" type="button" disabled={ex.series.length>=200} onClick={()=>change('ejercicios',draft.ejercicios.map((item,i)=>i===ei?{...item,series:[...item.series,{...item.series.at(-1)}]}:item))}><Plus size={17}/>Agregar serie</button></section>)}
  <label>Notas<textarea className="input-field" maxLength={10000} value={draft.notas} onChange={e=>change('notas',e.target.value)}/></label>
  <p className="chart-note">El volumen y los gráficos se recalculan al guardar.</p>{error&&<p role="alert" className="notice">{error}</p>}
 </div><footer><button className="btn-primary w-full" disabled={saving||!dirty}>{saving?'Guardando…':'Guardar cambios'}</button></footer></form></MobileSheet>
}
