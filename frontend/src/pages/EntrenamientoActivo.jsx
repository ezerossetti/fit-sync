import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import rutinasService from '../services/rutinas.service'
import sesionesService from '../services/sesiones.service'
import { ultimoRegistroEjercicio, formatFechaRelativa, formatTimer, volumenSesion, formatKg, formatDuracion } from '../utils/helpers'

const SALTOS_PESO = [1.25, 2.5, 5]
const SALTOS_REPS = [1, 2, 5]

function Stepper({ label, value, onChange, saltos, unidad, min = 0 }) {
  const [saltoIdx, setSaltoIdx] = useState(0)
  const salto = saltos[saltoIdx]

  return (
    <div className="flex flex-col items-center">
      <p className="text-label-md text-on-surface-variant uppercase mb-3">{label}</p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, +(value - salto).toFixed(2)))}
          className="plate-btn w-16 h-16"
          aria-label={`Restar ${salto}${unidad}`}
        >
          <span className="material-symbols-outlined text-[28px]">remove</span>
        </button>
        <div className="w-24 text-center">
          <span className="font-mono text-headline-lg text-on-surface tabular-nums">{value}</span>
          <p className="text-label-md text-on-surface-variant">{unidad}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(+(value + salto).toFixed(2))}
          className="plate-btn w-16 h-16 bg-primary-container border-accent/30"
          aria-label={`Sumar ${salto}${unidad}`}
        >
          <span className="material-symbols-outlined text-[28px] text-accent">add</span>
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        {saltos.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setSaltoIdx(i)}
            className={`px-3 py-1 rounded-full text-label-md border ${i === saltoIdx ? 'bg-accent/15 border-accent text-accent' : 'border-outline-variant text-on-surface-variant'}`}
          >
            ±{s}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function EntrenamientoActivo() {
  const { rutinaId } = useParams()
  const navigate = useNavigate()

  const [rutinas, setRutinas] = useState([])
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)

  const [rutina, setRutina] = useState(null)
  const [ejercicioActual, setEjercicioActual] = useState(null)
  const [step, setStep] = useState('select-rutina') // select-rutina | select-ejercicio | pre-serie | activo | resumen

  const [sesionEjercicios, setSesionEjercicios] = useState([]) // acumulado de toda la sesión
  const [peso, setPeso] = useState(20)
  const [reps, setReps] = useState(8)
  const [segundosDescanso, setSegundosDescanso] = useState(0)
  const [descansando, setDescansando] = useState(false)
  const intervalRef = useRef(null)
  const inicioSesionRef = useRef(null)
  const [guardando, setGuardando] = useState(false)
  const [ultimaSesionGuardada, setUltimaSesionGuardada] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const [r, s] = await Promise.all([rutinasService.getAll(), sesionesService.getAll()])
        setRutinas((r || []).filter(x => x.activa))
        setHistorial(s || [])
        if (rutinaId) {
          const encontrada = (r || []).find(x => String(x.id) === String(rutinaId))
          if (encontrada) {
            setRutina(encontrada)
            setStep('select-ejercicio')
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [rutinaId])

  useEffect(() => {
    if (!inicioSesionRef.current) inicioSesionRef.current = Date.now()
  }, [])

  useEffect(() => {
    if (descansando) {
      intervalRef.current = setInterval(() => setSegundosDescanso(s => s + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [descansando])

  const elegirRutina = (r) => {
    setRutina(r)
    setStep('select-ejercicio')
  }

  const elegirEjercicio = (ej) => {
    setEjercicioActual(ej)
    const previo = ultimoRegistroEjercicio(historial, ej.nombre)
    setPeso(previo?.mejorSet?.peso ?? 20)
    setReps(previo?.mejorSet?.reps ?? (ej.reps_objetivo || 8))
    setStep('pre-serie')
  }

  const iniciarSerie = () => {
    setSegundosDescanso(0)
    setDescansando(false)
    setStep('activo')
  }

  const seriesGuardadasEjercicioActual = () => {
    const ex = sesionEjercicios.find(e => e.nombre === ejercicioActual?.nombre)
    return ex?.series?.length || 0
  }

  const guardarSerie = () => {
    setSesionEjercicios(prev => {
      const idx = prev.findIndex(e => e.nombre === ejercicioActual.nombre)
      if (idx === -1) {
        return [...prev, { nombre: ejercicioActual.nombre, series: [{ peso, reps }] }]
      }
      const copia = [...prev]
      copia[idx] = { ...copia[idx], series: [...copia[idx].series, { peso, reps }] }
      return copia
    })
    setDescansando(true)
    setSegundosDescanso(0)
  }

  const repetirCarga = () => {
    const ex = sesionEjercicios.find(e => e.nombre === ejercicioActual.nombre)
    const ultima = ex?.series?.[ex.series.length - 1]
    if (ultima) {
      setPeso(ultima.peso)
      setReps(ultima.reps)
    }
    guardarSerie()
  }

  const volverASeleccionEjercicio = () => setStep('select-ejercicio')

  const finalizarSesion = async () => {
    setGuardando(true)
    try {
      const duracionMin = (Date.now() - inicioSesionRef.current) / 1000 / 60
      const payload = {
        fecha: new Date().toISOString(),
        rutina_id: rutina?.id,
        rutina_nombre: rutina?.nombre || 'Sesión libre',
        ejercicios: sesionEjercicios,
        volumen_total: volumenSesion(sesionEjercicios),
        duracion_min: Math.max(1, Math.round(duracionMin)),
        completada: true,
      }
      const creada = await sesionesService.create(payload)
      setUltimaSesionGuardada(creada || payload)
      setStep('resumen')
    } catch (e) {
      console.error(e)
      alert('No se pudo guardar la sesión. Revisá la conexión con el backend.')
    } finally {
      setGuardando(false)
    }
  }

  // ---------- RENDER ----------

  if (loading) {
    return <p className="text-body-sm text-on-surface-variant">Cargando...</p>
  }

  if (step === 'select-rutina') {
    return (
      <div>
        <h1 className="font-display text-headline-lg-mobile text-on-surface mb-1">Entrenar</h1>
        <p className="text-body-sm text-on-surface-variant mb-5">Elegí la rutina de hoy.</p>
        {rutinas.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-body-md text-on-surface mb-1">No tenés rutinas activas</p>
            <p className="text-body-sm text-on-surface-variant mb-3">Activá o creá una rutina para poder entrenar.</p>
            <button onClick={() => navigate('/rutinas')} className="btn-primary px-4 py-2 text-body-sm">Ir a rutinas</button>
          </div>
        ) : (
          <div className="space-y-2">
            {rutinas.map(r => (
              <button key={r.id} onClick={() => elegirRutina(r)} className="w-full card p-4 flex items-center justify-between text-left">
                <div>
                  <p className="text-body-md font-semibold text-on-surface">{r.nombre}</p>
                  <p className="text-label-md text-on-surface-variant">{(r.ejercicios || []).length} ejercicios</p>
                </div>
                <span className="material-symbols-outlined text-accent">chevron_right</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (step === 'select-ejercicio') {
    const ejerciciosDisponibles = rutina?.ejercicios || []
    return (
      <div>
        <button onClick={() => setStep('select-rutina')} className="flex items-center gap-1 text-accent text-body-sm mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span> Cambiar rutina
        </button>
        <h1 className="font-display text-headline-lg-mobile text-on-surface mb-1">{rutina?.nombre}</h1>
        <p className="text-body-sm text-on-surface-variant mb-5">Elegí el ejercicio a registrar.</p>

        {ejerciciosDisponibles.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-body-md text-on-surface mb-1">Esta rutina no tiene ejercicios</p>
            <button onClick={() => navigate('/rutinas')} className="btn-primary px-4 py-2 text-body-sm mt-2">Editar rutina</button>
          </div>
        ) : (
          <div className="space-y-2 mb-6">
            {ejerciciosDisponibles.map((ej, i) => {
              const hechos = sesionEjercicios.find(e => e.nombre === ej.nombre)?.series?.length || 0
              return (
                <button key={i} onClick={() => elegirEjercicio(ej)} className="w-full card p-4 flex items-center justify-between text-left">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-accent">fitness_center</span>
                    <div>
                      <p className="text-body-md font-semibold text-on-surface">{ej.nombre}</p>
                      <p className="text-label-md text-on-surface-variant">Objetivo: {ej.series_objetivo}×{ej.reps_objetivo}</p>
                    </div>
                  </div>
                  {hechos > 0 && <span className="text-label-md text-success bg-success-container px-2 py-1 rounded-full">{hechos} hecha{hechos > 1 ? 's' : ''}</span>}
                </button>
              )
            })}
          </div>
        )}

        {sesionEjercicios.length > 0 && (
          <button onClick={finalizarSesion} disabled={guardando} className="btn-primary w-full py-3 text-body-md">
            {guardando ? 'Guardando...' : 'Finalizar sesión'}
          </button>
        )}
      </div>
    )
  }

  if (step === 'pre-serie') {
    const previo = ultimoRegistroEjercicio(historial, ejercicioActual.nombre)
    return (
      <div className="flex flex-col min-h-[70vh]">
        <button onClick={volverASeleccionEjercicio} className="flex items-center gap-1 text-accent text-body-sm mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span> Elegir otro ejercicio
        </button>

        <h1 className="font-display text-headline-lg-mobile text-on-surface mb-1">{ejercicioActual.nombre}</h1>
        <p className="text-body-sm text-on-surface-variant mb-6">Objetivo: {ejercicioActual.series_objetivo} series × {ejercicioActual.reps_objetivo} reps</p>

        <div className="card p-5 mb-6">
          <p className="text-label-md text-on-surface-variant uppercase mb-2">Tu referencia de hoy</p>
          {previo ? (
            <>
              <p className="font-mono text-headline-md text-accent">{previo.mejorSet.peso} kg × {previo.mejorSet.reps} reps</p>
              <p className="text-body-sm text-on-surface-variant mt-1">Última vez · {formatFechaRelativa(previo.fecha)}</p>
            </>
          ) : (
            <p className="text-body-md text-on-surface-variant">Todavía no registraste este ejercicio. ¡Arrancá tu propia marca!</p>
          )}
        </div>

        <div className="mt-auto">
          <button onClick={iniciarSerie} className="btn-primary w-full py-4 text-body-lg flex items-center justify-center gap-2">
            Iniciar serie <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    )
  }

  if (step === 'activo') {
    const hechas = seriesGuardadasEjercicioActual()
    const objetivo = ejercicioActual.series_objetivo || 0
    return (
      <div className="flex flex-col min-h-[75vh]">
        <div className="flex items-center justify-between mb-2">
          <button onClick={volverASeleccionEjercicio} className="flex items-center gap-1 text-accent text-body-sm">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Ejercicios
          </button>
          <span className="text-label-md text-on-surface-variant">
            Serie {hechas + 1}{objetivo ? ` de ${objetivo}` : ''}
          </span>
        </div>

        <h1 className="font-display text-headline-md text-on-surface mb-1">{ejercicioActual.nombre}</h1>

        {/* Timer de descanso */}
        <div className="card p-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-accent">timer</span>
            <span className="font-mono text-headline-sm text-on-surface tabular-nums">{formatTimer(segundosDescanso)}</span>
          </div>
          <button
            onClick={() => setDescansando(d => !d)}
            className={`px-4 py-1.5 rounded-full text-label-md border ${descansando ? 'border-accent text-accent' : 'border-outline-variant text-on-surface-variant'}`}
          >
            {descansando ? 'Pausar' : 'Iniciar descanso'}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-around card p-6 mb-4">
          <Stepper label="Peso" value={peso} onChange={setPeso} saltos={SALTOS_PESO} unidad="kg" />
          <div className="w-px h-24 bg-outline-variant" />
          <Stepper label="Reps" value={reps} onChange={setReps} saltos={SALTOS_REPS} unidad="reps" min={0} />
        </div>

        <div className="space-y-2 mt-auto">
          {hechas > 0 && (
            <button onClick={repetirCarga} className="btn-secondary w-full py-3 text-body-md flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">repeat</span> Repetir carga
            </button>
          )}
          <button onClick={guardarSerie} className="btn-primary w-full py-4 text-body-lg flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            {objetivo && hechas + 1 >= objetivo ? 'Serie completada ✓ → Siguiente' : 'Serie completada ✓'}
          </button>
        </div>
      </div>
    )
  }

  if (step === 'resumen') {
    const vol = volumenSesion(sesionEjercicios)
    const totalSeries = sesionEjercicios.reduce((a, e) => a + e.series.length, 0)
    const duracion = ultimaSesionGuardada?.duracion_min || 0

    // Detectar PBs: peso más alto registrado hoy vs. historial previo
    const pbs = sesionEjercicios.filter(ej => {
      const previo = ultimoRegistroEjercicio(historial, ej.nombre)
      const maxHoy = Math.max(...ej.series.map(s => Number(s.peso)))
      return !previo || maxHoy > Number(previo.mejorSet.peso)
    })

    return (
      <div>
        <div className="text-center mb-6">
          <span className="material-symbols-outlined text-success text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          <h1 className="font-display text-headline-lg-mobile text-on-surface mt-2">¡Sesión completada!</h1>
          <p className="text-body-sm text-on-surface-variant">{rutina?.nombre}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="card p-3 text-center">
            <p className="font-mono text-headline-md text-accent">{formatKg(vol)}</p>
            <p className="text-label-md text-on-surface-variant mt-1">Volumen (kg)</p>
          </div>
          <div className="card p-3 text-center">
            <p className="font-mono text-headline-md text-accent">{totalSeries}</p>
            <p className="text-label-md text-on-surface-variant mt-1">Series totales</p>
          </div>
          <div className="card p-3 text-center">
            <p className="font-mono text-headline-md text-accent">{formatDuracion(duracion)}</p>
            <p className="text-label-md text-on-surface-variant mt-1">Duración</p>
          </div>
        </div>

        {pbs.length > 0 && (
          <div className="card p-4 mb-5 border-success/40">
            <p className="text-body-sm font-semibold text-success mb-1">🏆 Nuevo Personal Best</p>
            <p className="text-body-sm text-on-surface-variant">{pbs.map(p => p.nombre).join(', ')}</p>
          </div>
        )}

        <div className="space-y-2 mb-6">
          {sesionEjercicios.map((ej, i) => (
            <div key={i} className="card p-3">
              <p className="text-body-sm font-semibold text-on-surface mb-1">{ej.nombre}</p>
              <p className="text-label-md text-on-surface-variant">
                {ej.series.map(s => `${s.peso}kg×${s.reps}`).join(' · ')}
              </p>
            </div>
          ))}
        </div>

        <button onClick={() => navigate('/')} className="btn-primary w-full py-3 text-body-md">Volver al inicio</button>
      </div>
    )
  }

  return null
}
