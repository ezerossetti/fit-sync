import { Routes, Route } from 'react-router-dom'
import TopBar from './components/TopBar'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Rutinas from './pages/Rutinas'
import EntrenamientoActivo from './pages/EntrenamientoActivo'
import Historial from './pages/Historial'
import Usuarios from './pages/Usuarios'

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="max-w-container-max mx-auto px-margin-mobile pt-[72px] pb-28">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rutinas" element={<Rutinas />} />
          <Route path="/entrenar" element={<EntrenamientoActivo />} />
          <Route path="/entrenar/:rutinaId" element={<EntrenamientoActivo />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/usuarios" element={<Usuarios />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}
