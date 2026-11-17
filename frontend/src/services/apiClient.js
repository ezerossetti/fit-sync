import axios from 'axios'
import { supabase } from '../lib/supabaseClient'

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Antes de cada request, le pega el JWT de la sesión activa de Supabase.
// El backend lo valida y a partir de ahí sabe qué usuario está pidiendo qué.
apiClient.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  config.ownerId = data?.session?.user?.id
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const canCache = (config) => config?.method === 'get' && config.ownerId && /^\/(rutinas|sesiones|usuario\/me|ejercicios-personalizados)$/.test(config.url)
const cacheKey = config => `fitsync:api:${config.ownerId}:${config.url}`
apiClient.interceptors.response.use(response => {
  if (canCache(response.config)) {
    try { localStorage.setItem(cacheKey(response.config), JSON.stringify(response.data)) } catch { /* A cache failure must not fail a successful API request. */ }
  }
  // Keep the offline list consistent with confirmed edits/deletes and routine order.
  const config = response.config
  const collection = config.url?.match(/^\/(sesiones|rutinas)(?:\/([^/]+))?$/)
  if (config.ownerId && collection && ['post','put','delete'].includes(config.method)) {
    try {
      const key = `fitsync:api:${config.ownerId}:/${collection[1]}`
      const cached = JSON.parse(localStorage.getItem(key) || 'null')
      if (Array.isArray(cached?.data)) {
        const record = response.data.data
        if (collection[2] === 'orden' && Array.isArray(record)) cached.data.sort((a,b) => record.indexOf(a.id)-record.indexOf(b.id))
        else if (config.method === 'delete') cached.data = cached.data.filter(row => row.id !== collection[2])
        else if (record?.id) cached.data = [...cached.data.filter(row => row.id !== record.id), record]
        cached.count = cached.data.length
        localStorage.setItem(key, JSON.stringify(cached))
      }
    } catch { /* A cache failure cannot undo a confirmed server update. */ }
  }
  return response
}, async error => {
  if (!error.response && !error.config?.requireFresh && canCache(error.config)) {
    const { data } = await supabase.auth.getSession()
    if (data.session?.user?.id === error.config.ownerId) {
      try {
        const cached = localStorage.getItem(cacheKey(error.config))
        if (cached) return { data: JSON.parse(cached), config: error.config, fromCache: true }
      } catch { /* Preserve the original network error. */ }
    }
  }
  return Promise.reject(error)
})
export default apiClient
