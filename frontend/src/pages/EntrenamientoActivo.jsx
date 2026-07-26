import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import rutinasService from '../services/rutinas.service'
import sesionesService from '../services/sesiones.service'
import usuarioService from '../services/usuario.service'
import ejerciciosPersonalizadosService from '../services/ejerciciosPersonalizados.service'
import coachService from '../services/coach.service'
import { construirContextoComentarioSesion } from '../utils/contextoCoach'
import { getExerciseInfo, calentamientoSugeridoRutina } from '../data/exerciseCatalog'
import ExerciseMedia from '../components/ExerciseMedia'
import BuscadorEjercicio from '../components/BuscadorEjercicio'
import CompartirResumen from '../components/CompartirResumen'
import {
  ultimoRegistroEjercicio, prPersonalEjercicio, formatFechaRelativa, formatTimer,
  volumenSesion, formatKg, formatDuracion, volumenPorDiaSemana, analizarCoachEjercicio,
  dispararAlarmaDescanso, caloriasPorSerie, caloriasSesion, calcularRachaDetalle, topEjerciciosPorVolumen,
  notificarLogroDesbloqueado, calcularDiscos
} from '../utils/helpers'
import { logrosNuevos as calcularLogrosNuevos, NIVEL_COLOR } from '../data/achievements'
import { guardarBorrador, leerBorrador, borrarBorrador, guardarSesionPendiente } from '../utils/sesionDraft'
import { useTour } from '../context/TourContext'
import { TOURS } from '../data/tours'

const RPE_OPCIONES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// ---------- Selector de RPE (esfuerzo percibido, 1-10) ----------
// Discreto y opcional: no bloquea el flujo si el usuario no lo completa.
function SelectorRPE({ value, onChange }) {
  return (
    <div className="card p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-label-md text-on-surface-variant uppercase">RPE (esfuerzo, opcional)</p>
        {value != null && (
          <button type="button" onClick={() => onChange(null)} className="text-label-md text-on-surface-variant/70">
            Quitar
          </button>
        )}
      </div>
      <div className="flex gap-1 overflow-x-auto">
        {RPE_OPCIONES.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`shrink-0 w-8 h-8 rounded-full text-label-md flex items-center justify-center border ${
              value === n ? 'bg-accent text-on-primary border-accent' : 'border-outline-variant text-on-surface-variant'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

const SALTOS_PESO = [1.25, 2.5, 5]
const SALTOS_REPS = [1, 2, 5]
const DESCANSO_OBJETIVO_DEFAULT = 90

// ---------- Stepper de carga rápida (peso / reps) ----------
function CargaStepper({ label, value, onChange, saltos, unidad, min = 0, tourAdd, tourSubtract }) {
  const [saltoIdx, setSaltoIdx] = useState(0)
  const salto = saltos[saltoIdx]

  return (
    <div className="card p-4">
      <p className="text-label-md text-on-surface-variant uppercase text-center mb-3">{label}</p>
      <div className="flex items-center justify-between px-2">
        <button
          type="button"
          data-tour={tourSubtract}
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
          data-tour={tourAdd}
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

// ---------- Calculadora de discos ----------
// Muestra qué discos poner de cada lado de la barra para llegar al peso
// cargado en el stepper. Colapsada por defecto para no ocupar lugar cuando
// no hace falta (ejercicios con mancuernas, poleas, etc. donde no aplica).
function CalculadoraDiscos({ peso, barraKg }) {
  const [abierta, setAbierta] = useState(false)
  const { discosPorLado, sobra, soloBarra } = calcularDiscos(peso, barraKg)

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setAbierta(a => !a)}
        className="w-full p-3 flex items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 text-body-sm text-on-surface">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">calculate</span>
          Calculadora de discos
        </span>
        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
          {abierta ? 'expand_less' : 'expand_more'}
        </span>
      </button>
      {abierta && (
        <div className="px-4 pb-4">
          {soloBarra ? (
            <p className="text-body-sm text-on-surface-variant">
              Con solo la barra ({formatKg(barraKg)}kg) ya llegás o te pasás de {formatKg(peso)}kg. No hace falta agregar discos.
            </p>
          ) : discosPorLado.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">No se pudo calcular un juego de discos exacto para este peso.</p>
          ) : (
            <>
              <p className="text-label-md text-on-surface-variant uppercase mb-2">Por lado (barra {formatKg(barraKg)}kg)</p>
              <div className="flex flex-wrap gap-2">
                {discosPorLado.map(({ disco, cantidad }) => (
                  <span key={disco} className="font-mono text-body-sm text-on-surface bg-surface-container-high px-2.5 py-1 rounded-full">
                    {cantidad}×{formatKg(disco)}kg
                  </span>
                ))}
              </div>
              {sobra > 0 && (
                <p className="text-label-md text-on-surface-variant/70 mt-2">
                  Sobran {formatKg(sobra)}kg por lado que no entran justo con los discos estándar.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ---------- Calentamiento general sugerido (pantalla propia, una vez por rutina) ----------
// Reemplaza al viejo CalentamientoSugerido por ejercicio (basado en % del
// peso objetivo). Ahora es una checklist simple de 2-3 items generales
// (activación/movilidad, sin peso) que se muestra una sola vez al elegir
// la rutina, antes de la lista de ejercicios — ver step 'calentamiento-general'.
function CalentamientoGeneral({ items, onContinuar }) {
  const [hechos, setHechos] = useState(() => items.map(() => false))

  return (
    <div>
      <p className="text-body-sm text-on-surface-variant mb-4">
        Antes de arrancar, 2-3 movimientos para entrar en calor según lo que vas a trabajar hoy. No cuentan como series de trabajo.
      </p>
      <div className="space-y-2 mb-6">
        {items.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setHechos(h => h.map((v, idx) => (idx === i ? !v : v)))}
            className="w-full card p-4 flex items-start gap-3 text-left"
          >
            <span className={`material-symbols-outlined text-[22px] shrink-0 mt-0.5 ${hechos[i] ? 'text-success' : 'text-on-surface-variant/40'}`}>
              {hechos[i] ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            <div>
              <p className={`text-body-md font-semibold ${hechos[i] ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                {item.nombre}
              </p>
              <p className="text-label-md text-on-surface-variant mt-0.5">{item.descripcion}</p>
            </div>
          </button>
        ))}
      </div>
      <button data-tour="calentamiento-continuar" onClick={onContinuar} className="btn-primary w-full py-3 text-body-md">
        Continuar a ejercicios
      </button>
    </div>
  )
}

// ---------- Anillo circular de descanso ----------
function DescansoRing({ segundos, descansando, onToggle, objetivo = DESCANSO_OBJETIVO_DEFAULT, tourTarget }) {
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
      data-tour={tourTarget}
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
  const [step, setStep] = useState('select-rutina') // select-rutina | calentamiento-general | select-ejercicio | pre-serie | activo | resumen
  const [modoCarga, setModoCarga] = useState('live') // 'live' (entrenando ahora) | 'retroactivo' (cargando un entreno que ya hiciste)

  const [sesionEjercicios, setSesionEjercicios] = useState([]) // acumulado de toda la sesión
  const [peso, setPeso] = useState(20)
  const [reps, setReps] = useState(8)
  const [rpe, setRpe] = useState(null)
  const [pesoCorporalKg, setPesoCorporalKg] = useState(75)
  const [barraKg, setBarraKg] = useState(20)
  const [segundosDescanso, setSegundosDescanso] = useState(0)
  const [descansando, setDescansando] = useState(false)
  const intervalRef = useRef(null)
  const inicioSesionRef = useRef(null)
  const [guardando, setGuardando] = useState(false)
  const [ultimaSesionGuardada, setUltimaSesionGuardada] = useState(null)
  const [comentarioCoach, setComentarioCoach] = useState(null)
  const [cargandoComentarioCoach, setCargandoComentarioCoach] = useState(false)
  const [notas, setNotas] = useState('')
  const [nombreRutinaNueva, setNombreRutinaNueva] = useState('')
  const [guardandoRutina, setGuardandoRutina] = useState(false)
  const [rutinaGuardadaOk, setRutinaGuardadaOk] = useState(false)
  const [borradorPendiente, setBorradorPendiente] = useState(null) // borrador detectado al entrar, esperando "Retomar" o "Descartar"
  const [guardadaOffline, setGuardadaOffline] = useState(false) // la última sesión finalizada se guardó localmente porque falló el POST
  const [mostrandoBuscadorExtra, setMostrandoBuscadorExtra] = useState(false) // toggle "+ agregar otro ejercicio" dentro del flujo con rutina

  // Modo bloque (superserie/circuito): varios ejercicios que se alternan
  // serie por serie, sin volver a la lista ni pasar por pre-serie cada vez.
  // `bloqueActivo` = array de objetos ejercicio (de la rutina) mientras el
  // bloque está corriendo; `null` = entrenamiento normal (un ejercicio a la vez).
  const [bloqueActivo, setBloqueActivo] = useState(null)
  const [modoSeleccionBloque, setModoSeleccionBloque] = useState(false) // eligiendo miembros del próximo bloque
  const [bloqueSeleccionTemp, setBloqueSeleccionTemp] = useState([])
  const { startTour } = useTour()

  // Tours de esta pantalla: se disparan la primera vez que el usuario llega
  // a "pre-serie" (antes de la primera serie de un ejercicio) y a "activo"
  // (registrando series). Como startTour ya chequea localStorage, entrar y
  // salir de estos steps varias veces no vuelve a mostrar nada una vez visto.
  useEffect(() => {
    if (step === 'select-rutina') startTour('seleccionRutina', TOURS.seleccionRutina.steps)
    if (step === 'select-ejercicio') startTour('seleccionEjercicio', TOURS.seleccionEjercicio.steps)
    // Sin tour propio: es una pantalla intermedia y breve (una sola vez por
    // rutina), no amerita agregarla al recorrido guiado.
    if (step === 'pre-serie') startTour('preserie', TOURS.preserie.steps)
    if (step === 'activo') startTour('activo', TOURS.activo.steps)
    if (step === 'resumen') startTour('resumen', TOURS.resumen.steps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

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
        setPesoCorporalKg(Number(p?.preferencias?.pesoCorporalKg) || 75)
        setBarraKg(Number(p?.preferencias?.barraKg) || 20)
        if (rutinaId) {
          // Si viene por link directo a una rutina, eso manda: no interrumpimos
          // con la pantalla de "retomar borrador".
          const encontrada = (r || []).find(x => String(x.id) === String(rutinaId))
          if (encontrada) {
            setRutina(encontrada)
            setStep((encontrada.ejercicios || []).length > 0 ? 'calentamiento-general' : 'select-ejercicio')
          }
        } else {
          const borrador = leerBorrador()
          if (borrador?.sesionEjercicios?.length > 0) {
            setBorradorPendiente(borrador)
            setStep('retomar')
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

  // Autosave del borrador: se pisa en cada serie guardada (o cambio de notas)
  // mientras hay una sesión en curso. No se guarda en 'select-rutina' (todavía
  // no hay nada que perder) ni en 'retomar'/'resumen' (ahí ya se decidió o ya
  // terminó). Así, si se cuelga el teléfono o se pierde señal en el sótano del
  // gym, al volver a entrar aparece "Retomar sesión".
  useEffect(() => {
    if (sesionEjercicios.length === 0) return
    if (!['select-ejercicio', 'pre-serie', 'activo'].includes(step)) return
    guardarBorrador({
      rutinaId: rutina?.id ?? null,
      rutinaNombre: rutina?.nombre ?? null,
      sesionEjercicios,
      notas,
      inicioSesion: inicioSesionRef.current,
      modoCarga,
    })
  }, [sesionEjercicios, notas, step, rutina, modoCarga])

  // Notificación local de "logro importante desbloqueado" (oro/platino). Se
  // recalcula lo mismo que ya se muestra en la tarjeta de resumen
  // (calcularLogrosNuevos), pero acá vive en un efecto para poder disparar
  // el side-effect (notificación del sistema) una sola vez apenas se entra
  // a 'resumen' — no en cada render del branch condicional de abajo.
  const notificacionLogrosEnviada = useRef(false)
  useEffect(() => {
    if (step !== 'resumen' || !ultimaSesionGuardada) return
    if (notificacionLogrosEnviada.current) return
    notificacionLogrosEnviada.current = true
    const nuevos = calcularLogrosNuevos(historial, ultimaSesionGuardada)
    nuevos.filter(l => l.nivel === 'oro' || l.nivel === 'platino').forEach(notificarLogroDesbloqueado)
  }, [step, ultimaSesionGuardada, historial])

  // Comentario automático del coach IA sobre la sesión recién terminada:
  // compara cada ejercicio contra el historial inmediato (¿subiste peso?,
  // ¿estás estancado?, etc). Se pide una sola vez al llegar a "resumen" — si
  // falla (sin conexión, rate limit de Groq) simplemente no se muestra la
  // tarjeta, no bloquea el resto de la pantalla.
  const comentarioCoachPedido = useRef(false)
  useEffect(() => {
    if (step !== 'resumen' || !ultimaSesionGuardada) return
    if (comentarioCoachPedido.current) return
    comentarioCoachPedido.current = true
    setCargandoComentarioCoach(true)
    const contexto = construirContextoComentarioSesion(ultimaSesionGuardada, historial)
    coachService.comentarioSesion(contexto)
      .then(({ comentario }) => setComentarioCoach(comentario))
      .catch(() => setComentarioCoach(null))
      .finally(() => setCargandoComentarioCoach(false))
  }, [step, ultimaSesionGuardada, historial])

  const elegirRutina = (r) => {
    setRutina(r)
    setStep((r?.ejercicios || []).length > 0 ? 'calentamiento-general' : 'select-ejercicio')
  }

  // `destino` = 'pre-serie' (default, muestra gif/historial/coach antes de
  // arrancar) o 'activo' (directo a cargar la serie). Se usa 'activo' al
  // rotar entre ejercicios de un mismo bloque/superserie, para no tener que
  // salir y volver a entrar a cada uno en cada vuelta del circuito.
  const elegirEjercicio = (ej, destino = 'pre-serie') => {
    setEjercicioActual(ej)
    const yaEnSesion = sesionEjercicios.find(e => e.nombre === ej.nombre)
    const ultimaDeHoy = yaEnSesion?.series?.[yaEnSesion.series.length - 1]
    if (ultimaDeHoy) {
      // Ya cargaste series de este ejercicio hoy: seguimos desde ahí, no del historial viejo
      setPeso(ultimaDeHoy.peso)
      setReps(ultimaDeHoy.reps)
    } else {
      const previo = ultimoRegistroEjercicio(historial, ej.nombre)
      setPeso(previo?.mejorSet?.peso ?? 20)
      setReps(previo?.mejorSet?.reps ?? (ej.reps_objetivo || 8))
    }
    setRpe(null)
    setDescansando(false)
    setSegundosDescanso(0)
    setStep(destino)
  }

  const toggleSeleccionBloque = (ej) => {
    setBloqueSeleccionTemp(prev =>
      prev.some(e => e.nombre === ej.nombre)
        ? prev.filter(e => e.nombre !== ej.nombre)
        : [...prev, ej]
    )
  }

  const cancelarSeleccionBloque = () => {
    setModoSeleccionBloque(false)
    setBloqueSeleccionTemp([])
  }

  // Arranca el bloque: el primer ejercicio sí pasa por pre-serie (gif,
  // historial, coach) como cualquier ejercicio nuevo — la fricción que
  // se quería sacar es la de cada CAMBIO de ejercicio dentro del circuito,
  // no la primera entrada.
  const iniciarBloque = () => {
    if (bloqueSeleccionTemp.length < 2) return
    setBloqueActivo(bloqueSeleccionTemp)
    setModoSeleccionBloque(false)
    elegirEjercicio(bloqueSeleccionTemp[0])
    setBloqueSeleccionTemp([])
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

  // Busca el próximo ejercicio de la rutina que todavía no llegó a su
  // objetivo de series, arrancando justo después del ejercicio actual y
  // dando la vuelta completa. Devuelve null en sesión libre (sin rutina)
  // o si ya no queda ningún ejercicio pendiente.
  const siguienteEjercicioPendiente = (nombreActual) => {
    const ejerciciosRutina = rutina?.ejercicios || []
    if (ejerciciosRutina.length === 0) return null
    const idxActual = ejerciciosRutina.findIndex(e => e.nombre === nombreActual)
    const ordenados = idxActual === -1
      ? ejerciciosRutina
      : [...ejerciciosRutina.slice(idxActual + 1), ...ejerciciosRutina.slice(0, idxActual + 1)]
    return ordenados.find(ej => {
      if (ej.nombre === nombreActual) return false
      const hechos = sesionEjercicios.find(e => e.nombre === ej.nombre)?.series?.length || 0
      const objetivo = ej.series_objetivo || 3
      return hechos < objetivo
    }) || null
  }

  // Rotación dentro de un bloque/superserie: arranca justo después del
  // ejercicio actual y da la vuelta completa por bloqueActivo, devolviendo
  // el primer miembro (incluido el actual, si da la vuelta entera) que
  // todavía no llegó a su objetivo de series. null = el bloque ya completó
  // el objetivo de todos sus miembros.
  // `conteoActualizado` cubre el mismo caso que nuevoConteo en guardarSerie:
  // en el momento en que esto se llama, sesionEjercicios (closure) todavía
  // no refleja la serie recién guardada porque setState es asincrónico. Para
  // nombreActual usamos el conteo ya calculado en vez de leerlo del estado viejo.
  const siguienteMiembroBloque = (nombreActual, conteoActualizado) => {
    if (!bloqueActivo || bloqueActivo.length === 0) return null
    const idxActual = bloqueActivo.findIndex(e => e.nombre === nombreActual)
    const ordenados = idxActual === -1
      ? bloqueActivo
      : [...bloqueActivo.slice(idxActual + 1), ...bloqueActivo.slice(0, idxActual + 1)]
    return ordenados.find(ej => {
      const hechos = ej.nombre === nombreActual
        ? conteoActualizado
        : (sesionEjercicios.find(e => e.nombre === ej.nombre)?.series?.length || 0)
      const objetivo = ej.series_objetivo || 3
      return hechos < objetivo
    }) || null
  }

  // BUGFIX: antes esta función no chequeaba el objetivo de series de la rutina,
  // así que se podían guardar series infinitas ("Serie 16 de 2"). Ahora corta
  // automáticamente al llegar al objetivo. Si queda algún ejercicio pendiente
  // en la rutina, salta directo a su pre-serie (así evitamos que, al volver a
  // la lista, el usuario re-toque por error el ejercicio ya completo y siga
  // cargando series de más). Solo si no queda ninguno pendiente vuelve a la lista.
  const guardarSerie = (pesoOverride, repsOverride, rpeOverride) => {
    const pesoFinal = pesoOverride ?? peso
    const repsFinal = repsOverride ?? reps
    const rpeFinal = rpeOverride !== undefined ? rpeOverride : rpe

    // BUGFIX: el conteo de series NO se calcula más leyendo una variable
    // mutada "de reojo" dentro del callback de setSesionEjercicios (React no
    // garantiza que ese callback corra de forma síncrona antes de que sigamos
    // ejecutando el código de abajo). Ahora se calcula acá, de forma
    // determinística, a partir del estado actual (sesionEjercicios) antes de
    // disparar el setState. Esto es lo que causaba que a veces, al completar
    // la última serie, la pantalla se quedara clavada en "activo" en vez de
    // pasar automáticamente al siguiente ejercicio.
    const idxActual = sesionEjercicios.findIndex(e => e.nombre === ejercicioActual.nombre)
    const nuevoConteo = idxActual === -1 ? 1 : sesionEjercicios[idxActual].series.length + 1

    setSesionEjercicios(prev => {
      const idx = prev.findIndex(e => e.nombre === ejercicioActual.nombre)
      if (idx === -1) {
        return [...prev, { nombre: ejercicioActual.nombre, series: [{ peso: pesoFinal, reps: repsFinal, rpe: rpeFinal || null }] }]
      }
      const copia = [...prev]
      const series = [...copia[idx].series, { peso: pesoFinal, reps: repsFinal, rpe: rpeFinal || null }]
      copia[idx] = { ...copia[idx], series }
      return copia
    })

    setRpe(null)

    // BUGFIX: antes, en sesión libre (o en ejercicios agregados sobre la
    // marcha dentro de una rutina) el objetivo quedaba en `null` acá pero la
    // pantalla "activo" SÍ mostraba un objetivo de 3 (con el label "→
    // Siguiente"). Esa pantalla nunca cortaba de verdad, y como el contador
    // de "Serie X de Y" quedaba pisado en "3 de 3", el usuario no se daba
    // cuenta de que seguía sumando series 4, 5, 6... Ahora el criterio es
    // el mismo acá y en la pantalla "activo": si el ejercicio no trae
    // series_objetivo propio, el default de 3 se usa siempre (con o sin
    // rutina) y siempre corta al llegar al objetivo.
    const objetivo = ejercicioActual.series_objetivo || 3

    // Modo bloque/superserie: acá el corte NO espera a que este ejercicio
    // llegue a su objetivo — rota al siguiente miembro del bloque después
    // de CADA serie (esa es la gracia del circuito). Solo cuando ningún
    // miembro tiene series pendientes se cierra el bloque y se vuelve a la lista.
    if (bloqueActivo) {
      const siguienteDelBloque = siguienteMiembroBloque(ejercicioActual.nombre, nuevoConteo)
      if (siguienteDelBloque) {
        elegirEjercicio(siguienteDelBloque, 'activo')
      } else {
        setBloqueActivo(null)
        setDescansando(false)
        setSegundosDescanso(0)
        setStep('select-ejercicio')
      }
      return
    }

    if (objetivo && nuevoConteo >= objetivo) {
      setDescansando(false)
      setSegundosDescanso(0)
      const siguiente = siguienteEjercicioPendiente(ejercicioActual.nombre)
      if (siguiente) {
        elegirEjercicio(siguiente)
      } else {
        setStep('select-ejercicio')
      }
    } else if (modoCarga !== 'retroactivo') {
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
    guardarSerie(ultima.peso, ultima.reps, ultima.rpe ?? null)
  }

  const volverASeleccionEjercicio = () => {
    setBloqueActivo(null)
    setStep('select-ejercicio')
  }

  // El borrador guarda solo el rutinaId (no la rutina completa) porque la
  // lista de rutinas ya está cargada acá mismo al montar el componente.
  const retomarBorrador = () => {
    if (!borradorPendiente) return
    const rutinaGuardada = borradorPendiente.rutinaId
      ? rutinas.find(r => String(r.id) === String(borradorPendiente.rutinaId))
      : null
    setRutina(rutinaGuardada || null)
    setSesionEjercicios(borradorPendiente.sesionEjercicios || [])
    setNotas(borradorPendiente.notas || '')
    setModoCarga(borradorPendiente.modoCarga || 'live')
    inicioSesionRef.current = borradorPendiente.inicioSesion || Date.now()
    setBorradorPendiente(null)
    setStep(rutinaGuardada || !borradorPendiente.rutinaId ? 'select-ejercicio' : 'select-rutina')
  }

  const descartarBorrador = () => {
    borrarBorrador()
    setBorradorPendiente(null)
    setStep('select-rutina')
  }

  // Convierte lo que se hizo en una sesión libre en una rutina reutilizable:
  // series_objetivo = cuántas series se hicieron realmente de cada ejercicio,
  // reps_objetivo = las reps de la última serie (la carga "de trabajo" ya asentada).
  const guardarComoRutina = async () => {
    if (!nombreRutinaNueva.trim() || sesionEjercicios.length === 0) return
    setGuardandoRutina(true)
    try {
      const ejerciciosRutina = sesionEjercicios.map(ej => {
        const info = getExerciseInfo(ej.nombre, personalizados)
        const ultimaSerie = ej.series[ej.series.length - 1]
        return {
          nombre: ej.nombre,
          grupo: info?.grupo || 'Personalizado',
          series_objetivo: ej.series.length,
          reps_objetivo: ultimaSerie?.reps || 8,
        }
      })
      await rutinasService.create({
        nombre: nombreRutinaNueva.trim(),
        descripcion: 'Generada desde una sesión libre',
        ejercicios: ejerciciosRutina,
        activa: true,
      })
      setRutinaGuardadaOk(true)
    } catch (e) {
      console.error(e)
      alert('No se pudo guardar la rutina. Revisá la conexión con el backend.')
    } finally {
      setGuardandoRutina(false)
    }
  }

  const finalizarSesion = async () => {
    setGuardando(true)
    // BUGFIX: `payload` se declara ACÁ, antes del try, no adentro. Antes
    // estaba declarado con `const` dentro del bloque try, así que el bloque
    // catch (que lo necesita para guardarlo como pendiente cuando falla la
    // conexión) no tenía acceso a esa variable: tiraba
    // "ReferenceError: payload is not defined" apenas entraba al catch, y la
    // sesión completa se perdía en vez de quedar guardada offline.
    let payload = null
    try {
      const esRetroactivo = modoCarga === 'retroactivo'
      const duracionMin = (Date.now() - inicioSesionRef.current) / 1000 / 60
      const duracionRedondeada = Math.max(1, Math.round(duracionMin))
      payload = {
        fecha: new Date().toISOString(),
        rutina_id: rutina?.id,
        rutina_nombre: rutina?.nombre || 'Sesión libre',
        ejercicios: sesionEjercicios,
        volumen_total: volumenSesion(sesionEjercicios),
        // En modo retroactivo no pasó tiempo real entrenando, así que ni la
        // duración ni las calorías (que se calculan a partir de ella) tienen
        // sentido — se mandan null y el resumen las oculta.
        duracion_min: esRetroactivo ? null : duracionRedondeada,
        completada: true,
        notas: notas.trim() || null,
        calorias_estimadas: esRetroactivo ? null : caloriasSesion(sesionEjercicios, duracionRedondeada, pesoCorporalKg),
      }
      const creada = await sesionesService.create(payload)
      setUltimaSesionGuardada(creada || payload)
      setGuardadaOffline(false)
      borrarBorrador()
      setStep('resumen')
    } catch (e) {
      console.error(e)
      // Sin conexión (u otro error de red): no perdemos el entrenamiento.
      // Se guarda localmente como "pendiente" y el banner en App.jsx la
      // reintenta subir sola cuando vuelve la señal. El borrador NO se
      // borra todavía: recién se limpia cuando el POST realmente entra.
      if (payload) guardarSesionPendiente(payload)
      setUltimaSesionGuardada(payload)
      setGuardadaOffline(true)
      setStep('resumen')
    } finally {
      setGuardando(false)
    }
  }

  // ---------- RENDER ----------

  if (loading) {
    return <p className="text-body-sm text-on-surface-variant">Cargando...</p>
  }

  if (step === 'retomar') {
    const cantEjercicios = borradorPendiente?.sesionEjercicios?.length || 0
    const cantSeries = (borradorPendiente?.sesionEjercicios || []).reduce((a, e) => a + e.series.length, 0)
    return (
      <div>
        <div className="text-center mb-6">
          <span className="material-symbols-outlined text-accent text-[52px]">history</span>
          <h1 className="font-display text-headline-lg-mobile text-on-surface mt-2">Tenés una sesión sin terminar</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {borradorPendiente?.rutinaNombre || 'Sesión libre'} · {cantEjercicios} ejercicio{cantEjercicios > 1 ? 's' : ''} · {cantSeries} serie{cantSeries > 1 ? 's' : ''} cargada{cantSeries > 1 ? 's' : ''}
          </p>
        </div>
        <div className="space-y-2">
          <button onClick={retomarBorrador} className="btn-primary w-full py-4 text-body-lg flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20px]">play_arrow</span> Retomar sesión
          </button>
          <button onClick={descartarBorrador} className="w-full py-3 text-body-sm text-on-surface-variant">
            Descartar y empezar de nuevo
          </button>
        </div>
      </div>
    )
  }

  if (step === 'select-rutina') {
    return (
      <div>
        <h1 className="font-display text-headline-lg-mobile text-on-surface mb-1">Entrenar</h1>
        <p className="text-body-sm text-on-surface-variant mb-5">¿Cómo vas a entrenar hoy?</p>

        <button
          data-tour="select-rutina-libre"
          onClick={() => { setModoCarga('live'); setRutina(null); setStep('select-ejercicio') }}
          className="w-full card p-4 flex items-center justify-between text-left mb-3 border-accent/40 bg-accent/5"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-accent">bolt</span>
            <div>
              <p className="text-body-md font-semibold text-on-surface">Sesión libre</p>
              <p className="text-label-md text-on-surface-variant">Sin rutina armada. Vas cargando cada ejercicio a medida que te lo dan.</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-accent">chevron_right</span>
        </button>

        <button
          data-tour="select-rutina-retroactivo"
          onClick={() => { setModoCarga('retroactivo'); setRutina(null); setStep('select-ejercicio') }}
          className="w-full card p-4 flex items-center justify-between text-left mb-5 border-outline-variant"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-accent">history_edu</span>
            <div>
              <p className="text-body-md font-semibold text-on-surface">Cargar entreno que ya hice hoy</p>
              <p className="text-label-md text-on-surface-variant">Sin cronómetro ni descanso — solo para dejar registrado lo que hiciste.</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-accent">chevron_right</span>
        </button>

        <p className="text-label-md text-on-surface-variant uppercase mb-2">Con rutina cargada</p>
        {rutinas.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-body-md text-on-surface mb-1">Todavía no tenés rutinas</p>
            <button onClick={() => navigate('/rutinas')} className="btn-primary px-4 py-2 text-body-sm mt-2">Crear rutina</button>
          </div>
        ) : (
          <div data-tour="select-rutina-lista" className="space-y-2">
            {rutinas.map(r => (
              <button key={r.id} onClick={() => { setModoCarga('live'); elegirRutina(r) }} className="w-full card p-4 flex items-center justify-between text-left">
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

  if (step === 'calentamiento-general') {
    const items = calentamientoSugeridoRutina(rutina?.ejercicios || [], personalizados)
    return (
      <div>
        <button onClick={() => { setRutina(null); setStep('select-rutina') }} className="flex items-center gap-1 text-accent text-body-sm mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span> Cambiar rutina
        </button>
        <p className="text-label-md text-accent uppercase tracking-wide mb-1 flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">local_fire_department</span> Calentamiento sugerido
        </p>
        <h1 className="font-display text-headline-lg-mobile text-on-surface mb-3">{rutina?.nombre}</h1>
        <CalentamientoGeneral items={items} onContinuar={() => setStep('select-ejercicio')} />
      </div>
    )
  }

  if (step === 'select-ejercicio' && !rutina) {
    // Sesión libre: no hay lista fija de ejercicios. Se buscan en el catálogo
    // (o se cargan como texto libre si el entrenador usa un nombre que no está
    // catalogado) y se van agregando a medida que se los dan, uno por uno.
    return (
      <div>
        <button onClick={() => setStep('select-rutina')} className="flex items-center gap-1 text-accent text-body-sm mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span> Cambiar modo
        </button>
        <h1 className="font-display text-headline-lg-mobile text-on-surface mb-1">Sesión libre</h1>
        <p className="text-body-sm text-on-surface-variant mb-4">Buscá el ejercicio que te acaban de dar y registralo.</p>

        <div data-tour="select-ejercicio-buscador" className="mb-6">
          <BuscadorEjercicio personalizados={personalizados} onElegir={elegirEjercicio} />
        </div>

        {sesionEjercicios.length > 0 && (
          <>
            <p className="text-label-md text-on-surface-variant uppercase mb-2">Ya cargado en esta sesión</p>
            <div className="space-y-2 mb-6">
              {sesionEjercicios.map((ej, i) => (
                <button key={i} onClick={() => elegirEjercicio({ nombre: ej.nombre })} className="w-full card p-3 flex items-center justify-between text-left">
                  <p className="text-body-sm font-semibold text-on-surface">{ej.nombre}</p>
                  <span className="text-label-md text-accent bg-accent/15 px-2 py-1 rounded-full">
                    {ej.series.length} serie{ej.series.length > 1 ? 's' : ''} · agregar otra
                  </span>
                </button>
              ))}
            </div>

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
            <button data-tour="select-ejercicio-finalizar" onClick={finalizarSesion} disabled={guardando} className="btn-primary w-full py-3 text-body-md">
              {guardando ? 'Guardando...' : 'Finalizar sesión'}
            </button>
          </>
        )}
      </div>
    )
  }

  if (step === 'select-ejercicio') {
    const ejerciciosDisponibles = rutina?.ejercicios || []
    const nombresRutina = new Set(ejerciciosDisponibles.map(e => e.nombre))
    // Ejercicios que están en sesionEjercicios pero NO en la rutina cargada:
    // el caso real más común es mixto — vino con la rutina, pero el profe
    // agregó algo sobre la marcha. Se muestran aparte, con la misma chip UI.
    const ejerciciosAgregados = sesionEjercicios.filter(e => !nombresRutina.has(e.nombre))
    return (
      <div>
        <button onClick={() => { setBloqueActivo(null); cancelarSeleccionBloque(); setStep('select-rutina') }} className="flex items-center gap-1 text-accent text-body-sm mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span> Cambiar rutina
        </button>
        <h1 className="font-display text-headline-lg-mobile text-on-surface mb-1">{rutina?.nombre}</h1>
        <p className="text-body-sm text-on-surface-variant mb-3">
          {modoSeleccionBloque ? 'Elegí 2 o más ejercicios para alternar entre ellos.' : 'Elegí el ejercicio a registrar.'}
        </p>

        {!bloqueActivo && ejerciciosDisponibles.length >= 2 && (
          <button
            onClick={() => (modoSeleccionBloque ? cancelarSeleccionBloque() : setModoSeleccionBloque(true))}
            className={`w-full card p-3 flex items-center gap-2 text-left mb-4 ${modoSeleccionBloque ? 'border-accent/40 bg-accent/5' : 'border-dashed'}`}
          >
            <span className="material-symbols-outlined text-accent text-[20px]">
              {modoSeleccionBloque ? 'close' : 'sync_alt'}
            </span>
            <p className="text-body-sm text-on-surface">
              {modoSeleccionBloque ? 'Cancelar selección de bloque' : 'Entrenar por bloque (superserie/circuito)'}
            </p>
          </button>
        )}

        {bloqueActivo && (
          <div className="card p-3 flex items-center gap-2 mb-4 border-accent/40 bg-accent/5">
            <span className="material-symbols-outlined text-accent text-[20px]">sync_alt</span>
            <p className="text-body-sm text-on-surface">
              Bloque activo: {bloqueActivo.map(e => e.nombre).join(' → ')}
            </p>
          </div>
        )}

        {ejerciciosDisponibles.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-body-md text-on-surface mb-1">Esta rutina no tiene ejercicios</p>
            <button onClick={() => navigate('/rutinas')} className="btn-primary px-4 py-2 text-body-sm mt-2">Editar rutina</button>
          </div>
        ) : (
          <div data-tour="select-ejercicio-lista" className="space-y-2 mb-6">
            {ejerciciosDisponibles.map((ej, i) => {
              const hechos = sesionEjercicios.find(e => e.nombre === ej.nombre)?.series?.length || 0
              const objetivo = ej.series_objetivo || 0
              const completo = objetivo > 0 && hechos >= objetivo
              // Quick win: mostramos la señal del coach acá también (antes de
              // arrancar), no solo en la pantalla de pre-serie — así el
              // usuario ya sabe qué esperar antes de tocar el ejercicio.
              const coachHint = analizarCoachEjercicio(historial, ej)
              const seleccionadoEnBloque = bloqueSeleccionTemp.some(e => e.nombre === ej.nombre)
              return (
                <button
                  key={i}
                  onClick={() => (modoSeleccionBloque ? toggleSeleccionBloque(ej) : elegirEjercicio(ej))}
                  className={`w-full card p-4 flex items-center justify-between text-left ${seleccionadoEnBloque ? 'border-accent bg-accent/10' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-accent shrink-0">
                      {modoSeleccionBloque ? (seleccionadoEnBloque ? 'check_box' : 'check_box_outline_blank') : 'fitness_center'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-body-md font-semibold text-on-surface truncate">{ej.nombre}</p>
                      <p className="text-label-md text-on-surface-variant">Objetivo: {ej.series_objetivo}×{ej.reps_objetivo}</p>
                      {coachHint && (
                        <p className={`text-label-md flex items-center gap-1 mt-0.5 ${coachHint.tipo === 'listo_subir' ? 'text-success' : 'text-accent'}`}>
                          <span className="material-symbols-outlined text-[13px]">{coachHint.icono}</span>
                          {coachHint.titulo}
                        </p>
                      )}
                    </div>
                  </div>
                  {!modoSeleccionBloque && hechos > 0 && (
                    <span className={`text-label-md px-2 py-1 rounded-full shrink-0 ${completo ? 'text-success bg-success-container' : 'text-accent bg-accent/15'}`}>
                      {completo ? 'Completo ✓' : `${hechos}/${objetivo || '—'}`}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {modoSeleccionBloque && (
          <button
            onClick={iniciarBloque}
            disabled={bloqueSeleccionTemp.length < 2}
            className="btn-primary w-full py-3 text-body-md mb-6 disabled:opacity-40"
          >
            {bloqueSeleccionTemp.length < 2
              ? 'Elegí al menos 2 ejercicios'
              : `Iniciar bloque (${bloqueSeleccionTemp.length})`}
          </button>
        )}

        {ejerciciosAgregados.length > 0 && (
          <>
            <p className="text-label-md text-on-surface-variant uppercase mb-2">Agregados en esta sesión</p>
            <div className="space-y-2 mb-6">
              {ejerciciosAgregados.map((ej, i) => (
                <button key={i} onClick={() => elegirEjercicio({ nombre: ej.nombre })} className="w-full card p-3 flex items-center justify-between text-left">
                  <p className="text-body-sm font-semibold text-on-surface">{ej.nombre}</p>
                  <span className="text-label-md text-accent bg-accent/15 px-2 py-1 rounded-full">
                    {ej.series.length} serie{ej.series.length > 1 ? 's' : ''} · agregar otra
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {mostrandoBuscadorExtra ? (
          <div className="mb-6">
            <p className="text-label-md text-on-surface-variant uppercase mb-2">Buscar ejercicio para agregar</p>
            <BuscadorEjercicio
              personalizados={personalizados}
              autoFocus
              onElegir={(ej) => { setMostrandoBuscadorExtra(false); elegirEjercicio(ej) }}
            />
            <button onClick={() => setMostrandoBuscadorExtra(false)} className="w-full py-2 text-body-sm text-on-surface-variant mt-2">
              Cancelar
            </button>
          </div>
        ) : (
          <button
            data-tour="select-ejercicio-agregar"
            onClick={() => setMostrandoBuscadorExtra(true)}
            className="w-full card p-4 flex items-center gap-3 text-left border-dashed mb-6"
          >
            <span className="material-symbols-outlined text-accent">add_circle</span>
            <p className="text-body-md text-on-surface">+ Agregar otro ejercicio</p>
          </button>
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
            <button data-tour="select-ejercicio-finalizar" onClick={finalizarSesion} disabled={guardando} className="btn-primary w-full py-3 text-body-md">
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

        {(info?.equipo || info?.musculo) && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {info.equipo && (
              <span className="text-label-md text-on-surface-variant bg-surface-container-high px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">fitness_center</span> {info.equipo}
              </span>
            )}
            {info.musculo && (
              <span className="text-label-md text-on-surface-variant bg-surface-container-high px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">target</span> {info.musculo}
              </span>
            )}
          </div>
        )}

        {/* Fotos reales del ejercicio (free-exercise-db) con fallback a ícono */}
        <ExerciseMedia exerciseInfo={info} />

        {info?.descripcion && (
          <p className="text-body-sm text-on-surface-variant mb-4">{info.descripcion}</p>
        )}

        <div data-tour="preserie-historial" className="grid grid-cols-2 gap-3 mb-4">
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

        <button data-tour="preserie-comenzar" onClick={iniciarSerie} className="btn-primary w-full py-4 text-body-lg flex items-center justify-center gap-2">
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
            Serie {hechas + 1}{objetivo ? ` de ${objetivo}` : ''}
          </span>
        </div>

        {bloqueActivo && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {bloqueActivo.map(ej => {
              const hechosEj = sesionEjercicios.find(e => e.nombre === ej.nombre)?.series?.length || 0
              const objetivoEj = ej.series_objetivo || 3
              const esActual = ej.nombre === ejercicioActual.nombre
              const completoEj = hechosEj >= objetivoEj
              return (
                <span
                  key={ej.nombre}
                  className={`text-label-md px-2 py-1 rounded-full flex items-center gap-1 ${
                    esActual ? 'bg-accent text-on-primary' : completoEj ? 'text-success bg-success-container' : 'text-on-surface-variant bg-surface-container-high'
                  }`}
                >
                  {completoEj && <span className="material-symbols-outlined text-[12px]">check</span>}
                  {ej.nombre}
                </span>
              )
            })}
          </div>
        )}

        <h1 className="font-display text-headline-md text-on-surface">{ejercicioActual.nombre}</h1>

        {previo && (
          <div className="card p-3 flex items-center justify-between">
            <p className="text-body-sm text-on-surface-variant">
              <span className="text-on-surface-variant/70">Historial anterior · </span>
              Mejor serie: {previo.mejorSet.peso}kg × {previo.mejorSet.reps} ✓
            </p>
            {hechas > 0 && (
              <button data-tour="activo-repetir" onClick={repetirCarga} className="text-label-md text-accent flex items-center gap-1 shrink-0 ml-2">
                <span className="material-symbols-outlined text-[16px]">repeat</span> Repetir
              </button>
            )}
          </div>
        )}

        <CargaStepper
          label="Carga (kg)"
          value={peso}
          onChange={setPeso}
          saltos={SALTOS_PESO}
          unidad="kg"
          tourAdd="activo-stepper-sumar"
          tourSubtract="activo-stepper-restar"
        />
        <CargaStepper label="Repeticiones" value={reps} onChange={setReps} saltos={SALTOS_REPS} unidad="reps" min={0} />

        <CalculadoraDiscos peso={peso} barraKg={barraKg} />

        {modoCarga !== 'retroactivo' && (
          <>
            <SelectorRPE value={rpe} onChange={setRpe} />

            <div className="card py-6">
              <DescansoRing
                segundos={segundosDescanso}
                descansando={descansando}
                onToggle={() => setDescansando(d => !d)}
                objetivo={descansoObjetivo}
                tourTarget="activo-descanso"
              />
            </div>

            <p className="text-label-md text-on-surface-variant/70 text-center -mt-2">
              ~{Math.round(caloriasPorSerie(rpe, pesoCorporalKg))} kcal estimadas esta serie
            </p>
          </>
        )}

        {pr && (
          <p className="text-body-sm text-center text-on-surface-variant">
            {faltaParaPR > 0
              ? `Estás a ${formatKg(faltaParaPR)} kg de tu récord personal (${formatKg(pr.peso)} kg)`
              : '🔥 ¡Estás igualando o superando tu récord personal!'}
          </p>
        )}

        <div className="space-y-2">
          <button data-tour="activo-guardar" onClick={() => guardarSerie()} className="btn-primary w-full py-4 text-body-lg flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            {bloqueActivo
              ? 'Serie completada ✓ → Sigue el bloque'
              : (objetivo && hechas + 1 >= objetivo ? 'Serie completada ✓ → Siguiente' : 'Serie completada ✓')}
          </button>
        </div>
      </div>
    )
  }

  if (step === 'resumen') {
    const vol = volumenSesion(sesionEjercicios)
    const totalSeries = sesionEjercicios.reduce((a, e) => a + e.series.length, 0)

    // Detectar PBs: peso más alto registrado hoy vs. el verdadero récord
    // histórico (prPersonalEjercicio, todas las sesiones). Antes comparaba
    // contra ultimoRegistroEjercicio (solo la sesión anterior), así que
    // avisaba "nuevo récord" con solo superar la última sesión, aunque
    // siguiera por debajo del máximo histórico real.
    const pbs = sesionEjercicios.filter(ej => {
      const pr = prPersonalEjercicio(historial, ej.nombre)
      const maxHoy = Math.max(...ej.series.map(s => Number(s.peso)))
      return !pr || maxHoy > Number(pr.peso)
    })

    const semana = volumenPorDiaSemana(historial, ultimaSesionGuardada)
    const maxSemana = Math.max(1, ...semana.map(d => d.volumen))
    const { racha: rachaActual } = calcularRachaDetalle([...historial, ultimaSesionGuardada].filter(Boolean))
    // Sesión cargada en modo retroactivo: no hay duración real, así que no
    // tiene sentido ni mostrar ni recalcular calorías a partir de ella.
    const esRetroactiva = ultimaSesionGuardada?.duracion_min == null
    const calorias = esRetroactiva ? null : (ultimaSesionGuardada?.calorias_estimadas ?? caloriasSesion(sesionEjercicios, ultimaSesionGuardada?.duracion_min || 0, pesoCorporalKg))
    const topEjercicios = topEjerciciosPorVolumen(sesionEjercicios, 3)
    const logrosDeEstaSesion = calcularLogrosNuevos(historial, ultimaSesionGuardada)

    return (
      <div>
        <div className="text-center mb-6">
          <span className="material-symbols-outlined text-success text-[52px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <h1 className="font-display text-headline-lg-mobile text-on-surface mt-2">¡Sesión completada!</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {pbs.length > 0 ? 'Superaste tus límites hoy. ¡A seguir así!' : `${rutina?.nombre || 'Sesión libre'} · buen trabajo`}
          </p>
        </div>

        {guardadaOffline && (
          <div className="card p-3 mb-5 border-accent/30 bg-accent/5 flex items-center gap-2">
            <span className="material-symbols-outlined text-accent text-[20px]">cloud_off</span>
            <p className="text-body-sm text-on-surface-variant">
              Se guardó en tu teléfono porque no había conexión. Se va a subir sola en cuanto vuelva la señal — no hace falta que hagas nada.
            </p>
          </div>
        )}

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

        {(cargandoComentarioCoach || comentarioCoach) && (
          <div className="card p-4 mb-5 border-accent/30 bg-accent/5">
            <p className="text-body-sm font-semibold text-accent mb-1.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">sports</span>
              Coach Chiche
            </p>
            {cargandoComentarioCoach ? (
              <p className="text-body-sm text-on-surface-variant">Analizando tu sesión...</p>
            ) : (
              <p className="text-body-sm text-on-surface whitespace-pre-wrap">{comentarioCoach}</p>
            )}
          </div>
        )}

        <div data-tour="resumen-stats" className="grid grid-cols-2 gap-3 mb-5">
          <div className="card p-4 text-center">
            <p className="font-mono text-headline-md text-accent">{formatKg(vol)} kg</p>
            <p className="text-label-md text-on-surface-variant mt-1 uppercase">Volumen total</p>
          </div>
          <div className="card p-4 text-center">
            <p className="font-mono text-headline-md text-accent">{totalSeries}</p>
            <p className="text-label-md text-on-surface-variant mt-1 uppercase">Series totales</p>
          </div>
        </div>

        {esRetroactiva ? (
          <p className="text-label-md text-on-surface-variant text-center mb-6">
            Cargado como entreno ya hecho
          </p>
        ) : (
          <p className="text-label-md text-on-surface-variant text-center mb-6">
            Duración de la sesión: {formatDuracion(ultimaSesionGuardada?.duracion_min || 0)}
            {' · '}~{calorias} kcal estimadas
          </p>
        )}

        {logrosDeEstaSesion.length > 0 && (
          <div className="card p-4 mb-5 border-[#E3B341]/40" style={{ background: 'rgba(227, 179, 65, 0.08)' }}>
            <p className="text-body-sm font-semibold mb-3 flex items-center gap-1.5" style={{ color: '#E3B341' }}>
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
              {logrosDeEstaSesion.length > 1 ? 'Nuevos logros desbloqueados' : 'Nuevo logro desbloqueado'}
            </p>
            <div className="flex flex-wrap gap-2">
              {logrosDeEstaSesion.map(l => (
                <div key={l.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-high">
                  <span className="material-symbols-outlined text-[18px]" style={{ color: NIVEL_COLOR[l.nivel] }}>{l.icono}</span>
                  <span className="text-body-sm text-on-surface">{l.titulo}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div data-tour="resumen-compartir" className="mb-6">
          <CompartirResumen
            rutinaNombre={rutina?.nombre || 'Sesión libre'}
            fecha={new Date(ultimaSesionGuardada?.fecha || Date.now())}
            volumenTotal={vol}
            totalSeries={totalSeries}
            duracionMin={ultimaSesionGuardada?.duracion_min || 0}
            prs={pbs.map(p => p.nombre)}
            semana={semana}
            calorias={calorias}
            racha={rachaActual}
            topEjercicios={topEjercicios}
            logrosNuevos={logrosDeEstaSesion}
          />
        </div>

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

        {!rutina && sesionEjercicios.length > 0 && (
          <div className="card p-4 mb-6">
            {rutinaGuardadaOk ? (
              <p className="text-body-sm text-success flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Rutina "{nombreRutinaNueva.trim()}" guardada. Ya la vas a ver en Rutinas.
              </p>
            ) : (
              <>
                <p className="text-body-sm font-semibold text-on-surface mb-1">¿Guardar estos ejercicios como rutina?</p>
                <p className="text-label-md text-on-surface-variant mb-3">Opcional. La próxima vez que te den los mismos ejercicios, la vas a tener ya armada.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input-field flex-1"
                    placeholder="Nombre de la rutina"
                    value={nombreRutinaNueva}
                    onChange={(e) => setNombreRutinaNueva(e.target.value)}
                  />
                  <button
                    onClick={guardarComoRutina}
                    disabled={guardandoRutina || !nombreRutinaNueva.trim()}
                    className="btn-primary px-4 py-2 text-body-sm shrink-0 disabled:opacity-50"
                  >
                    {guardandoRutina ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <button
          data-tour="resumen-volver"
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
