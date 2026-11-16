export default function PendingSyncBanner({ sync }) {
  if (!sync.cantidad) return null
  return <div className={`sync-banner ${sync.errorPermanente ? 'text-error' : ''}`} role="status">
    <span>{sync.errorPermanente ? 'Tu entrenamiento está en este teléfono. No pudimos subirlo.' : `${sync.cantidad} entrenamiento${sync.cantidad > 1 ? 's' : ''} guardado${sync.cantidad > 1 ? 's' : ''} en este teléfono.`}</span>
    <button onClick={sync.reintentarManual} disabled={sync.sincronizando || !sync.online}>{sync.sincronizando ? 'Enviando…' : 'Reintentar'}</button>
  </div>
}
