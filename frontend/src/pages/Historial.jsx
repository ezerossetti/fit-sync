import { useEffect, useState } from 'react'
import sesionesService from '../services/sesiones.service'
import { formatFecha, formatFechaRelativa, volumenSesion, formatKg, formatDuracion } from '../utils/helpers'

function mesAnioLabel(fechaISO) {
  const d = new Date(fechaISO)
  const label = d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

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
      <h1 className="font-display text-headline-lg-mobile text-on-surface mb-1">Historial</h1>
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

      {loading ? (
        <p className="text-body-sm text-on-surface-variant">Cargando historial...</p>
      ) : sesiones.length === 0 ? (
        <div className="card p-6 text-center">
          <span className="material-symbols-outlined text-on-surface-variant text-[32px] mb-2">history</span>
          <p className="text-body-md text-on-surface">Todavía no registraste ninguna sesión</p>
          <p className="text-body-sm text-on-surface-variant mt-1">Es una invitación: tocá "Entrenar" y arrancá.</p>
        </div>
      ) : (
        <div className="space-y-6">
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
