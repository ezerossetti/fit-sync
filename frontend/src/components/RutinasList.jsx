import { useState, useEffect } from 'react'
import { Pencil, Trash2, Dumbbell, Activity, ChevronRight } from 'lucide-react'
import rutinasService from '../services/rutinas.service'

const F = "'Lexend', sans-serif"

export default function RutinasList({ refreshKey, onEditarRutina }) {
  const [rutinas, setRutinas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRutinas = async () => {
    try {
      setLoading(true); setError(null)
      const data = await rutinasService.getAll()
      setRutinas(data || [])
    } catch (err) {
      setError(err.message || 'Error al cargar rutinas')
      setRutinas([])
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchRutinas() }, [refreshKey])

  const handleEliminar = async (id, nombre) => {
    if (confirm(`¿Eliminás la rutina "${nombre}"?`)) {
      try {
        await rutinasService.delete(id)
        setRutinas(prev => prev.filter(r => r.id !== id))
      } catch (err) {
        alert('Error al eliminar: ' + (err.message || 'Error desconocido'))
      }
    }
  }

  if (loading) return (
    <div style={{ padding: '48px', textAlign: 'center', fontFamily: F }}>
      <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #444650', borderTop: '3px solid #29B0E8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ marginTop: '12px', color: '#8e909b', fontSize: '14px' }}>Cargando rutinas...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (error) return (
    <div style={{ padding: '16px 20px', backgroundColor: '#16181D', borderLeft: '4px solid #ffb4ab', borderRadius: '8px', fontFamily: F }}>
      <p style={{ color: '#ffb4ab', fontWeight: '600', margin: '0 0 8px' }}>Error: {error}</p>
      <button onClick={fetchRutinas} style={{ fontFamily: F, fontSize: '12px', fontWeight: '600', padding: '6px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#ffb4ab', color: '#690005', cursor: 'pointer' }}>Reintentar</button>
    </div>
  )

  if (rutinas.length === 0) return (
    <div style={{ padding: '64px 20px', textAlign: 'center', backgroundColor: '#16181D', borderRadius: '12px', border: '2px dashed #444650', fontFamily: F }}>
      <Dumbbell size={40} color="#444650" style={{ marginBottom: '12px' }} />
      <h3 style={{ color: '#e3e2df', fontSize: '18px', fontWeight: '600', margin: '0 0 6px' }}>Sin rutinas registradas</h3>
      <p style={{ color: '#8e909b', fontSize: '14px', margin: 0 }}>Creá tu primera rutina para empezar</p>
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', fontFamily: F }}>
      {rutinas.map((rutina) => (
        <div key={rutina.id} style={{
          backgroundColor: '#16181D', borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.05)',
          borderLeft: '4px solid #29B0E8',
          padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px',
          transition: 'background-color 0.2s'
        }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1C1F26'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16181D'}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(10,46,110,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Dumbbell size={18} color="#29B0E8" />
            </div>
            <span style={{
              fontSize: '11px', fontWeight: '600', letterSpacing: '0.05em',
              textTransform: 'uppercase', padding: '4px 8px', borderRadius: '9999px',
              display: 'flex', alignItems: 'center', gap: '4px',
              backgroundColor: rutina.activa ? 'rgba(122,208,255,0.1)' : 'rgba(142,144,155,0.1)',
              color: rutina.activa ? '#7ad0ff' : '#8e909b',
              border: `1px solid ${rutina.activa ? 'rgba(122,208,255,0.3)' : 'rgba(142,144,155,0.2)'}`
            }}>
              <Activity size={10} />
              {rutina.activa ? 'Activa' : 'Inactiva'}
            </span>
          </div>

          <div>
            <h3 style={{ color: '#e3e2df', fontSize: '18px', fontWeight: '600', margin: '0 0 6px' }}>{rutina.nombre}</h3>
            <p style={{ color: '#8e909b', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{rutina.descripcion || 'Sin descripción'}</p>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: '#8e909b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ChevronRight size={12} /> Ejercicios
              </span>
              <span style={{ color: '#7ad0ff', fontWeight: '700' }}>{rutina.ejercicios?.length || 0}</span>
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: '#0D0D0F', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: Math.min((rutina.ejercicios?.length || 0) * 25, 100) + '%',
                background: 'linear-gradient(90deg, #0A2E6E 0%, #29B0E8 100%)',
                borderRadius: '2px', transition: 'width 0.4s ease'
              }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button onClick={() => onEditarRutina(rutina)} style={{
              flex: 1, fontFamily: F, fontSize: '12px', fontWeight: '600',
              padding: '8px', borderRadius: '8px', border: 'none',
              backgroundColor: '#0A2E6E', color: '#F4F3F0',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', transition: 'opacity 0.2s'
            }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
              <Pencil size={12} /> Editar
            </button>
            <button onClick={() => handleEliminar(rutina.id, rutina.nombre)} style={{
              flex: 1, fontFamily: F, fontSize: '12px', fontWeight: '600',
              padding: '8px', borderRadius: '8px',
              border: '1px solid #ffb4ab', backgroundColor: 'transparent', color: '#ffb4ab',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', transition: 'opacity 0.2s'
            }}
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
