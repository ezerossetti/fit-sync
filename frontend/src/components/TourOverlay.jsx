import { useEffect, useRef, useState } from 'react'
import { useTour } from '../context/TourContext'

const REINTENTOS_MAX = 8 // ~1.2s en total buscando el elemento antes de saltear el paso
const REINTENTO_MS = 150

export default function TourOverlay() {
  const { activeTour, next, skipStep, skipTour } = useTour()
  const [rect, setRect] = useState(null)
  const intentosRef = useRef(0)

  const step = activeTour?.steps?.[activeTour.stepIndex]
  const stepKey = activeTour ? `${activeTour.id}-${activeTour.stepIndex}` : null

  useEffect(() => {
    if (!step) {
      setRect(null)
      return
    }

    intentosRef.current = 0
    let cancelado = false
    let timeoutId

    const buscarElemento = () => {
      if (cancelado) return
      const el = document.querySelector(`[data-tour="${step.target}"]`)

      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        // pequeño delay para que el scroll suave termine antes de medir
        timeoutId = setTimeout(() => {
          if (cancelado) return
          const r = document.querySelector(`[data-tour="${step.target}"]`)?.getBoundingClientRect()
          if (r) setRect(r)
        }, 280)
        return
      }

      intentosRef.current += 1
      if (intentosRef.current >= REINTENTOS_MAX) {
        // El elemento no apareció (ej: "Repetir carga" antes de la primera
        // serie). No es un error, se saltea este paso solo.
        skipStep()
        return
      }
      timeoutId = setTimeout(buscarElemento, REINTENTO_MS)
    }

    buscarElemento()

    return () => {
      cancelado = true
      clearTimeout(timeoutId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey])

  useEffect(() => {
    if (!rect) return
    const actualizar = () => {
      const el = document.querySelector(`[data-tour="${step?.target}"]`)
      if (el) setRect(el.getBoundingClientRect())
    }
    window.addEventListener('resize', actualizar)
    window.addEventListener('scroll', actualizar, true)
    return () => {
      window.removeEventListener('resize', actualizar)
      window.removeEventListener('scroll', actualizar, true)
    }
  }, [rect, step])

  if (!activeTour || !step || !rect) return null

  const pad = 8
  const viewportH = window.innerHeight
  const espacioAbajo = viewportH - rect.bottom
  // Si no entra el tooltip abajo, lo mostramos arriba del elemento
  const mostrarArriba = espacioAbajo < 180 && rect.top > 180
  const tooltipStyle = mostrarArriba
    ? { bottom: viewportH - rect.top + 16 }
    : { top: rect.bottom + 16 }

  const esUltimo = activeTour.stepIndex + 1 >= activeTour.steps.length

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      {/* Spotlight: recorta un "agujero" iluminado sobre el elemento target */}
      <div
        className="absolute rounded-xl transition-all duration-300 ease-out"
        style={{
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
          boxShadow: '0 0 0 9999px rgba(10,10,14,0.78)',
          border: '2px solid rgba(41,176,232,0.9)', // var accent de FitSync
          pointerEvents: 'none',
        }}
      />

      <div
        className="absolute card p-4 w-[calc(100%-2rem)] max-w-xs left-4 sm:left-1/2 sm:-translate-x-1/2"
        style={tooltipStyle}
      >
        <p className="text-body-md font-semibold text-on-surface mb-1">{step.title}</p>
        <p className="text-body-sm text-on-surface-variant mb-4">{step.body}</p>
        <div className="flex items-center justify-between">
          <button type="button" onClick={skipTour} className="text-label-md text-on-surface-variant/70">
            Saltar tutorial
          </button>
          <button type="button" onClick={next} className="btn-primary px-4 py-2 text-label-md">
            {esUltimo ? 'Listo' : 'Siguiente'}
          </button>
        </div>
        <div className="flex gap-1 mt-3">
          {activeTour.steps.map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= activeTour.stepIndex ? 'bg-accent' : 'bg-outline-variant'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
