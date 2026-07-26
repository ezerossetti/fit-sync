import { useEffect, useState } from 'react'
import usuarioService from '../services/usuario.service'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)

  const cargar = async () => {
    setLoading(true)
    try {
      const data = await usuarioService.getAll()
      setUsuarios(data || [])
    } catch (e) {
      console.error(e)
      setError('No se pudieron cargar los usuarios.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const crear = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await usuarioService.create({ nombre, email })
      setNombre('')
      setEmail('')
      setShowForm(false)
      await cargar()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return
    try {
      await usuarioService.delete(id)
      await cargar()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div>
      <h1 className="font-display text-headline-lg-mobile text-on-surface mb-1">Perfil</h1>
      <p className="text-body-sm text-on-surface-variant mb-5">Gestioná los usuarios de la app (demo / testing).</p>

      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="btn-primary w-full py-3 text-body-md mb-5 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">person_add</span> Nuevo usuario
        </button>
      ) : (
        <form onSubmit={crear} className="card p-4 space-y-3 mb-5">
          <input className="input-field" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          <input className="input-field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 text-body-sm text-on-surface-variant">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 py-2 text-body-sm">{saving ? 'Guardando...' : 'Crear'}</button>
          </div>
        </form>
      )}

      {error && <p className="text-body-sm text-error mb-3">{error}</p>}

      {loading ? (
        <p className="text-body-sm text-on-surface-variant">Cargando...</p>
      ) : (
        <div className="space-y-2">
          {usuarios.map(u => (
            <div key={u.id} className="card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-accent font-semibold text-body-sm">
                  {u.nombre?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-body-sm font-semibold text-on-surface">{u.nombre}</p>
                  <p className="text-label-md text-on-surface-variant">{u.email}</p>
                </div>
              </div>
              <button onClick={() => eliminar(u.id)} className="text-error">
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
