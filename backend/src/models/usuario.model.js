import { supabase } from '../supabase.js';

export const usuarioModel = {
  // Obtener todos los usuarios
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*');

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error en usuarioModel.getAll:', error);
      throw error;
    }
  },

  // Obtener un usuario por ID
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

  // Crear un nuevo usuario
  create: async (dataUsuario) => {
    try {
      const payload = {
        nombre: dataUsuario.nombre,
        email: dataUsuario.email,
        rol: dataUsuario.rol || 'cliente',
        activo: dataUsuario.activo ?? true
      };

      // Si viene creado_en, lo agregamos
      if (dataUsuario.creado_en) {
        payload.creado_en = dataUsuario.creado_en;
      }

      // Si viene un ID predefinido, lo incluimos (útil para tests o IDs específicos)
      if (dataUsuario.id) {
        payload.id = dataUsuario.id;
      }

      const { data, error } = await supabase
        .from('usuarios')
        .insert([payload])
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error en usuarioModel.create:', error);
      throw error;
    }
  },

  // Actualizar un usuario
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
  },

  // Eliminar un usuario
  remove: async (usuarioId) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', usuarioId)
        .select()
        .maybeSingle();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error en usuarioModel.remove:', error);
      throw error;
    }
  }
};

