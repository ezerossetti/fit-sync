import { useState } from 'react'
import { Download, Upload } from 'lucide-react'
import apiClient from '../services/apiClient'
import { supabase } from '../lib/supabaseClient'
import { downloadFile } from '../utils/progress'
import MobileSheet from './MobileSheet'
import '../progress.css'
export default function DataBackup(){
 const [backup,setBackup]=useState(null),[busy,setBusy]=useState(false),[status,setStatus]=useState(''),[settings,setSettings]=useState(false),[progress,setProgress]=useState(0)
 async function exportBackup(){setBusy(true);setStatus('Preparando una copia completa…');try{const {data}=await apiClient.get('/backup',{timeout:90000});downloadFile(JSON.stringify(data.data,null,2),`fitsync-respaldo-${new Date().toISOString().slice(0,10)}.json`,'application/json');setStatus('Respaldo descargado. Conservá el archivo JSON para restaurarlo en esta misma cuenta.')}catch(e){setStatus(e.response?.data?.message||'No se pudo descargar. Conectate a Internet y reintentá.')}finally{setBusy(false)}}
 async function readFile(e){const file=e.target.files?.[0];e.target.value='';if(!file)return;setStatus('');setSettings(false);setProgress(0);setBusy(true);try{if(file.size>10*1024*1024)throw new Error('El archivo supera los 10 MB.');const parsed=JSON.parse(await file.text());const {data}=await apiClient.post('/backup/validate',parsed,{timeout:90000});setBackup(data.data)}catch(e){setStatus(e.response?.data?.message||'No pudimos validar el archivo. Elegí un respaldo JSON de FitSync y revisá la conexión.')}finally{setBusy(false)}}
 const total=backup?backup.sesiones.length+backup.rutinas.length+backup.ejercicios_personalizados.length:0
 async function restore(){setBusy(true);setStatus('Restaurando…');setProgress(0);let added=0,skipped=0,processed=0;
  try{
   const {data:auth}=await supabase.auth.getSession();if(auth.session?.user?.id!==backup.ownerId)throw new Error('La cuenta cambió. Volvé a abrir el respaldo.');
   const config={headers:{Authorization:`Bearer ${auth.session.access_token}`},timeout:90000,requireFresh:true};
   for(const kind of ['rutinas','ejercicios_personalizados','sesiones'])for(let start=0;start<backup[kind].length;start+=10){
    const records=backup[kind].slice(start,start+10);const {data}=await apiClient.post('/backup/restore',{ownerId:backup.ownerId,kind,records},config);added+=data.data.added;skipped+=data.data.skipped;processed+=records.length;setProgress(processed);
   }
   if(settings){const {data:profile}=await apiClient.get('/usuario/me',config);await apiClient.put('/usuario/me',{preferencias:{...profile.data.preferencias,...backup.preferencias}},config);}
   setStatus(`Restauración completa: ${added} registros agregados y ${skipped} existentes conservados.${settings?' Preferencias restauradas.':''}`);setBackup(null);window.dispatchEvent(new Event('fitsync-session-synced'));
  }catch(e){setStatus(`${e.response?.data?.message||e.message||'La restauración se interrumpió.'} Se procesaron ${processed} registros en lotes completos. Podés reintentar: los existentes se omiten.`)}finally{setBusy(false)}
 }
 return <section className="data-tools"><h2>Tus datos, con vos</h2><p>Respaldo de entrenamientos, rutinas, ejercicios propios y preferencias. Los borradores y sesiones pendientes de sincronizar quedan en este dispositivo.</p><div className="data-tool-actions"><button onClick={exportBackup} disabled={busy}><Download size={17}/>Exportar JSON</button><label className={busy?'is-disabled':''}><Upload size={17}/>Restaurar<input aria-label="Seleccionar respaldo JSON" type="file" accept=".json,application/json" disabled={busy} onChange={readFile}/></label></div>{status&&!backup&&<p role="status">{status}</p>}
 {backup&&<MobileSheet title="Restaurar tus datos" busy={busy} onClose={()=>setBackup(null)}><div className="sheet-content"><p>Se agregarán los registros que falten en esta cuenta. Los existentes se conservan, aunque el archivo tenga valores diferentes.</p><div className="backup-summary">{[['sesiones','Entrenamientos'],['rutinas','Rutinas'],['ejercicios_personalizados','Ejercicios propios']].map(([key,label])=><div key={key}><b>{backup[key].length}</b>{label}</div>)}</div><label className="flex items-center gap-3"><input type="checkbox" checked={settings} disabled={busy} onChange={e=>setSettings(e.target.checked)}/>También reemplazar mis preferencias de entrenamiento</label><p className="chart-note">Necesitás conexión. Si se interrumpe, lo ya importado permanece y podés reintentar sin duplicados. No se restaura el chat del coach.</p>{busy&&<progress aria-label="Progreso de restauración" value={progress} max={Math.max(total,1)} className="w-full"/>}{status&&<p role="status" className="notice">{status}</p>}</div><footer><button disabled={busy} onClick={restore} className="btn-primary w-full">{busy?`Restaurando ${progress} de ${total}…`:'Agregar registros faltantes'}</button></footer></MobileSheet>}
 </section>
}
