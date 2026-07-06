export default function TopBar({ title }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-margin-mobile bg-surface-container-lowest/95 backdrop-blur border-b border-outline-variant">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-accent text-[18px] leading-none">bolt</span>
        </div>
        <span className="font-display font-bold text-headline-sm text-on-primary-container tracking-tight">
          {title || 'FitSync'}
        </span>
      </div>
      <button className="text-on-surface-variant hover:opacity-80 transition-opacity" aria-label="Sincronizado">
        <span className="material-symbols-outlined text-[20px]">cloud_done</span>
      </button>
    </header>
  )
}
