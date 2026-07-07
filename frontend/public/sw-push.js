// Extiende el service worker autogenerado por vite-plugin-pwa (workbox) con
// soporte de Web Push. Se inyecta vía `importScripts` desde vite.config.js,
// así no hace falta cambiar de estrategia (generateSW) ni sumar deps de workbox.

self.addEventListener('push', (event) => {
  let data = { title: 'Coach Chiche', body: 'Tenés novedades en FitSync.' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // Si el payload no es JSON, dejamos el texto plano como body
    if (event.data) data.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
