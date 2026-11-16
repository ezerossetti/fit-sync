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

  // Obtener una sesión por ID, siempre scopeada al usuario dueño
  getById: async (sesionId, usuarioId) => {
    try {
      const { data, error } = await supabase
        .from('sesiones')
        .select('*')
        .eq('id', sesionId)
        .eq('usuario_id', usuarioId)
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
        duracion_min: dataSesion.duracion_min ?? null,
        completada: dataSesion.completada || false,
        notas: dataSesion.notas || null,
        calorias_estimadas: dataSesion.calorias_estimadas ?? null
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

      // Replaying the same client UUID is a read, never an overwrite. This also
      // handles two concurrent inserts because the primary key is unique.
      if (error?.code === '23505' && payload.id) {
        const existing = await sesionModel.getById(payload.id, payload.usuario_id);
        if (existing) return existing;
      }
      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error en sesionModel.create:', error);
      throw error;
    }
  },

  // Actualizar una sesión, siempre scopeada al usuario dueño
  update: async (sesionId, usuarioId, datosActualizacion) => {
    try {
      const { data, error } = await supabase
        .from('sesiones')
        .update(datosActualizacion)
        .eq('id', sesionId)
        .eq('usuario_id', usuarioId)
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

  // Eliminar una sesión, siempre scopeada al usuario dueño
  remove: async (sesionId, usuarioId) => {
    try {
      const { data, error } = await supabase
        .from('sesiones')
        .delete()
        .eq('id', sesionId)
        .eq('usuario_id', usuarioId)
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

