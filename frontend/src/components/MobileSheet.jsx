import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
export default function MobileSheet({title,onClose,children,busy=false}) {
 const ref=useRef(null)
 useEffect(()=>{const previous=document.activeElement;ref.current.showModal();return()=>{previous?.focus()}},[])
 return <dialog ref={ref} className="mobile-sheet" aria-label={title} onCancel={e=>{e.preventDefault();if(!busy)onClose()}}><div className="sheet-handle"/><header><h2>{title}</h2><button autoFocus className="toolbar-button" aria-label="Cerrar" disabled={busy} onClick={onClose}><X size={20}/></button></header>{children}</dialog>
}
