import { groqService } from '../services/groq.service.js';
import { coachModel } from '../models/coach.model.js';

export const coachController = {
  // Chat libre. Body: { mensaje, contexto }
  chat: async (req, res) => {
    try {
      const usuarioId = req.usuarioId;
      const { mensaje, contexto } = req.body;

      if (!mensaje) {
        return res.status(400).json({ success: false, message: 'Falta el campo mensaje' });
      }

      const historial = await coachModel.obtenerHistorialChat(usuarioId, 20);

      const respuesta = await groqService.generarRespuesta('chat', {
        contextoJSON: JSON.stringify(contexto || {}),
        mensajeUsuario: mensaje,
        historial: historial.map((h) => ({ rol: h.rol, contenido: h.contenido })),
      });

      // Persistimos ambos turnos para mantener memoria de la conversación
      await coachModel.guardarMensaje(usuarioId, 'user', mensaje);
      await coachModel.guardarMensaje(usuarioId, 'model', respuesta);

      res.status(200).json({ success: true, data: { respuesta } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error en el chat del coach', error: error.message });
    }
  },

  // Trae el historial de chat guardado, para pintarlo al abrir el widget
  historial: async (req, res) => {
    try {
      const usuarioId = req.usuarioId;
      const historial = await coachModel.obtenerHistorialChat(usuarioId, 30);
      res.status(200).json({ success: true, data: historial });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener historial del coach', error: error.message });
    }
  },

  // Comentario automático post-sesión. Body: { contexto } (sesión recién terminada + historial reciente de esos ejercicios)
  comentarioSesion: async (req, res) => {
    try {
      const { contexto } = req.body;

      if (!contexto) {
        return res.status(400).json({ success: false, message: 'Falta el contexto de la sesión' });
      }

      const respuesta = await groqService.generarRespuesta('comentario_sesion', {
        contextoJSON: JSON.stringify(contexto),
        mensajeUsuario: 'Dame tu feedback sobre esta sesión que acabo de terminar.',
      });

      res.status(200).json({ success: true, data: { comentario: respuesta } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al generar el comentario de la sesión', error: error.message });
    }
  },

  // Resumen semanal o mensual con cache. Body: { tipo: 'semanal'|'mensual', periodoInicio, periodoFin, contexto }
  resumen: async (req, res) => {
    try {
      const usuarioId = req.usuarioId;
      const { tipo, periodoInicio, periodoFin, contexto, forzarRegenerar } = req.body;

      if (!tipo || !periodoInicio || !periodoFin || !contexto) {
        return res.status(400).json({ success: false, message: 'Faltan campos: tipo, periodoInicio, periodoFin, contexto' });
      }

      if (!forzarRegenerar) {
        const cacheado = await coachModel.obtenerResumenCacheado(usuarioId, tipo, periodoInicio);
        if (cacheado) {
          return res.status(200).json({ success: true, data: { resumen: cacheado.contenido, cache: true } });
        }
      }

      const respuesta = await groqService.generarRespuesta('resumen', {
        contextoJSON: JSON.stringify(contexto),
        mensajeUsuario: `Generá el resumen ${tipo} con feedback.`,
      });

      await coachModel.guardarResumen(usuarioId, tipo, periodoInicio, periodoFin, respuesta);

      res.status(200).json({ success: true, data: { resumen: respuesta, cache: false } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al generar el resumen', error: error.message });
    }
  },

  // Sugerencia de ejercicios nuevos según balance muscular y rutinas actuales. Body: { contexto }
  sugerirEjercicios: async (req, res) => {
    try {
      const { contexto } = req.body;

      if (!contexto) {
        return res.status(400).json({ success: false, message: 'Falta el contexto de rutinas/balance' });
      }

      const respuesta = await groqService.generarRespuesta('sugerir_ejercicios', {
        contextoJSON: JSON.stringify(contexto),
        mensajeUsuario: 'Sugerime ejercicios nuevos para sumar a mis rutinas.',
      });

      res.status(200).json({ success: true, data: { sugerencia: respuesta } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al generar sugerencias de ejercicios', error: error.message });
    }
  },
};
