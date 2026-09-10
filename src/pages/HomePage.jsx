import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import { doctorPatientsImages, patientUploadImage, validateSession } from '../data/auth'
import '../styles/home.css'
import Recetas from '../components/Recetas'
import Navigation from '../components/Navigation'
import Modal from '../components/modal'

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
      paciente: { nombre: "Narela", apellido: "Camara" },
      receta: {
        nombre: "Esitalopran",
        fecha: '2026-09-01'
      }
    },
    {
      paciente: { nombre: "Rocio", apellido: "Camara" },
      receta: {
        nombre: "Esitalopran",
        fecha: '2026-09-01'
      }
    }
  ]


  const handleImage = () => {
    const request = patientUploadImage(session.access_token)
    console.log('request', request)
  }

  //  useEffect( () => { doctorPatientsImages(session.access_token)}, [])


  /* <Modal status="Ok" message="Guardado correctamente" />
   * <Modal status="Fallo" message="No se pudo completar la operación" onClose={() => {}} />        
   * <Modal status="Cargando" />
  */

  const subtitle = role == 'paciente' ? `Visualiza y envia tus recetas` : `Gestiona y transcrive las recetas`
  return (
    <main className="home-page">
      <Navigation title={`Bienvenido/a,  ${fullName}`} subtitle={subtitle} handleLogout={handleLogout} />
      <Recetas recetas={recetas} rol={role} handleImage={handleImage} />
    </main>
  )
}

export default HomePage