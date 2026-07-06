import { supabase } from '../supabase.js';

export const sesionModel = {
  // Obtener todas las sesiones de un usuario
  getAll: async (usuarioId) => {
    try {
      const { data, error } = await supabase
        .from('sesiones')
        .select('*')
        .eq('usuario_id', usuarioId);

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error en sesionModel.getAll:', error);
      throw error;
    }
  },

  // Obtener una sesión por ID
  getById: async (sesionId) => {
    try {
      const { data, error } = await supabase
        .from('sesiones')
        .select('*')
        .eq('id', sesionId)
        .maybeSingle();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error en sesionModel.getById:', error);
      throw error;
    }
  },

  // Crear una nueva sesión
  create: async (dataSesion) => {
    try {
      const payload = {
        usuario_id: dataSesion.usuario_id,
        fecha: dataSesion.fecha,
        rutina_id: dataSesion.rutina_id,
        rutina_nombre: dataSesion.rutina_nombre,
        ejercicios: dataSesion.ejercicios || [],
        volumen_total: dataSesion.volumen_total || 0,
        duracion_min: dataSesion.duracion_min || 0,
        completada: dataSesion.completada || false
      };

      // Si viene un ID predefinido, lo incluimos (útil para tests o IDs específicos)
      if (dataSesion.id) {
        payload.id = dataSesion.id;
      }

      const { data, error } = await supabase
        .from('sesiones')
        .insert([payload])
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error en sesionModel.create:', error);
      throw error;
    }
  },

  // Actualizar una sesión
  update: async (sesionId, datosActualizacion) => {
    try {
      const { data, error } = await supabase
        .from('sesiones')
        .update(datosActualizacion)
        .eq('id', sesionId)
        .select()
        .maybeSingle();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error en sesionModel.update:', error);
      throw error;
    }
  },

  // Eliminar una sesión
  remove: async (sesionId) => {
    try {
      const { data, error } = await supabase
        .from('sesiones')
        .delete()
        .eq('id', sesionId)
        .select()
        .maybeSingle();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error en sesionModel.remove:', error);
      throw error;
    }
  }
};

