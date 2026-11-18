import '../home-athletic.css'
import { useTour } from '../context/TourContext'
import { TOURS } from '../data/tours'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowRight, Plus, Check, History } from 'lucide-react'
import rutinasService from '../services/rutinas.service'
import sesionesService from '../services/sesiones.service'
import usuarioService from '../services/usuario.service'
import { useAuth } from '../context/AuthContext'
import { fechaSesion, formatFechaRelativa, calcularRachaSemanal } from '../utils/helpers'
import { leerBorrador, hayDatosAnteriores, recuperarDatosAnteriores, STORAGE_EVENT } from '../utils/sesionDraft'

export default function Home() {
  const { user } = useAuth()
  const rail = useRef(null)
  const [activeRoutine,setActiveRoutine] = useState(0)
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
  const series = draft?.sesionEjercicios?.reduce((sum,e) => sum + e.series.length, 0) || 0
  const recuperar = () => {
    if (!confirm('Hay un entrenamiento de una versión anterior sin cuenta asociada. ¿Es tuyo y querés recuperarlo en esta cuenta?')) return
    try { recuperarDatosAnteriores(user.id); setLegacy(false); setDraft(leerBorrador(user.id)) }
    catch { setError('No pudimos recuperar el entrenamiento. Los datos originales siguen guardados.') }
  }
  const featured = rutinas[activeRoutine] || rutinas[0]
  const target = draft ? '/entrenar' : featured ? `/entrenar/${featured.id}` : '/entrenar'
  function scrollRoutine(direction) {
    const next = Math.max(0, Math.min(rutinas.length-1, activeRoutine+direction))
    const item = rail.current?.children[next]
    if (item) rail.current.scrollTo({left:item.offsetLeft-rail.current.offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})
  }
  return <div className="athletic-home">
    <header className="athletic-greeting"><div><p>{hoy.toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'})}</p><h1>Vamos, {nombre}<span>.</span></h1></div><Link to="/perfil" aria-label="Ir a mi perfil" className="athletic-avatar">{nombre.slice(0,1).toUpperCase()}</Link></header>
    {error && <div role="alert" className="notice"><p>{error}</p><button onClick={cargar}>Volver a intentar</button></div>}
    {legacy && <div className="notice"><p>Encontramos un entrenamiento de tu versión anterior.</p><button onClick={recuperar}>Recuperar mis datos</button></div>}
    <section className="training-poster" aria-label="Tu entrenamiento de hoy">
      <div className="poster-top"><span>FITSYNC / TRAINING CLUB</span><span>{draft?'EN CURSO':'TU ESPACIO'}</span></div>
      <div className="poster-art" aria-hidden="true"><svg viewBox="0 0 300 300"><circle cx="150" cy="150" r="128"/><circle cx="150" cy="150" r="106"/><circle cx="150" cy="150" r="84"/><circle cx="150" cy="150" r="62"/><path d="M0 150H300M150 0V300"/></svg><span>FS</span></div>
      <h2>{draft?<>SEGUÍ.<br/>ES TUYO.</>:<>HOY<br/>CUENTA.</>}</h2>
      <div className="poster-bottom"><div><span>{draft?'RETOMÁ TU SESIÓN':featured?'LISTO PARA VOS':'A TU RITMO'}</span><p>{draft?`${draft.rutinaNombre||'Sesión libre'} · ${series} series`:loading?'Preparando tu entrenamiento…':featured?.nombre||'Tu primer entrenamiento empieza acá'}</p></div><Link to={target} data-tour="home-cta-entrenar" className="poster-cta" aria-label={draft?'Retomar entrenamiento':'Empezar entrenamiento'}><span>{draft?'Continuar':'Entrenar'}</span><ArrowUpRight size={22}/></Link></div>
    </section>
    <section className="athletic-week" data-tour="home-stats" aria-label="Actividad de esta semana"><div className="athletic-section-heading"><h2>Esta semana</h2><Link to="/historial"><b>{loading?'—':dias.size}</b> / {racha.meta} días <ArrowUpRight size={15}/></Link></div><div className="athletic-days">{['L','M','M','J','V','S','D'].map((letter,i)=>{const date=new Date(lunes);date.setDate(date.getDate()+i);const done=dias.has(date.toDateString()),today=date.toDateString()===hoy.toDateString();return <div key={i} className={`${done?'done':''} ${today?'today':''}`} aria-label={`${date.toLocaleDateString('es-AR')}${done?', entrenaste':''}${today?', hoy':''}`}><span>{letter}</span><b>{done?<Check size={19}/>:date.getDate()}</b><i/></div>})}</div></section>
    <section className="athletic-routines" data-tour="home-rutinas"><div className="athletic-section-heading"><h2>Tu plan.</h2><Link to="/rutinas">Ver todas <ArrowUpRight size={16}/></Link></div>{loading?<div className="athletic-loading" aria-label="Cargando rutinas"/>:rutinas.length?<><div ref={rail} className="routine-rail" aria-label="Elegí tu rutina" onScroll={e=>{const el=e.currentTarget;const width=el.children[0]?.getBoundingClientRect().width+12;if(width)setActiveRoutine(Math.min(rutinas.length-1,Math.round(el.scrollLeft/width)))}}>{rutinas.map((r,i)=><Link className="athletic-routine" key={r.id} to={draft?'/entrenar':`/entrenar/${r.id}`}><div className="routine-cover" aria-hidden="true"><span>{String(i+1).padStart(2,'0')}</span><svg viewBox="0 0 100 100"><path d={i%3===0?'M10 78L35 53L50 68L90 22':i%3===1?'M20 80V20H80V80Z M35 65V35H65V65Z':'M15 75L50 15L85 75Z M30 75L50 40L70 75Z'}/></svg><ArrowUpRight size={20}/></div><h3>{r.nombre}</h3><p>{r.ejercicios?.length||0} ejercicios · {(r.ejercicios||[]).reduce((n,e)=>n+(Number(e.series_objetivo)||3),0)} series</p></Link>)}</div>{rutinas.length>1&&<div className="routine-rail-controls"><span>{String(activeRoutine+1).padStart(2,'0')} <i>/ {String(rutinas.length).padStart(2,'0')}</i></span><div><button aria-label="Rutina anterior" disabled={!activeRoutine} onClick={()=>scrollRoutine(-1)}><ArrowRight size={17} style={{transform:'rotate(180deg)'}}/></button><button aria-label="Rutina siguiente" disabled={activeRoutine>=rutinas.length-1} onClick={()=>scrollRoutine(1)}><ArrowRight size={17}/></button></div></div>}</>:<Link className="athletic-empty" to="/rutinas"><Plus size={22}/><span>Armá tu primera rutina</span><ArrowUpRight size={18}/></Link>}</section>
    <Link to="/historial/momentos" className="athletic-moments"><div><span>EL ESFUERZO DEJA HUELLA</span><h2>TU HISTORIA.<br/>TUS REGLAS.</h2><p>Wrapped, marcas y misiones personales.</p></div><span className="moments-arrow"><ArrowUpRight size={24}/></span></Link>
    {ultimo&&<Link className="athletic-last" to="/historial"><History size={20}/><div><span>ÚLTIMA SESIÓN · {formatFechaRelativa(ultimo.fecha)}</span><b>{ultimo.rutina_nombre||'Sesión libre'}</b></div><ArrowUpRight size={18}/></Link>}
    <p className="athletic-signoff">FITSYNC<span>HECHO POR VOS.</span></p>
  </div>
}
