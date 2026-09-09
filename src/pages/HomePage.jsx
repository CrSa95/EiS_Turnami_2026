import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import { validateSession } from '../data/auth'
import '../styles/home.css'
import Recetas from '../components/Recetas'

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
  const role = session.role === 'patient' ? 'paciente' : 'medico'

  const handleLogout = () => {
    localStorage.removeItem('turnami-session')
    navigate('/', { replace: true })
  }

  const recetas = [ 
    {
      paciente: { nombre: "Narela", apellido:  "Camara"},
      receta: {
         nombre: "Esitalopran", 
         descripcion: "le agarro el bajon ahhre"
      }
    },
    {
      paciente: { nombre: "Rocio", apellido:  "Camara"},
      receta: {
         nombre: "Esitalopran", 
         descripcion: "le agarro el bajon ahhre"
      }
    }
  ]
  return (
    <main className="home-page">
      <header className="home-header"><div className="home-brand"><BrandMark /></div><button type="button" onClick={handleLogout}>Cerrar sesión</button></header>
      <section className="home-welcome" aria-labelledby="welcome-title">
        <p className="eyebrow">HOLA, {roleLabel.toUpperCase()}</p>
        <h1 id="welcome-title">Bienvenido/a, {fullName}</h1>
        {role == "paciente" &&  <CargarReceta />}
        <Recetas recetas={recetas} rol={role} />
      </section>
    </main>
  )
}

export default HomePage