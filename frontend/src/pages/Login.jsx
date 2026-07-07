import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [modo, setModo] = useState('login') // login | registro
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [avisoConfirmacion, setAvisoConfirmacion] = useState(false)

  const esRegistro = modo === 'registro'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setAvisoConfirmacion(false)
    setCargando(true)
    try {
      if (esRegistro) {
        const data = await signUp({ nombre, email, password })
        if (!data.session) {
          // Si el proyecto de Supabase tiene confirmación de email activada,
          // acá no hay sesión todavía: hay que confirmar el mail primero.
          setAvisoConfirmacion(true)
        }
      } else {
        await signIn({ email, password })
      }
    } catch (err) {
      setError(traducirError(err.message))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-margin-mobile py-10 md:px-margin-desktop">
      {/* Blobs atmosféricos de fondo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[380px] h-[380px] rounded-full bg-primary-container opacity-30 blur-[110px]" />
        <div className="absolute -bottom-24 -left-24 w-[340px] h-[340px] rounded-full bg-accent/20 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-4xl md:grid md:grid-cols-2 md:rounded-xl md:overflow-hidden md:border md:border-outline-variant md:shadow-plate">
        {/* Panel de branding — solo desktop */}
        <div className="hidden md:flex flex-col justify-between bg-surface-container-low p-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle, rgba(41,176,232,0.12) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="relative flex items-center gap-2">
            <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-accent text-[20px] leading-none">bolt</span>
            </div>
            <span className="font-display font-bold text-headline-sm text-on-surface tracking-tight">FitSync</span>
          </div>
          <div className="relative">
            <h2 className="font-display text-headline-lg text-on-surface leading-tight mb-3">
              Tu progreso,<br />siempre a mano.
            </h2>
            <p className="text-body-md text-on-surface-variant max-w-sm">
              Cargá tus series con botones, sin tipear. FitSync recuerda tu última sesión para que nunca pierdas el hilo de tu fuerza.
            </p>
          </div>
          <p className="relative text-label-md text-on-surface-variant opacity-60">FitSync · Tu fuerza, en datos.</p>
        </div>

        {/* Panel del formulario */}
        <div className="w-full bg-surface-container-lowest md:bg-surface-container-low/40 rounded-xl md:rounded-none border border-outline-variant md:border-0 p-6 md:p-10 backdrop-blur">
          {/* Logo — solo mobile, en desktop ya está en el panel de branding */}
          <div className="flex md:hidden flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shadow-plate mb-3">
              <span className="material-symbols-outlined text-accent text-[28px]">bolt</span>
            </div>
            <h1 className="font-display text-headline-lg-mobile text-on-surface">FitSync</h1>
            <p className="text-label-md text-accent tracking-widest mt-1 uppercase">Tu fuerza, en datos.</p>
          </div>

          <h2 className="hidden md:block font-display text-headline-md text-on-surface mb-1">
            {esRegistro ? 'Creá tu cuenta' : 'Bienvenido de nuevo'}
          </h2>
          <p className="hidden md:block text-body-sm text-on-surface-variant mb-6">
            {esRegistro ? 'Empezá a registrar tu progreso hoy.' : 'Iniciá sesión para ver tu progreso.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {esRegistro && (
              <input
                className="input-field"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                autoComplete="name"
              />
            )}

            <input
              className="input-field"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <div className="relative">
              <input
                className="input-field pr-11"
                type={verPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={esRegistro ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setVerPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {verPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            {error && (
              <p className="text-body-sm text-error flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                {error}
              </p>
            )}

            {avisoConfirmacion && (
              <p className="text-body-sm text-success flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[18px] shrink-0">mail</span>
                Te mandamos un email para confirmar tu cuenta. Confirmalo y volvé a iniciar sesión.
              </p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="btn-interact w-full bg-primary hover:opacity-90 text-on-primary font-semibold text-body-md py-3.5 rounded-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {cargando ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
              ) : (
                <>
                  <span>{esRegistro ? 'Crear cuenta' : 'Iniciar sesión'}</span>
                  <span className="material-symbols-outlined text-[20px]">
                    {esRegistro ? 'person_add' : 'login'}
                  </span>
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 py-6">
            <div className="h-px flex-grow bg-outline-variant/40" />
            <span className="text-label-md text-on-surface-variant uppercase tracking-widest">o</span>
            <div className="h-px flex-grow bg-outline-variant/40" />
          </div>

          <button
            type="button"
            onClick={() => { setModo(esRegistro ? 'login' : 'registro'); setError(null); setAvisoConfirmacion(false) }}
            className="w-full text-center text-body-sm text-on-surface-variant"
          >
            {esRegistro ? (
              <>¿Ya tenés cuenta? <span className="text-accent font-semibold">Iniciá sesión</span></>
            ) : (
              <>¿Todavía no tenés cuenta? <span className="text-accent font-semibold">Registrate</span></>
            )}
          </button>

          <p className="text-label-md text-on-surface-variant text-center opacity-50 mt-8">
            Al continuar, aceptás nuestros Términos de Servicio y Política de Privacidad.
          </p>
        </div>
      </div>
    </div>
  )
}

function traducirError(msg = '') {
  const m = msg.toLowerCase()
  if (m.includes('invalid login credentials')) return 'Email o contraseña incorrectos.'
  if (m.includes('user already registered') || m.includes('already registered')) return 'Ya existe una cuenta con ese email.'
  if (m.includes('password should be at least')) return 'La contraseña tiene que tener al menos 6 caracteres.'
  if (m.includes('email not confirmed')) return 'Todavía no confirmaste tu email. Revisá tu bandeja de entrada.'
  return msg || 'Algo salió mal. Probá de nuevo.'
}
