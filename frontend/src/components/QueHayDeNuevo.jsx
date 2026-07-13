import { useEffect, useState } from 'react'
import { APP_VERSION, CHANGELOG } from '../data/changelog'

const STORAGE_KEY = 'fitsync_last_seen_version'

// Modal de "¿Qué hay de nuevo?": se muestra una sola vez por usuario cuando
// detecta que la versión guardada en localStorage quedó vieja respecto a
// APP_VERSION. La primera vez que alguien usa FitSync NO se le muestra nada
// (no es "novedad" si nunca usó una versión anterior) — solo se guarda la
// versión actual como punto de partida silencioso.
export default function QueHayDeNuevo() {
  const [entradas, setEntradas] = useState([])

  useEffect(() => {
    const vistaAnterior = localStorage.getItem(STORAGE_KEY)

    if (vistaAnterior === null) {
      localStorage.setItem(STORAGE_KEY, APP_VERSION)
      return
    }
    if (vistaAnterior === APP_VERSION) return

    const idxAnterior = CHANGELOG.findIndex((v) => v.version === vistaAnterior)
    // Si la versión guardada no está en el changelog (usuario que venía de
    // muy atrás) mostramos solo la más reciente, no todo el historial.
    const nuevas = idxAnterior === -1 ? CHANGELOG.slice(0, 1) : CHANGELOG.slice(0, idxAnterior)

    if (nuevas.length === 0) {
      localStorage.setItem(STORAGE_KEY, APP_VERSION)
      return
    }
    setEntradas(nuevas)
  }, [])

  const cerrar = () => {
    localStorage.setItem(STORAGE_KEY, APP_VERSION)
    setEntradas([])
  }

  if (entradas.length === 0) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 p-4"
      onClick={cerrar}
    >
      <div
        className="card w-full max-w-sm p-5 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-4">
          <span
            className="material-symbols-outlined text-accent text-[22px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          <h2 className="font-display text-headline-sm text-on-surface">Qué hay de nuevo</h2>
        </div>

        <div className="space-y-4 mb-5">
          {entradas.map((v) => (
            <div key={v.version}>
              <p className="text-label-md text-on-surface-variant uppercase mb-1.5">{v.fecha}</p>
              <ul className="space-y-1.5">
                {v.items.map((item, i) => (
                  <li key={i} className="text-body-sm text-on-surface flex gap-2">
                    <span className="material-symbols-outlined text-accent text-[16px] shrink-0 mt-0.5">
                      check_circle
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <button onClick={cerrar} className="btn-primary w-full py-3 text-body-sm">
          Entendido
        </button>
      </div>
    </div>
  )
}
