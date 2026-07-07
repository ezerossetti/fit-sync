import apiClient from './apiClient'

const usuarioService = {
  // GET el perfil del usuario logueado (el backend lo resuelve por el token, no por ID)
  getMe: async () => {
    const response = await apiClient.get('/usuario/me')
    return response.data.data
  },

  // PUT actualizar datos del perfil propio (por ahora, nombre)
  updateMe: async (data) => {
    const response = await apiClient.put('/usuario/me', data)
    return response.data.data
  }
}

export default usuarioService
