const endpoints = {
  patient: '/api/v1/paciente/auth',
  doctor: '/api/v1/medico/auth',
  patientUpload: '/api/v1/paciente/upload',
  doctorPatientImages: (pacienteId) => `/api/v1/medico/paciente/${pacienteId}/images`,
}

const TEST_SESSION = {
  token_type: 'Bearer',
  access_token: 'turnami-frontend-test-token',
  expires_in: 3600,
  user: {
    id: '00000000-0000-4000-8000-000000000001',
    dni: '12345678',
    nombre: 'María',
    apellido: 'González',
  },
}

async function request(role, options = {}) {
  const response = await fetch(endpoints[role], options)
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      payload.mensaje || payload.message || payload.error || 'No fue posible iniciar sesión. Intentá nuevamente.',
    )
  }

  return payload
}

async function requestEndpoint(endpoint, options = {}) {
  const response = await fetch(endpoint, options)
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      payload.mensaje || payload.message || payload.error || 'No fue posible completar la solicitud. Intentá nuevamente.',
    )
  }

  return payload
}

export function authenticate(role, credentials) {
  if (role === 'patient' && credentials.dni === TEST_SESSION.user.dni && credentials.password === 'turnami2026') {
    return Promise.resolve(TEST_SESSION)
  }

  return request(role, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
}

export function validateSession(role, accessToken) {
  if (accessToken === TEST_SESSION.access_token) return Promise.resolve(TEST_SESSION)

  return request(role, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}


export function patientUploadImage(accessToken, file) {
  if (!file) {
    return Promise.reject(new Error('Seleccioná una imagen antes de enviarla.'))
  }

  const formData = new FormData()
  formData.append('image', file)

  return requestEndpoint(endpoints.patientUpload, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  })
}

export function doctorPatientsImages(accessToken, pacienteId) {
  if (!pacienteId) {
    return Promise.reject(new Error('El ID del paciente es obligatorio.'))
  }

  return requestEndpoint(endpoints.doctorPatientImages(pacienteId), {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}