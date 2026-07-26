import { useCallback, useEffect, useState } from 'react'
import sesionesService from '../services/sesiones.service'
import { leerSesionPendiente, borrarSesionPendiente } from '../utils/sesionDraft'

const REINTENTO_MS = 30000 // por si el evento 'online' no dispara (algunos navegadores mobile)

export default function usePendingSessionSync() {
  const [pendiente, setPendiente] = useState(() => leerSesionPendiente())
  const [sincronizando, setSincronizando] = useState(false)
  const [sincronizadoOk, setSincronizadoOk] = useState(false)
  // Rechazo permanente del backend (400/404/422): reintentar para siempre
  // no tiene sentido acá, el payload no va a cambiar solo. Se corta el loop
  // y se le avisa al usuario en vez de girar el spinner sin fin.
  const [errorPermanente, setErrorPermanente] = useState(false)

  const intentarSync = useCallback(async () => {
    const actual = leerSesionPendiente()
    if (!actual) return
    setSincronizando(true)
    try {
      await sesionesService.create(actual.payload)
      borrarSesionPendiente()
      setPendiente(null)
      setErrorPermanente(false)
      setSincronizadoOk(true)
      setTimeout(() => setSincronizadoOk(false), 4000)
    } catch (e) {
      // e.response presente = el backend respondió (llegó la request), no es
      // un problema de conectividad. 401/403 = sesión vencida, hay que
      // reloguearse. 400/404/422 = el payload está mal y nunca va a pasar
      // solo. En esos casos cortamos el reintento automático; el resto
      // (sin e.response = error de red, o 5xx del server) sigue reintentando.
      const status = e?.response?.status
      const esErrorPermanente = status !== undefined && status !== 429 && status < 500
      setErrorPermanente(esErrorPermanente)
    } finally {
      setSincronizando(false)
    }
  }, [])

  useEffect(() => {
    if (!pendiente || errorPermanente) return undefined
    intentarSync()
    window.addEventListener('online', intentarSync)
    const interval = setInterval(intentarSync, REINTENTO_MS)
    return () => {
      window.removeEventListener('online', intentarSync)
      clearInterval(interval)
    }
  }, [pendiente, errorPermanente, intentarSync])

  // Si EntrenamientoActivo guarda una nueva sesión pendiente mientras el
  // banner ya está montado en App.jsx, hay que enterarse sin recargar.
  useEffect(() => {
    const onStorage = () => setPendiente(leerSesionPendiente())
    window.addEventListener('storage', onStorage)
    const interval = setInterval(() => {
      const actual = leerSesionPendiente()
      setPendiente(prev => {
        if (!!prev === !!actual) return prev
        return actual
      })
    }, 3000)
    return () => {
      window.removeEventListener('storage', onStorage)
      clearInterval(interval)
    }
  }, [])

  return { pendiente, sincronizando, sincronizadoOk, errorPermanente, reintentarManual: intentarSync }
}
