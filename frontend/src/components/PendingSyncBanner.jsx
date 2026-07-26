import usePendingSessionSync from '../hooks/usePendingSessionSync'

export default function PendingSyncBanner() {
  const { pendiente, sincronizando, sincronizadoOk, errorPermanente, reintentarManual } = usePendingSessionSync()

  if (sincronizadoOk) {
    return (
      <div
        className="fixed top-0 left-0 right-0 z-50 bg-success text-on-primary text-body-sm text-center py-2 flex items-center justify-center gap-2"
        style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}
      >
        <span className="material-symbols-outlined text-[18px]">cloud_done</span>
        Sesión sincronizada
      </div>
    )
  }

  if (!pendiente) return null

  if (errorPermanente) {
    return (
      <div
        className="fixed top-0 left-0 right-0 z-50 bg-error text-on-primary text-body-sm text-center py-2 flex items-center justify-center gap-2"
        style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}
      >
        <span className="material-symbols-outlined text-[18px]">error</span>
        No se pudo subir la sesión guardada.
        <button onClick={reintentarManual} className="underline font-medium">
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-accent text-on-primary text-body-sm text-center py-2 flex items-center justify-center gap-2"
      style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}
    >
      <span className={`material-symbols-outlined text-[18px] ${sincronizando ? 'animate-spin' : ''}`}>
        {sincronizando ? 'progress_activity' : 'cloud_off'}
      </span>
      {sincronizando ? 'Sincronizando sesión guardada sin conexión...' : 'Tenés una sesión sin subir. Se sube sola cuando vuelve la señal.'}
    </div>
  )
}
