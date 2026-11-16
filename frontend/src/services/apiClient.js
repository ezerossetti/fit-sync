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
  return response
}, async error => {
  if (!error.response && canCache(error.config)) {
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
