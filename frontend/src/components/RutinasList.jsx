import { useState, useEffect } from 'react'
import rutinasService from '../services/rutinas.service'

export default function RutinasList({ refreshKey }) {
  const [rutinas, setRutinas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRutinas = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await rutinasService.getAll()
      setRutinas(data || [])
    } catch (err) {
      setError(err.message || 'Error al cargar rutinas')
      setRutinas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRutinas()
  }, [refreshKey])

  if (loading) return <div style={{ padding: '20px' }}>Cargando rutinas...</div>

  if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>

  return (
    <div style={{ padding: '20px' }}>
      <h2>Mis Rutinas</h2>
      {rutinas.length === 0 ? (
        <p>No hay rutinas registradas</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Nombre</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Descripción</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Ejercicios</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {rutinas.map((rutina) => (
              <tr key={rutina.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{rutina.nombre}</td>
                <td style={{ padding: '10px', color: '#666' }}>{rutina.descripcion || '-'}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {rutina.ejercicios?.length || 0}
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <span
                    style={{
                      padding: '5px 10px',
                      borderRadius: '4px',
                      backgroundColor: rutina.activa ? '#4caf50' : '#ff9800',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}
                  >
                    {rutina.activa ? 'Activa' : 'Inactiva'}
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
