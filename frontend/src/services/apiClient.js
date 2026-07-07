import axios from 'axios'
import { supabase } from '../lib/supabaseClient'

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Antes de cada request, le pega el JWT de la sesión activa de Supabase.
// El backend lo valida y a partir de ahí sabe qué usuario está pidiendo qué.
apiClient.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default apiClient
