export const STORAGE_EVENT = 'fitsync-workouts-changed'
const prefix = (userId) => {
  if (!userId) throw new Error('Necesitás iniciar sesión para guardar el entrenamiento.')
  return `fitsync:v2:${userId}:`
}
const notify = () => { if (typeof window !== 'undefined') window.dispatchEvent(new Event(STORAGE_EVENT)) }
const read = (key) => { try { return JSON.parse(localStorage.getItem(key)) } catch { return null } }
export function guardarBorrador(data, userId) {
  localStorage.setItem(`${prefix(userId)}draft`, JSON.stringify({ ...data, usuarioId: userId, guardadoEn: Date.now() }))
  notify()
}
export function leerBorrador(userId) { return userId ? read(`${prefix(userId)}draft`) : null }
export function borrarBorrador(userId, sessionId) {
  const current = leerBorrador(userId)
  if (!sessionId || current?.sessionId === sessionId) localStorage.removeItem(`${prefix(userId)}draft`)
  notify()
}
export function guardarSesionPendiente(payload, userId) {
  if (!payload.id) throw new Error('La sesión necesita un identificador antes de guardarse.')
  localStorage.setItem(`${prefix(userId)}pending:${payload.id}`, JSON.stringify({ payload, usuarioId: userId, guardadoEn: Date.now() }))
  notify()
}
export function leerSesionesPendientes(userId) {
  if (!userId) return []
  const start = `${prefix(userId)}pending:`
  return Object.keys(localStorage).filter(k => k.startsWith(start)).map(read)
    .filter(x => x?.usuarioId === userId && x?.payload?.id).sort((a, b) => a.guardadoEn - b.guardadoEn)
}
export function borrarSesionPendiente(userId, id) {
  localStorage.removeItem(`${prefix(userId)}pending:${id}`)
  borrarBorrador(userId, id)
  notify()
}
export function hayDatosAnteriores() { return !!(read('fitsync_sesion_draft') || read('fitsync_sesion_pendiente')) }
// Legacy records had no owner. Recovery requires explicit user confirmation.
export function recuperarDatosAnteriores(userId) {
  const pending = read('fitsync_sesion_pendiente')
  const draft = read('fitsync_sesion_draft')
  if (pending?.payload) {
    guardarSesionPendiente({ ...pending.payload, id: pending.payload.id || crypto.randomUUID() }, userId)
    localStorage.removeItem('fitsync_sesion_pendiente')
    localStorage.removeItem('fitsync_sesion_draft')
  } else if (draft) {
    guardarBorrador({ ...draft, sessionId: draft.sessionId || crypto.randomUUID() }, userId)
    localStorage.removeItem('fitsync_sesion_draft')
  }
}
