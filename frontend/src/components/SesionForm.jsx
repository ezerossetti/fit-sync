import { useState, useEffect } from 'react'
import sesionesService from '../services/sesiones.service'
import rutinasService from '../services/rutinas.service'

export default function SesionForm({ onSesionCreated }) {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    rutina_id: '',
    rutina_nombre: '',
    volumen_total: '',
    duracion_min: '',
    completada: false
  })
  const [rutinas, setRutinas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    rutinasService.getAll()
      .then(data => setRutinas(data || []))
      .catch(() => setRutinas([]))
  }, [])

  const handleRutinaChange = (e) => {
    const rutinaId = e.target.value
    const rutina = rutinas.find(r => r.id === rutinaId)
    setFormData(prev => ({
      ...prev,
      rutina_id: rutinaId,
      rutina_nombre: rutina ? rutina.nombre : ''
    }))
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    try {
      setLoading(true)
      await sesionesService.create({
        usuario_id: 'user-123',
        fecha: formData.fecha,
        rutina_id: formData.rutina_id || null,
        rutina_nombre: formData.rutina_nombre,
        volumen_total: parseFloat(formData.volumen_total) || 0,
        duracion_min: parseInt(formData.duracion_min) || 0,
        completada: formData.completada
      })
      setSuccess(true)
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        rutina_id: '',
        rutina_nombre: '',
        volumen_total: '',
        duracion_min: '',
        completada: false
      })
      if (onSesionCreated) onSesionCreated()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Error al crear sesión')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '20px' }}>
      <h2>Nueva Sesión</h2>

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '15px' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '10px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', marginBottom: '15px' }}>
          ✓ Sesión creada exitosamente
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>

          <div>
            <label style={labelStyle}>Fecha</label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Rutina *</label>
            <select
              value={formData.rutina_id}
              onChange={handleRutinaChange}
              required
              style={{ ...inputStyle, backgroundColor: 'white' }}
            >
              <option value="">— Seleccioná una rutina —</option>
              {rutinas.map(r => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Volumen Total (kg)</label>
            <input
              type="number"
              name="volumen_total"
              value={formData.volumen_total}
              onChange={handleChange}
              placeholder="0"
              min="0"
              step="0.5"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Duración (minutos)</label>
            <input
              type="number"
              name="duracion_min"
              value={formData.duracion_min}
              onChange={handleChange}
              placeholder="0"
              min="0"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="completada"
                checked={formData.completada}
                onChange={handleChange}
                style={{ marginRight: '8px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 'bold' }}>Marcar como completada</span>
            </label>
          </div>

        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          {loading ? 'Guardando...' : 'Crear Sesión'}
        </button>
      </form>
    </div>
  )
}
