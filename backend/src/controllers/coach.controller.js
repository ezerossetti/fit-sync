import { groqService } from '../services/groq.service.js';
import { coachModel } from '../models/coach.model.js';

// Cuántos turnos de historial se le mandan a Groq como contexto de la
// conversación. OJO: esto NO es cuánto se guarda en la base (eso sigue
// siendo ilimitado, para poder mostrar el chat completo al abrir el
// widget) — es cuánto se re-manda en cada mensaje nuevo. Con conversaciones
// largas, mandar todo el historial completo cada vez infla el consumo de
// tokens por día de forma innecesaria; 8 turnos alcanzan para que el coach
// no repita lo que ya dijo, sin gastar de más.
const TURNOS_HISTORIAL_PARA_CONTEXTO = 8;

// Distingue un 429 de Groq (se acabó la cuota gratis del día/minuto) de un
// error real, para no mostrarle al usuario un mensaje de "algo se rompió"
// cuando en realidad es "hay mucha gente usando el coach ahora mismo".
const manejarErrorCoach = (error, res, mensajeGenerico) => {
  if (error?.status === 429) {
    return res.status(429).json({
      success: false,
      rateLimited: true,
      message: 'El coach está muy pedido ahora mismo (límite de la IA gratuita). Probá de nuevo en unos minutos.',
      retryAfterSeconds: error.retryAfterSeconds ?? null,
    });
  }
  console.error(mensajeGenerico, error);
  res.status(500).json({ success: false, message: mensajeGenerico, error: error.message });
};

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
      // Al modelo solo le mandamos los últimos N turnos (no los 20 que
      // guardamos para pintar el historial completo en la UI).
      const historialParaContexto = historial.slice(-TURNOS_HISTORIAL_PARA_CONTEXTO);

      const respuesta = await groqService.generarRespuesta('chat', {
        contextoJSON: JSON.stringify(contexto || {}),
        mensajeUsuario: mensaje,
        historial: historialParaContexto.map((h) => ({ rol: h.rol, contenido: h.contenido })),
      });

      // Persistimos ambos turnos para mantener memoria de la conversación
      await coachModel.guardarMensaje(usuarioId, 'user', mensaje);
      await coachModel.guardarMensaje(usuarioId, 'model', respuesta);

      res.status(200).json({ success: true, data: { respuesta } });
    } catch (error) {
      manejarErrorCoach(error, res, 'Error en el chat del coach');
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
      manejarErrorCoach(error, res, 'Error al generar el comentario de la sesión');
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
      manejarErrorCoach(error, res, 'Error al generar el resumen');
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
      manejarErrorCoach(error, res, 'Error al generar sugerencias de ejercicios');
    }
  },

  // Análisis de técnica de un ejercicio puntual. Body: { contexto, mensaje }
  // contexto: ejercicio + puntos clave + historial (armado en el frontend con contextoCoach.js)
  // mensaje: descripción en texto libre de cómo lo sintió el usuario
  analizarTecnica: async (req, res) => {
    try {
      const { contexto, mensaje } = req.body;

      if (!contexto || !mensaje) {
        return res.status(400).json({ success: false, message: 'Faltan campos: contexto, mensaje' });
      }

      const respuesta = await groqService.generarRespuesta('analisis_tecnica', {
        contextoJSON: JSON.stringify(contexto),
        mensajeUsuario: mensaje,
      });

      res.status(200).json({ success: true, data: { analisis: respuesta } });
    } catch (error) {
      manejarErrorCoach(error, res, 'Error al analizar la técnica');
    }
  },

  // Generador de rutina personalizada por IA. Body: { contexto }
  // contexto: objetivo, días disponibles, nivel, balance muscular, rutinas actuales
  // y la lista completa de ejercicios válidos (armado en el frontend con contextoCoach.js).
  // Devuelve el JSON de la rutina generada sin guardarla: el frontend la previsualiza
  // y decide si la guarda (vía el flujo normal de rutinas.service.js).
  generarRutina: async (req, res) => {
    try {
      const { contexto } = req.body;

      if (!contexto) {
        return res.status(400).json({ success: false, message: 'Falta el contexto para generar la rutina' });
      }

      const respuesta = await groqService.generarRespuesta('generar_rutina', {
        contextoJSON: JSON.stringify(contexto),
        mensajeUsuario: 'Generá la rutina según ese contexto.',
      });

      let rutina;
      try {
        rutina = JSON.parse(respuesta);
      } catch {
        return res.status(502).json({ success: false, message: 'El coach devolvió un formato inválido, probá de nuevo' });
      }

      if (!rutina?.nombre || !Array.isArray(rutina.ejercicios) || rutina.ejercicios.length === 0) {
        return res.status(502).json({ success: false, message: 'La rutina generada no tiene el formato esperado, probá de nuevo' });
      }

      res.status(200).json({ success: true, data: { rutina } });
    } catch (error) {
      manejarErrorCoach(error, res, 'Error al generar la rutina');
    }
  },
};
