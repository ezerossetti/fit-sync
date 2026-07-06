import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
})

const usuarioService = {
  // GET todos los usuarios
  getAll: async () => {
    const response = await axiosInstance.get('/usuario')
    return response.data.data
  },

  // GET un usuario por ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/usuario/${id}`)
    return response.data.data
  },

  // POST crear nuevo usuario
  create: async (data) => {
    const response = await axiosInstance.post('/usuario', data)
    return response.data.data
  },

  // PUT actualizar usuario
  update: async (id, data) => {
    const response = await axiosInstance.put(`/usuario/${id}`, data)
    return response.data.data
  },

  // DELETE eliminar usuario
  delete: async (id) => {
    const response = await axiosInstance.delete(`/usuario/${id}`)
    return response.data.data
  }
}

export default usuarioService
