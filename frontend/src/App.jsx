import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import SesionForm from './components/SesionForm'
import SesionesList from './components/SesionesList'
import UsuarioForm from './components/UsuarioForm'
import UsuarioList from './components/UsuarioList'
import RutinaForm from './components/RutinaForm'
import RutinasList from './components/RutinasList'

const F = "'Lexend', sans-serif"

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [sesionEditando, setSesionEditando] = useState(null)
  const [rutinaEditando, setRutinaEditando] = useState(null)

  const handleRefresh = () => setRefreshKey(prev => prev + 1)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0F', fontFamily: F }}>
      <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <Navbar />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/sesiones" replace />} />
          <Route path="/sesiones" element={
            <div>
              <h1 style={{ fontFamily: F, fontSize: '28px', fontWeight: '700', color: '#e3e2df', margin: '0 0 4px' }}>
                {sesionEditando ? '✏️ Editar Sesión' : 'Sesiones'}
              </h1>
              <p style={{ fontFamily: F, fontSize: '14px', color: '#c4c6d2', margin: '0 0 28px' }}>
                {sesionEditando ? 'Modificá los datos de tu sesión.' : 'Registrá y seguí tus entrenamientos.'}
              </p>
              <SesionForm onSesionCreated={handleRefresh} sesionEditando={sesionEditando} onCancelEdit={() => setSesionEditando(null)} />
              <hr style={{ border: 'none', borderTop: '1px solid #444650', margin: '32px 0' }} />
              <h2 style={{ fontFamily: F, fontSize: '20px', fontWeight: '700', color: '#e3e2df', margin: '0 0 16px' }}>Historial de Sesiones</h2>
              <SesionesList key={`sesiones-${refreshKey}`} onEditarSesion={(s) => { setSesionEditando(s); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
            </div>
          } />
          <Route path="/rutinas" element={
            <div>
              <h1 style={{ fontFamily: F, fontSize: '28px', fontWeight: '700', color: '#e3e2df', margin: '0 0 4px' }}>
                {rutinaEditando ? '✏️ Editar Rutina' : 'Mis Rutinas'}
              </h1>
              <p style={{ fontFamily: F, fontSize: '14px', color: '#c4c6d2', margin: '0 0 28px' }}>
                {rutinaEditando ? 'Modificá los datos de tu rutina.' : 'Mantén el ritmo y alcanzá tus objetivos.'}
              </p>
              <RutinaForm onRutinaCreada={handleRefresh} rutinaEditando={rutinaEditando} onCancelEdit={() => setRutinaEditando(null)} />
              <hr style={{ border: 'none', borderTop: '1px solid #444650', margin: '32px 0' }} />
              <h2 style={{ fontFamily: F, fontSize: '20px', fontWeight: '700', color: '#e3e2df', margin: '0 0 16px' }}>Rutinas guardadas</h2>
              <RutinasList key={`rutinas-${refreshKey}`} refreshKey={refreshKey} onEditarRutina={(r) => { setRutinaEditando(r); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
            </div>
          } />
          <Route path="/usuarios" element={
            <div>
              <h1 style={{ fontFamily: F, fontSize: '28px', fontWeight: '700', color: '#e3e2df', margin: '0 0 4px' }}>Usuarios</h1>
              <p style={{ fontFamily: F, fontSize: '14px', color: '#c4c6d2', margin: '0 0 28px' }}>Gestioná los perfiles de la app.</p>
              <UsuarioForm onUsuarioCreated={handleRefresh} />
              <hr style={{ border: 'none', borderTop: '1px solid #444650', margin: '32px 0' }} />
              <h2 style={{ fontFamily: F, fontSize: '20px', fontWeight: '700', color: '#e3e2df', margin: '0 0 16px' }}>Lista de usuarios</h2>
              <UsuarioList key={`usuarios-${refreshKey}`} />
            </div>
          } />
        </Routes>
      </main>
    </div>
  )
}
