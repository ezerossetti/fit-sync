import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import rutinasService from '../services/rutinas.service'
import sesionesService from '../services/sesiones.service'
import usuarioService from '../services/usuario.service'
import { useAuth } from '../context/AuthContext'
import { useTour } from '../context/TourContext'
import { TOURS } from '../data/tours'
import { saludoPorHora, formatFechaRelativa, volumenSesion, formatKg, calcularRachaDetalle, sugerirDeload, ejerciciosAbandonados } from '../utils/helpers'
import { calcularLogros, NIVEL_COLOR } from '../data/achievements'

function inicioDeSemana() {
  const d = new Date()
  const day = d.getDay() === 0 ? 7 : d.getDay()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - day + 1)
  return d
}

// Vista previa de 6 logros para Home, usando el mismo catálogo central que
// Perfil (data/achievements.js) — así nunca se desincronizan entre pantallas.
// Prioriza mostrar primero los ya desbloqueados y, si sobra lugar, completa
// con los que están más cerca de desbloquearse (mayor progreso).
function logrosPreview(sesiones) {
  const todos = calcularLogros(sesiones)
  const desbloqueados = todos.filter(l => l.desbloqueado)
  const bloqueados = todos
    .filter(l => !l.desbloqueado)
    .slice()
    .sort((a, b) => b.progreso - a.progreso)
  return [...desbloqueados, ...bloqueados].slice(0, 6)
}

export default function Home() {
  const { user } = useAuth()
  const { startTour, yaVisto } = useTour()
  const [rutinas, setRutinas] = useState([])
  const [sesiones, setSesiones] = useState([])
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Primera vez en la app: tour de bienvenida (recorre la barra inferior).
  // Ya la vio, pero nunca vio el detalle de Home: tour de Home.
  // Ambos quedan guardados en localStorage, así que esto corre una sola vez
  // por usuario, no en cada sesión.
  useEffect(() => {
    if (!yaVisto('bienvenida')) {
      startTour('bienvenida', TOURS.bienvenida.steps)
    } else {
      startTour('home', TOURS.home.steps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const [r, s, p] = await Promise.all([
          rutinasService.getAll(),
          sesionesService.getAll(),
          usuarioService.getMe().catch(() => null),
        ])
        setRutinas(r || [])
        setSesiones((s || []).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)))
        setPerfil(p)
      } catch (e) {
        console.error(e)
        setError('No se pudo conectar con el backend. Puede estar "durmiendo" (free tier de Render) — probá recargar en 30-60 seg.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const inicio = inicioDeSemana()
  const sesionesSemana = sesiones.filter(s => new Date(s.fecha) >= inicio)
  const { racha, huboGracia } = calcularRachaDetalle(sesiones)
  const deload = sugerirDeload(sesiones)
  const abandonados = ejerciciosAbandonados(sesiones, rutinas)
  const ultimaSesion = sesiones[0]
  const logrosTotales = calcularLogros(sesiones)
  const logrosDesbloqueados = logrosTotales.filter(l => l.desbloqueado).length
  const logros = logrosPreview(sesiones)
  const nombre = perfil?.nombre || user?.user_metadata?.nombre || 'Deportista'
  const primerNombre = nombre.split(' ')[0]

  return (
    <div className="space-y-6">
      {/* Hero greeting */}
      <div>
        <p className="text-body-sm text-on-surface-variant">{saludoPorHora()},</p>
        <h1 className="font-display text-headline-lg-mobile text-on-surface">{primerNombre} 💪</h1>
      </div>

      {error && (
        <div className="card p-4 border-error-container">
          <p className="text-body-sm text-error">{error}</p>
        </div>
      )}

      {/* CTA principal */}
      <Link
        to="/entrenar"
        data-tour="home-cta-entrenar"
        className="block card p-5 bg-gradient-to-br from-primary to-primary-container border-none relative overflow-hidden"
      >
        <div className="relative z-10">
          <p className="text-label-md text-accent uppercase tracking-wide mb-1">Carga rápida</p>
          <h2 className="font-display text-headline-sm text-on-primary mb-1">Empezar entrenamiento</h2>
          <p className="text-body-sm text-on-primary-container">Sin teclado. Solo tocá y registrá.</p>
        </div>
        <span className="material-symbols-outlined absolute -right-3 -bottom-3 text-[110px] text-white/5">bolt</span>
      </Link>

      {/* Sugerencia de deload */}
      {deload && (
        <div className="card p-4 border-l-4 border-l-accent bg-accent/5 flex gap-3">
          <span className="material-symbols-outlined text-accent text-[22px] shrink-0">self_improvement</span>
          <div>
            <p className="text-body-sm font-semibold text-on-surface mb-0.5">Sugerencia: semana de descarga</p>
            <p className="text-body-sm text-on-surface-variant">{deload.mensaje}</p>
          </div>
        </div>
      )}

      {/* Ejercicio abandonado */}
      {abandonados.length > 0 && (
        <div className="card p-4 border-l-4 border-l-accent bg-accent/5 flex gap-3">
          <span className="material-symbols-outlined text-accent text-[22px] shrink-0">history_toggle_off</span>
          <div>
            <p className="text-body-sm font-semibold text-on-surface mb-0.5">Coach · Ejercicio abandonado</p>
            <p className="text-body-sm text-on-surface-variant">
              Hace {abandonados[0].dias} días que no hacés <span className="font-semibold text-on-surface">{abandonados[0].nombre}</span>, y sigue en tus rutinas activas.
            </p>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div data-tour="home-stats" className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <p className="font-mono text-headline-md text-accent">{loading ? '–' : rutinas.length}</p>
          <p className="text-label-md text-on-surface-variant mt-1">Rutinas</p>
        </div>
        <div className="card p-3 text-center">
          <p className="font-mono text-headline-md text-accent">{loading ? '–' : sesionesSemana.length}</p>
          <p className="text-label-md text-on-surface-variant mt-1">Sesiones · semana</p>
        </div>
        <div className="card p-3 text-center">
          <p className="font-mono text-headline-md text-accent">{loading ? '–' : racha}</p>
          <p className="text-label-md text-on-surface-variant mt-1 flex items-center justify-center gap-1">
            Racha (días)
            {!loading && huboGracia && (
              <span title="Tenés un día de gracia usado en esta racha" className="material-symbols-outlined text-[14px] text-accent">shield</span>
            )}
          </p>
        </div>
      </div>

      {/* Última sesión */}
      {ultimaSesion && (
        <div>
          <h3 className="text-headline-sm font-display text-on-surface mb-2">Tu última sesión</h3>
          <div className="card p-4 timeline-accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-md font-semibold text-on-surface">{ultimaSesion.rutina_nombre || 'Sesión libre'}</p>
                <p className="text-body-sm text-on-surface-variant">{formatFechaRelativa(ultimaSesion.fecha)}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-body-lg text-accent">{formatKg(ultimaSesion.volumen_total || volumenSesion(ultimaSesion.ejercicios))} kg</p>
                <p className="text-label-md text-on-surface-variant">volumen total</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rutinas */}
      <div data-tour="home-rutinas">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-headline-sm font-display text-on-surface">Mis rutinas</h3>
          <Link to="/rutinas" className="text-body-sm text-accent">Ver todas</Link>
        </div>

        {loading ? (
          <p className="text-body-sm text-on-surface-variant">Cargando...</p>
        ) : rutinas.length === 0 ? (
          <div className="card p-5 text-center">
            <p className="text-body-md text-on-surface mb-1">Todavía no tenés rutinas</p>
            <p className="text-body-sm text-on-surface-variant mb-3">Creá la primera para empezar a registrar tu progreso.</p>
            <Link to="/rutinas" className="btn-primary inline-block px-4 py-2 text-body-sm">Crear rutina</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {rutinas.slice(0, 3).map(r => (
              <div key={r.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="text-body-md font-semibold text-on-surface">{r.nombre}</p>
                  <p className="text-label-md text-on-surface-variant">{(r.ejercicios || []).length} ejercicios</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logros */}
      <div data-tour="home-logros">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-headline-sm font-display text-on-surface">Logros</h3>
          <Link to="/perfil" className="text-label-md text-accent">{logrosDesbloqueados}/{logrosTotales.length} · Ver todos</Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {logros.map(l => (
            <Link
              to="/perfil"
              key={l.id}
              className={`card p-3 text-center flex flex-col items-center gap-1.5 ${l.desbloqueado ? 'border-accent/40' : 'opacity-50'}`}
            >
              <span
                className={`w-10 h-10 rounded-full flex items-center justify-center ${l.desbloqueado ? '' : 'bg-surface-container-high'}`}
                style={{
                  backgroundColor: l.desbloqueado ? `${NIVEL_COLOR[l.nivel]}26` : undefined,
                  color: l.desbloqueado ? NIVEL_COLOR[l.nivel] : undefined,
                }}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${l.desbloqueado ? '' : 'text-on-surface-variant'}`}
                  style={l.desbloqueado ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {l.icono}
                </span>
              </span>
              <p className="text-label-md font-semibold text-on-surface leading-tight">{l.titulo}</p>
              <p className="text-label-md text-on-surface-variant leading-tight">{l.descripcion}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
