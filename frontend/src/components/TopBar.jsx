import { Link } from 'react-router-dom'
import { Activity, CloudOff, RefreshCw, CloudCheck } from 'lucide-react'
export default function TopBar({ sync }) {
  const label = sync.errorPermanente ? 'Revisar guardado' : sync.sincronizando ? 'Guardando' : sync.cantidad ? `${sync.cantidad} pendiente${sync.cantidad > 1 ? 's' : ''}` : !sync.online ? 'Sin conexión' : 'Al día'
  const Icon = sync.sincronizando ? RefreshCw : !sync.online || sync.cantidad ? CloudOff : CloudCheck
  return <header className="app-topbar">
    <Link to="/" className="brand" aria-label="FitSync, inicio"><span className="brand-symbol"><Activity size={23} strokeWidth={2.6} /></span><span>fit<span className="text-accent">sync</span><span className="brand-dot">.</span></span></Link>
    <button onClick={sync.reintentarManual} disabled={sync.sincronizando || !sync.cantidad} className={`sync-status ${sync.errorPermanente ? 'text-error' : ''}`} aria-label={label}>
      <Icon size={15} className={sync.sincronizando ? 'animate-spin' : ''}/><span>{label}</span>
    </button>
  </header>
}
