import { NavLink } from 'react-router-dom'
import { House, Dumbbell, ChartNoAxesCombined, UserRound, Play } from 'lucide-react'
const tabs = [ ['/', 'Hoy', House, 'nav-home'], ['/rutinas', 'Rutinas', Dumbbell, 'nav-rutinas'], ['/entrenar', 'Entrenar', Play, 'nav-entrenar'], ['/historial', 'Progreso', ChartNoAxesCombined, 'nav-historial'], ['/perfil', 'Vos', UserRound, 'nav-perfil'] ]
export default function BottomNav() {
  return <nav className="bottom-navigation" aria-label="Navegación principal"><div>{tabs.map(([to, label, Icon, tour]) =>
    <NavLink end={to === '/'} key={to} to={to} data-tour={tour} className={({isActive}) => `nav-item ${isActive ? 'is-active' : ''} ${to === '/entrenar' ? 'nav-train' : ''}`}>
      <span><Icon size={21} strokeWidth={1.8}/></span><small>{label}</small>
    </NavLink>
  )}</div></nav>
}
