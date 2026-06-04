import { useState, useEffect } from 'react'
import sesionesService from '../services/sesiones.service'

export default function SesionesList() {
  const [sesiones, setSesiones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSesiones = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await sesionesService.getAll()
      setSesiones(data || [])
    } catch (err) {
      setError(err.message || 'Error al cargar sesiones')
      setSesiones([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSesiones()
  }, [])

  if (loading) {
    return <div style={{ padding: '20px' }}>Cargando sesiones...</div>
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Error: {error}
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Mis Sesiones</h2>
      {sesiones.length === 0 ? (
        <p>No hay sesiones registradas</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Fecha</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Rutina</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Volumen (kg)</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Duración (min)</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {sesiones.map((sesion) => (
              <tr key={sesion.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>
                  {new Date(sesion.fecha).toLocaleDateString('es-AR')}
                </td>
                <td style={{ padding: '10px' }}>{sesion.rutina_nombre || '-'}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {sesion.volumen_total || 0}
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {sesion.duracion_min || 0}
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <span
                    style={{
                      padding: '5px 10px',
                      borderRadius: '4px',
                      backgroundColor: sesion.completada ? '#4caf50' : '#ff9800',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}
                  >
                    {sesion.completada ? 'Completada' : 'Pendiente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
