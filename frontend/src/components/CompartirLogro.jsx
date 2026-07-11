import { useEffect, useRef, useState } from 'react'
import { dibujarTarjetaLogro, esperarFuentes } from '../utils/shareCard'
import { formatFecha } from '../utils/helpers'

// Modal para compartir UN logro puntual desde la grilla de Perfil (no
// depende de que se acabe de desbloquear en la sesión activa: se puede
// abrir para cualquier logro ya conseguido). Sigue el mismo patrón de
// generación/preview/compartir que CompartirResumen, apuntando a
// dibujarTarjetaLogro en vez de dibujarTarjetaResumen.
//
// Se controla con abierto/onCerrar desde afuera (en vez de manejar su
// propio botón trigger como CompartirResumen) porque el trigger acá es un
// ícono sobre cada tile de logro desbloqueado en la grilla, no un botón
// único fijo.
export default function CompartirLogro({ logro, nombreUsuario, abierto, onCerrar }) {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [generando, setGenerando] = useState(false)
  const [error, setError] = useState(null)
  const canvasRef = useRef(null)
  const blobRef = useRef(null)

  const puedeCompartirArchivos = typeof navigator !== 'undefined'
    && typeof navigator.canShare === 'function'
    && typeof navigator.share === 'function'

  const generar = async () => {
    if (!logro) return
    setGenerando(true)
    setError(null)
    try {
      await esperarFuentes()
      const canvas = canvasRef.current
      dibujarTarjetaLogro(canvas, {
        logro,
        nombreUsuario,
        statsContext: logro.fechaDesbloqueo ? `Desbloqueado el ${formatFecha(logro.fechaDesbloqueo)}` : '',
      })
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.95))
      if (!blob) throw new Error('No se pudo generar la imagen')
      blobRef.current = blob
      setPreviewUrl(URL.createObjectURL(blob))
    } catch (e) {
      console.error(e)
      setError('No se pudo generar la tarjeta. Probá de nuevo.')
    } finally {
      setGenerando(false)
    }
  }

  useEffect(() => {
    if (abierto && logro) generar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, logro?.id])

  useEffect(() => {
    // Limpieza si el componente se desmonta con el modal abierto.
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cerrar = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    blobRef.current = null
    onCerrar?.()
  }

  const compartir = async () => {
    if (!blobRef.current || !logro) return
    const file = new File([blobRef.current], `fitsync-logro-${logro.id}.png`, { type: 'image/png' })
    const shareData = {
      files: [file],
      title: `Logro desbloqueado en FitSync: ${logro.titulo}`,
      text: `🏆 ${logro.titulo} — ${logro.descripcion}`,
    }
    try {
      if (puedeCompartirArchivos && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        return
      }
    } catch (e) {
      if (e?.name === 'AbortError') return
    }
    descargar()
  }

  const descargar = () => {
    if (!previewUrl || !logro) return
    const a = document.createElement('a')
    a.href = previewUrl
    a.download = `fitsync-logro-${logro.id}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  if (!abierto) {
    // El canvas offscreen no hace falta montarlo si el modal nunca se abrió.
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      <div className="card w-full max-w-sm p-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-body-md font-semibold text-on-surface">Compartir logro</p>
          <button onClick={cerrar} className="text-on-surface-variant p-1" aria-label="Cerrar">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="rounded-lg overflow-hidden border border-outline-variant bg-surface-container-lowest aspect-[4/5] flex items-center justify-center">
          {generando && (
            <p className="text-label-md text-on-surface-variant">Generando tarjeta…</p>
          )}
          {error && !generando && (
            <p className="text-label-md text-error px-4 text-center">{error}</p>
          )}
          {previewUrl && !generando && !error && (
            <img src={previewUrl} alt={`Tarjeta del logro ${logro?.titulo}`} className="w-full h-full object-contain" />
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={descargar}
            disabled={generando || !previewUrl}
            className="btn-secondary flex-1 py-3 text-body-sm flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Descargar
          </button>
          <button
            onClick={compartir}
            disabled={generando || !previewUrl}
            className="btn-primary flex-1 py-3 text-body-sm flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[18px]">ios_share</span>
            {puedeCompartirArchivos ? 'Compartir' : 'Descargar'}
          </button>
        </div>
      </div>
    </div>
  )
}
