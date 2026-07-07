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

  // Análisis de técnica de un ejercicio puntual. contexto: armado con construirContextoTecnica.
  // mensaje: descripción en texto libre de cómo lo sintió el usuario.
  analizarTecnica: async (contexto, mensaje) => {
    const response = await apiClient.post('/coach/analizar-tecnica', { contexto, mensaje })
    return response.data.data
  },

  // Generador de rutina personalizada por IA. contexto: armado con construirContextoGenerarRutina.
  generarRutina: async (contexto) => {
    const response = await apiClient.post('/coach/generar-rutina', { contexto })
    return response.data.data
  },
}

export default coachService
