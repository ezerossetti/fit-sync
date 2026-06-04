import { usuarioModel } from '../models/usuario.model.js';

export const usuarioController = {
  getAll: async (req, res) => {
    try {
      const usuarios = await usuarioModel.getAll();
      res.status(200).json({ success: true, data: usuarios, count: usuarios.length });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener usuarios', error: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const { usuarioId } = req.params;
      const usuario = await usuarioModel.getById(usuarioId);

      if (!usuario) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      res.status(200).json({ success: true, data: usuario });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener el usuario', error: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const { nombre, email, rol, activo, creado_en } = req.body;

      if (!nombre || !email) {
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios: nombre, email' });
      }

      const nuevoUsuario = await usuarioModel.create({
        nombre,
        email,
        rol,
        activo,
        creado_en
      });

      res.status(201).json({ success: true, message: 'Usuario creado exitosamente', data: nuevoUsuario });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al crear el usuario', error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { usuarioId } = req.params;
      const datosActualizacion = req.body;

      const usuarioActualizado = await usuarioModel.update(usuarioId, datosActualizacion);

      if (!usuarioActualizado) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      res.status(200).json({ success: true, message: 'Usuario actualizado exitosamente', data: usuarioActualizado });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al actualizar el usuario', error: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      const { usuarioId } = req.params;
      const usuarioEliminado = await usuarioModel.remove(usuarioId);

      if (!usuarioEliminado) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      res.status(200).json({ success: true, message: 'Usuario eliminado exitosamente', data: usuarioEliminado });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al eliminar el usuario', error: error.message });
    }
  }
};
