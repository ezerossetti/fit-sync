import { supabase } from '../supabase.js';

export const usuarioModel = {
  // Obtener un usuario por ID (id = auth.users.id)
  getById: async (usuarioId) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', usuarioId)
        .maybeSingle();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error en usuarioModel.getById:', error);
      throw error;
    }
  },

  // Actualizar datos propios del perfil
  update: async (usuarioId, datosActualizacion) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update(datosActualizacion)
        .eq('id', usuarioId)
        .select()
        .maybeSingle();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error en usuarioModel.update:', error);
      throw error;
    }
  }
};
