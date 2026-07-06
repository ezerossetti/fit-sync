import { useEffect, useState } from 'react'
import sesionesService from '../services/sesiones.service'
import { formatFecha, formatFechaRelativa, volumenSesion, formatKg, formatDuracion } from '../utils/helpers'

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

  return (
    <div>
      <h1 className="font-display text-headline-lg-mobile text-on-surface mb-1">Historial</h1>
      <p className="text-body-sm text-on-surface-variant mb-5">Tu progreso, siempre 100% libre — sin límites de tier.</p>

      {error && <p className="text-body-sm text-error mb-3">{error}</p>}

      {loading ? (
        <p className="text-body-sm text-on-surface-variant">Cargando historial...</p>
      ) : sesiones.length === 0 ? (
        <div className="card p-6 text-center">
          <span className="material-symbols-outlined text-on-surface-variant text-[32px] mb-2">history</span>
          <p className="text-body-md text-on-surface">Todavía no registraste ninguna sesión</p>
          <p className="text-body-sm text-on-surface-variant mt-1">Es una invitación: tocá "Entrenar" y arrancá.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sesiones.map(s => (
            <div key={s.id} className="card p-4 timeline-accent">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-body-md font-semibold text-on-surface">{s.rutina_nombre || 'Sesión libre'}</p>
                  <p className="text-label-md text-on-surface-variant">{formatFechaRelativa(s.fecha)} · {formatFecha(s.fecha)}</p>
                </div>
                <button onClick={() => eliminar(s.id)} className="text-error">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>

              <div className="flex gap-4 mt-3">
                <div>
                  <p className="font-mono text-body-lg text-accent">{formatKg(s.volumen_total ?? volumenSesion(s.ejercicios))}</p>
                  <p className="text-label-md text-on-surface-variant">kg volumen</p>
                </div>
                <div>
                  <p className="font-mono text-body-lg text-accent">{(s.ejercicios || []).length}</p>
                  <p className="text-label-md text-on-surface-variant">ejercicios</p>
                </div>
                <div>
                  <p className="font-mono text-body-lg text-accent">{formatDuracion(s.duracion_min || 0)}</p>
                  <p className="text-label-md text-on-surface-variant">duración</p>
                </div>
              </div>

              {(s.ejercicios || []).length > 0 && (
                <p className="text-label-md text-on-surface-variant mt-2 truncate">
                  {s.ejercicios.map(e => e.nombre).join(' · ')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
