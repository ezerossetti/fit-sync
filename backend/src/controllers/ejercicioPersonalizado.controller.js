import { ejercicioPersonalizadoModel } from '../models/ejercicioPersonalizado.model.js';

export const ejercicioPersonalizadoController = {
  // Obtener todos los ejercicios personalizados del usuario logueado
  getAll: async (req, res) => {
    try {
      const usuarioId = req.usuarioId;
      const ejercicios = await ejercicioPersonalizadoModel.getAll(usuarioId);
      res.status(200).json({
        success: true,
        data: ejercicios,
        count: ejercicios.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener ejercicios personalizados',
        error: error.message
      });
    }
  },

  // Crear un nuevo ejercicio personalizado
  create: async (req, res) => {
    try {
      const usuarioId = req.usuarioId;
      const { nombre, grupo, descripcion, puntos_clave } = req.body;

      if (!nombre || !nombre.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Falta el campo obligatorio: nombre'
        });
      }

      const nuevoEjercicio = await ejercicioPersonalizadoModel.create({
        usuario_id: usuarioId,
        nombre: nombre.trim(),
        grupo,
        descripcion,
        puntos_clave
      });

      res.status(201).json({
        success: true,
        message: 'Ejercicio personalizado creado exitosamente',
        data: nuevoEjercicio
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear el ejercicio personalizado',
        error: error.message
      });
    }
  },

  // Eliminar un ejercicio personalizado propio
  remove: async (req, res) => {
    try {
      const usuarioId = req.usuarioId;
      const { ejercicioId } = req.params;

      const eliminado = await ejercicioPersonalizadoModel.remove(ejercicioId, usuarioId);

      if (!eliminado) {
        return res.status(404).json({
          success: false,
          message: 'Ejercicio personalizado no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Ejercicio personalizado eliminado exitosamente',
        data: eliminado
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el ejercicio personalizado',
        error: error.message
      });
    }
  }
};
