import apiClient from './apiClient'

const coachService = {
  // Chat libre. contexto: objeto armado con contextoCoach.js
  chat: async (mensaje, contexto) => {
    const response = await apiClient.post('/coach/chat', { mensaje, contexto })
    return response.data.data
  },

  // Historial de chat guardado (para pintar la conversación al abrir el widget)
  getHistorial: async () => {
    const response = await apiClient.get('/coach/historial')
    return response.data.data
  },

  // Comentario automático post-sesión
  comentarioSesion: async (contexto) => {
    const response = await apiClient.post('/coach/comentario-sesion', { contexto })
    return response.data.data
  },

  // Resumen semanal o mensual (con cache en el backend)
  resumen: async ({ tipo, periodoInicio, periodoFin, contexto, forzarRegenerar = false }) => {
    const response = await apiClient.post('/coach/resumen', {
      tipo, periodoInicio, periodoFin, contexto, forzarRegenerar,
    })
    return response.data.data
  },

  // Sugerencia de ejercicios nuevos
  sugerirEjercicios: async (contexto) => {
    const response = await apiClient.post('/coach/sugerir-ejercicios', { contexto })
    return response.data.data
  },
}

export default coachService
