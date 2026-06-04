import { sesionModel } from '../models/sesion.model.js';

export const sesionController = {
  // Obtener todas las sesiones del usuario
  getAll: async (req, res) => {
    try {
      const usuarioId = req.params.usuarioId;
      const sesiones = await sesionModel.getAll(usuarioId);
      res.status(200).json({
        success: true,
        data: sesiones,
        count: sesiones.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener sesiones',
        error: error.message
      });
    }
  },

  // Obtener una sesión por ID
  getById: async (req, res) => {
    try {
      const { sesionId } = req.params;
      const sesion = await sesionModel.getById(sesionId);

      if (!sesion) {
        return res.status(404).json({
          success: false,
          message: 'Sesión no encontrada'
        });
      }

      res.status(200).json({
        success: true,
        data: sesion
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener la sesión',
        error: error.message
      });
    }
  },

  // Crear una nueva sesión
  create: async (req, res) => {
    try {
      const usuarioId = req.params.usuarioId;
      const { fecha, rutina_id, rutina_nombre, ejercicios, volumen_total, duracion_min, completada } = req.body;

      // Validaciones básicas
      if (!fecha || !rutina_id || !rutina_nombre) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos obligatorios: fecha, rutina_id, rutina_nombre'
        });
      }

      const nuevaSesion = await sesionModel.create({
        usuario_id: usuarioId,
        fecha,
        rutina_id,
        rutina_nombre,
        ejercicios,
        volumen_total,
        duracion_min,
        completada
      });

      res.status(201).json({
        success: true,
        message: 'Sesión creada exitosamente',
        data: nuevaSesion
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear la sesión',
        error: error.message
      });
    }
  },

  // Actualizar una sesión
  update: async (req, res) => {
    try {
      const { sesionId } = req.params;
      const datosActualizacion = req.body;

      const sesionActualizada = await sesionModel.update(sesionId, datosActualizacion);

      if (!sesionActualizada) {
        return res.status(404).json({
          success: false,
          message: 'Sesión no encontrada'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Sesión actualizada exitosamente',
        data: sesionActualizada
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la sesión',
        error: error.message
      });
    }
  },

  // Eliminar una sesión
  remove: async (req, res) => {
    try {
      const { sesionId } = req.params;

      const sesionEliminada = await sesionModel.remove(sesionId);

      if (!sesionEliminada) {
        return res.status(404).json({
          success: false,
          message: 'Sesión no encontrada'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Sesión eliminada exitosamente',
        data: sesionEliminada
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la sesión',
        error: error.message
      });
    }
  }
};
