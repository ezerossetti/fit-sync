import { supabase } from '../supabase.js';

export const pushSubscriptionModel = {
  // Guarda o actualiza la suscripción (el endpoint es único por dispositivo/navegador)
  upsert: async (usuarioId, { endpoint, keys }) => {
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .upsert(
          {
            usuario_id: usuarioId,
            endpoint,
            p256dh: keys.p256dh,
            auth: keys.auth,
          },
          { onConflict: 'endpoint' }
        )
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error en pushSubscriptionModel.upsert:', error);
      throw error;
    }
  },

  // Elimina una suscripción puntual (ej: el usuario desactiva notificaciones)
  remove: async (usuarioId, endpoint) => {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('usuario_id', usuarioId)
        .eq('endpoint', endpoint);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error en pushSubscriptionModel.remove:', error);
      throw error;
    }
  },

  // Elimina por endpoint sin importar el usuario (usado cuando el navegador
  // devuelve 410/404 al intentar enviar, o sea la suscripción ya está muerta)
  removeByEndpoint: async (endpoint) => {
    try {
      const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
      if (error) throw error;
    } catch (error) {
      console.error('Error en pushSubscriptionModel.removeByEndpoint:', error);
    }
  },

  // Todas las suscripciones (usado por el job de inactividad)
  getAll: async () => {
    try {
      const { data, error } = await supabase.from('push_subscriptions').select('*');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error en pushSubscriptionModel.getAll:', error);
      throw error;
    }
  },

  marcarNotificado: async (id) => {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .update({ ultima_notificacion_en: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error en pushSubscriptionModel.marcarNotificado:', error);
    }
  },
};
