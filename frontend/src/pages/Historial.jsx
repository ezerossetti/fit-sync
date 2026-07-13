import { useEffect, useMemo, useState } from 'react'
import sesionesService from '../services/sesiones.service'
import ejerciciosPersonalizadosService from '../services/ejerciciosPersonalizados.service'
import { useTour } from '../context/TourContext'
import { TOURS } from '../data/tours'
import {
  formatFecha, formatFechaRelativa, volumenSesion, formatKg, formatDuracion,
  ejerciciosEnHistorial, progresoPorEjercicio, datosHeatmap, volumenPorGrupoSemana,
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
    <div data-tour="historial-heatmap" className="card p-4 mb-6">
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

// ---------- Balance muscular de la semana (empuje / tracción / piernas / core) ----------
function MuscleBalanceChart({ sesiones, personalizados }) {
  const datos = useMemo(
    () => volumenPorGrupoSemana(sesiones, personalizados),
    [sesiones, personalizados]
  )

  const hayDatos = datos.some(d => d.volumen > 0)
  const maxVol = Math.max(1, ...datos.map(d => d.volumen))

  return (
    <div className="card p-4 mb-6">
      <p className="text-label-md text-accent uppercase tracking-wide mb-3">Balance muscular · esta semana</p>
      {!hayDatos ? (
        <p className="text-body-sm text-on-surface-variant italic py-2 text-center">
          Todavía no registraste ejercicios esta semana.
        </p>
      ) : (
        <div className="space-y-2.5">
          {datos.filter(d => d.categoria !== 'Otro' || d.volumen > 0).map(d => (
            <div key={d.categoria} className="flex items-center gap-3">
              <span className="text-label-md text-on-surface-variant w-20 shrink-0">{d.categoria}</span>
              <div className="flex-1 h-3 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full"
                  style={{ width: `${Math.max(3, Math.round((d.volumen / maxVol) * 100))}%`, opacity: d.volumen === 0 ? 0.15 : 1 }}
                />
              </div>
              <span className="font-mono text-label-md text-on-surface w-16 text-right shrink-0">{formatKg(d.volumen)} kg</span>
            </div>
          ))}
          <p className="text-label-md text-on-surface-variant mt-1">
            Lunes a hoy. Si algún grupo queda siempre en cero, puede valer la pena sumarlo a tu rutina.
          </p>
        </div>
      )}
    </div>
  )
}

// Arma y dispara la descarga de un CSV con todas las sesiones del historial.
function exportarHistorialCSV(sesiones) {
  const encabezados = ['fecha', 'rutina', 'ejercicio', 'set_numero', 'peso_kg', 'reps', 'volumen_sesion_kg', 'duracion_min', 'notas']
  const filas = []

  const escapar = (valor) => {
    const s = String(valor ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }

  sesiones.forEach(s => {
    const volumenSesionTotal = s.volumen_total ?? volumenSesion(s.ejercicios)
    const ejercicios = s.ejercicios || []
    if (ejercicios.length === 0) {
      filas.push([s.fecha, s.rutina_nombre || 'Sesión libre', '', '', '', '', volumenSesionTotal, s.duracion_min || 0, s.notas || ''])
      return
    }
    ejercicios.forEach(ej => {
      const series = ej.series || []
      if (series.length === 0) {
        filas.push([s.fecha, s.rutina_nombre || 'Sesión libre', ej.nombre, '', '', '', volumenSesionTotal, s.duracion_min || 0, s.notas || ''])
        return
      }
      series.forEach((set, i) => {
        filas.push([
          s.fecha, s.rutina_nombre || 'Sesión libre', ej.nombre, i + 1,
          set.peso ?? '', set.reps ?? '', volumenSesionTotal, s.duracion_min || 0, s.notas || '',
        ])
      })
    })
  })

  const csv = [encabezados, ...filas].map(fila => fila.map(escapar).join(',')).join('\n')
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const fechaArchivo = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `fitsync-historial-${fechaArchivo}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function Historial() {
  const [sesiones, setSesiones] = useState([])
  const [personalizados, setPersonalizados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { startTour } = useTour()

  // Se dispara recién cuando terminó de cargar y hay sesiones: los targets
  // (heatmap, lista) solo existen en el DOM en ese caso.
  useEffect(() => {
    if (!loading && sesiones.length > 0) {
      startTour('historial', TOURS.historial.steps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, sesiones.length])

  const cargar = async () => {
    setLoading(true)
    try {
      const [data, ep] = await Promise.all([
        sesionesService.getAll(),
        ejerciciosPersonalizadosService.getAll().catch(() => []),
      ])
      setSesiones((data || []).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)))
      setPersonalizados(ep || [])
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
      <div className="flex items-start justify-between gap-3 mb-1">
        <h1 className="font-display text-headline-lg-mobile text-on-surface">Historial</h1>
        {!loading && sesiones.length > 0 && (
          <button
            type="button"
            onClick={() => exportarHistorialCSV(sesiones)}
            className="text-label-md text-accent border border-accent/30 rounded-full px-3 py-1.5 flex items-center gap-1 shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            CSV
          </button>
        )}
      </div>
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
          <MuscleBalanceChart sesiones={sesiones} personalizados={personalizados} />
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
        <div data-tour="historial-lista" className="space-y-6">
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
