import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import sesionesService from '../services/sesiones.service'
import { STORAGE_EVENT, leerSesionesPendientes, borrarSesionPendiente } from '../utils/sesionDraft'
export default function usePendingSessionSync() {
  const { user } = useAuth()
  const userId = user?.id
  const [cantidad, setCantidad] = useState(0)
  const [sincronizando, setSincronizando] = useState(false)
  const [errorPermanente, setErrorPermanente] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  const lock = useRef(false)
  const owner = useRef(userId)
  owner.current = userId
  const intentarSync = useCallback(async () => {
    if (lock.current || !userId || !navigator.onLine) return
    lock.current = true
    setSincronizando(true)
    setErrorPermanente(false)
    try {
      for (const item of leerSesionesPendientes(userId)) {
        const { data } = await supabase.auth.getSession()
        if (owner.current !== userId || data.session?.user?.id !== userId) break
        await sesionesService.create(item.payload, data.session.access_token)
        borrarSesionPendiente(userId, item.payload.id)
        window.dispatchEvent(new Event('fitsync-session-synced'))
      }
    } catch (error) {
      if (owner.current === userId) setErrorPermanente(!!error.response && error.response.status < 500 && error.response.status !== 429)
    } finally {
      lock.current = false
      if (owner.current === userId) {
        setSincronizando(false)
        setCantidad(leerSesionesPendientes(userId).length)
      }
    }
  }, [userId])
  useEffect(() => {
    setErrorPermanente(false)
    setSincronizando(false)
    const refresh = () => setCantidad(leerSesionesPendientes(userId).length)
    const connection = () => { setOnline(navigator.onLine); refresh() }
    refresh()
    window.addEventListener(STORAGE_EVENT, refresh)
    window.addEventListener('storage', refresh)
    window.addEventListener('online', connection)
    window.addEventListener('offline', connection)
    return () => {
      window.removeEventListener(STORAGE_EVENT, refresh)
      window.removeEventListener('storage', refresh)
      window.removeEventListener('online', connection)
      window.removeEventListener('offline', connection)
    }
  }, [userId])
  useEffect(() => {
    if (!cantidad || !online || errorPermanente) return
    intentarSync()
    const interval = setInterval(intentarSync, 30000)
    return () => clearInterval(interval)
  }, [cantidad, online, errorPermanente, intentarSync])
  return { cantidad, online, sincronizando, errorPermanente, reintentarManual: intentarSync }
}
