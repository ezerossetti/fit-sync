import { useState, useEffect } from 'react'
import { Pencil, Trash2, CheckCircle, Clock, Weight, Timer } from 'lucide-react'
import sesionesService from '../services/sesiones.service'

const F = "'Lexend', sans-serif"

const CARD = {
  backgroundColor: '#16181D', borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.05)',
  borderLeft: '4px solid #29B0E8',
  padding: '16px 20px',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  gap: '16px', transition: 'background-color 0.2s'
}

const BTN_EDIT = {
  fontFamily: F, fontSize: '12px', fontWeight: '600',
  padding: '6px 14px', borderRadius: '8px', border: 'none',
  backgroundColor: '#0A2E6E', color: '#F4F3F0',
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', transition: 'opacity 0.2s'
}

const BTN_DELETE = {
  fontFamily: F, fontSize: '12px', fontWeight: '600',
  padding: '6px 14px', borderRadius: '8px',
  border: '1px solid #ffb4ab', backgroundColor: 'transparent', color: '#ffb4ab',
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', transition: 'opacity 0.2s'
}

export default function SesionesList({ onEditarSesion }) {
  const [sesiones, setSesiones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSesiones = async () => {
    try {
      setLoading(true); setError(null)
      const data = await sesionesService.getAll()
      setSesiones(data || [])
    } catch (err) {
      setError(err.message || 'Error al cargar sesiones')
      setSesiones([])
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchSesiones() }, [])

  const handleEliminar = async (id, fecha) => {
    if (confirm(`¿Eliminás la sesión del ${new Date(fecha).toLocaleDateString('es-AR')}?`)) {
      try {
        await sesionesService.delete(id)
        setSesiones(prev => prev.filter(s => s.id !== id))
      } catch (err) {
        alert('Error al eliminar: ' + (err.message || 'Error desconocido'))
      }
    }
  }

  if (loading) return (
    <div style={{ padding: '48px', textAlign: 'center', fontFamily: F }}>
      <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #444650', borderTop: '3px solid #29B0E8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ marginTop: '12px', color: '#8e909b', fontSize: '14px' }}>Cargando sesiones...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (error) return (
    <div style={{ padding: '16px 20px', backgroundColor: '#16181D', borderLeft: '4px solid #ffb4ab', borderRadius: '8px', fontFamily: F }}>
      <p style={{ color: '#ffb4ab', fontWeight: '600', margin: '0 0 8px' }}>Error: {error}</p>
      <button onClick={fetchSesiones} style={{ ...BTN_EDIT, backgroundColor: '#ffb4ab', color: '#690005' }}>Reintentar</button>
    </div>
  )

  if (sesiones.length === 0) return (
    <div style={{ padding: '64px 20px', textAlign: 'center', backgroundColor: '#16181D', borderRadius: '12px', border: '2px dashed #444650', fontFamily: F }}>
      <Clock size={40} color="#444650" style={{ marginBottom: '12px' }} />
      <h3 style={{ color: '#e3e2df', fontSize: '18px', fontWeight: '600', margin: '0 0 6px' }}>Sin sesiones registradas</h3>
      <p style={{ color: '#8e909b', fontSize: '14px', margin: 0 }}>Creá tu primera sesión de entrenamiento</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: F }}>
      {sesiones.map((sesion) => (
        <div key={sesion.id} style={CARD}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1C1F26'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16181D'}>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#e3e2df', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
              {sesion.rutina_nombre || '—'}
            </div>
            <div style={{ color: '#8e909b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} />
              {new Date(sesion.fecha).toLocaleDateString('es-AR')}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexShrink: 0 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#7ad0ff', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                <Weight size={13} color="#29B0E8" />
                {sesion.volumen_total ?? 0}
              </div>
              <div style={{ color: '#8e909b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>kg vol.</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#7ad0ff', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                <Timer size={13} color="#29B0E8" />
                {sesion.duracion_min ?? 0}
              </div>
              <div style={{ color: '#8e909b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>min</div>
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '4px 10px', borderRadius: '9999px', flexShrink: 0,
            fontSize: '11px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase',
            backgroundColor: sesion.completada ? 'rgba(104,219,174,0.15)' : 'rgba(196,198,210,0.1)',
            color: sesion.completada ? '#68dbae' : '#8e909b',
            border: `1px solid ${sesion.completada ? '#68dbae' : '#444650'}`
          }}>
            <CheckCircle size={11} />
            {sesion.completada ? 'Completada' : 'Pendiente'}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button onClick={() => onEditarSesion(sesion)} style={BTN_EDIT}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
              <Pencil size={12} /> Editar
            </button>
            <button onClick={() => handleEliminar(sesion.id, sesion.fecha)} style={BTN_DELETE}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
              <Trash2 size={12} /> Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
