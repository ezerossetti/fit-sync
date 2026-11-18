import '../home-athletic.css'
import { useTour } from '../context/TourContext'
import { TOURS } from '../data/tours'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ChevronRight, Plus, Check, History, MoveUpRight } from 'lucide-react'
import TrainingFocus from '../components/TrainingFocus'
import rutinasService from '../services/rutinas.service'
import sesionesService from '../services/sesiones.service'
import usuarioService from '../services/usuario.service'
import { useAuth } from '../context/AuthContext'
import { fechaSesion, formatFechaRelativa, calcularRachaSemanal } from '../utils/helpers'
import { leerBorrador, hayDatosAnteriores, recuperarDatosAnteriores, STORAGE_EVENT } from '../utils/sesionDraft'

export default function Home() {
  const { user } = useAuth()
  const { startTour } = useTour()
  useEffect(() => { startTour('home', TOURS.home.steps); startTour('bienvenida', TOURS.bienvenida.steps) }, [startTour])
  const [data, setData] = useState({rutinas: [], sesiones: [], perfil: null})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState(() => leerBorrador(user.id))
  const [legacy, setLegacy] = useState(hayDatosAnteriores)
  const cargar = async () => {
    setLoading(true); setError('')
    try {
      const [rutinas, sesiones, perfil] = await Promise.all([rutinasService.getAll(), sesionesService.getAll(), usuarioService.getMe().catch(() => null)])
      setData({rutinas: rutinas || [], sesiones: (sesiones || []).sort((a,b) => fechaSesion(b.fecha)-fechaSesion(a.fecha)), perfil})
    } catch { setError('No pudimos cargar tus datos. Tu entrenamiento guardado en este teléfono sigue a salvo.') }
    finally { setLoading(false) }
  }
  useEffect(() => { cargar() }, [user.id])
  useEffect(() => { window.addEventListener('fitsync-session-synced', cargar); return () => window.removeEventListener('fitsync-session-synced', cargar) }, [])
  useEffect(() => {
    const update = () => setDraft(leerBorrador(user.id))
    window.addEventListener(STORAGE_EVENT, update)
    return () => window.removeEventListener(STORAGE_EVENT, update)
  }, [user.id])
  const {rutinas, sesiones, perfil} = data
  const hoy = new Date()
  const lunes = new Date(hoy); lunes.setHours(0,0,0,0); lunes.setDate(lunes.getDate() - (lunes.getDay()+6)%7)
  const semana = sesiones.filter(s => s.completada !== false && fechaSesion(s.fecha) >= lunes && fechaSesion(s.fecha) <= hoy)
  const dias = new Set(semana.map(s => fechaSesion(s.fecha).toDateString()))
  const racha = calcularRachaSemanal(sesiones, perfil?.preferencias?.metaSemanal || 3)
  const nombre = (perfil?.nombre || user.user_metadata?.nombre || 'Atleta').split(' ')[0]
  const ultimo = sesiones[0]
  const recuperar = () => {
    if (!confirm('Hay un entrenamiento de una versión anterior sin cuenta asociada. ¿Es tuyo y querés recuperarlo en esta cuenta?')) return
    try { recuperarDatosAnteriores(user.id); setLegacy(false); setDraft(leerBorrador(user.id)) }
    catch { setError('No pudimos recuperar el entrenamiento. Los datos originales siguen guardados.') }
  }
  return <div className="athletic-home">
    <header className="athletic-greeting"><div><p>{hoy.toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'})}</p><h1>Vamos, {nombre}<span>.</span></h1></div><Link to="/perfil" aria-label="Ir a mi perfil" className="athletic-avatar">{nombre.slice(0,1).toUpperCase()}</Link></header>
    {error && <div role="alert" className="notice"><p>{error}</p><button onClick={cargar}>Volver a intentar</button></div>}
    {legacy && <div className="notice"><p>Encontramos un entrenamiento de tu versión anterior.</p><button onClick={recuperar}>Recuperar mis datos</button></div>}
    <TrainingFocus rutinas={rutinas} sesiones={sesiones} draft={draft} loading={loading}/>
    <section className="athletic-week" data-tour="home-stats" aria-label="Actividad de esta semana"><div className="athletic-section-heading"><h2>Esta semana</h2><Link to="/historial"><b>{loading?'—':dias.size}</b> / {racha.meta} días <ArrowUpRight size={15}/></Link></div><div className="athletic-days">{['L','M','M','J','V','S','D'].map((letter,i)=>{const date=new Date(lunes);date.setDate(date.getDate()+i);const done=dias.has(date.toDateString()),today=date.toDateString()===hoy.toDateString();return <div key={i} className={`${done?'done':''} ${today?'today':''}`} aria-label={`${date.toLocaleDateString('es-AR')}${done?', entrenaste':''}${today?', hoy':''}`}><span>{letter}</span><b>{done?<Check size={19}/>:date.getDate()}</b><i/></div>})}</div></section>
    <section className="athletic-routines" data-tour="home-rutinas">
      <div className="athletic-section-heading"><h2>Tus rutinas</h2><Link to="/rutinas">Editar <ArrowUpRight size={15}/></Link></div>
      {loading ? <p className="athletic-loading" role="status">Cargando rutinas…</p> : rutinas.length ? <ul className="routine-list">
        {rutinas.map((r, i) => <li key={r.id}><Link className="athletic-routine" to={draft ? '/entrenar' : `/entrenar/${r.id}`} aria-label={draft ? `Retomar sesión en curso antes de ${r.nombre}` : `Entrenar ${r.nombre}`}>
          <span className="routine-index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          <div><h3>{r.nombre}</h3><p>{r.ejercicios?.length || 0} ejercicios <span aria-hidden="true">·</span> {(r.ejercicios || []).reduce((n,e) => n + (Number(e.series_objetivo) || 3), 0)} series</p></div>
          <ChevronRight size={18}/>
        </Link></li>)}
      </ul> : <Link className="athletic-empty" to="/rutinas"><Plus size={20}/><span>Armá tu primera rutina</span><ChevronRight size={18}/></Link>}
      {draft && rutinas.length > 0 && <p className="routine-draft-note">Tenés una sesión en curso. Retomala antes de empezar otra.</p>}
    </section>
    <div className="athletic-personal">
      <Link to="/historial/momentos" className="athletic-moments" data-tour="home-logros"><MoveUpRight size={20}/><div><h2>Tus momentos</h2><p>Marcas, misiones y tu Wrapped.</p></div><ChevronRight size={18}/></Link>
      {ultimo && <Link className="athletic-last" to="/historial"><History size={20}/><div><span>Última sesión · {formatFechaRelativa(ultimo.fecha)}</span><b>{ultimo.rutina_nombre || 'Sesión libre'}</b></div><ChevronRight size={18}/></Link>}
    </div>
  </div>
}
