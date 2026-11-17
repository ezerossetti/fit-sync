import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import sesionesService from '../services/sesiones.service'
import usuarioService from '../services/usuario.service'
import ejerciciosPersonalizadosService from '../services/ejerciciosPersonalizados.service'
import Wrapped from '../components/Wrapped'
import MuscleMap from '../components/MuscleMap'
import PersonalMissions from '../components/PersonalMissions'
import PRMoment from '../components/PRMoment'
import { personalRecords } from '../utils/moments'
import '../moments.css'
export default function Momentos(){
 const [sessions,setSessions]=useState([]),[profile,setProfile]=useState(null),[custom,setCustom]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('')
 async function load(){setError('');try{const [rows,p,ex]=await Promise.all([sesionesService.getAll(),usuarioService.getMe().catch(()=>null),ejerciciosPersonalizadosService.getAll().catch(()=>[])]);setSessions(rows||[]);setProfile(p);setCustom(ex||[])}catch{setError('No pudimos cargar tus momentos. Revisá la conexión.')}finally{setLoading(false)}}
 useEffect(()=>{load();window.addEventListener('fitsync-session-synced',load);return()=>window.removeEventListener('fitsync-session-synced',load)},[])
 const records=personalRecords(sessions).reverse()
 return <div className="moments-page"><Link to="/historial" className="moments-back"><ArrowLeft size={18}/>Tu progreso</Link><div className="page-heading"><div><p className="eyebrow">HECHO POR VOS</p><h1>Tus momentos<span className="text-accent">.</span></h1><p>El esfuerzo pasa. La historia queda.</p></div></div>{error&&<div className="notice" role="alert">{error}<button className="min-h-11" onClick={load}>Reintentar</button></div>}{loading?<div className="skeleton-card" aria-label="Cargando momentos"/>:!error&&<><Wrapped sessions={sessions}/><MuscleMap sessions={sessions} custom={custom}/><PersonalMissions sessions={sessions} profile={profile} onUpdated={misiones=>setProfile(p=>({...p,preferencias:{...p?.preferencias,misiones}}))}/><section><div className="moment-heading"><div><p className="eyebrow">TUS HITOS</p><h2>Marcas para recordar.</h2></div></div>{records.length?<PRMoment records={records}/>:<div className="moment-empty"><p>Tu próximo PR empieza con una referencia.</p><small>Después de tu primer registro, una mayor carga —o más repeticiones con tu mayor carga— crea un PR Moment.</small></div>}</section></>}</div>
}
