import { useCallback, useEffect, useState } from 'react'
import sesionesService from '../services/sesiones.service'
import { leerSesionPendiente, borrarSesionPendiente } from '../utils/sesionDraft'

const REINTENTO_MS = 30000 // por si el evento 'online' no dispara (algunos navegadores mobile)

export default function usePendingSessionSync() {
  const [pendiente, setPendiente] = useState(() => leerSesionPendiente())
  const [sincronizando, setSincronizando] = useState(false)
  const [sincronizadoOk, setSincronizadoOk] = useState(false)

  const intentarSync = useCallback(async () => {
    const actual = leerSesionPendiente()
    if (!actual) return
    setSincronizando(true)
    try {
      await sesionesService.create(actual.payload)
      borrarSesionPendiente()
      setPendiente(null)
      setSincronizadoOk(true)
      setTimeout(() => setSincronizadoOk(false), 4000)
    } catch (e) {
      // Sigue sin conexión (o el backend rechazó el payload): se reintenta
      // en el próximo evento 'online' o en el próximo intervalo.
    } finally {
      setSincronizando(false)
    }
  }, [])

  useEffect(() => {
    if (!pendiente) return undefined
    intentarSync()
    window.addEventListener('online', intentarSync)
    const interval = setInterval(intentarSync, REINTENTO_MS)
    return () => {
      window.removeEventListener('online', intentarSync)
      clearInterval(interval)
    }
  }, [pendiente, intentarSync])

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

  return { pendiente, sincronizando, sincronizadoOk }
}
