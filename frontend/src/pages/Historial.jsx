import { useEffect, useMemo, useState } from 'react'
import sesionesService from '../services/sesiones.service'
import {
  formatFecha, formatFechaRelativa, volumenSesion, formatKg, formatDuracion,
  ejerciciosEnHistorial, progresoPorEjercicio, datosHeatmap,
} from '../utils/helpers'

function mesAnioLabel(fechaISO) {
  const d = new Date(fechaISO)
  const label = d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

// ---------- Heatmap de actividad (últimas 12 semanas) ----------
function ActivityHeatmap({ sesiones }) {
  const semanas = useMemo(() => datosHeatmap(sesiones, 12), [sesiones])
  const colorPorIntensidad = [
    'bg-surface-container-high',
    'bg-accent/25',
    'bg-accent/45',
    'bg-accent/70',
    'bg-accent',
  ]

  return (
    <div className="card p-4 mb-6">
      <p className="text-label-md text-accent uppercase tracking-wide mb-3">Actividad · últimas 12 semanas</p>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {semanas.map((semana, i) => (
          <div key={i} className="flex flex-col gap-1">
            {semana.map((dia, j) => (
              <div
                key={j}
                title={`${dia.fecha.toLocaleDateString('es-AR')} · ${formatKg(dia.volumen)} kg`}
                className={`w-2.5 h-2.5 rounded-sm ${dia.intensidad < 0 ? 'bg-transparent' : colorPorIntensidad[dia.intensidad]}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-3 justify-end">
        <span className="text-label-md text-on-surface-variant mr-1">Menos</span>
        {colorPorIntensidad.map((c, i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-sm ${c}`} />
        ))}
        <span className="text-label-md text-on-surface-variant ml-1">Más</span>
      </div>
    </div>
  )
}

// ---------- Gráfico de progreso por ejercicio (SVG simple, sin librerías) ----------
function ProgressChart({ sesiones }) {
  const ejercicios = useMemo(() => ejerciciosEnHistorial(sesiones), [sesiones])
  const [seleccionado, setSeleccionado] = useState(ejercicios[0] || '')

  useEffect(() => {
    if (!seleccionado && ejercicios.length) setSeleccionado(ejercicios[0])
  }, [ejercicios])

  const puntos = useMemo(() => progresoPorEjercicio(sesiones, seleccionado), [sesiones, seleccionado])

  if (ejercicios.length === 0) return null

  const W = 300, H = 120, PAD = 24
  const pesos = puntos.map(p => p.peso)
  const min = Math.min(...pesos)
  const max = Math.max(...pesos)
  const rango = max - min || 1

  const coords = puntos.map((p, i) => {
    const x = puntos.length > 1 ? PAD + (i / (puntos.length - 1)) * (W - PAD * 2) : W / 2
    const y = H - PAD - ((p.peso - min) / rango) * (H - PAD * 2)
    return { x, y, ...p }
  })

  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')

  return (
    <div className="card p-4 mb-6">
      <div className="flex items-center justify-between mb-3 gap-2">
        <p className="text-label-md text-accent uppercase tracking-wide">Progreso por ejercicio</p>
        <select
          className="input-field py-1 px-2 text-body-sm w-auto max-w-[55%]"
          value={seleccionado}
          onChange={(e) => setSeleccionado(e.target.value)}
        >
          {ejercicios.map(nombre => <option key={nombre} value={nombre}>{nombre}</option>)}
        </select>
      </div>

      {puntos.length < 2 ? (
        <p className="text-body-sm text-on-surface-variant italic py-4 text-center">
          Necesitás al menos 2 sesiones con este ejercicio para ver el gráfico.
        </p>
      ) : (
        <>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            <path d={path} fill="none" stroke="#29B0E8" strokeWidth="2" />
            {coords.map((c, i) => (
              <circle key={i} cx={c.x} cy={c.y} r="3" fill="#29B0E8" />
            ))}
          </svg>
          <div className="flex items-center justify-between mt-2 text-label-md text-on-surface-variant">
            <span>{formatFecha(coords[0].fecha)} · {formatKg(coords[0].peso)} kg</span>
            <span>{formatFecha(coords[coords.length - 1].fecha)} · {formatKg(coords[coords.length - 1].peso)} kg</span>
          </div>
        </>
      )}
    </div>
  )
}

export default function Historial() {
  const [sesiones, setSesiones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = async () => {
    setLoading(true)
    try {
      const data = await sesionesService.getAll()
      setSesiones((data || []).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)))
    } catch (e) {
      console.error(e)
      setError('No se pudo cargar el historial.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta sesión?')) return
    try {
      await sesionesService.delete(id)
      await cargar()
    } catch (e) {
      console.error(e)
    }
  }

  // Agrupar sesiones por mes para una lectura más ordenada
  const grupos = []
  sesiones.forEach(s => {
    const label = mesAnioLabel(s.fecha)
    let grupo = grupos.find(g => g.label === label)
    if (!grupo) {
      grupo = { label, sesiones: [] }
      grupos.push(grupo)
    }
    grupo.sesiones.push(s)
  })

  const volumenTotalHistorico = sesiones.reduce((acc, s) => acc + Number(s.volumen_total ?? volumenSesion(s.ejercicios)), 0)

  return (
    <div>
      <h1 className="font-display text-headline-lg-mobile text-on-surface mb-1">Historial</h1>
      <p className="text-body-sm text-on-surface-variant mb-5">Tu progreso, siempre 100% libre.</p>

      {error && <p className="text-body-sm text-error mb-3">{error}</p>}

      {!loading && sesiones.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="card p-3 text-center">
            <p className="font-mono text-headline-sm text-accent">{sesiones.length}</p>
            <p className="text-label-md text-on-surface-variant mt-1 uppercase">Sesiones totales</p>
          </div>
          <div className="card p-3 text-center">
            <p className="font-mono text-headline-sm text-accent">{formatKg(volumenTotalHistorico)} kg</p>
            <p className="text-label-md text-on-surface-variant mt-1 uppercase">Volumen histórico</p>
          </div>
        </div>
      )}

      {!loading && sesiones.length > 0 && (
        <>
          <ActivityHeatmap sesiones={sesiones} />
          <ProgressChart sesiones={sesiones} />
        </>
      )}

      {loading ? (
        <p className="text-body-sm text-on-surface-variant">Cargando historial...</p>
      ) : sesiones.length === 0 ? (
        <div className="card p-6 text-center">
          <span className="material-symbols-outlined text-on-surface-variant text-[32px] mb-2">history</span>
          <p className="text-body-md text-on-surface">Todavía no registraste ninguna sesión</p>
          <p className="text-body-sm text-on-surface-variant mt-1">Es una invitación: tocá "Entrenar" y arrancá.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grupos.map(grupo => (
            <div key={grupo.label}>
              <p className="text-label-md text-accent uppercase tracking-wide mb-2">{grupo.label}</p>
              <div className="space-y-3">
                {grupo.sesiones.map(s => (
                  <div key={s.id} className="card p-4 timeline-accent">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-lg bg-primary-container flex flex-col items-center justify-center shrink-0 leading-none">
                          <span className="text-label-md text-accent font-bold">
                            {new Date(s.fecha).toLocaleDateString('es-AR', { day: '2-digit' })}
                          </span>
                          <span className="text-on-surface-variant" style={{ fontSize: '9px' }}>
                            {new Date(s.fecha).toLocaleDateString('es-AR', { month: 'short' }).replace('.', '')}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-body-md font-semibold text-on-surface truncate">{s.rutina_nombre || 'Sesión libre'}</p>
                          <p className="text-label-md text-on-surface-variant">{formatFechaRelativa(s.fecha)} · {formatFecha(s.fecha)}</p>
                        </div>
                      </div>
                      <button onClick={() => eliminar(s.id)} className="text-error shrink-0">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>

                    <div className="flex gap-2 mt-3 flex-wrap">
                      <span className="text-label-md bg-surface-container-high text-accent px-2.5 py-1 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">bar_chart</span>
                        {formatKg(s.volumen_total ?? volumenSesion(s.ejercicios))} kg
                      </span>
                      <span className="text-label-md bg-surface-container-high text-on-surface-variant px-2.5 py-1 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">fitness_center</span>
                        {(s.ejercicios || []).length} ejercicios
                      </span>
                      <span className="text-label-md bg-surface-container-high text-on-surface-variant px-2.5 py-1 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {formatDuracion(s.duracion_min || 0)}
                      </span>
                    </div>

                    {(s.ejercicios || []).length > 0 && (
                      <p className="text-label-md text-on-surface-variant mt-2 truncate">
                        {s.ejercicios.map(e => e.nombre).join(' · ')}
                      </p>
                    )}

                    {s.notas && (
                      <p className="text-body-sm text-on-surface-variant mt-2 italic flex gap-1.5">
                        <span className="material-symbols-outlined text-[14px] shrink-0 mt-0.5">sticky_note_2</span>
                        {s.notas}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
