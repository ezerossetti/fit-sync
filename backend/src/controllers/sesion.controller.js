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
      const sesion = await sesionModel.getById(sesionId, req.usuarioId);

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
      const { fecha, rutina_id, rutina_nombre, ejercicios, volumen_total, duracion_min, completada, notas, calorias_estimadas } = req.body;

      // Validaciones básicas.
      // rutina_id es opcional: una "Sesión libre" (sin rutina precargada, ej.
      // cuando el entrenador da los ejercicios sobre la marcha) no tiene rutina
      // asociada. rutina_nombre sí es obligatorio (cae a 'Sesión libre' desde el front).
      if (!fecha || !rutina_nombre) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos obligatorios: fecha, rutina_nombre'
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
        completada,
        notas,
        calorias_estimadas
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

      // Whitelist explícito: nunca dejamos que el body pise usuario_id, id,
      // creado_en, etc. Sin esto, cualquiera podía mandar { "usuario_id": "<otro-uuid>" }
      // en el PUT y "robarse" (o tirar al limbo) la sesión de otro usuario.
      const {
        fecha, rutina_id, rutina_nombre, ejercicios,
        volumen_total, duracion_min, completada, notas, calorias_estimadas
      } = req.body;
      const datosActualizacion = {};
      if (fecha !== undefined) datosActualizacion.fecha = fecha;
      if (rutina_id !== undefined) datosActualizacion.rutina_id = rutina_id;
      if (rutina_nombre !== undefined) datosActualizacion.rutina_nombre = rutina_nombre;
      if (ejercicios !== undefined) datosActualizacion.ejercicios = ejercicios;
      if (volumen_total !== undefined) datosActualizacion.volumen_total = volumen_total;
      if (duracion_min !== undefined) datosActualizacion.duracion_min = duracion_min;
      if (completada !== undefined) datosActualizacion.completada = completada;
      if (notas !== undefined) datosActualizacion.notas = notas;
      if (calorias_estimadas !== undefined) datosActualizacion.calorias_estimadas = calorias_estimadas;

      const sesionActualizada = await sesionModel.update(sesionId, req.usuarioId, datosActualizacion);

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

      const sesionEliminada = await sesionModel.remove(sesionId, req.usuarioId);

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
