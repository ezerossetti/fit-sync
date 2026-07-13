import { useEffect, useRef, useState } from 'react'
import { dibujarTarjetaResumen, dibujarStickerResumen, esperarFuentes } from '../utils/shareCard'

// Tarjeta compartible del resumen de sesión (historias de Instagram y
// similares). Renderiza a canvas offscreen, muestra una preview en un modal
// y comparte vía Web Share API (con archivo) si el navegador lo soporta;
// si no, cae a descarga directa del PNG.
//
// Tiene dos modos de generación:
// - 'sticker': PNG transparente salvo un panel compacto abajo (estilo
//   Strava). Pensado para compartir directo a Instagram: el share sheet
//   nativo detecta la transparencia y IG lo coloca como sticker sobre la
//   foto/cámara que el usuario elija en el editor de Historia.
// - 'completa': la tarjeta de siempre, con fondo propio y todos los datos
//   (gráfico semanal, logros, top ejercicios). Para quien prefiere una
//   imagen ya terminada, sin depender de agregarle una foto después.
export default function CompartirResumen({
  rutinaNombre, fecha, volumenTotal, totalSeries, duracionMin, prs, semana,
  calorias, racha, topEjercicios, logrosNuevos,
}) {
  const [abierto, setAbierto] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [generando, setGenerando] = useState(false)
  const [error, setError] = useState(null)
  const [modo, setModo] = useState('sticker')
  const canvasRef = useRef(null)
  const blobRef = useRef(null)

  const datosTarjeta = {
    rutinaNombre, fecha, volumenTotal, totalSeries, duracionMin, prs, semana,
    calorias, racha, topEjercicios, logrosNuevos,
  }

  const puedeCompartirArchivos = typeof navigator !== 'undefined'
    && typeof navigator.canShare === 'function'
    && typeof navigator.share === 'function'

  const generar = async (modoActual = modo) => {
    setGenerando(true)
    setError(null)
    try {
      await esperarFuentes()
      const canvas = canvasRef.current
      if (modoActual === 'sticker') {
        dibujarStickerResumen(canvas, datosTarjeta)
      } else {
        dibujarTarjetaResumen(canvas, datosTarjeta)
      }
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.95))
      if (!blob) throw new Error('No se pudo generar la imagen')
      blobRef.current = blob
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return URL.createObjectURL(blob)
      })
    } catch (e) {
      console.error(e)
      setError('No se pudo generar la tarjeta. Probá de nuevo.')
    } finally {
      setGenerando(false)
    }
  }

  const abrir = async () => {
    // Si no hay forma de compartir archivos, "con tu foto" no tiene sentido
    // como punto de partida: nadie va a poder pegarle una foto atrás, así
    // que arrancamos directo en la tarjeta completa.
    const modoInicial = puedeCompartirArchivos ? 'sticker' : 'completa'
    setModo(modoInicial)
    setAbierto(true)
    await generar(modoInicial)
  }

  const cambiarModo = async (nuevoModo) => {
    if (nuevoModo === modo || generando) return
    setModo(nuevoModo)
    await generar(nuevoModo)
  }

  const cerrar = () => {
    setAbierto(false)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    blobRef.current = null
  }

  useEffect(() => {
    // Limpieza si el componente se desmonta con el modal abierto (p. ej. al
    // navegar a "Volver al inicio" desde el resumen).
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const nombreArchivo = modo === 'sticker' ? 'fitsync-sticker.png' : 'fitsync-resumen.png'

  const compartir = async () => {
    if (!blobRef.current) return
    const file = new File([blobRef.current], nombreArchivo, { type: 'image/png' })
    const shareData = {
      files: [file],
      title: 'Mi sesión en FitSync',
      text: `${rutinaNombre} · ${totalSeries} series · ${volumenTotal} kg de volumen 💪`,
    }
    try {
      if (puedeCompartirArchivos && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        return
      }
    } catch (e) {
      // El usuario canceló el share sheet, o el navegador lo rechazó: no es
      // un error real, simplemente ofrecemos la descarga como alternativa.
      if (e?.name === 'AbortError') return
    }
    descargar()
  }

  const descargar = () => {
    if (!previewUrl) return
    const a = document.createElement('a')
    a.href = previewUrl
    a.download = nombreArchivo
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return (
    <>
      <button
        onClick={abrir}
        className="btn-secondary w-full py-3 text-body-md flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-[18px]">ios_share</span>
        Compartir resumen
      </button>

      {/* Canvas offscreen: siempre montado para poder redibujar sin abrir el modal */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="card w-full max-w-sm p-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="text-body-md font-semibold text-on-surface">Compartir sesión</p>
              <button onClick={cerrar} className="text-on-surface-variant p-1" aria-label="Cerrar">
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Toggle de modo: sticker transparente vs tarjeta completa */}
            <div className="flex gap-1 p-1 rounded-md bg-surface-container-lowest border border-outline-variant mb-3">
              <button
                onClick={() => cambiarModo('sticker')}
                disabled={generando}
                className={`flex-1 py-2 rounded text-body-sm font-semibold transition-colors disabled:opacity-50 ${
                  modo === 'sticker' ? 'bg-accent text-on-accent' : 'text-on-surface-variant'
                }`}
              >
                Con tu foto
              </button>
              <button
                onClick={() => cambiarModo('completa')}
                disabled={generando}
                className={`flex-1 py-2 rounded text-body-sm font-semibold transition-colors disabled:opacity-50 ${
                  modo === 'completa' ? 'bg-accent text-on-accent' : 'text-on-surface-variant'
                }`}
              >
                Tarjeta completa
              </button>
            </div>

            <div
              className="rounded-lg overflow-hidden border border-outline-variant aspect-[9/16] flex items-center justify-center"
              style={modo === 'sticker' ? {
                backgroundImage: 'linear-gradient(45deg, #2a2a2e 25%, transparent 25%), linear-gradient(-45deg, #2a2a2e 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a2a2e 75%), linear-gradient(-45deg, transparent 75%, #2a2a2e 75%)',
                backgroundSize: '24px 24px',
                backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px',
                backgroundColor: '#1b1b1d',
              } : undefined}
            >
              {generando && (
                <p className="text-label-md text-on-surface-variant">Generando tarjeta…</p>
              )}
              {error && !generando && (
                <p className="text-label-md text-error px-4 text-center">{error}</p>
              )}
              {previewUrl && !generando && !error && (
                <img src={previewUrl} alt="Vista previa de la tarjeta de resumen" className="w-full h-full object-contain" />
              )}
            </div>

            {modo === 'sticker' && !generando && (
              <p className="text-label-md text-on-surface-variant text-center mt-2 px-2">
                El cuadriculado es transparencia, no se ve así en Instagram. Elegí Instagram al compartir y vas a poder ponerle una foto o video de fondo antes de acomodar la tarjeta.
              </p>
            )}

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
      )}
    </>
  )
}
