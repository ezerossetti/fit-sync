import { useEffect, useRef, useState } from 'react'
import coachService from '../services/coach.service'
import sesionesService from '../services/sesiones.service'
import rutinasService from '../services/rutinas.service'
import ejerciciosPersonalizadosService from '../services/ejerciciosPersonalizados.service'
import usuarioService from '../services/usuario.service'
import { getExerciseInfo } from '../data/exerciseCatalog'
import {
  construirContextoChat,
  construirContextoResumen,
  construirContextoSugerirEjercicios,
  construirContextoTecnica,
  construirContextoGenerarRutina,
} from '../utils/contextoCoach'

const OBJETIVOS_RUTINA = ['Hipertrofia', 'Fuerza', 'Resistencia', 'General']

// El backend marca rateLimited: true cuando Groq corta por límite de la IA
// gratuita (429). En ese caso mostramos un mensaje específico en vez del
// genérico "no se pudo conectar" — no es una falla, es que se está usando
// mucho el coach en este momento.
const mensajeError = (err, fallback) => {
  if (err?.response?.status === 429 || err?.response?.data?.rateLimited) {
    return 'El coach está muy pedido ahora mismo (se usó mucho hoy). Probá de nuevo en unos minutos.'
  }
  return fallback
}

// Widget flotante: un botón (FAB) que abre un panel de chat con el coach IA.
// Se monta una sola vez en App.jsx, así queda disponible en toda la app.
export default function CoachChat() {
  const [abierto, setAbierto] = useState(false)
  // mensajes: { rol: 'user' | 'model', contenido }  o, para una rutina generada:
  // { rol: 'model', tipo: 'rutina', rutina: { nombre, descripcion, ejercicios }, guardando, guardado }
  const [mensajes, setMensajes] = useState([])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [nombreUsuario, setNombreUsuario] = useState(null)
  const scrollRef = useRef(null)

  // Panel inline activo sobre el input: null | 'tecnica' | 'rutina'
  const [panelActivo, setPanelActivo] = useState(null)
  const [ejerciciosDisponibles, setEjerciciosDisponibles] = useState([])
  const [tecnicaEjercicio, setTecnicaEjercicio] = useState('')
  const [tecnicaDescripcion, setTecnicaDescripcion] = useState('')
  const [rutinaObjetivo, setRutinaObjetivo] = useState('Hipertrofia')
  const [rutinaDias, setRutinaDias] = useState(4)

  useEffect(() => {
    if (abierto && mensajes.length === 0) {
      cargarHistorial()
    }
    if (abierto && nombreUsuario === null) {
      usuarioService.getMe().then((u) => setNombreUsuario(u?.nombre || '')).catch(() => setNombreUsuario(''))
    }
  }, [abierto])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [mensajes, cargando, panelActivo])

  const cargarHistorial = async () => {
    try {
      const historial = await coachService.getHistorial()
      setMensajes(historial.map((h) => ({ rol: h.rol, contenido: h.contenido })))
    } catch {
      // Si falla, arrancamos con chat vacío sin romper la UI
    }
  }

  // Trae rutinas/sesiones/personalizados frescos para armar el contexto del pedido
  const cargarDatosBase = async () => {
    const [sesiones, rutinas, personalizados] = await Promise.all([
      sesionesService.getAll(),
      rutinasService.getAll(),
      ejerciciosPersonalizadosService.getAll(),
    ])
    return { sesiones, rutinas, personalizados }
  }

  const enviarMensaje = async (textoForzado) => {
    const texto = (textoForzado ?? input).trim()
    if (!texto || cargando) return

    setError(null)
    setInput('')
    setMensajes((prev) => [...prev, { rol: 'user', contenido: texto }])
    setCargando(true)

    try {
      const { sesiones, rutinas, personalizados } = await cargarDatosBase()
      const contexto = construirContextoChat(sesiones, rutinas, personalizados, nombreUsuario)
      const { respuesta } = await coachService.chat(texto, contexto)
      setMensajes((prev) => [...prev, { rol: 'model', contenido: respuesta }])
    } catch (err) {
      setError(mensajeError(err, 'No se pudo conectar con el coach. Probá de nuevo en un momento.'))
    } finally {
      setCargando(false)
    }
  }

  // Acciones rápidas: resumen semanal, mensual y sugerencia de ejercicios,
  // sin que el usuario tenga que escribir el pedido a mano.
  const accionRapida = async (tipo) => {
    if (cargando) return
    setError(null)
    setPanelActivo(null)
    setCargando(true)

    const hoy = new Date()
    const inicio = new Date(hoy)
    inicio.setDate(inicio.getDate() - (tipo === 'mensual' ? 30 : 7))
    const periodoInicio = inicio.toISOString().slice(0, 10)
    const periodoFin = hoy.toISOString().slice(0, 10)

    const etiqueta = tipo === 'sugerencias' ? 'Sugerime ejercicios nuevos' : `Resumen ${tipo}`
    setMensajes((prev) => [...prev, { rol: 'user', contenido: etiqueta }])

    try {
      const { sesiones, rutinas, personalizados } = await cargarDatosBase()

      if (tipo === 'sugerencias') {
        const contexto = construirContextoSugerirEjercicios(rutinas, sesiones, personalizados)
        const { sugerencia } = await coachService.sugerirEjercicios(contexto)
        setMensajes((prev) => [...prev, { rol: 'model', contenido: sugerencia }])
      } else {
        const contexto = construirContextoResumen(sesiones, personalizados, tipo)
        const { resumen } = await coachService.resumen({ tipo, periodoInicio, periodoFin, contexto })
        setMensajes((prev) => [...prev, { rol: 'model', contenido: resumen }])
      }
    } catch (err) {
      setError(mensajeError(err, 'No se pudo generar eso ahora. Probá de nuevo en un momento.'))
    } finally {
      setCargando(false)
    }
  }

  // Abre/cierra el panel inline de técnica o rutina. Al abrir técnica por
  // primera vez, precarga la lista de ejercicios (de las rutinas actuales)
  // para poblar el selector.
  const abrirPanel = async (tipo) => {
    if (cargando) return
    setError(null)

    if (tipo === 'tecnica' && panelActivo !== 'tecnica' && ejerciciosDisponibles.length === 0) {
      try {
        const { rutinas } = await cargarDatosBase()
        const nombres = Array.from(new Set(rutinas.flatMap((r) => (r.ejercicios || []).map((e) => e.nombre))))
        setEjerciciosDisponibles(nombres)
        if (nombres.length) setTecnicaEjercicio(nombres[0])
      } catch {
        // Si falla, el selector queda vacío pero el resto de la app sigue andando
      }
    }

    setPanelActivo((prev) => (prev === tipo ? null : tipo))
  }

  // Análisis de técnica: el usuario elige un ejercicio de sus rutinas y
  // describe cómo lo sintió. El coach compara contra los puntos clave reales
  // del catálogo y su historial.
  const enviarTecnica = async (e) => {
    e.preventDefault()
    const descripcion = tecnicaDescripcion.trim()
    if (!tecnicaEjercicio || !descripcion || cargando) return

    setError(null)
    setPanelActivo(null)
    setMensajes((prev) => [...prev, { rol: 'user', contenido: `Técnica — ${tecnicaEjercicio}: ${descripcion}` }])
    setCargando(true)

    try {
      const { sesiones, personalizados } = await cargarDatosBase()
      const contexto = construirContextoTecnica({ nombre: tecnicaEjercicio }, sesiones, personalizados)
      const { analisis } = await coachService.analizarTecnica(contexto, descripcion)
      setMensajes((prev) => [...prev, { rol: 'model', contenido: analisis }])
      setTecnicaDescripcion('')
    } catch (err) {
      setError(mensajeError(err, 'No se pudo analizar la técnica ahora. Probá de nuevo en un momento.'))
    } finally {
      setCargando(false)
    }
  }

  // Generador de rutina: arma el contexto con objetivo/días/nivel/balance y
  // le pide al coach un JSON estricto. Lo que vuelve se valida contra el
  // catálogo real (nunca confiamos ciegamente un nombre de ejercicio que
  // "dijo" la IA) antes de mostrarlo como preview guardable.
  const generarRutinaIA = async (e) => {
    e.preventDefault()
    if (cargando) return

    setError(null)
    setPanelActivo(null)
    setMensajes((prev) => [...prev, { rol: 'user', contenido: `Generar rutina — objetivo: ${rutinaObjetivo}, ${rutinaDias} días/semana` }])
    setCargando(true)

    try {
      const { sesiones, rutinas, personalizados } = await cargarDatosBase()
      const contexto = construirContextoGenerarRutina(rutinas, sesiones, personalizados, {
        objetivo: rutinaObjetivo,
        diasPorSemana: rutinaDias,
      })
      const { rutina } = await coachService.generarRutina(contexto)

      // Filtramos cualquier ejercicio inventado fuera del catálogo, y el
      // grupo lo tomamos siempre del catálogo (nunca del que devolvió la IA).
      const ejerciciosValidados = (rutina.ejercicios || [])
        .map((ej) => {
          const info = getExerciseInfo(ej.nombre, personalizados)
          if (!info) return null
          return {
            nombre: info.nombre,
            grupo: info.grupo,
            series_objetivo: Number(ej.series_objetivo) || 3,
            reps_objetivo: Number(ej.reps_objetivo) || 10,
          }
        })
        .filter(Boolean)

      if (ejerciciosValidados.length === 0) {
        setError('El coach no pudo armar una rutina válida esta vez. Probá de nuevo.')
        return
      }

      setMensajes((prev) => [
        ...prev,
        {
          rol: 'model',
          tipo: 'rutina',
          rutina: { nombre: rutina.nombre, descripcion: rutina.descripcion || '', ejercicios: ejerciciosValidados },
        },
      ])
    } catch (err) {
      setError(mensajeError(err, 'No se pudo generar la rutina ahora. Probá de nuevo en un momento.'))
    } finally {
      setCargando(false)
    }
  }

  const guardarRutinaGenerada = async (index) => {
    const msg = mensajes[index]
    if (!msg || msg.guardando || msg.guardado) return

    setMensajes((prev) => prev.map((m, i) => (i === index ? { ...m, guardando: true } : m)))
    try {
      await rutinasService.create({
        nombre: msg.rutina.nombre,
        descripcion: msg.rutina.descripcion,
        ejercicios: msg.rutina.ejercicios,
        activa: false,
      })
      setMensajes((prev) => prev.map((m, i) => (i === index ? { ...m, guardando: false, guardado: true } : m)))
    } catch {
      setMensajes((prev) => prev.map((m, i) => (i === index ? { ...m, guardando: false } : m)))
      setError('No se pudo guardar la rutina. Probá de nuevo.')
    }
  }

  const descartarRutinaGenerada = (index) => {
    setMensajes((prev) => prev.map((m, i) => (i === index ? { ...m, descartado: true } : m)))
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setAbierto(true)}
        className="fixed z-50 bottom-24 right-4 w-14 h-14 rounded-full bg-primary shadow-plate flex items-center justify-center"
        style={{ display: abierto ? 'none' : 'flex' }}
        aria-label="Abrir coach IA"
      >
        <span className="material-symbols-outlined text-accent text-[26px]">forum</span>
      </button>

      {/* Panel de chat */}
      {abierto && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-surface-container-lowest md:inset-auto md:bottom-4 md:right-4 md:w-96 md:h-[600px] md:rounded-xl md:border md:border-outline-variant md:shadow-plate"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-outline-variant bg-primary">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-accent text-[20px]">forum</span>
              <span className="font-display font-bold text-on-primary-container">Coach Chiche</span>
            </div>
            <button onClick={() => setAbierto(false)} aria-label="Cerrar" className="p-2 -m-2">
              <span className="material-symbols-outlined text-on-primary-container">close</span>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {mensajes.length === 0 && !cargando && (
              <p className="text-body-sm text-on-surface-variant text-center mt-8">
                Preguntame lo que quieras sobre tu entrenamiento, o usá los botones de abajo.
              </p>
            )}
            {mensajes.map((m, i) => {
              // Tarjeta especial: rutina generada por IA, con preview y acciones de guardar/descartar.
              if (m.tipo === 'rutina') {
                if (m.descartado) {
                  return (
                    <div key={i} className="flex justify-start">
                      <div className="max-w-[85%] rounded-lg px-3 py-2 text-body-sm bg-surface-container text-on-surface-variant italic">
                        Rutina descartada.
                      </div>
                    </div>
                  )
                }
                return (
                  <div key={i} className="flex justify-start">
                    <div className="max-w-[90%] rounded-lg border border-outline-variant bg-surface-container-low overflow-hidden">
                      <div className="px-3 py-2 bg-surface-container">
                        <p className="font-display font-bold text-body-md text-on-surface">{m.rutina.nombre}</p>
                        {m.rutina.descripcion && (
                          <p className="text-body-sm text-on-surface-variant mt-0.5">{m.rutina.descripcion}</p>
                        )}
                      </div>
                      <ul className="px-3 py-2 space-y-1">
                        {m.rutina.ejercicios.map((ej, j) => (
                          <li key={j} className="text-body-sm text-on-surface flex justify-between gap-2">
                            <span>{ej.nombre}</span>
                            <span className="text-on-surface-variant tabular-nums shrink-0">{ej.series_objetivo}×{ej.reps_objetivo}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex gap-2 px-3 py-2 border-t border-outline-variant">
                        {m.guardado ? (
                          <span className="text-label-sm text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            Guardada en tus rutinas
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => guardarRutinaGenerada(i)}
                              disabled={m.guardando}
                              className="text-label-sm px-3 py-1.5 rounded-full bg-primary text-on-primary disabled:opacity-50"
                            >
                              {m.guardando ? 'Guardando...' : 'Guardar rutina'}
                            </button>
                            <button
                              onClick={() => descartarRutinaGenerada(i)}
                              disabled={m.guardando}
                              className="text-label-sm px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant disabled:opacity-50"
                            >
                              Descartar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div key={i} className={`flex ${m.rol === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-body-sm whitespace-pre-wrap ${
                      m.rol === 'user'
                        ? 'bg-primary text-on-primary-container'
                        : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    {m.contenido}
                  </div>
                </div>
              )
            })}
            {cargando && (
              <div className="flex justify-start">
                <div className="bg-surface-container rounded-lg px-3 py-2">
                  <span className="material-symbols-outlined animate-spin text-[18px] text-on-surface-variant">progress_activity</span>
                </div>
              </div>
            )}
            {error && <p className="text-body-sm text-error text-center">{error}</p>}
          </div>

          {/* Panel inline: análisis de técnica */}
          {panelActivo === 'tecnica' && (
            <form onSubmit={enviarTecnica} className="px-4 py-3 border-t border-outline-variant space-y-2 bg-surface-container-low">
              <label className="text-label-sm text-on-surface-variant block">
                Ejercicio
                <select
                  className="input-field w-full mt-1"
                  value={tecnicaEjercicio}
                  onChange={(e) => setTecnicaEjercicio(e.target.value)}
                >
                  {ejerciciosDisponibles.length === 0 && <option value="">No hay ejercicios en tus rutinas</option>}
                  {ejerciciosDisponibles.map((nombre) => (
                    <option key={nombre} value={nombre}>{nombre}</option>
                  ))}
                </select>
              </label>
              <label className="text-label-sm text-on-surface-variant block">
                ¿Cómo lo sentiste?
                <textarea
                  className="input-field w-full mt-1 resize-none"
                  rows={2}
                  placeholder="Ej: me tembló la rodilla en la bajada"
                  value={tecnicaDescripcion}
                  onChange={(e) => setTecnicaDescripcion(e.target.value)}
                />
              </label>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setPanelActivo(null)} className="text-label-sm px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!tecnicaEjercicio || !tecnicaDescripcion.trim() || cargando}
                  className="text-label-sm px-3 py-1.5 rounded-full bg-primary text-on-primary disabled:opacity-50"
                >
                  Analizar
                </button>
              </div>
            </form>
          )}

          {/* Panel inline: generador de rutina */}
          {panelActivo === 'rutina' && (
            <form onSubmit={generarRutinaIA} className="px-4 py-3 border-t border-outline-variant space-y-2 bg-surface-container-low">
              <label className="text-label-sm text-on-surface-variant block">
                Objetivo
                <select
                  className="input-field w-full mt-1"
                  value={rutinaObjetivo}
                  onChange={(e) => setRutinaObjetivo(e.target.value)}
                >
                  {OBJETIVOS_RUTINA.map((obj) => (
                    <option key={obj} value={obj}>{obj}</option>
                  ))}
                </select>
              </label>
              <label className="text-label-sm text-on-surface-variant block">
                Días por semana
                <input
                  type="number"
                  min={1}
                  max={7}
                  className="input-field w-full mt-1"
                  value={rutinaDias}
                  onChange={(e) => setRutinaDias(Math.min(7, Math.max(1, Number(e.target.value) || 1)))}
                />
              </label>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setPanelActivo(null)} className="text-label-sm px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant">
                  Cancelar
                </button>
                <button type="submit" disabled={cargando} className="text-label-sm px-3 py-1.5 rounded-full bg-primary text-on-primary disabled:opacity-50">
                  Generar rutina
                </button>
              </div>
            </form>
          )}

          <div className="flex gap-2 px-4 py-2 overflow-x-auto border-t border-outline-variant">
            <button onClick={() => accionRapida('semanal')} disabled={cargando} className="shrink-0 text-label-sm px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant disabled:opacity-50">
              Resumen semanal
            </button>
            <button onClick={() => accionRapida('mensual')} disabled={cargando} className="shrink-0 text-label-sm px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant disabled:opacity-50">
              Resumen mensual
            </button>
            <button onClick={() => accionRapida('sugerencias')} disabled={cargando} className="shrink-0 text-label-sm px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant disabled:opacity-50">
              Sugerir ejercicios
            </button>
            <button onClick={() => abrirPanel('tecnica')} disabled={cargando} className={`shrink-0 text-label-sm px-3 py-1.5 rounded-full disabled:opacity-50 ${panelActivo === 'tecnica' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}>
              Analizar técnica
            </button>
            <button onClick={() => abrirPanel('rutina')} disabled={cargando} className={`shrink-0 text-label-sm px-3 py-1.5 rounded-full disabled:opacity-50 ${panelActivo === 'rutina' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}>
              Generar rutina
            </button>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); enviarMensaje() }}
            className="flex gap-2 px-4 py-3 border-t border-outline-variant"
          >
            <input
              className="input-field flex-1"
              placeholder="Preguntale algo al coach..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={cargando}
            />
            <button type="submit" disabled={cargando || !input.trim()} className="btn-interact bg-primary text-on-primary rounded-lg px-4 disabled:opacity-50">
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </form>
        </div>
      )}
    </>
  )
}
