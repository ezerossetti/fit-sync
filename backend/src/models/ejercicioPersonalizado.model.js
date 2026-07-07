import { supabase } from '../supabase.js';

export const ejercicioPersonalizadoModel = {
  // Obtener todos los ejercicios personalizados de un usuario
  getAll: async (usuarioId) => {
    try {
      const { data, error } = await supabase
        .from('ejercicios_personalizados')
        .select('*')
        .eq('usuario_id', usuarioId)
        .order('creado_en', { ascending: true });

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error en ejercicioPersonalizadoModel.getAll:', error);
      throw error;
    }
  },

  // Crear un nuevo ejercicio personalizado
  create: async (dataEjercicio) => {
    try {
      const payload = {
        usuario_id: dataEjercicio.usuario_id,
        nombre: dataEjercicio.nombre,
        grupo: dataEjercicio.grupo || 'Personalizado',
        descripcion: dataEjercicio.descripcion || '',
        puntos_clave: dataEjercicio.puntos_clave || [],
      };

      const { data, error } = await supabase
        .from('ejercicios_personalizados')
        .insert([payload])
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error en ejercicioPersonalizadoModel.create:', error);
      throw error;
    }
  },

  // Eliminar un ejercicio personalizado (solo si pertenece al usuario)
  remove: async (id, usuarioId) => {
    try {
      const { data, error } = await supabase
        .from('ejercicios_personalizados')
        .delete()
        .eq('id', id)
        .eq('usuario_id', usuarioId)
        .select()
        .maybeSingle();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error en ejercicioPersonalizadoModel.remove:', error);
      throw error;
    }
  }
};
