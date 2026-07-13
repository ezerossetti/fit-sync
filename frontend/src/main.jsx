import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'
import './styles.css'

// Registro manual del service worker (en vez de injectRegister:'auto' de
// vite-plugin-pwa) para poder forzar un chequeo de actualización cada vez
// que la PWA instalada vuelve a primer plano. El problema que resuelve esto:
// una app instalada en el celu (Android/iOS) puede quedarse "pegada" a la
// versión que se instaló, porque el navegador no siempre vuelve a chequear
// si hay un SW nuevo con solo reabrir el ícono. Acá lo forzamos nosotros.
registerSW({
  immediate: true,
  onRegisteredSW(swUrl, registration) {
    if (!registration) return
    registration.update()
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') registration.update()
    })
    setInterval(() => registration.update(), 60 * 60 * 1000) // cada 1h con la app abierta
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
