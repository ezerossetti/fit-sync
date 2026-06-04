import { useState } from 'react'
import SesionForm from './components/SesionForm'
import SesionesList from './components/SesionesList'
import UsuarioForm from './components/UsuarioForm'
import UsuarioList from './components/UsuarioList'
import RutinaForm from './components/RutinaForm'
import RutinasList from './components/RutinasList'

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => setRefreshKey(prev => prev + 1)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <header style={{ backgroundColor: '#1976d2', color: 'white', padding: '20px' }}>
        <h1 style={{ margin: 0 }}>💪 FitSync</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>PWA de registro de entrenamiento de fuerza</p>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <SesionForm onSesionCreated={handleRefresh} />
        <SesionesList key={`sesiones-${refreshKey}`} />

        <hr style={{ margin: '30px 0', border: 'none', borderTop: '2px solid #e0e0e0' }} />

        <RutinaForm onRutinaCreada={handleRefresh} />
        <RutinasList key={`rutinas-${refreshKey}`} refreshKey={refreshKey} />

        <hr style={{ margin: '30px 0', border: 'none', borderTop: '2px solid #e0e0e0' }} />

        <UsuarioForm onUsuarioCreated={handleRefresh} />
        <UsuarioList key={`usuarios-${refreshKey}`} />
      </main>
    </div>
  )
}
