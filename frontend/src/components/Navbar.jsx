import { Link, useLocation } from 'react-router-dom'
import { Calendar, Users, Dumbbell } from 'lucide-react'
import logo from '../assets/logo.png'

const F = "'Lexend', sans-serif"

export default function Navbar() {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  const links = [
    { to: '/sesiones', label: 'Sesiones', icon: Calendar },
    { to: '/rutinas', label: 'Rutinas', icon: Dumbbell },
    { to: '/usuarios', label: 'Usuarios', icon: Users },
  ]

  return (
    <header style={{
      backgroundColor: '#0D0F0D',
      borderBottom: '1px solid rgba(41,176,232,0.15)',
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', height: '56px', fontFamily: F
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img src={logo} alt="FitSync" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
        <span style={{ fontFamily: F, fontSize: '20px', fontWeight: '700', color: '#b1c5ff', letterSpacing: '-0.01em' }}>
          FitSync
        </span>
      </div>

      <nav style={{ display: 'flex', gap: '4px' }}>
        {links.map(({ to, label, icon: Icon }) => {
          const active = isActive(to)
          return (
            <Link key={to} to={to} style={{
              fontFamily: F, fontSize: '14px', fontWeight: active ? '600' : '400',
              color: active ? '#7ad0ff' : '#c4c6d2',
              textDecoration: 'none', padding: '6px 14px', borderRadius: '9999px',
              backgroundColor: active ? 'rgba(41,176,232,0.12)' : 'transparent',
              borderBottom: active ? '2px solid #29b0e8' : '2px solid transparent',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <Icon size={14} />
              {label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
