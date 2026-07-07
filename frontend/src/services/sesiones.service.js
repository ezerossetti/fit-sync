import apiClient from './apiClient'

const sesionesService = {
  // GET todas las sesiones del usuario logueado
  getAll: async () => {
    const response = await apiClient.get('/sesiones')
    return response.data.data
  },

  // GET una sesión por ID
  getById: async (id) => {
    const response = await apiClient.get(`/sesiones/${id}`)
    return response.data.data
  },

  // POST crear nueva sesión
  create: async (data) => {
    const response = await apiClient.post('/sesiones', data)
    return response.data.data
  },

  // PUT actualizar sesión
  update: async (id, data) => {
    const response = await apiClient.put(`/sesiones/${id}`, data)
    return response.data.data
  },

  // DELETE eliminar sesión
  delete: async (id) => {
    const response = await apiClient.delete(`/sesiones/${id}`)
    return response.data.data
  }
}

export default sesionesService
