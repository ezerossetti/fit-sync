import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import usuarioService from '../services/usuario.service'
import sesionesService from '../services/sesiones.service'
import {
  calcularRacha, volumenTotalHistorico, sesionesCompletadas,
  horasActivasTotales, recordsPersonalesTotal, nivelPorSesiones, formatKg
} from '../utils/helpers'

export default function Perfil() {
  const { user, signOut } = useAuth()
  const [perfil, setPerfil] = useState(null)
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)
  const [editandoNombre, setEditandoNombre] = useState(false)
  const [nombreForm, setNombreForm] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Preferencias — demo local, no persisten en el backend todavía
  const [descansoDefault, setDescansoDefault] = useState(90)
  const [unidad, setUnidad] = useState('Kilogramos')
  const [recordatorios, setRecordatorios] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const [p, s] = await Promise.all([
          usuarioService.getMe().catch(() => null),
          sesionesService.getAll().catch(() => []),
        ])
        setPerfil(p)
        setNombreForm(p?.nombre || '')
        setHistorial(s || [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const guardarNombre = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      const actualizado = await usuarioService.updateMe({ nombre: nombreForm })
      setPerfil(actualizado)
      setEditandoNombre(false)
    } catch (err) {
      console.error(err)
      alert('No se pudo actualizar el nombre.')
    } finally {
      setGuardando(false)
    }
  }

  const cambiarPassword = async () => {
    if (!user?.email) return
    try {
      await supabase.auth.resetPasswordForEmail(user.email)
      alert(`Te mandamos un email a ${user.email} para cambiar tu contraseña.`)
    } catch (err) {
      alert('No se pudo enviar el email de recuperación.')
    }
  }

  const nombre = perfil?.nombre || user?.user_metadata?.nombre || 'Deportista'
  const inicial = nombre?.[0]?.toUpperCase() || '?'

  const racha = calcularRacha(historial)
  const volumen = volumenTotalHistorico(historial)
  const completados = sesionesCompletadas(historial)
  const horas = horasActivasTotales(historial)
  const prs = recordsPersonalesTotal(historial)
  const nivel = nivelPorSesiones(completados)

  if (loading) {
    return <p className="text-body-sm text-on-surface-variant">Cargando perfil...</p>
  }

  return (
    <div className="pb-4">
      {/* Header de perfil */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-2 border-accent flex items-center justify-center bg-primary-container">
            <span className="font-display text-headline-lg text-on-primary-container">{inicial}</span>
          </div>
          <button
            onClick={() => setEditandoNombre(true)}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center border-2 border-surface-container-lowest"
            aria-label="Editar nombre"
          >
            <span className="material-symbols-outlined text-on-accent text-[16px]">edit</span>
          </button>
        </div>

        {editandoNombre ? (
          <form onSubmit={guardarNombre} className="w-full max-w-xs mt-4 space-y-2">
            <input
              className="input-field text-center"
              value={nombreForm}
              onChange={(e) => setNombreForm(e.target.value)}
              autoFocus
              required
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditandoNombre(false)} className="flex-1 py-2 text-body-sm text-on-surface-variant">
                Cancelar
              </button>
              <button type="submit" disabled={guardando} className="btn-primary flex-1 py-2 text-body-sm">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        ) : (
          <h1 className="font-display text-headline-md text-on-surface mt-4">{nombre}</h1>
        )}

        <div className="flex items-center gap-2 mt-2">
          <span className="px-3 py-1 rounded-full text-label-md bg-primary-container text-on-primary-container uppercase">
            Nivel {nivel}
          </span>
          {racha > 0 && (
            <span className="px-3 py-1 rounded-full text-label-md bg-success-container text-on-success-container flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
              {racha} {racha === 1 ? 'Día' : 'Días'}
            </span>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-accent text-[20px]">bar_chart</span>
        <h2 className="text-body-md font-semibold text-on-surface">Mis Estadísticas</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card p-4 border-l-4 border-l-accent">
          <p className="text-label-md text-on-surface-variant uppercase">Volumen total</p>
          <p className="font-mono text-headline-sm text-on-surface mt-1">{formatKg(volumen)} <span className="text-body-sm">kg</span></p>
        </div>
        <div className="card p-4 border-l-4 border-l-accent">
          <p className="text-label-md text-on-surface-variant uppercase">Completados</p>
          <p className="font-mono text-headline-sm text-on-surface mt-1">{completados}</p>
          <p className="text-label-md text-on-surface-variant">Entrenamientos totales</p>
        </div>
        <div className="card p-4 border-l-4 border-l-success">
          <p className="text-label-md text-on-surface-variant uppercase">Tiempo activo</p>
          <p className="font-mono text-headline-sm text-on-surface mt-1">{horas} <span className="text-body-sm">hrs</span></p>
          <p className="text-label-md text-on-surface-variant">Tiempo de esfuerzo</p>
        </div>
        <div className="card p-4 border-l-4 border-l-success">
          <p className="text-label-md text-on-surface-variant uppercase">Récords personales</p>
          <p className="font-mono text-headline-sm text-on-surface mt-1">{prs}</p>
          <p className="text-label-md text-on-surface-variant">Superados en total</p>
        </div>
      </div>

      {/* Preferencias */}
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-accent text-[20px]">tune</span>
        <h2 className="text-body-md font-semibold text-on-surface">Preferencias de Entrenamiento</h2>
      </div>
      <div className="card divide-y divide-outline-variant mb-6">
        <button onClick={() => setDescansoDefault(d => (d === 90 ? 60 : d === 60 ? 120 : 90))} className="w-full flex items-center justify-between p-4 text-left">
          <span className="flex items-center gap-2 text-body-sm text-on-surface">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">timer</span>
            Descanso predeterminado
          </span>
          <span className="flex items-center gap-1 text-body-sm text-on-surface-variant">
            {descansoDefault}s <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </span>
        </button>
        <button onClick={() => setUnidad(u => (u === 'Kilogramos' ? 'Libras' : 'Kilogramos'))} className="w-full flex items-center justify-between p-4 text-left">
          <span className="flex items-center gap-2 text-body-sm text-on-surface">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">scale</span>
            Unidades de peso
          </span>
          <span className="flex items-center gap-1 text-body-sm text-on-surface-variant">
            {unidad} <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </span>
        </button>
        <div className="w-full flex items-center justify-between p-4">
          <span className="flex items-center gap-2 text-body-sm text-on-surface">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">notifications</span>
            Recordatorios diarios
          </span>
          <button
            onClick={() => setRecordatorios(r => !r)}
            className={`w-11 h-6 rounded-full relative transition-colors ${recordatorios ? 'bg-accent' : 'bg-surface-container-highest'}`}
            aria-label="Recordatorios diarios"
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-on-primary transition-transform ${recordatorios ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Ajustes de cuenta */}
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-accent text-[20px]">manage_accounts</span>
        <h2 className="text-body-md font-semibold text-on-surface">Ajustes de Cuenta</h2>
      </div>
      <div className="card divide-y divide-outline-variant mb-8">
        <div className="w-full flex items-center justify-between p-4">
          <span className="flex items-center gap-2 text-body-sm text-on-surface">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">mail</span>
            Correo electrónico
          </span>
          <span className="text-body-sm text-on-surface-variant truncate max-w-[140px]">{user?.email}</span>
        </div>
        <button onClick={cambiarPassword} className="w-full flex items-center justify-between p-4 text-left">
          <span className="flex items-center gap-2 text-body-sm text-on-surface">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">lock</span>
            Seguridad y Contraseña
          </span>
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">chevron_right</span>
        </button>
      </div>

      <button
        onClick={signOut}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg border border-error/40 text-error font-semibold text-body-sm"
      >
        <span className="material-symbols-outlined text-[18px]">logout</span>
        Cerrar Sesión
      </button>

      <p className="text-center text-label-md text-on-surface-variant opacity-50 mt-6">
        FitSync · Hecho para el progreso.
      </p>
    </div>
  )
}
