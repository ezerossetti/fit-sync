import { Link, useLocation } from 'react-router-dom'

const TABS = [
  { to: '/', label: 'Inicio', icon: 'home' },
  { to: '/rutinas', label: 'Rutinas', icon: 'checklist' },
  { to: '/entrenar', label: 'Entrenar', icon: 'add_circle', isCta: true },
  { to: '/historial', label: 'Historial', icon: 'history' },
  { to: '/perfil', label: 'Perfil', icon: 'person' },
]

export default function BottomNav() {
  const location = useLocation()
  const isActive = (to) => (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to))

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur border-t border-outline-variant pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-container-max mx-auto flex items-stretch justify-between px-2">
        {TABS.map(({ to, label, icon, isCta }) => {
          const active = isActive(to)
          if (isCta) {
            return (
              <Link key={to} to={to} className="flex flex-col items-center justify-center flex-1 py-1.5 -mt-4">
                <span className="w-14 h-14 rounded-full bg-accent flex items-center justify-center shadow-plate border-4 border-surface-container-lowest">
                  <span className="material-symbols-outlined text-on-accent text-[28px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}>
                    {icon}
                  </span>
                </span>
                <span className="text-label-md mt-1 text-accent">{label}</span>
              </Link>
            )
          }
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center justify-center flex-1 py-2 gap-0.5"
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ color: active ? '#29B0E8' : '#8e909b', fontVariationSettings: active ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400" }}
              >
                {icon}
              </span>
              <span className={`text-label-md ${active ? 'text-accent' : 'text-on-surface-variant'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
