import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Ya tenemos public/manifest.webmanifest + link tag en index.html con el
      // schema que necesitábamos (íconos, theme-color, etc.) — no lo duplicamos,
      // solo agregamos el service worker para que la PWA sea instalable de verdad
      // (Chrome exige un SW registrado, no solo el manifest) y funcione offline.
      manifest: false,
      includeManifestIcons: false,
      injectRegister: 'auto',
      devOptions: {
        enabled: true, // permite probar instalación/offline con `npm run dev`, sin esperar al build
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        // Suma el manejo de push/notificationclick al SW autogenerado, sin
        // tener que migrar a la estrategia injectManifest.
        importScripts: ['/sw-push.js'],
        // Rutinas/historial/perfil: network-first para tener datos frescos con
        // internet, pero que no rompa si el celu se queda sin señal a mitad de
        // sesión (caso real: gimnasio en el sótano).
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/rutinas') || url.pathname.startsWith('/api/sesiones') || url.pathname.startsWith('/api/usuarios'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'fitsync-api-cache',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Fotos de ejercicios (free-exercise-db) y catálogo: casi nunca cambian,
            // conviene cache-first para que las rutinas se vean offline con fotos y todo.
            urlPattern: ({ url }) => url.origin === 'https://raw.githubusercontent.com' || url.pathname.startsWith('/data/exercises-db.json'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'fitsync-exercise-media',
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
})
