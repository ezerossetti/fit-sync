import apiClient from './apiClient'

const ejerciciosPersonalizadosService = {
  // GET todos los ejercicios personalizados del usuario logueado
  getAll: async () => {
    const response = await apiClient.get('/ejercicios-personalizados')
    return response.data.data
  },

  // POST crear un ejercicio personalizado
  create: async (data) => {
    const response = await apiClient.post('/ejercicios-personalizados', data)
    return response.data.data
  },

  // DELETE eliminar un ejercicio personalizado propio
  delete: async (id) => {
    const response = await apiClient.delete(`/ejercicios-personalizados/${id}`)
    return response.data.data
  }
}

export default ejerciciosPersonalizadosService
