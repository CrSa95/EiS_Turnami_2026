import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import { validateSession } from '../data/auth'
import '../styles/home.css'

function HomePage() {
  const [session, setSession] = useState(() => {
    const storedSession = localStorage.getItem('turnami-session')
    return storedSession ? JSON.parse(storedSession) : null
  })
  const navigate = useNavigate()

  useEffect(() => {
    if (!session) return

    validateSession(session.role, session.access_token).catch(() => {
      localStorage.removeItem('turnami-session')
      setSession(null)
    })
  }, [session])

  if (!session) return <Navigate to="/" replace />

  const fullName = [session.user.nombre, session.user.apellido].filter(Boolean).join(' ')
  const roleLabel = session.role === 'patient' ? 'paciente' : 'profesional'

  const handleLogout = () => {
    localStorage.removeItem('turnami-session')
    navigate('/', { replace: true })
  }

  return (
    <main className="home-page">
      <header className="home-header"><div className="home-brand"><BrandMark /></div><button type="button" onClick={handleLogout}>Cerrar sesión</button></header>
      <section className="home-welcome" aria-labelledby="welcome-title">
        <p className="eyebrow">HOLA, {roleLabel.toUpperCase()}</p>
        <h1 id="welcome-title">Bienvenido/a, {fullName}</h1>
        <p>Tu espacio personal en Turnami está listo.</p>
      </section>
    </main>
  )
}

export default HomePage