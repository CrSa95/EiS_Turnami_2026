import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import { doctorPatientsImages, patientUploadImage, validateSession } from '../data/auth'
import '../styles/home.css'
import Recetas from '../components/Recetas'
import Navigation from '../components/Navigation'
import Modal from '../components/modal'
import ModalState from '../components/ModalStates'

export const States = {
  Error: 'Error',
  Ok: 'Ok',
  Loading: 'Loading',
}

function HomePage() {
  const [session, setSession] = useState(() => {
    const storedSession = localStorage.getItem('turnami-session')
    return storedSession ? JSON.parse(storedSession) : null
  })
  const navigate = useNavigate()

  const [state, setState] = useState('NONE')

  useEffect(() => {
    if (!session) return

    validateSession(session.role, session.access_token).catch(() => {
      localStorage.removeItem('turnami-session')
      setSession(null)
    })
  }, [session])

  if (!session) return <Navigate to="/" replace />

  const fullName = [session.user.nombre, session.user.apellido].filter(Boolean).join(' ')
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
    },
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
    }, {
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
    },
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
    },
  ]

  console.log('nare', state)

  const handleImage = (file) => {
    setState(States.Loading)
    try {
//      const request = patientUploadImage(session.access_token, file)
  //    console.log('request', request)
      setState(States.Ok)
    } catch (error) {
      setState(States.Error)
    }
  }

  //  useEffect( () => { doctorPatientsImages(session.access_token)}, [])

  const subtitle = role == 'paciente' ? `Visualiza y envia tus recetas` : `Gestiona y transcrive las recetas`
  return (
    <main className="home-page">
      <Navigation title={`Bienvenido/a,  ${fullName}`} subtitle={subtitle} handleLogout={handleLogout} />
      <Recetas recetas={[]} rol={role} handleImage={handleImage} />
      <ModalState state={state} setState={setState} />
    </main>
  )
}

export default HomePage