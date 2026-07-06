import { supabase } from '../supabase.js';

export const rutinaModel = {
  // Obtener todas las rutinas de un usuario
  getAll: async (usuarioId) => {
    try {
      const { data, error } = await supabase
        .from('rutinas')
        .select('*')
        .eq('usuario_id', usuarioId);

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error en rutinaModel.getAll:', error);
      throw error;
    }
  },

  // Obtener una rutina por ID
  getById: async (rutinaId) => {
    try {
      const { data, error } = await supabase
        .from('rutinas')
        .select('*')
        .eq('id', rutinaId)
        .maybeSingle();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error en rutinaModel.getById:', error);
      throw error;
    }
  },

  // Crear una nueva rutina
  create: async (dataRutina) => {
    try {
      const payload = {
        usuario_id: dataRutina.usuario_id,
        nombre: dataRutina.nombre,
        descripcion: dataRutina.descripcion || '',
        ejercicios: dataRutina.ejercicios || [],
        activa: dataRutina.activa ?? false
      };

      // Si viene creada_en, la agregamos
      if (dataRutina.creada_en) {
        payload.creada_en = dataRutina.creada_en;
      }

      // Si viene un ID predefinido, lo incluimos (útil para tests o IDs específicos)
      if (dataRutina.id) {
        payload.id = dataRutina.id;
      }

      const { data, error } = await supabase
        .from('rutinas')
        .insert([payload])
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error en rutinaModel.create:', error);
      throw error;
    }
  },

  // Actualizar una rutina
  update: async (rutinaId, datosActualizacion) => {
    try {
      const { data, error } = await supabase
        .from('rutinas')
        .update(datosActualizacion)
        .eq('id', rutinaId)
        .select()
        .maybeSingle();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error en rutinaModel.update:', error);
      throw error;
    }
  },

  // Eliminar una rutina
  remove: async (rutinaId) => {
    try {
      const { data, error } = await supabase
        .from('rutinas')
        .delete()
        .eq('id', rutinaId)
        .select()
        .maybeSingle();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error en rutinaModel.remove:', error);
      throw error;
    }
  }
};

