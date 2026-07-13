import { createContext, useCallback, useContext, useState } from 'react'
import { TOUR_IDS } from '../data/tours'

const TourContext = createContext(null)

const STORAGE_PREFIX = 'fitsync_tour_seen_'

function yaVisto(tourId) {
  return localStorage.getItem(STORAGE_PREFIX + tourId) === 'true'
}

function marcarVisto(tourId) {
  localStorage.setItem(STORAGE_PREFIX + tourId, 'true')
}

export function TourProvider({ children }) {
  // activeTour: { id, steps, stepIndex } | null
  const [activeTour, setActiveTour] = useState(null)

  /**
   * Arranca un tour si el usuario todavía no lo vio (persistido en
   * localStorage, así queda "recordado" entre sesiones). Si ya hay un tour
   * activo, no lo pisa — se resuelve uno por vez.
   *
   * @param {string} tourId
   * @param {{target: string, title: string, body: string}[]} steps
   * @param {{force?: boolean}} opts - force=true ignora si ya fue visto (para "Ver de nuevo")
   */
  const startTour = useCallback((tourId, steps, { force = false } = {}) => {
    if (!steps || steps.length === 0) return
    setActiveTour((actual) => {
      if (actual) return actual // ya hay uno corriendo, no interrumpir
      if (!force && yaVisto(tourId)) return null
      return { id: tourId, steps, stepIndex: 0 }
    })
  }, [])

  const next = useCallback(() => {
    setActiveTour((t) => {
      if (!t) return t
      const siguienteIndex = t.stepIndex + 1
      if (siguienteIndex >= t.steps.length) {
        marcarVisto(t.id)
        return null
      }
      return { ...t, stepIndex: siguienteIndex }
    })
  }, [])

  // Se usa cuando el elemento target de un step no existe en el DOM: lo
  // saltamos sin marcar el tour completo como "visto" todavía.
  const skipStep = useCallback(() => {
    setActiveTour((t) => {
      if (!t) return t
      const siguienteIndex = t.stepIndex + 1
      if (siguienteIndex >= t.steps.length) {
        marcarVisto(t.id)
        return null
      }
      return { ...t, stepIndex: siguienteIndex }
    })
  }, [])

  const skipTour = useCallback(() => {
    setActiveTour((t) => {
      if (t) marcarVisto(t.id)
      return null
    })
  }, [])

  const resetTour = useCallback((tourId) => {
    localStorage.removeItem(STORAGE_PREFIX + tourId)
  }, [])

  const resetAllTours = useCallback(() => {
    TOUR_IDS.forEach((id) => localStorage.removeItem(STORAGE_PREFIX + id))
  }, [])

  const value = {
    activeTour,
    startTour,
    next,
    skipStep,
    skipTour,
    resetTour,
    resetAllTours,
    yaVisto,
  }

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>
}

export function useTour() {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('useTour tiene que usarse dentro de <TourProvider>')
  return ctx
}
