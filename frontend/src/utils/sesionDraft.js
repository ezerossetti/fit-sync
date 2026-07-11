// Utilidades de persistencia local para EntrenamientoActivo.jsx
//
// Dos cosas distintas se guardan acá, con claves separadas:
//
// 1. BORRADOR (draft): la sesión en curso, mientras se está entrenando.
//    Se pisa en cada serie guardada. Sirve para "Retomar sesión" si se
//    cierra la pestaña, se queda sin batería, etc. Expira solo (12hs).
//
// 2. PENDIENTE (pending): una sesión ya TERMINADA (el usuario tocó
//    "Finalizar sesión") pero que no se pudo subir al backend por falta
//    de conexión. Se reintenta subir sola cuando vuelve la señal.

const DRAFT_KEY = 'fitsync_sesion_draft'
const DRAFT_MAX_AGE_MS = 12 * 60 * 60 * 1000 // 12hs: pasado esto, se descarta solo por viejo

const PENDING_KEY = 'fitsync_sesion_pendiente'

// ---------- Borrador de sesión en curso ----------

export function guardarBorrador(data) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, guardadoEn: Date.now() }))
  } catch (e) {
    console.error('No se pudo guardar el borrador de sesión', e)
  }
}

export function leerBorrador() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data?.guardadoEn || Date.now() - data.guardadoEn > DRAFT_MAX_AGE_MS) {
      borrarBorrador()
      return null
    }
    return data
  } catch (e) {
    console.error('No se pudo leer el borrador de sesión', e)
    return null
  }
}

export function borrarBorrador() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch (e) {
    console.error('No se pudo borrar el borrador de sesión', e)
  }
}

// ---------- Sesión terminada pendiente de sincronizar ----------

export function guardarSesionPendiente(payload) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify({ payload, guardadoEn: Date.now() }))
  } catch (e) {
    console.error('No se pudo guardar la sesión pendiente de sync', e)
  }
}

export function leerSesionPendiente() {
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    console.error('No se pudo leer la sesión pendiente de sync', e)
    return null
  }
}

export function borrarSesionPendiente() {
  try {
    localStorage.removeItem(PENDING_KEY)
  } catch (e) {
    console.error('No se pudo borrar la sesión pendiente de sync', e)
  }
}
