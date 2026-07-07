import notificacionesService from '../services/notificaciones.service'

// El navegador exige la VAPID public key en formato Uint8Array (no base64url string)
function base64UrlToUint8Array(base64Url) {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4)
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export const pushNotifications = {
  // true si el navegador soporta push + service workers (falso en Safari de
  // escritorio viejo, o en iPhone si la PWA no está agregada a la pantalla de inicio)
  esSoportado: () => 'serviceWorker' in navigator && 'PushManager' in window,

  getPermiso: () => (typeof Notification !== 'undefined' ? Notification.permission : 'default'),

  // Chequea si ya hay una suscripción activa guardada en este navegador
  getSuscripcionActual: async () => {
    if (!pushNotifications.esSoportado()) return null
    const registration = await navigator.serviceWorker.ready
    return registration.pushManager.getSubscription()
  },

  // Pide permiso, crea la suscripción push del navegador y la guarda en el backend
  activar: async () => {
    if (!pushNotifications.esSoportado()) {
      throw new Error('Este navegador no soporta notificaciones push')
    }

    const permiso = await Notification.requestPermission()
    if (permiso !== 'granted') {
      throw new Error('Permiso de notificaciones no concedido')
    }

    const registration = await navigator.serviceWorker.ready
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      const publicKey = await notificacionesService.getVapidPublicKey()
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(publicKey),
      })
    }

    const json = subscription.toJSON()
    await notificacionesService.suscribir({
      endpoint: json.endpoint,
      keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
    })

    return subscription
  },

  // Cancela la suscripción tanto en el navegador como en el backend
  desactivar: async () => {
    const subscription = await pushNotifications.getSuscripcionActual()
    if (!subscription) return
    const endpoint = subscription.endpoint
    await subscription.unsubscribe()
    await notificacionesService.desuscribir(endpoint)
  },
}
