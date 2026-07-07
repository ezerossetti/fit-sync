import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import TopBar from './components/TopBar'
import BottomNav from './components/BottomNav'
import Login from './pages/Login'
import Home from './pages/Home'
import Rutinas from './pages/Rutinas'
import EntrenamientoActivo from './pages/EntrenamientoActivo'
import Historial from './pages/Historial'
import Perfil from './pages/Perfil'

export default function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="material-symbols-outlined text-accent text-[32px] animate-spin">progress_activity</span>
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main
        className="max-w-container-max mx-auto px-margin-mobile pb-28"
        style={{ paddingTop: 'calc(72px + env(safe-area-inset-top))' }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rutinas" element={<Rutinas />} />
          <Route path="/entrenar" element={<EntrenamientoActivo />} />
          <Route path="/entrenar/:rutinaId" element={<EntrenamientoActivo />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}
