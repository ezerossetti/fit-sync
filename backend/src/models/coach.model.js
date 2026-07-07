import { supabase } from '../supabase.js';

export const coachModel = {
  // Guarda un turno de chat (rol: 'user' | 'model')
  guardarMensaje: async (usuarioId, rol, contenido) => {
    try {
      const { data, error } = await supabase
        .from('coach_mensajes')
        .insert([{ usuario_id: usuarioId, rol, contenido }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error en coachModel.guardarMensaje:', error);
      throw error;
    }
  },

  // Trae los últimos N turnos de chat del usuario, en orden cronológico
  obtenerHistorialChat: async (usuarioId, limite = 20) => {
    try {
      const { data, error } = await supabase
        .from('coach_mensajes')
        .select('rol, contenido, creado_en')
        .eq('usuario_id', usuarioId)
        .order('creado_en', { ascending: false })
        .limit(limite);

      if (error) throw error;
      return (data || []).reverse();
    } catch (error) {
      console.error('Error en coachModel.obtenerHistorialChat:', error);
      throw error;
    }
  },

  // Busca un resumen ya generado para ese usuario/tipo/período (cache, para no gastar cuota de Gemini de nuevo)
  obtenerResumenCacheado: async (usuarioId, tipo, periodoInicio) => {
    try {
      const { data, error } = await supabase
        .from('coach_resumenes')
        .select('*')
        .eq('usuario_id', usuarioId)
        .eq('tipo', tipo)
        .eq('periodo_inicio', periodoInicio)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error en coachModel.obtenerResumenCacheado:', error);
      throw error;
    }
  },

  // Guarda (o reemplaza) el resumen generado para ese período
  guardarResumen: async (usuarioId, tipo, periodoInicio, periodoFin, contenido) => {
    try {
      const { data, error } = await supabase
        .from('coach_resumenes')
        .upsert(
          [{ usuario_id: usuarioId, tipo, periodo_inicio: periodoInicio, periodo_fin: periodoFin, contenido }],
          { onConflict: 'usuario_id,tipo,periodo_inicio' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error en coachModel.guardarResumen:', error);
      throw error;
    }
  },
};
