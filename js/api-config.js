// API Configuration
const API_CONFIG = {
  // Use relative path since backend serves frontend from same origin
  BASE_URL: '/api',
  
  // Socket.IO URL - use same origin
  SOCKET_URL: window.location.origin
};

// Helper function para hacer peticiones a la API
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('cripta_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error en la petición');
  }

  return response.json();
}

// Guardar token
function saveToken(token) {
  localStorage.setItem('cripta_token', token);
}

// Obtener token
function getToken() {
  return localStorage.getItem('cripta_token');
}

// Eliminar token
function removeToken() {
  localStorage.removeItem('cripta_token');
}

// Verificar si está autenticado
function isAuthenticated() {
  return !!getToken();
}
