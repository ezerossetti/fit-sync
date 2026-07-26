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

  // Obtener una rutina por ID, siempre scopeada al usuario dueño
  getById: async (rutinaId, usuarioId) => {
    try {
      const { data, error } = await supabase
        .from('rutinas')
        .select('*')
        .eq('id', rutinaId)
        .eq('usuario_id', usuarioId)
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

  // Actualizar una rutina, siempre scopeada al usuario dueño
  update: async (rutinaId, usuarioId, datosActualizacion) => {
    try {
      const { data, error } = await supabase
        .from('rutinas')
        .update(datosActualizacion)
        .eq('id', rutinaId)
        .eq('usuario_id', usuarioId)
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

  // Eliminar una rutina, siempre scopeada al usuario dueño
  remove: async (rutinaId, usuarioId) => {
    try {
      const { data, error } = await supabase
        .from('rutinas')
        .delete()
        .eq('id', rutinaId)
        .eq('usuario_id', usuarioId)
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

