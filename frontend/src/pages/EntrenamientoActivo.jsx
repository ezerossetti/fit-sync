import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import rutinasService from '../services/rutinas.service'
import sesionesService from '../services/sesiones.service'
import usuarioService from '../services/usuario.service'
import ejerciciosPersonalizadosService from '../services/ejerciciosPersonalizados.service'
import { getExerciseInfo } from '../data/exerciseCatalog'
import ExerciseMedia from '../components/ExerciseMedia'
import {
  ultimoRegistroEjercicio, prPersonalEjercicio, formatFechaRelativa, formatTimer,
  volumenSesion, formatKg, formatDuracion, volumenPorDiaSemana, analizarCoachEjercicio,
  dispararAlarmaDescanso
} from '../utils/helpers'

const SALTOS_PESO = [1.25, 2.5, 5]
const SALTOS_REPS = [1, 2, 5]
const DESCANSO_OBJETIVO_DEFAULT = 90

// ---------- Stepper de carga rápida (peso / reps) ----------
function CargaStepper({ label, value, onChange, saltos, unidad, min = 0 }) {
  const [saltoIdx, setSaltoIdx] = useState(0)
  const salto = saltos[saltoIdx]

  return (
    <div className="card p-4">
      <p className="text-label-md text-on-surface-variant uppercase text-center mb-3">{label}</p>
      <div className="flex items-center justify-between px-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, +(value - salto).toFixed(2)))}
          className="plate-btn w-14 h-14 shrink-0"
          aria-label={`Restar ${salto}${unidad}`}
        >
          <span className="material-symbols-outlined text-[26px]">remove</span>
        </button>
        <div className="text-center px-2">
          <span className="font-mono text-headline-lg text-on-surface tabular-nums">{value}</span>
          <p className="text-label-md text-on-surface-variant">{unidad}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(+(value + salto).toFixed(2))}
          className="plate-btn w-14 h-14 shrink-0 bg-primary-container border-accent/30"
          aria-label={`Sumar ${salto}${unidad}`}
        >
          <span className="material-symbols-outlined text-[26px] text-accent">add</span>
        </button>
      </div>
      <div className="flex justify-center gap-2 mt-3">
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

// ---------- Anillo circular de descanso ----------
function DescansoRing({ segundos, descansando, onToggle, objetivo = DESCANSO_OBJETIVO_DEFAULT }) {
  const restante = Math.max(0, objetivo - segundos)
  const progreso = objetivo > 0 ? Math.min(1, segundos / objetivo) : 1
  const size = 128
  const stroke = 8
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = c * (1 - progreso)

  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative flex items-center justify-center mx-auto"
      style={{ width: size, height: size }}
      aria-label={descansando ? 'Pausar descanso' : 'Iniciar descanso'}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#22242A" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={restante === 0 ? '#1D9E75' : '#29B0E8'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dash}
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-headline-md text-on-surface tabular-nums">{formatTimer(restante)}</span>
        <span className="text-label-md text-on-surface-variant mt-0.5 flex items-center gap-1">
          {descansando ? 'DESCANSO' : 'TOCÁ PARA DESCANSAR'}
          {descansando && <span className="material-symbols-outlined text-[12px]" title="Te avisamos con vibración y sonido">notifications_active</span>}
        </span>
      </div>
    </button>
  )
}

export default function EntrenamientoActivo() {
  const { rutinaId } = useParams()
  const navigate = useNavigate()

  const [rutinas, setRutinas] = useState([])
  const [historial, setHistorial] = useState([])
  const [personalizados, setPersonalizados] = useState([])
  const [descansoObjetivo, setDescansoObjetivo] = useState(DESCANSO_OBJETIVO_DEFAULT)
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
  const [notas, setNotas] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const [r, s, p, ep] = await Promise.all([
          rutinasService.getAll(),
          sesionesService.getAll(),
          usuarioService.getMe().catch(() => null),
          ejerciciosPersonalizadosService.getAll().catch(() => []),
        ])
        setRutinas(r || [])
        setHistorial(s || [])
        setPersonalizados(ep || [])
        setDescansoObjetivo(p?.preferencias?.descansoDefault ?? DESCANSO_OBJETIVO_DEFAULT)
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
      intervalRef.current = setInterval(() => {
        setSegundosDescanso(s => {
          const nuevo = s + 1
          // Alarma de fin de descanso: se dispara UNA sola vez, justo cuando
          // el contador cruza el objetivo (vibración + beep), sin necesidad
          // de estar mirando la pantalla para darse cuenta.
          if (nuevo >= descansoObjetivo && s < descansoObjetivo) {
            dispararAlarmaDescanso()
          }
          return nuevo
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [descansando, descansoObjetivo])

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

  // BUGFIX: antes esta función no chequeaba el objetivo de series de la rutina,
  // así que se podían guardar series infinitas ("Serie 16 de 2"). Ahora corta
  // automáticamente al llegar al objetivo y vuelve a la lista de ejercicios.
  const guardarSerie = (pesoOverride, repsOverride) => {
    const pesoFinal = pesoOverride ?? peso
    const repsFinal = repsOverride ?? reps
    let nuevoConteo = 0

    setSesionEjercicios(prev => {
      const idx = prev.findIndex(e => e.nombre === ejercicioActual.nombre)
      if (idx === -1) {
        nuevoConteo = 1
        return [...prev, { nombre: ejercicioActual.nombre, series: [{ peso: pesoFinal, reps: repsFinal }] }]
      }
      const copia = [...prev]
      const series = [...copia[idx].series, { peso: pesoFinal, reps: repsFinal }]
      nuevoConteo = series.length
      copia[idx] = { ...copia[idx], series }
      return copia
    })

    const objetivo = ejercicioActual.series_objetivo || 3
    if (nuevoConteo >= objetivo) {
      setDescansando(false)
      setSegundosDescanso(0)
      setStep('select-ejercicio')
    } else {
      setDescansando(true)
      setSegundosDescanso(0)
    }
  }

  // BUGFIX: antes llamaba a guardarSerie() justo después de setPeso/setReps,
  // pero como los setState son asincrónicos, guardaba los valores VIEJOS del
  // estado en vez de los de la última serie. Ahora se pasan explícitamente.
  const repetirCarga = () => {
    const ex = sesionEjercicios.find(e => e.nombre === ejercicioActual.nombre)
    const ultima = ex?.series?.[ex.series.length - 1]
    if (!ultima) return
    setPeso(ultima.peso)
    setReps(ultima.reps)
    guardarSerie(ultima.peso, ultima.reps)
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
        notas: notas.trim() || null,
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
            <p className="text-body-md text-on-surface mb-1">Todavía no tenés rutinas</p>
            <button onClick={() => navigate('/rutinas')} className="btn-primary px-4 py-2 text-body-sm mt-2">Crear rutina</button>
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
              const objetivo = ej.series_objetivo || 0
              const completo = objetivo > 0 && hechos >= objetivo
              return (
                <button key={i} onClick={() => elegirEjercicio(ej)} className="w-full card p-4 flex items-center justify-between text-left">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-accent">fitness_center</span>
                    <div>
                      <p className="text-body-md font-semibold text-on-surface">{ej.nombre}</p>
                      <p className="text-label-md text-on-surface-variant">Objetivo: {ej.series_objetivo}×{ej.reps_objetivo}</p>
                    </div>
                  </div>
                  {hechos > 0 && (
                    <span className={`text-label-md px-2 py-1 rounded-full ${completo ? 'text-success bg-success-container' : 'text-accent bg-accent/15'}`}>
                      {completo ? 'Completo ✓' : `${hechos}/${objetivo || '—'}`}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {sesionEjercicios.length > 0 && (
          <>
            <div className="mb-3">
              <label className="text-label-md text-on-surface-variant uppercase">Notas de la sesión (opcional)</label>
              <textarea
                className="input-field mt-1"
                rows={2}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej: buena energía hoy, probé agarre más ancho en press..."
              />
            </div>
            <button onClick={finalizarSesion} disabled={guardando} className="btn-primary w-full py-3 text-body-md">
              {guardando ? 'Guardando...' : 'Finalizar sesión'}
            </button>
          </>
        )}
      </div>
    )
  }

  if (step === 'pre-serie') {
    const previo = ultimoRegistroEjercicio(historial, ejercicioActual.nombre)
    const pr = prPersonalEjercicio(historial, ejercicioActual.nombre)
    const info = getExerciseInfo(ejercicioActual.nombre, personalizados)
    const coach = analizarCoachEjercicio(historial, ejercicioActual)

    return (
      <div>
        <button onClick={volverASeleccionEjercicio} className="flex items-center gap-1 text-accent text-body-sm mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span> Elegir otro ejercicio
        </button>

        <p className="text-label-md text-accent uppercase tracking-wide mb-1">Pre-serie</p>
        <h1 className="font-display text-headline-lg-mobile text-on-surface mb-1">{ejercicioActual.nombre}</h1>
        <p className="text-body-sm text-on-surface-variant mb-4">{info?.grupo || 'Ejercicio personalizado'}</p>

        {/* Fotos reales del ejercicio (free-exercise-db) con fallback a ícono */}
        <ExerciseMedia exerciseInfo={info} />

        {info?.descripcion && (
          <p className="text-body-sm text-on-surface-variant mb-4">{info.descripcion}</p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="card p-3 text-center">
            <p className="text-label-md text-on-surface-variant uppercase mb-1">PR Personal</p>
            <p className="font-mono text-headline-sm text-accent">{pr ? `${formatKg(pr.peso)} kg` : '—'}</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-label-md text-on-surface-variant uppercase mb-1">Últ. sesión</p>
            <p className="font-mono text-headline-sm text-accent">{previo ? `${formatKg(previo.mejorSet.peso)} kg` : '—'}</p>
          </div>
        </div>

        {previo && (
          <p className="text-body-sm text-on-surface-variant mb-4 -mt-2">
            {previo.mejorSet.peso} kg × {previo.mejorSet.reps} reps · {formatFechaRelativa(previo.fecha)}
          </p>
        )}

        {coach && (
          <div className={`card p-4 mb-4 flex gap-3 ${coach.tipo === 'listo_subir' ? 'border-success/40 bg-success-container/10' : 'border-accent/30 bg-accent/5'}`}>
            <span className={`material-symbols-outlined text-[22px] shrink-0 ${coach.tipo === 'listo_subir' ? 'text-success' : 'text-accent'}`}>{coach.icono}</span>
            <div>
              <p className="text-body-sm font-semibold text-on-surface mb-0.5 flex items-center gap-1.5">
                <span className="text-label-md text-accent uppercase tracking-wide">Coach</span> · {coach.titulo}
              </p>
              <p className="text-body-sm text-on-surface-variant">{coach.mensaje}</p>
            </div>
          </div>
        )}

        {info?.puntosClave?.length > 0 && (
          <div className="card p-4 mb-6">
            <p className="text-label-md text-accent uppercase mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">info</span> Puntos clave
            </p>
            <ul className="space-y-1.5">
              {info.puntosClave.map((punto, i) => (
                <li key={i} className="text-body-sm text-on-surface-variant flex gap-2">
                  <span className="text-accent">•</span> {punto}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button onClick={iniciarSerie} className="btn-primary w-full py-4 text-body-lg flex items-center justify-center gap-2">
          Comenzar serie <span className="material-symbols-outlined">bolt</span>
        </button>
      </div>
    )
  }

  if (step === 'activo') {
    const hechas = seriesGuardadasEjercicioActual()
    // BUGFIX real: si la rutina se guardó sin `series_objetivo` (rutinas viejas,
    // o ejercicios cargados a mano sin ese campo), esto daba 0 y el chequeo de
    // arriba (`if (objetivo && nuevoConteo >= objetivo)`) nunca cortaba porque
    // 0 es falsy. Como resultado, "Siguiente" quedaba habilitado para siempre.
    // Default sensato: 3 series (el mismo que usa el ExerciseBuilder al crear).
    const objetivo = ejercicioActual.series_objetivo || 3
    const pr = prPersonalEjercicio(historial, ejercicioActual.nombre)
    const previo = ultimoRegistroEjercicio(historial, ejercicioActual.nombre)
    const faltaParaPR = pr ? +(pr.peso - peso).toFixed(2) : null

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={volverASeleccionEjercicio} className="flex items-center gap-1 text-accent text-body-sm">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Ejercicios
          </button>
          <span className="text-label-md text-on-surface-variant bg-surface-container-high px-2.5 py-1 rounded-full">
            Serie {Math.min(hechas + 1, objetivo || hechas + 1)}{objetivo ? ` de ${objetivo}` : ''}
          </span>
        </div>

        <h1 className="font-display text-headline-md text-on-surface">{ejercicioActual.nombre}</h1>

        {previo && (
          <div className="card p-3 flex items-center justify-between">
            <p className="text-body-sm text-on-surface-variant">
              <span className="text-on-surface-variant/70">Historial anterior · </span>
              Serie 1: {previo.mejorSet.peso}kg × {previo.mejorSet.reps} ✓
            </p>
            {hechas > 0 && (
              <button onClick={repetirCarga} className="text-label-md text-accent flex items-center gap-1 shrink-0 ml-2">
                <span className="material-symbols-outlined text-[16px]">repeat</span> Repetir
              </button>
            )}
          </div>
        )}

        <CargaStepper label="Carga (kg)" value={peso} onChange={setPeso} saltos={SALTOS_PESO} unidad="kg" />
        <CargaStepper label="Repeticiones" value={reps} onChange={setReps} saltos={SALTOS_REPS} unidad="reps" min={0} />

        <div className="card py-6">
          <DescansoRing segundos={segundosDescanso} descansando={descansando} onToggle={() => setDescansando(d => !d)} objetivo={descansoObjetivo} />
        </div>

        {pr && (
          <p className="text-body-sm text-center text-on-surface-variant">
            {faltaParaPR > 0
              ? `Estás a ${formatKg(faltaParaPR)} kg de tu récord personal (${formatKg(pr.peso)} kg)`
              : '🔥 ¡Estás igualando o superando tu récord personal!'}
          </p>
        )}

        <div className="space-y-2">
          <button onClick={() => guardarSerie()} className="btn-primary w-full py-4 text-body-lg flex items-center justify-center gap-2">
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

    // Detectar PBs: peso más alto registrado hoy vs. historial previo
    const pbs = sesionEjercicios.filter(ej => {
      const previo = ultimoRegistroEjercicio(historial, ej.nombre)
      const maxHoy = Math.max(...ej.series.map(s => Number(s.peso)))
      return !previo || maxHoy > Number(previo.mejorSet.peso)
    })

    const semana = volumenPorDiaSemana(historial, ultimaSesionGuardada)
    const maxSemana = Math.max(1, ...semana.map(d => d.volumen))

    return (
      <div>
        <div className="text-center mb-6">
          <span className="material-symbols-outlined text-success text-[52px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <h1 className="font-display text-headline-lg-mobile text-on-surface mt-2">¡Sesión completada!</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {pbs.length > 0 ? 'Superaste tus límites hoy. ¡A seguir así!' : `${rutina?.nombre || 'Sesión libre'} · buen trabajo`}
          </p>
        </div>

        {pbs.length > 0 && (
          <div className="card p-4 mb-5 border-success/40 bg-success-container/20">
            <p className="text-body-sm font-semibold text-on-success-container mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
              ¡Nuevo récord personal en {pbs[0].nombre}!
            </p>
            {pbs.length > 1 && (
              <p className="text-body-sm text-on-surface-variant">También en: {pbs.slice(1).map(p => p.nombre).join(', ')}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="card p-4 text-center">
            <p className="font-mono text-headline-md text-accent">{formatKg(vol)} kg</p>
            <p className="text-label-md text-on-surface-variant mt-1 uppercase">Volumen total</p>
          </div>
          <div className="card p-4 text-center">
            <p className="font-mono text-headline-md text-accent">{totalSeries}</p>
            <p className="text-label-md text-on-surface-variant mt-1 uppercase">Series totales</p>
          </div>
        </div>

        <p className="text-label-md text-on-surface-variant text-center mb-6">
          Duración de la sesión: {formatDuracion(ultimaSesionGuardada?.duracion_min || 0)}
        </p>

        {ultimaSesionGuardada?.notas && (
          <div className="card p-4 mb-5">
            <p className="text-label-md text-accent uppercase mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">sticky_note_2</span> Notas
            </p>
            <p className="text-body-sm text-on-surface-variant">{ultimaSesionGuardada.notas}</p>
          </div>
        )}

        <div className="card p-4 mb-5">
          <p className="text-body-sm font-semibold text-on-surface mb-3">Volumen semanal</p>
          <div className="flex items-end justify-between gap-2 h-24">
            {semana.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className={`w-full rounded-t-md ${d.esHoy ? 'bg-accent' : 'bg-primary-container'}`}
                  style={{ height: `${Math.max(4, (d.volumen / maxSemana) * 100)}%` }}
                  title={`${formatKg(d.volumen)} kg`}
                />
                <span className={`text-label-md mt-1 ${d.esHoy ? 'text-accent' : 'text-on-surface-variant'}`}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-body-sm font-semibold text-on-surface mb-2">Desglose de ejercicios</p>
          <div className="space-y-2">
            {sesionEjercicios.map((ej, i) => (
              <div key={i} className="card p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent text-[18px]">fitness_center</span>
                  <p className="text-body-sm font-semibold text-on-surface">{ej.nombre}</p>
                </div>
                <p className="text-label-md text-on-surface-variant text-right">
                  {ej.series.length} serie{ej.series.length > 1 ? 's' : ''} · {formatKg(volumenSesion([ej]))} kg total
                </p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full py-3 text-body-md rounded font-semibold bg-success text-on-primary flex items-center justify-center gap-2 active:opacity-80 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">home</span> Volver al inicio
        </button>
      </div>
    )
  }

  return null
}
