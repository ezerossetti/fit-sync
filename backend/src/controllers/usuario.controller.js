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

  // Actualizar datos del propio perfil (nombre y/o preferencias de entrenamiento)
  updateMe: async (req, res) => {
    try {
      const { nombre, preferencias } = req.body;

      if (nombre === undefined && preferencias === undefined) {
        return res.status(400).json({ success: false, message: 'No se envió ningún campo para actualizar (nombre o preferencias)' });
      }

      const cambios = {};
      if (nombre !== undefined) cambios.nombre = nombre;
      if (preferencias !== undefined) cambios.preferencias = preferencias;

      const usuarioActualizado = await usuarioModel.update(req.usuarioId, cambios);

      if (!usuarioActualizado) {
        return res.status(404).json({ success: false, message: 'Perfil no encontrado' });
      }

      res.status(200).json({ success: true, message: 'Perfil actualizado exitosamente', data: usuarioActualizado });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al actualizar el perfil', error: error.message });
    }
  }
};
