import { rutinaModel } from '../models/rutina.model.js';

export const rutinaController = {
  getAll: async (req, res) => {
    try {
      const usuarioId = req.params.usuarioId;
      const rutinas = await rutinaModel.getAll(usuarioId);
      res.status(200).json({ success: true, data: rutinas, count: rutinas.length });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener rutinas', error: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const { rutinaId } = req.params;
      const rutina = await rutinaModel.getById(rutinaId, req.usuarioId);
      if (!rutina) {
        return res.status(404).json({ success: false, message: 'Rutina no encontrada' });
      }
      res.status(200).json({ success: true, data: rutina });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener la rutina', error: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const usuarioId = req.params.usuarioId;
      const { nombre, descripcion, ejercicios, activa, creada_en } = req.body;

      if (!nombre) {
        return res.status(400).json({ success: false, message: 'Falta el campo obligatorio: nombre' });
      }

      const nuevaRutina = await rutinaModel.create({
        usuario_id: usuarioId,
        nombre,
        descripcion,
        ejercicios,
        activa,
        creada_en
      });

      res.status(201).json({ success: true, message: 'Rutina creada exitosamente', data: nuevaRutina });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al crear la rutina', error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { rutinaId } = req.params;

      // Whitelist explícito: mismo fix que en sesion.controller — no dejar
      // que el body reasigne usuario_id/id de la rutina.
      const { nombre, descripcion, ejercicios, activa } = req.body;
      const datosActualizacion = {};
      if (nombre !== undefined) datosActualizacion.nombre = nombre;
      if (descripcion !== undefined) datosActualizacion.descripcion = descripcion;
      if (ejercicios !== undefined) datosActualizacion.ejercicios = ejercicios;
      if (activa !== undefined) datosActualizacion.activa = activa;

      const rutinaActualizada = await rutinaModel.update(rutinaId, req.usuarioId, datosActualizacion);
      if (!rutinaActualizada) {
        return res.status(404).json({ success: false, message: 'Rutina no encontrada' });
      }
      res.status(200).json({ success: true, message: 'Rutina actualizada exitosamente', data: rutinaActualizada });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al actualizar la rutina', error: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      const { rutinaId } = req.params;
      const rutinaEliminada = await rutinaModel.remove(rutinaId, req.usuarioId);
      if (!rutinaEliminada) {
        return res.status(404).json({ success: false, message: 'Rutina no encontrada' });
      }
      res.status(200).json({ success: true, message: 'Rutina eliminada exitosamente', data: rutinaEliminada });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al eliminar la rutina', error: error.message });
    }
  }
};
