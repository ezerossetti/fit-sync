import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import usuarioService from '../services/usuario.service'
import sesionesService from '../services/sesiones.service'
import ejerciciosPersonalizadosService from '../services/ejerciciosPersonalizados.service'
import { pushNotifications } from '../utils/pushNotifications'
import {
  calcularRachaDetalle, volumenTotalHistorico, sesionesCompletadas,
  horasActivasTotales, recordsPersonalesTotal, nivelPorSesiones, formatKg, formatTimer
} from '../utils/helpers'

const PRESETS_DESCANSO = [30, 60, 90, 120, 180]

export default function Perfil() {
  const { user, signOut } = useAuth()
  const [perfil, setPerfil] = useState(null)
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)
  const [editandoNombre, setEditandoNombre] = useState(false)
  const [nombreForm, setNombreForm] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Preferencias — ahora persisten en usuarios.preferencias (jsonb) vía /usuario/me
  const [descansoDefault, setDescansoDefault] = useState(90)
  const [descansoInput, setDescansoInput] = useState('90')
  const [unidad, setUnidad] = useState('Kilogramos')
  const [pesoCorporalKg, setPesoCorporalKg] = useState(75)
  const [pesoCorporalInput, setPesoCorporalInput] = useState('75')
  const [prefsListas, setPrefsListas] = useState(false)

  // Notificaciones push (chequeo de inactividad)
  const [notifSoportado, setNotifSoportado] = useState(false)
  const [notifActivas, setNotifActivas] = useState(false)
  const [notifCargando, setNotifCargando] = useState(false)
  const [notifError, setNotifError] = useState(null)

  // Ejercicios personalizados persistentes
  const [ejerciciosPersonalizados, setEjerciciosPersonalizados] = useState([])
  const [cargandoPersonalizados, setCargandoPersonalizados] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const [p, s, ep] = await Promise.all([
          usuarioService.getMe().catch(() => null),
          sesionesService.getAll().catch(() => []),
          ejerciciosPersonalizadosService.getAll().catch(() => []),
        ])
        setPerfil(p)
        setNombreForm(p?.nombre || '')
        setHistorial(s || [])
        setEjerciciosPersonalizados(ep || [])
        if (p?.preferencias) {
          const d = p.preferencias.descansoDefault ?? 90
          setDescansoDefault(d)
          setDescansoInput(String(d))
          setUnidad(p.preferencias.unidad ?? 'Kilogramos')
          const peso = Number(p.preferencias.pesoCorporalKg) || 75
          setPesoCorporalKg(peso)
          setPesoCorporalInput(String(peso))
        }
      } finally {
        setLoading(false)
        setCargandoPersonalizados(false)
        setPrefsListas(true) // evita guardar de vuelta los valores por defecto antes de cargar los reales
      }
    })()

    setNotifSoportado(pushNotifications.esSoportado())
    pushNotifications.getSuscripcionActual()
      .then((sub) => setNotifActivas(!!sub))
      .catch(() => setNotifActivas(false))
  }, [])

  // Guarda las preferencias en el backend cada vez que cambian (después de la carga inicial)
  useEffect(() => {
    if (!prefsListas) return
    usuarioService.updateMe({
      preferencias: { descansoDefault, unidad, pesoCorporalKg }
    }).catch(err => console.error('No se pudieron guardar las preferencias:', err))
  }, [descansoDefault, unidad, pesoCorporalKg, prefsListas])

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

  // Descanso configurable sin límite: el usuario puede tipear cualquier valor
  // (en segundos). Los presets son solo atajos rápidos, no un tope.
  const aplicarDescanso = (segundos) => {
    const val = Math.max(0, Math.round(Number(segundos) || 0))
    setDescansoDefault(val)
    setDescansoInput(String(val))
  }

  const onDescansoInputChange = (e) => {
    const val = e.target.value
    if (val === '' || /^[0-9]+$/.test(val)) setDescansoInput(val)
  }

  const confirmarDescansoInput = () => {
    const val = descansoInput === '' ? 0 : parseInt(descansoInput, 10)
    aplicarDescanso(val)
  }

  const onPesoCorporalInputChange = (e) => {
    const val = e.target.value
    if (val === '' || /^[0-9]+$/.test(val)) setPesoCorporalInput(val)
  }

  const confirmarPesoCorporalInput = () => {
    const val = Math.max(30, Math.round(Number(pesoCorporalInput) || 75))
    setPesoCorporalKg(val)
    setPesoCorporalInput(String(val))
  }

  const toggleNotificaciones = async () => {
    setNotifError(null)
    setNotifCargando(true)
    try {
      if (notifActivas) {
        await pushNotifications.desactivar()
        setNotifActivas(false)
      } else {
        await pushNotifications.activar()
        setNotifActivas(true)
      }
    } catch (err) {
      console.error(err)
      setNotifError(err.message || 'No se pudo cambiar el estado de las notificaciones.')
    } finally {
      setNotifCargando(false)
    }
  }

  const eliminarEjercicioPersonalizado = async (id) => {
    if (!confirm('¿Eliminar este ejercicio personalizado?')) return
    try {
      await ejerciciosPersonalizadosService.delete(id)
      setEjerciciosPersonalizados(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      console.error(err)
      alert('No se pudo eliminar el ejercicio personalizado.')
    }
  }

  const nombre = perfil?.nombre || user?.user_metadata?.nombre || 'Deportista'
  const inicial = nombre?.[0]?.toUpperCase() || '?'

  const { racha, huboGracia } = calcularRachaDetalle(historial)
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
              {huboGracia && (
                <span title="Tenés un día de gracia usado en esta racha" className="material-symbols-outlined text-[13px] ml-0.5">shield</span>
              )}
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
      <div className="card mb-6">
        <div className="p-4 border-b border-outline-variant">
          <span className="flex items-center gap-2 text-body-sm text-on-surface mb-3">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">timer</span>
            Descanso predeterminado
          </span>

          <div className="flex items-center gap-3 mb-3">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={5}
              className="input-field w-24 text-center font-mono"
              value={descansoInput}
              onChange={onDescansoInputChange}
              onBlur={confirmarDescansoInput}
              onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget.blur())}
              aria-label="Segundos de descanso"
            />
            <span className="text-body-sm text-on-surface-variant">segundos</span>
            <span className="font-mono text-body-md text-accent ml-auto">{formatTimer(descansoDefault)}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESETS_DESCANSO.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => aplicarDescanso(s)}
                className={`px-3 py-1 rounded-full text-label-md border ${descansoDefault === s ? 'bg-accent/15 border-accent text-accent' : 'border-outline-variant text-on-surface-variant'}`}
              >
                {s < 60 ? `${s}s` : `${Math.round(s / 60)} min`}
              </button>
            ))}
          </div>
          <p className="text-label-md text-on-surface-variant mt-2">
            Sin límite: escribí el valor exacto que quieras (ej: 45, 75, 240...).
          </p>
        </div>
        <button onClick={() => setUnidad(u => (u === 'Kilogramos' ? 'Libras' : 'Kilogramos'))} className="w-full flex items-center justify-between p-4 text-left border-b border-outline-variant">
          <span className="flex items-center gap-2 text-body-sm text-on-surface">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">scale</span>
            Unidades de peso
          </span>
          <span className="flex items-center gap-1 text-body-sm text-on-surface-variant">
            {unidad} <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </span>
        </button>
        <div className="p-4">
          <span className="flex items-center gap-2 text-body-sm text-on-surface mb-3">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">monitor_weight</span>
            Peso corporal
          </span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              inputMode="numeric"
              min={30}
              className="input-field w-24 text-center font-mono"
              value={pesoCorporalInput}
              onChange={onPesoCorporalInputChange}
              onBlur={confirmarPesoCorporalInput}
              onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget.blur())}
              aria-label="Peso corporal en kg"
            />
            <span className="text-body-sm text-on-surface-variant">kg</span>
          </div>
          <p className="text-label-md text-on-surface-variant mt-2">
            Se usa para estimar calorías quemadas en tus sesiones (aproximado, no es un dato médico).
          </p>
        </div>
      </div>

      {/* Notificaciones */}
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-accent text-[20px]">notifications</span>
        <h2 className="text-body-md font-semibold text-on-surface">Notificaciones</h2>
      </div>
      <div className="card mb-6 p-4">
        {!notifSoportado ? (
          <p className="text-body-sm text-on-surface-variant">
            Tu navegador no soporta notificaciones push. En iPhone, agregá FitSync a la pantalla de inicio primero (Safari no permite push en una pestaña normal).
          </p>
        ) : (
          <>
            <button
              onClick={toggleNotificaciones}
              disabled={notifCargando}
              className="w-full flex items-center justify-between text-left disabled:opacity-60"
            >
              <span className="flex items-center gap-2 text-body-sm text-on-surface">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                  {notifActivas ? 'notifications_active' : 'notifications_off'}
                </span>
                Avisos si pasan varios días sin entrenar
              </span>
              <span
                className={`w-11 h-6 rounded-full relative transition-colors ${notifActivas ? 'bg-accent' : 'bg-surface-container-high'}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${notifActivas ? 'translate-x-5' : 'translate-x-0.5'}`}
                />
              </span>
            </button>
            {notifError && <p className="text-body-sm text-error mt-2">{notifError}</p>}
          </>
        )}
      </div>

      {/* Ejercicios personalizados */}
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-accent text-[20px]">fitness_center</span>
        <h2 className="text-body-md font-semibold text-on-surface">Mis Ejercicios Personalizados</h2>
      </div>
      <div className="card mb-6 overflow-hidden">
        {cargandoPersonalizados ? (
          <p className="text-body-sm text-on-surface-variant p-4">Cargando...</p>
        ) : ejerciciosPersonalizados.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant p-4">
            Todavía no creaste ningún ejercicio propio. Podés hacerlo desde el buscador al armar una rutina.
          </p>
        ) : (
          <div className="divide-y divide-outline-variant">
            {ejerciciosPersonalizados.map(ej => (
              <div key={ej.id} className="flex items-center justify-between p-4">
                <div className="min-w-0">
                  <p className="text-body-sm font-semibold text-on-surface truncate">{ej.nombre}</p>
                  <p className="text-label-md text-on-surface-variant truncate">{ej.grupo}</p>
                </div>
                <button
                  onClick={() => eliminarEjercicioPersonalizado(ej.id)}
                  className="w-8 h-8 rounded-md bg-error-container/40 text-error flex items-center justify-center shrink-0 ml-3"
                  aria-label={`Eliminar ${ej.nombre}`}
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
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
