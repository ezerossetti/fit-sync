import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, X, Save, Plus } from 'lucide-react'
import rutinasService from '../services/rutinas.service'

const F = "'Lexend', sans-serif"

const INPUT = {
  width: '100%', padding: '10px 14px', borderRadius: '8px',
  border: '1px solid #444650', backgroundColor: '#0D0D0F', color: '#e3e2df',
  fontFamily: F, fontSize: '14px', boxSizing: 'border-box',
  outline: 'none', transition: 'border-color 0.2s'
}

const LABEL = {
  display: 'block', marginBottom: '6px', fontFamily: F,
  fontSize: '12px', fontWeight: '600', color: '#7ad0ff',
  textTransform: 'uppercase', letterSpacing: '0.05em'
}

export default function RutinaForm({ onRutinaCreada, rutinaEditando, onCancelEdit }) {
  const [form, setForm] = useState({ nombre: '', descripcion: '', activa: true })
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    if (rutinaEditando) {
      setForm({ nombre: rutinaEditando.nombre || '', descripcion: rutinaEditando.descripcion || '', activa: rutinaEditando.activa !== undefined ? rutinaEditando.activa : true })
    } else { resetForm() }
  }, [rutinaEditando])

  const resetForm = () => setForm({ nombre: '', descripcion: '', activa: true })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async () => {
    if (!form.nombre.trim()) return setMensaje({ tipo: 'error', texto: 'El nombre es obligatorio' })
    try {
      setLoading(true); setMensaje(null)
      if (rutinaEditando) {
        await rutinasService.update(rutinaEditando.id, { ...form, usuario_id: 'user-123', ejercicios: rutinaEditando.ejercicios || [] })
        setMensaje({ tipo: 'ok', texto: 'Rutina actualizada correctamente' })
      } else {
        await rutinasService.create({ ...form, usuario_id: 'user-123', ejercicios: [] })
        setMensaje({ tipo: 'ok', texto: 'Rutina creada correctamente' }); resetForm()
      }
      if (onRutinaCreada) onRutinaCreada()
      setTimeout(() => setMensaje(null), 3000)
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message || 'Error al guardar rutina' })
    } finally { setLoading(false) }
  }

  return (
    <div style={{ backgroundColor: '#16181D', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', marginBottom: '8px', fontFamily: F }}>
      {mensaje && (
        <div style={{
          padding: '12px 16px', marginBottom: '16px', borderRadius: '8px',
          backgroundColor: mensaje.tipo === 'ok' ? 'rgba(104,219,174,0.08)' : 'rgba(255,180,171,0.08)',
          borderLeft: `4px solid ${mensaje.tipo === 'ok' ? '#68dbae' : '#ffb4ab'}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ color: mensaje.tipo === 'ok' ? '#68dbae' : '#ffb4ab', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {mensaje.tipo === 'ok' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            {mensaje.texto}
          </span>
          <button onClick={() => setMensaje(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={15} /></button>
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <label style={LABEL}>Nombre *</label>
        <input name="nombre" value={form.nombre} onChange={handleChange}
          placeholder="Ej: Push Day" style={INPUT}
          onFocus={(e) => e.target.style.borderColor = '#29B0E8'}
          onBlur={(e) => e.target.style.borderColor = '#444650'} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={LABEL}>Descripción</label>
        <input name="descripcion" value={form.descripcion} onChange={handleChange}
          placeholder="Ej: Empuje de tren superior" style={INPUT}
          onFocus={(e) => e.target.style.borderColor = '#29B0E8'}
          onBlur={(e) => e.target.style.borderColor = '#444650'} />
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', cursor: 'pointer' }}>
        <input type="checkbox" name="activa" checked={form.activa} onChange={handleChange}
          style={{ width: '16px', height: '16px', accentColor: '#29B0E8', cursor: 'pointer' }} />
        <span style={{ fontFamily: F, fontSize: '14px', fontWeight: '500', color: '#c4c6d2' }}>Activa</span>
      </label>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={handleSubmit} disabled={loading} style={{
          fontFamily: F, fontSize: '14px', fontWeight: '600',
          padding: '10px 24px', borderRadius: '8px', border: 'none',
          backgroundColor: loading ? '#292a29' : '#0A2E6E',
          color: loading ? '#8e909b' : '#F4F3F0',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px', transition: 'opacity 0.2s'
        }}>
          {rutinaEditando ? <Save size={14} /> : <Plus size={14} />}
          {loading ? 'Guardando...' : rutinaEditando ? 'Guardar Cambios' : 'Crear Rutina'}
        </button>
        {rutinaEditando && (
          <button onClick={() => { resetForm(); if (onCancelEdit) onCancelEdit() }} style={{
            fontFamily: F, fontSize: '14px', fontWeight: '600',
            padding: '10px 24px', borderRadius: '8px',
            border: '1px solid #444650', backgroundColor: 'transparent', color: '#c4c6d2',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <X size={14} /> Cancelar
          </button>
        )}
      </div>
    </div>
  )
}
