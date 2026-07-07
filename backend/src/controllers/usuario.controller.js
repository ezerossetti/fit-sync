import { usuarioModel } from '../models/usuario.model.js';

export const usuarioController = {
  // Perfil del usuario logueado (resuelto por el token, no por :id en la URL)
  getMe: async (req, res) => {
    try {
      const usuario = await usuarioModel.getById(req.usuarioId);

      if (!usuario) {
        return res.status(404).json({ success: false, message: 'Perfil no encontrado' });
      }

      res.status(200).json({ success: true, data: usuario });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener el perfil', error: error.message });
    }
  },

  // Actualizar datos del propio perfil (por ahora, nombre)
  updateMe: async (req, res) => {
    try {
      const { nombre } = req.body;

      if (!nombre) {
        return res.status(400).json({ success: false, message: 'Falta el campo obligatorio: nombre' });
      }

      const usuarioActualizado = await usuarioModel.update(req.usuarioId, { nombre });

      if (!usuarioActualizado) {
        return res.status(404).json({ success: false, message: 'Perfil no encontrado' });
      }

      res.status(200).json({ success: true, message: 'Perfil actualizado exitosamente', data: usuarioActualizado });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al actualizar el perfil', error: error.message });
    }
  }
};
