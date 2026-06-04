import { useState, useEffect } from 'react'
import usuarioService from '../services/usuario.service'

export default function UsuarioList() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await usuarioService.getAll()
      setUsuarios(data || [])
    } catch (err) {
      setError(err.message || 'Error al cargar usuarios')
      setUsuarios([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  if (loading) {
    return <div style={{ padding: '20px' }}>Cargando usuarios...</div>
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
      <h2>Usuarios</h2>
      {usuarios.length === 0 ? (
        <p>No hay usuarios registrados</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Nombre</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Rol</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Activo</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario, index) => (
              <tr key={usuario.id || usuario._id || index} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{usuario.nombre || usuario.name || '-'}</td>
                <td style={{ padding: '10px' }}>{usuario.email || '-'}</td>
                <td style={{ padding: '10px' }}>{usuario.rol || usuario.role || '-'}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {usuario.activo === false ? 'No' : 'Sí'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
