import apiClient from './apiClient'

const rutinasService = {
  // GET todas las rutinas del usuario logueado
  getAll: async () => {
    const response = await apiClient.get('/rutinas')
    return response.data.data
  },

  // GET una rutina por ID
  getById: async (id) => {
    const response = await apiClient.get(`/rutinas/${id}`)
    return response.data.data
  },

  // POST crear nueva rutina
  create: async (data) => {
    const response = await apiClient.post('/rutinas', data)
    return response.data.data
  },

  // PUT actualizar rutina
  update: async (id, data) => {
    const response = await apiClient.put(`/rutinas/${id}`, data)
    return response.data.data
  },

  // DELETE eliminar rutina
  delete: async (id) => {
    const response = await apiClient.delete(`/rutinas/${id}`)
    return response.data.data
  }
}

export default rutinasService
