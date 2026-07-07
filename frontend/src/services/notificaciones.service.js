import apiClient from './apiClient'

const notificacionesService = {
  getVapidPublicKey: async () => {
    const response = await apiClient.get('/notificaciones/vapid-public-key')
    return response.data.publicKey
  },

  suscribir: async (subscription) => {
    const response = await apiClient.post('/notificaciones/suscribir', subscription)
    return response.data.data
  },

  desuscribir: async (endpoint) => {
    const response = await apiClient.post('/notificaciones/desuscribir', { endpoint })
    return response.data
  },
}

export default notificacionesService
