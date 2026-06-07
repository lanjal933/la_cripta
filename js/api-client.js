// API Client para La Cripta
const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  SOCKET_URL: 'http://localhost:3000'
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

// Auth API
const AuthAPI = {
  async register(data) {
    const result = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    if (result.token) {
      localStorage.setItem('cripta_token', result.token);
      localStorage.setItem('cripta_user', JSON.stringify(result.user));
    }
    
    return result;
  },

  async getMe() {
    return await apiCall('/auth/me');
  },

  async updateProfile(data) {
    const result = await apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    
    if (result.user) {
      localStorage.setItem('cripta_user', JSON.stringify(result.user));
    }
    
    return result;
  },

  async updateAvailability(data) {
    const result = await apiCall('/auth/availability', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    
    if (result.user) {
      localStorage.setItem('cripta_user', JSON.stringify(result.user));
    }
    
    return result;
  },

  async updateSettings(data) {
    const result = await apiCall('/auth/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    
    if (result.user) {
      localStorage.setItem('cripta_user', JSON.stringify(result.user));
    }
    
    return result;
  },

  async logout() {
    await apiCall('/auth/logout', { method: 'POST' });
    localStorage.removeItem('cripta_token');
    localStorage.removeItem('cripta_user');
    localStorage.removeItem('your_matchmaking_search');
  },

  isAuthenticated() {
    return !!localStorage.getItem('cripta_token');
  }
};

// Matchmaking API
const MatchmakingAPI = {
  async createSearch(playerClass) {
    return await apiCall('/matchmaking/search', {
      method: 'POST',
      body: JSON.stringify({ playerClass })
    });
  },

  async cancelSearch() {
    return await apiCall('/matchmaking/search', {
      method: 'DELETE'
    });
  },

  async getMySearch() {
    return await apiCall('/matchmaking/my-search');
  },

  async getActiveSearches() {
    return await apiCall('/matchmaking/active');
  },

  async checkMatches() {
    return await apiCall('/matchmaking/check-matches', {
      method: 'POST'
    });
  }
};

// Users API
const UsersAPI = {
  async getNotifications() {
    return await apiCall('/users/notifications');
  },

  async markNotificationRead(notificationId) {
    return await apiCall(`/users/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  },

  async deleteNotification(notificationId) {
    return await apiCall(`/users/notifications/${notificationId}`, {
      method: 'DELETE'
    });
  }
};

// Exportar APIs
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuthAPI, MatchmakingAPI, UsersAPI, API_CONFIG };
}
