import { useState } from 'react'
import rutinasService from '../services/rutinas.service'

export default function RutinaForm({ onRutinaCreada }) {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    activa: true
  })
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async () => {
    if (!form.nombre.trim()) {
      setMensaje({ tipo: 'error', texto: 'El nombre es obligatorio' })
      return
    }
    try {
      setLoading(true)
      setMensaje(null)
      await rutinasService.create({
        ...form,
        usuario_id: 'user-123',
        ejercicios: []
      })
      setMensaje({ tipo: 'ok', texto: '✅ Rutina creada correctamente' })
      setForm({ nombre: '', descripcion: '', activa: true })
      if (onRutinaCreada) onRutinaCreada()
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message || 'Error al crear rutina' })
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '8px',
    marginTop: '4px',
    marginBottom: '12px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
    boxSizing: 'border-box'
  }

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
      <h2>Nueva Rutina</h2>

      <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Nombre *</label>
      <input
        style={inputStyle}
        name="nombre"
        placeholder="Ej: Push Day"
        value={form.nombre}
        onChange={handleChange}
      />

      <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Descripción</label>
      <input
        style={inputStyle}
        name="descripcion"
        placeholder="Ej: Empuje de tren superior"
        value={form.descripcion}
        onChange={handleChange}
      />

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          name="activa"
          checked={form.activa}
          onChange={handleChange}
        />
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Activa</span>
      </label>

      {mensaje && (
        <div style={{
          padding: '10px',
          marginBottom: '12px',
          borderRadius: '4px',
          backgroundColor: mensaje.tipo === 'ok' ? '#e8f5e9' : '#ffebee',
          color: mensaje.tipo === 'ok' ? '#2e7d32' : '#c62828',
          fontSize: '14px'
        }}>
          {mensaje.texto}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#90caf9' : '#1976d2',
          color: 'white',
          padding: '10px 24px',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        {loading ? 'Creando...' : 'Crear Rutina'}
      </button>
    </div>
  )
}
