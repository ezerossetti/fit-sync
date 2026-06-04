import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

const sesionesService = {
  // GET todas las sesiones
  getAll: async () => {
    const response = await axiosInstance.get('/sesiones')
    return response.data.data
  },

  // GET una sesión por ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/sesiones/${id}`)
    return response.data.data
  },

  // POST crear nueva sesión
  create: async (data) => {
    const response = await axiosInstance.post('/sesiones', data)
    return response.data.data
  },

  // PUT actualizar sesión
  update: async (id, data) => {
    const response = await axiosInstance.put(`/sesiones/${id}`, data)
    return response.data.data
  },

  // DELETE eliminar sesión
  delete: async (id) => {
    const response = await axiosInstance.delete(`/sesiones/${id}`)
    return response.data.data
  }
}

export default sesionesService
