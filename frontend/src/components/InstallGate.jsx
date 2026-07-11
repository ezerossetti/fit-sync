import { useEffect, useState } from 'react'
import logo from '../assets/logo.png'

const DISMISS_KEY = 'fitsync_install_gate_dismissed'

// Detección de plataforma. iPadOS 13+ se identifica como "Mac" con touch,
// por eso el chequeo extra de maxTouchPoints.
function detectarPlataforma() {
  const ua = navigator.userAgent || ''
  const esIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  const esAndroid = /Android/.test(ua)
  return { esIOS, esAndroid, esMobile: esIOS || esAndroid }
}

function yaEstaInstalada() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

// ---------- Pasos manuales por plataforma (no hay API para forzar instalación) ----------
function PasosIOS() {
  return (
    <ol className="space-y-3 mb-6">
      <li className="flex items-start gap-3">
        <span className="shrink-0 w-6 h-6 rounded-full bg-accent/15 text-accent text-label-md flex items-center justify-center font-semibold">1</span>
        <p className="text-body-sm text-on-surface-variant pt-0.5">
          Tocá el ícono <span className="material-symbols-outlined text-[16px] align-middle text-accent">ios_share</span> <span className="text-on-surface font-medium">Compartir</span> en la barra de Safari (abajo o arriba, según el modelo)
        </p>
      </li>
      <li className="flex items-start gap-3">
        <span className="shrink-0 w-6 h-6 rounded-full bg-accent/15 text-accent text-label-md flex items-center justify-center font-semibold">2</span>
        <p className="text-body-sm text-on-surface-variant pt-0.5">
          Elegí <span className="text-on-surface font-medium">"Agregar a inicio"</span> (puede estar más abajo en la lista)
        </p>
      </li>
      <li className="flex items-start gap-3">
        <span className="shrink-0 w-6 h-6 rounded-full bg-accent/15 text-accent text-label-md flex items-center justify-center font-semibold">3</span>
        <p className="text-body-sm text-on-surface-variant pt-0.5">
          Confirmá tocando <span className="text-on-surface font-medium">"Agregar"</span> arriba a la derecha
        </p>
      </li>
    </ol>
  )
}

function PasosAndroidManual() {
  return (
    <ol className="space-y-3 mb-6">
      <li className="flex items-start gap-3">
        <span className="shrink-0 w-6 h-6 rounded-full bg-accent/15 text-accent text-label-md flex items-center justify-center font-semibold">1</span>
        <p className="text-body-sm text-on-surface-variant pt-0.5">
          Tocá los <span className="text-on-surface font-medium">3 puntos</span> arriba a la derecha de Chrome
        </p>
      </li>
      <li className="flex items-start gap-3">
        <span className="shrink-0 w-6 h-6 rounded-full bg-accent/15 text-accent text-label-md flex items-center justify-center font-semibold">2</span>
        <p className="text-body-sm text-on-surface-variant pt-0.5">
          Elegí <span className="text-on-surface font-medium">"Instalar app"</span> o <span className="text-on-surface font-medium">"Agregar a pantalla de inicio"</span>
        </p>
      </li>
    </ol>
  )
}

export default function InstallGate() {
  const [visible, setVisible] = useState(false)
  const [plataforma, setPlataforma] = useState({ esIOS: false, esAndroid: false, esMobile: false })
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [instalando, setInstalando] = useState(false)

  useEffect(() => {
    const p = detectarPlataforma()
    setPlataforma(p)

    const yaDescartado = localStorage.getItem(DISMISS_KEY) === 'true'
    if (p.esMobile && !yaDescartado && !yaEstaInstalada()) {
      setVisible(true)
    }

    // Android/Chrome: Chrome dispara este evento cuando la PWA cumple los
    // criterios de instalabilidad. Lo interceptamos para poder disparar el
    // prompt nativo desde nuestro propio botón en vez del banner del navegador.
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)

    // Se dispara cuando la instalación se completa (por nuestro botón o por
    // fuera, ej. el usuario usó el menú del navegador directamente).
    const onAppInstalled = () => {
      localStorage.setItem(DISMISS_KEY, 'true')
      setVisible(false)
    }
    window.addEventListener('appinstalled', onAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  const cerrar = () => {
    localStorage.setItem(DISMISS_KEY, 'true')
    setVisible(false)
  }

  const instalarAndroid = async () => {
    if (!deferredPrompt) return
    setInstalando(true)
    try {
      deferredPrompt.prompt()
      await deferredPrompt.userChoice
    } finally {
      setDeferredPrompt(null)
      setInstalando(false)
      // Se descarta el gate tanto si acepta como si cancela el prompt nativo:
      // ya vio la opción, no tiene sentido volver a interrumpirlo cada vez que abre.
      cerrar()
    }
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-margin-mobile py-10 overflow-y-auto">
      <div className="w-full max-w-sm">
        <div className="w-16 h-16 mx-auto mb-4">
          <img src={logo} alt="FitSync" className="w-full h-full object-contain" />
        </div>
        <h1 className="font-display text-headline-lg-mobile text-on-surface text-center mb-2">Instalá FitSync</h1>
        <p className="text-body-sm text-on-surface-variant text-center mb-6">
          Se usa como una app nativa: ícono en tu pantalla de inicio, pantalla completa y funciona sin conexión en el gym.
        </p>

        <div className="card p-5 mb-4">
          {plataforma.esIOS && <PasosIOS />}
          {plataforma.esAndroid && !deferredPrompt && <PasosAndroidManual />}

          {plataforma.esAndroid && deferredPrompt ? (
            <button
              onClick={instalarAndroid}
              disabled={instalando}
              className="btn-primary w-full py-3.5 text-body-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">install_mobile</span>
              {instalando ? 'Instalando...' : 'Instalar FitSync'}
            </button>
          ) : (
            <button onClick={cerrar} className="btn-primary w-full py-3.5 text-body-md">
              Ya la agregué
            </button>
          )}
        </div>

        <button onClick={cerrar} className="w-full py-2 text-label-md text-on-surface-variant/70 text-center">
          Seguir en el navegador por ahora
        </button>
      </div>
    </div>
  )
}
