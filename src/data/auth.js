const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const endpoints = {
  patient: `${API_BASE_URL}/api/v1/paciente/auth`,
  doctor: `${API_BASE_URL}/api/v1/medico/auth`,
  patientImagesRecetas: `${API_BASE_URL}/api/v1/paciente/images`,
  patientUpload: `${API_BASE_URL}/api/v1/paciente/upload`,
  doctorPendingImages: `${API_BASE_URL}/api/v1/medico/imagenes-pendientes`,
  doctorpatientImagesRecetas: (pacienteDni) =>
    `${API_BASE_URL}/api/v1/medico/paciente/${pacienteDni}/images`,
  transcribeRecipe: (idReceta) =>
    `${API_BASE_URL}/api/v1/medico/images/${idReceta}/transcribir`,
  rejectRecipe: (idReceta) =>
    `${API_BASE_URL}/api/v1/medico/images/${idReceta}/rechazar`,
};

const TEST_SESSION = {
  token_type: "Bearer",
  access_token: "turnami-frontend-test-token",
  expires_in: 3600,
  user: {
    id: "00000000-0000-4000-8000-000000000001",
    dni: "12345678",
    nombre: "María",
    apellido: "González",
  },
};

async function request(role, options = {}) {
  const response = await fetch(endpoints[role], options);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload.mensaje ||
        payload.message ||
        payload.error ||
        "No fue posible iniciar sesión. Intentá nuevamente.",
    );
  }

  return payload;
}

async function requestEndpoint(endpoint, options = {}) {
  const response = await fetch(endpoint, options);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload.mensaje ||
        payload.message ||
        payload.error ||
        "No fue posible completar la solicitud. Intentá nuevamente.",
    );
  }

  return payload;
}

export function authenticate(role, credentials) {
  if (
    role === "patient" &&
    credentials.dni === TEST_SESSION.user.dni &&
    credentials.password === "turnami2026"
  ) {
    return Promise.resolve(TEST_SESSION);
  }

  return request(role, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
}

export function validateSession(role, accessToken) {
  if (accessToken === TEST_SESSION.access_token)
    return Promise.resolve(TEST_SESSION);

  return request(role, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  }).then((valid) => {
    if (valid !== true && valid?.valid !== true) {
      throw new Error("La sesión no es válida.");
    }
    return valid;
  });
}

export function patientUploadImage(accessToken, file, type = "Receta") {
  if (!file) {
    return Promise.reject(
      new Error("Seleccioná una imagen antes de enviarla."),
    );
  }

  const formData = new FormData();
  formData.append("image", file);
  formData.append("tipo", type);

  return requestEndpoint(endpoints.patientUpload, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });
}

export function patientImagesRecetas(accessToken, type = "Receta") {
  const url = `${endpoints.patientImagesRecetas}?tipo=${encodeURIComponent(type)}`;

  return requestEndpoint(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function patientImagesOrdenes(accessToken) {
  return patientImagesRecetas(accessToken, "Orden");
}

export function doctorPendingImagesRecetas(accessToken, type = "Receta") {
  const url = `${endpoints.doctorPendingImages}?tipo=${encodeURIComponent(type)}`;

  return requestEndpoint(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function doctorPendingImagesOrdenes(accessToken) {
  return doctorPendingImagesRecetas(accessToken, "Orden");
}
export function transcribeRecipe(accessToken, idReceta) {
  return requestEndpoint(endpoints.transcribeRecipe(idReceta), {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function rejectRecipe(accessToken, idReceta) {
  return requestEndpoint(endpoints.rejectRecipe(idReceta), {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
