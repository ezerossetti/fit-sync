import logo from '../assets/logo.png'

export default function TopBar({ title }) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-margin-mobile bg-surface-container-lowest/95 backdrop-blur border-b border-outline-variant"
      style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(56px + env(safe-area-inset-top))' }}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 overflow-hidden">
          <img src={logo} alt="FitSync" className="w-full h-full object-contain" />
        </div>
        <span className="font-display font-bold text-headline-sm text-on-primary-container tracking-tight leading-none">
          {title || 'FitSync'}
        </span>
      </div>
      <button className="text-on-surface-variant hover:opacity-80 transition-opacity" aria-label="Sincronizado">
        <span className="material-symbols-outlined text-[20px]">cloud_done</span>
      </button>
    </header>
  )
}
