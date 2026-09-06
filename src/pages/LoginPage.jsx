import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import LoginForm from '../components/LoginForm'
import LoginModal from '../components/LoginModal'
import WelcomePanel from '../components/WelcomePanel'
import { authenticate } from '../data/auth'
import '../styles/login.css'

function LoginPage() {
  const hasSession = Boolean(localStorage.getItem('turnami-session'))
  const [role, setRole] = useState('patient')
  const [dni, setDni] = useState('')
  const [password, setPassword] = useState('')
  const [modal, setModal] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  if (hasSession) return <Navigate to="/home" replace />

  const selectRole = (nextRole) => {
    setRole(nextRole)
    setDni('')
    setPassword('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!dni || !password) {
      setModal({ type: 'error', message: 'Completá tu DNI y contraseña para ingresar.' })
      return
    }

    setIsSubmitting(true)
    try {
      const session = await authenticate(role, { dni, password })
      localStorage.setItem('turnami-session', JSON.stringify({ ...session, role }))
      navigate('/home', { replace: true })
    } catch (error) {
      setModal({ type: 'error', message: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <WelcomePanel />
      <LoginForm
        role={role}
        dni={dni}
        password={password}
        isSubmitting={isSubmitting}
        onRoleChange={selectRole}
        onDniChange={(event) => setDni(event.target.value.replace(/\D/g, '').slice(0, 8))}
        onPasswordChange={(event) => setPassword(event.target.value)}
        onSubmit={handleSubmit}
      />
      <LoginModal modal={modal} onClose={() => setModal(null)} />
    </main>
  )
}

export default LoginPage