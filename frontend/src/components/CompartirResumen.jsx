import { useEffect, useRef, useState } from 'react'
import { Share2, X, ImagePlus, Download } from 'lucide-react'
import { dibujarTarjetaResumen, dibujarStickerResumen, esperarFuentes } from '../utils/shareCard'

export default function CompartirResumen(datos) {
  const dialog = useRef(null), opener = useRef(null), generation = useRef(0), photo = useRef(null)
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [error, setError] = useState('')
  const [withPhoto, setWithPhoto] = useState(false)
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])
  useEffect(() => () => { generation.current++; photo.current?.close?.() }, [])
  async function generate(image = null) {
    const id = ++generation.current
    setBusy(true); setFile(null); setError('')
    try {
      await Promise.race([esperarFuentes(), new Promise(resolve => setTimeout(resolve, 2500))])
      const canvas = document.createElement('canvas')
      if (image) {
        const sticker = document.createElement('canvas')
        dibujarStickerResumen(sticker, datos)
        canvas.width = 1080; canvas.height = 1920
        const ctx = canvas.getContext('2d')
        const scale = Math.max(canvas.width / image.width, canvas.height / image.height)
        ctx.drawImage(image, (canvas.width-image.width*scale)/2, (canvas.height-image.height*scale)/2, image.width*scale, image.height*scale)
        ctx.drawImage(sticker, 0, 0, canvas.width, canvas.height)
      } else dibujarTarjetaResumen(canvas, datos)
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('No se pudo generar la imagen')
      if (id !== generation.current) return
      setFile(new File([blob], 'fitsync-entrenamiento.png', { type: 'image/png' }))
      setPreview(URL.createObjectURL(blob)); setWithPhoto(Boolean(image))
    } catch {
      if (id === generation.current) setError('No pudimos preparar la imagen. Probá con otra foto o con la tarjeta.')
    } finally { if (id === generation.current) setBusy(false) }
  }
  function open() { dialog.current.showModal(); generate(photo.current) }
  function close() { generation.current++; setBusy(false); dialog.current.close(); opener.current?.focus() }
  async function selectPhoto(event) {
    const selected = event.target.files?.[0]; event.target.value = ''
    if (!selected) return
    if (selected.size > 25 * 1024 * 1024) { setError('Elegí una foto de menos de 25 MB.'); return }
    setBusy(true)
    const id = ++generation.current
    try {
      const bitmap = await createImageBitmap(selected)
      if (id !== generation.current) { bitmap.close(); return }
      photo.current?.close?.(); photo.current = bitmap
      await generate(bitmap)
    } catch { if (id === generation.current) { setError('No pudimos abrir esa foto. Probá con una imagen JPG o PNG.'); setBusy(false) } }
  }
  function download() {
    if (!preview || !file) return
    const a = document.createElement('a'); a.href = preview; a.download = file.name; a.click()
    setError('Si se guardó en Archivos, abrí la imagen y elegí Compartir → Guardar imagen. Después podés elegirla en una historia de Instagram.')
  }
  async function share() {
    if (!file || sharing) return
    const data = { files: [file] }
    if (!navigator.share || !navigator.canShare?.(data)) { download(); return }
    setSharing(true); setError('')
    try { await navigator.share(data) }
    catch (e) { if (e.name !== 'AbortError') setError('No se pudo abrir Compartir. Podés guardar la imagen y subirla desde Instagram.') }
    finally { setSharing(false) }
  }
  return <>
    <button ref={opener} onClick={open} className="btn-secondary w-full share-trigger"><Share2 size={20}/>Compartir resumen</button>
    <dialog ref={dialog} className="share-sheet" aria-labelledby="share-title" onCancel={close} onClick={e => { if (e.target === dialog.current) close() }}>
      <div className="sheet-handle"/>
      <header><div><p>HECHO POR VOS</p><h2 id="share-title">Tu entrenamiento.</h2></div><button autoFocus className="toolbar-button" aria-label="Cerrar compartir" onClick={close}><X size={21}/></button></header>
      <div className="share-body">
        <div className="share-preview" aria-busy={busy}>{preview && !busy ? <img src={preview} alt="Historia con el resumen de tu entrenamiento"/> : <p>{busy ? 'Preparando tu historia…' : 'Elegí un formato para continuar'}</p>}</div>
        <div className="share-options"><label className={`photo-picker ${busy ? 'is-disabled' : ''}`}><ImagePlus size={19}/>{withPhoto ? 'Cambiar foto' : 'Agregar mi foto'}<input type="file" accept="image/*" onChange={selectPhoto} disabled={busy} aria-label="Agregar mi foto"/></label><button onClick={() => { photo.current?.close?.(); photo.current = null; generate(null) }} disabled={busy} aria-pressed={!withPhoto}>Solo tarjeta</button></div>
        <p className="share-hint">Lista para historias · 9:16. Tu foto se procesa en este dispositivo.</p>
        <p className="share-hint">En Compartir, elegí Instagram si aparece. También podés guardar la imagen y seleccionarla al crear tu historia.</p>
        {error && <p className="share-notice" role="status">{error}</p>}
      </div>
      <footer><button onClick={download} disabled={busy || !file || sharing} className="btn-secondary" aria-label="Guardar imagen"><Download size={20}/></button><button onClick={share} disabled={busy || !file || sharing} className="btn-primary"><Share2 size={20}/>{sharing ? 'Compartiendo…' : 'Compartir imagen'}</button></footer>
    </dialog>
  </>
}
