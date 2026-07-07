import { pushSubscriptionModel } from '../models/pushSubscription.model.js';
import { pushService } from '../services/push.service.js';
import { correrChequeoInactividad } from '../services/inactividad.job.js';

export const notificacionController = {
  // GET: clave pública VAPID que el frontend necesita para suscribirse
  vapidPublicKey: (req, res) => {
    const key = pushService.getPublicKey();
    if (!key) {
      return res.status(500).json({ success: false, message: 'El servidor no tiene configurado VAPID_PUBLIC_KEY' });
    }
    res.status(200).json({ success: true, publicKey: key });
  },

  // POST: guarda la suscripción del navegador (endpoint + keys) para el usuario logueado
  suscribir: async (req, res) => {
    try {
      const { endpoint, keys } = req.body;
      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return res.status(400).json({ success: false, message: 'Suscripción incompleta' });
      }
      const data = await pushSubscriptionModel.upsert(req.usuarioId, { endpoint, keys });
      res.status(201).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al guardar la suscripción', error: error.message });
    }
  },

  // POST: da de baja una suscripción puntual
  desuscribir: async (req, res) => {
    try {
      const { endpoint } = req.body;
      if (!endpoint) {
        return res.status(400).json({ success: false, message: 'Falta el endpoint' });
      }
      await pushSubscriptionModel.remove(req.usuarioId, endpoint);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al dar de baja la suscripción', error: error.message });
    }
  },

  // POST: dispara el chequeo de inactividad para todos los usuarios.
  // Protegido por CRON_SECRET (no requireAuth), pensado para que lo llame
  // un cron externo tipo cron-job.org, ya que Render free duerme el server.
  chequeoInactividad: async (req, res) => {
    try {
      const secretoRecibido = req.headers['x-cron-secret'];
      if (!process.env.CRON_SECRET || secretoRecibido !== process.env.CRON_SECRET) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }
      const resultado = await correrChequeoInactividad();
      res.status(200).json({ success: true, ...resultado });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error en el chequeo de inactividad', error: error.message });
    }
  },
};
