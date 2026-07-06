import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, X, Save, Plus } from 'lucide-react'
import sesionesService from '../services/sesiones.service'
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

export default function SesionForm({ onSesionCreated, sesionEditando, onCancelEdit }) {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    rutina_id: '', rutina_nombre: '', volumen_total: '', duracion_min: '', completada: false
  })
  const [rutinas, setRutinas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (sesionEditando) {
      setFormData({
        fecha: sesionEditando.fecha, rutina_id: sesionEditando.rutina_id || '',
        rutina_nombre: sesionEditando.rutina_nombre || '',
        volumen_total: sesionEditando.volumen_total || '',
        duracion_min: sesionEditando.duracion_min || '',
        completada: sesionEditando.completada || false
      })
    } else { resetForm() }
  }, [sesionEditando])

  useEffect(() => {
    rutinasService.getAll().then(data => setRutinas(data || [])).catch(() => setRutinas([]))
  }, [])

  const resetForm = () => setFormData({
    fecha: new Date().toISOString().split('T')[0],
    rutina_id: '', rutina_nombre: '', volumen_total: '', duracion_min: '', completada: false
  })

  const handleRutinaChange = (e) => {
    const rutinaId = e.target.value
    const rutina = rutinas.find(r => r.id === rutinaId)
    setFormData(prev => ({ ...prev, rutina_id: rutinaId, rutina_nombre: rutina ? rutina.nombre : '' }))
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null); setSuccess(false)
    if (!formData.fecha) return setError('La fecha es obligatoria')
    if (!formData.rutina_id) return setError('Seleccioná una rutina')
    try {
      setLoading(true)
      const payload = {
        usuario_id: 'user-123', fecha: formData.fecha,
        rutina_id: formData.rutina_id, rutina_nombre: formData.rutina_nombre,
        volumen_total: parseFloat(formData.volumen_total) || 0,
        duracion_min: parseInt(formData.duracion_min) || 0,
        completada: formData.completada
      }
      if (sesionEditando) { await sesionesService.update(sesionEditando.id, payload) }
      else { await sesionesService.create(payload); resetForm() }
      setSuccess(true)
      if (onSesionCreated) onSesionCreated()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Error al guardar sesión')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ backgroundColor: '#16181D', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', marginBottom: '8px', fontFamily: F }}>
      {error && (
        <div style={{ padding: '12px 16px', marginBottom: '16px', borderRadius: '8px', backgroundColor: 'rgba(255,180,171,0.08)', borderLeft: '4px solid #ffb4ab', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#ffb4ab', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={15} /> {error}
          </span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#ffb4ab', cursor: 'pointer' }}><X size={15} /></button>
        </div>
      )}
      {success && (
        <div style={{ padding: '12px 16px', marginBottom: '16px', borderRadius: '8px', backgroundColor: 'rgba(104,219,174,0.08)', borderLeft: '4px solid #68dbae', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#68dbae', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={15} /> {sesionEditando ? 'Sesión actualizada' : 'Sesión creada'} exitosamente
          </span>
          <button onClick={() => setSuccess(false)} style={{ background: 'none', border: 'none', color: '#68dbae', cursor: 'pointer' }}><X size={15} /></button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={LABEL}>Fecha</label>
            <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required style={INPUT}
              onFocus={(e) => e.target.style.borderColor = '#29B0E8'}
              onBlur={(e) => e.target.style.borderColor = '#444650'} />
          </div>
          <div>
            <label style={LABEL}>Rutina *</label>
            <select value={formData.rutina_id} onChange={handleRutinaChange} required
              style={{ ...INPUT, backgroundColor: '#0D0D0F' }}
              onFocus={(e) => e.target.style.borderColor = '#29B0E8'}
              onBlur={(e) => e.target.style.borderColor = '#444650'}>
              <option value="">— Seleccioná una rutina —</option>
              {rutinas.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </div>
          <div>
            <label style={LABEL}>Volumen Total (kg)</label>
            <input type="number" name="volumen_total" value={formData.volumen_total} onChange={handleChange}
              placeholder="0" min="0" step="0.5" style={INPUT}
              onFocus={(e) => e.target.style.borderColor = '#29B0E8'}
              onBlur={(e) => e.target.style.borderColor = '#444650'} />
          </div>
          <div>
            <label style={LABEL}>Duración (min)</label>
            <input type="number" name="duracion_min" value={formData.duracion_min} onChange={handleChange}
              placeholder="0" min="0" style={INPUT}
              onFocus={(e) => e.target.style.borderColor = '#29B0E8'}
              onBlur={(e) => e.target.style.borderColor = '#444650'} />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" name="completada" checked={formData.completada} onChange={handleChange}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#29B0E8' }} />
            <span style={{ fontFamily: F, fontSize: '14px', fontWeight: '500', color: '#c4c6d2' }}>Marcar como completada</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" disabled={loading} style={{
            fontFamily: F, fontSize: '14px', fontWeight: '600',
            padding: '10px 24px', borderRadius: '8px', border: 'none',
            backgroundColor: loading ? '#292a29' : '#0A2E6E',
            color: loading ? '#8e909b' : '#F4F3F0',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px', transition: 'opacity 0.2s'
          }}>
            {sesionEditando ? <Save size={14} /> : <Plus size={14} />}
            {loading ? 'Guardando...' : sesionEditando ? 'Guardar Cambios' : 'Crear Sesión'}
          </button>
          {sesionEditando && (
            <button type="button" onClick={() => { resetForm(); if (onCancelEdit) onCancelEdit() }} style={{
              fontFamily: F, fontSize: '14px', fontWeight: '600',
              padding: '10px 24px', borderRadius: '8px',
              border: '1px solid #444650', backgroundColor: 'transparent', color: '#c4c6d2',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <X size={14} /> Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
