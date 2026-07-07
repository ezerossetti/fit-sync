import { useEffect, useRef, useState } from 'react'
import coachService from '../services/coach.service'
import sesionesService from '../services/sesiones.service'
import rutinasService from '../services/rutinas.service'
import ejerciciosPersonalizadosService from '../services/ejerciciosPersonalizados.service'
import { construirContextoChat, construirContextoResumen, construirContextoSugerirEjercicios } from '../utils/contextoCoach'

// Widget flotante: un botón (FAB) que abre un panel de chat con el coach IA.
// Se monta una sola vez en App.jsx, así queda disponible en toda la app.
export default function CoachChat() {
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState([]) // { rol: 'user' | 'model', contenido }
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (abierto && mensajes.length === 0) {
      cargarHistorial()
    }
  }, [abierto])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [mensajes, cargando])

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
      const contexto = construirContextoChat(sesiones, rutinas, personalizados)
      const { respuesta } = await coachService.chat(texto, contexto)
      setMensajes((prev) => [...prev, { rol: 'model', contenido: respuesta }])
    } catch (err) {
      setError('No se pudo conectar con el coach. Probá de nuevo en un momento.')
    } finally {
      setCargando(false)
    }
  }

  // Acciones rápidas: resumen semanal, mensual y sugerencia de ejercicios,
  // sin que el usuario tenga que escribir el pedido a mano.
  const accionRapida = async (tipo) => {
    if (cargando) return
    setError(null)
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
      setError('No se pudo generar eso ahora. Probá de nuevo en un momento.')
    } finally {
      setCargando(false)
    }
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
        <div className="fixed inset-0 z-50 flex flex-col bg-surface-container-lowest md:inset-auto md:bottom-4 md:right-4 md:w-96 md:h-[600px] md:rounded-xl md:border md:border-outline-variant md:shadow-plate">
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant bg-primary">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-accent text-[20px]">forum</span>
              <span className="font-display font-bold text-on-primary-container">Coach FitSync</span>
            </div>
            <button onClick={() => setAbierto(false)} aria-label="Cerrar">
              <span className="material-symbols-outlined text-on-primary-container">close</span>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {mensajes.length === 0 && !cargando && (
              <p className="text-body-sm text-on-surface-variant text-center mt-8">
                Preguntame lo que quieras sobre tu entrenamiento, o usá los botones de abajo.
              </p>
            )}
            {mensajes.map((m, i) => (
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
            ))}
            {cargando && (
              <div className="flex justify-start">
                <div className="bg-surface-container rounded-lg px-3 py-2">
                  <span className="material-symbols-outlined animate-spin text-[18px] text-on-surface-variant">progress_activity</span>
                </div>
              </div>
            )}
            {error && <p className="text-body-sm text-error text-center">{error}</p>}
          </div>

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
