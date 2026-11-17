import '../moments.css'
import { useTour } from '../context/TourContext'
import { TOURS } from '../data/tours'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowRight, Play, Dumbbell, Plus, Check, History, Flame } from 'lucide-react'
import rutinasService from '../services/rutinas.service'
import sesionesService from '../services/sesiones.service'
import usuarioService from '../services/usuario.service'
import { useAuth } from '../context/AuthContext'
import { fechaSesion, formatKg, formatFechaRelativa, calcularRachaSemanal, volumenSesion } from '../utils/helpers'
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
  const semana = sesiones.filter(s => fechaSesion(s.fecha) >= lunes)
  const dias = new Set(semana.map(s => fechaSesion(s.fecha).toDateString()))
  const racha = calcularRachaSemanal(sesiones, perfil?.preferencias?.metaSemanal || 3)
  const nombre = (perfil?.nombre || user.user_metadata?.nombre || 'Atleta').split(' ')[0]
  const ultimo = sesiones[0]
  const series = draft?.sesionEjercicios?.reduce((sum,e) => sum + e.series.length, 0) || 0
  const recuperar = () => {
    if (!confirm('Hay un entrenamiento de una versión anterior sin cuenta asociada. ¿Es tuyo y querés recuperarlo en esta cuenta?')) return
    try { recuperarDatosAnteriores(user.id); setLegacy(false); setDraft(leerBorrador(user.id)) }
    catch { setError('No pudimos recuperar el entrenamiento. Los datos originales siguen guardados.') }
  }
  return <div className="home-page page-enter">
    <div className="page-heading"><div><p className="eyebrow">TU ESPACIO DE ENTRENAMIENTO</p><h1>Vamos, {nombre}<span className="text-accent">.</span></h1><p>Una serie más. Un paso adelante.</p></div><span className="date-badge">{hoy.toLocaleDateString('es-AR', {day:'2-digit', month:'short'}).replace('.','')}</span></div>
    {error && <div role="alert" className="notice"><p>{error}</p><button onClick={cargar}>Volver a intentar</button></div>}
    {legacy && <div className="notice"><p>Encontramos un entrenamiento de tu versión anterior.</p><button onClick={recuperar}>Recuperar mis datos</button></div>}
    <Link to="/entrenar" data-tour="home-cta-entrenar" className="training-hero">
      <div className="hero-orbit" aria-hidden="true"><Dumbbell size={92} strokeWidth={1.1}/></div>
      <p className="eyebrow"><span className="live-dot"/>{draft ? 'TENÉS UNA SESIÓN EN CURSO' : 'TU PRÓXIMA MEJOR VERSIÓN'}</p>
      <h2>{draft ? 'Seguí donde' : 'Hoy se'}<br/>{draft ? 'lo dejaste.' : 'entrena.'}</h2>
      <p>{draft ? `${draft.rutinaNombre || 'Sesión libre'} · ${series} series registradas` : 'Tu rutina, tus pesos, tu ritmo.'}</p>
      <div className="hero-action"><span>{draft ? 'Retomar entrenamiento' : 'Empezar entrenamiento'}</span><span className="hero-play"><Play size={19} fill="currentColor"/></span></div>
    </Link>
    <section className="week-card" data-tour="home-stats" aria-label="Actividad de esta semana">
      <div className="section-heading"><h2>Tu semana</h2><span><strong>{loading ? '—' : dias.size}</strong> / {racha.meta} días</span></div>
      <div className="week-days">{['L','M','M','J','V','S','D'].map((letra,i) => {
        const fecha = new Date(lunes); fecha.setDate(lunes.getDate()+i)
        const done = dias.has(fecha.toDateString()); const today = fecha.toDateString() === hoy.toDateString()
        return <div key={i} className={`${done ? 'done' : ''} ${today ? 'today' : ''}`} aria-label={`${fecha.toLocaleDateString('es-AR')}${done ? ', entrenaste' : ''}${today ? ', hoy' : ''}`}><span>{letra}</span><b>{done ? <Check size={18}/> : fecha.getDate()}</b><i/></div>
      })}</div>
      <div className="week-footer"><span><Flame size={15}/> {racha.racha} {racha.racha === 1 ? 'semana' : 'semanas'} de constancia</span><Link to="/historial">Ver progreso <ArrowUpRight size={14}/></Link></div>
    </section>
    <Link to="/historial/momentos" className="moments-entry"><div><span className="moment-entry-label">HECHO POR VOS</span><b>Tus momentos.</b><p>Tu Wrapped, tu mapa muscular<br/>y una misión a tu medida.</p></div><ArrowUpRight size={23}/></Link>
    <section data-tour="home-rutinas"><div className="section-heading"><h2>Tus rutinas</h2><Link to="/rutinas">Ver todas <ArrowRight size={15}/></Link></div>
      {loading ? <div className="skeleton-card" aria-label="Cargando rutinas"/> : rutinas.length ? <div className="routine-stack">{rutinas.slice(0,3).map((r,i) => <Link className="routine-preview" to={draft ? '/entrenar' : `/entrenar/${r.id}`} key={r.id}><span className="routine-number">0{i+1}</span><div><h3>{r.nombre}</h3><p>{r.ejercicios?.length || 0} ejercicios · {(r.ejercicios || []).reduce((a,e) => a+(e.series_objetivo || 3),0)} series</p></div><ArrowUpRight size={20}/></Link>)}</div> : <Link className="empty-state" to="/rutinas"><Plus size={24}/><h3>Tu primera rutina empieza acá</h3><p>Armala una vez. Repetila y superate.</p></Link>}
    </section>
    {ultimo && <section><div className="section-heading"><h2>Último entrenamiento</h2><History size={18} className="text-on-surface-variant"/></div><Link className="last-workout" to="/historial"><div><p className="eyebrow">{formatFechaRelativa(ultimo.fecha)}</p><h3>{ultimo.rutina_nombre || 'Sesión libre'}</h3><p>{ultimo.ejercicios?.length || 0} ejercicios completados</p></div><div><strong>{formatKg(ultimo.volumen_total ?? volumenSesion(ultimo.ejercicios))}</strong><span>kg de volumen</span></div></Link></section>}
    <p className="home-footnote">TU FUERZA, EN DATOS.</p>
  </div>
}
