import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { TourProvider } from './context/TourContext'
import TopBar from './components/TopBar'
import BottomNav from './components/BottomNav'
import Login from './pages/Login'
const Home = lazy(() => import('./pages/Home'))
const Rutinas = lazy(() => import('./pages/Rutinas'))
const EntrenamientoActivo = lazy(() => import('./pages/EntrenamientoActivo'))
const Historial = lazy(() => import('./pages/Historial'))
const Momentos = lazy(() => import('./pages/Momentos'))
const Perfil = lazy(() => import('./pages/Perfil'))
import CoachChat from './components/CoachChat'
import PendingSyncBanner from './components/PendingSyncBanner'
import TourOverlay from './components/TourOverlay'
import usePendingSessionSync from './hooks/usePendingSessionSync'

export default function App() {
  const { session, loading } = useAuth()
  const sync = usePendingSessionSync()
  const { pathname } = useLocation()
  const entrenamiento = pathname.startsWith('/entrenar')
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="material-symbols-outlined text-accent text-[32px] animate-spin">progress_activity</span>
      </div>
    )
  }

  if (!session) {
    return (
      <>
        <Login />
      </>
    )
  }

  return (
    <TourProvider key={session.user.id}>
      <div className={`app-shell ${entrenamiento ? 'training-shell' : ''}`}>
        <TopBar sync={sync} />
        <main className="app-main">
          <PendingSyncBanner sync={sync} />
          <Suspense fallback={<div className="skeleton-card" aria-label="Cargando pantalla"/>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rutinas" element={<Rutinas />} />
            <Route path="/entrenar" element={<EntrenamientoActivo />} />
            <Route path="/entrenar/:rutinaId" element={<EntrenamientoActivo />} />
            <Route path="/historial/momentos" element={<Momentos />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </main>
        <BottomNav />
        {!entrenamiento && <CoachChat />}
        <TourOverlay />

      </div>
    </TourProvider>
  )
}
