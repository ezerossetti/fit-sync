import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

const rutinasService = {
  // GET todas las rutinas
  getAll: async () => {
    const response = await axiosInstance.get('/rutinas')
    return response.data.data
  },

  // GET una rutina por ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/rutinas/${id}`)
    return response.data.data
  },

  // POST crear nueva rutina
  create: async (data) => {
    const response = await axiosInstance.post('/rutinas', data)
    return response.data.data
  },

  // PUT actualizar rutina
  update: async (id, data) => {
    const response = await axiosInstance.put(`/rutinas/${id}`, data)
    return response.data.data
  },

  // DELETE eliminar rutina
  delete: async (id) => {
    const response = await axiosInstance.delete(`/rutinas/${id}`)
    return response.data.data
  }
}

export default rutinasService
