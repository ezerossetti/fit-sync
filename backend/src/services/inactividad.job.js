import { pushSubscriptionModel } from '../models/pushSubscription.model.js';
import { sesionModel } from '../models/sesion.model.js';
import { pushService } from './push.service.js';
import { groqService } from './groq.service.js';

const DIAS_UMBRAL = 4; // a partir de cuántos días sin entrenar se avisa
const DIAS_ENTRE_AVISOS = 3; // no reavisar todos los días al mismo usuario

function diasDesde(fechaISO) {
  const ms = Date.now() - new Date(fechaISO).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

// Recorre todas las suscripciones push, calcula la última sesión de cada
// usuario y dispara un push (redactado por el coach) si superó el umbral de
// inactividad y no fue notificado hace poco. Pensado para correr 1 vez/día.
export async function correrChequeoInactividad() {
  const suscripciones = await pushSubscriptionModel.getAll();
  const resultado = { revisados: 0, notificados: 0, errores: 0 };

  // Agrupamos suscripciones por usuario, por si tiene más de un dispositivo
  const porUsuario = new Map();
  for (const sub of suscripciones) {
    if (!porUsuario.has(sub.usuario_id)) porUsuario.set(sub.usuario_id, []);
    porUsuario.get(sub.usuario_id).push(sub);
  }

  for (const [usuarioId, subs] of porUsuario.entries()) {
    resultado.revisados += 1;
    try {
      const sesiones = await sesionModel.getAll(usuarioId);
      if (!sesiones || sesiones.length === 0) continue; // usuario sin sesiones registradas: no hay "inactividad" que medir

      const ultima = sesiones.reduce((max, s) => (new Date(s.fecha) > new Date(max.fecha) ? s : max), sesiones[0]);
      const dias = diasDesde(ultima.fecha);
      if (dias < DIAS_UMBRAL) continue;

      // Filtramos suscripciones ya notificadas recientemente
      const subsAAvisar = subs.filter((s) => {
        if (!s.ultima_notificacion_en) return true;
        return diasDesde(s.ultima_notificacion_en) >= DIAS_ENTRE_AVISOS;
      });
      if (subsAAvisar.length === 0) continue;

      const contexto = JSON.stringify({ dias_sin_entrenar: dias, ultima_rutina: ultima.rutina_nombre || null });
      const mensaje = await groqService.generarRespuesta('chequeo_inactividad', {
        contextoJSON: contexto,
        mensajeUsuario: `Generá la notificación para ${dias} días sin entrenar.`,
      });

      for (const sub of subsAAvisar) {
        const enviado = await pushService.enviar(sub, {
          title: 'Coach Chiche',
          body: mensaje,
          url: '/',
        });
        if (enviado) {
          await pushSubscriptionModel.marcarNotificado(sub.id);
          resultado.notificados += 1;
        }
      }
    } catch (error) {
      console.error(`Error chequeando inactividad de usuario ${usuarioId}:`, error.message);
      resultado.errores += 1;
    }
  }

  return resultado;
}
