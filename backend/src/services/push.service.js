import webpush from 'web-push';
import { pushSubscriptionModel } from '../models/pushSubscription.model.js';

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;

let configurado = false;

function asegurarConfig() {
  if (configurado) return;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    throw new Error('Faltan VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY en el .env del backend');
  }
  webpush.setVapidDetails(VAPID_SUBJECT || 'mailto:soporte@fitsync.app', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  configurado = true;
}

export const pushService = {
  getPublicKey: () => VAPID_PUBLIC_KEY,

  // Manda un push a una suscripción puntual. Si el navegador devuelve que la
  // suscripción ya no existe (410 Gone / 404), la borramos para no reintentar
  // para siempre contra un dispositivo que desinstaló la app.
  enviar: async (subscription, payload) => {
    asegurarConfig();
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: { p256dh: subscription.p256dh, auth: subscription.auth },
    };

    try {
      await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
      return true;
    } catch (error) {
      if (error.statusCode === 410 || error.statusCode === 404) {
        await pushSubscriptionModel.removeByEndpoint(subscription.endpoint);
      } else {
        console.error('Error enviando push:', error.statusCode, error.body || error.message);
      }
      return false;
    }
  },
};
