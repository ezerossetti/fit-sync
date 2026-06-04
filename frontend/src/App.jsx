import { useState } from 'react'
import SesionForm from './components/SesionForm'
import SesionesList from './components/SesionesList'

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSesionCreated = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <header style={{ backgroundColor: '#1976d2', color: 'white', padding: '20px' }}>
        <h1 style={{ margin: 0 }}>💪 FitSync</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>PWA de registro de entrenamiento de fuerza</p>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <SesionForm onSesionCreated={handleSesionCreated} />
        <SesionesList key={refreshKey} />
      </main>
    </div>
  )
}
