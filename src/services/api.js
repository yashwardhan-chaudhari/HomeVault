let authToken = localStorage.getItem('hv_token');

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('hv_token', token);
  } else {
    localStorage.removeItem('hv_token');
  }
};

export const getAuthToken = () => authToken;

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Server error (${response.status})`);
  }

  return data;
}

export const api = {
  // Auth
  register: (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/api/auth/me'),
  updateProfile: (data) => request('/api/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  updatePassword: (data) => request('/api/auth/password', { method: 'PUT', body: JSON.stringify(data) }),
  forgotPassword: (email) => request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  deleteAccount: () => request('/api/auth/delete-account', { method: 'DELETE' }),

  // Items
  getItems: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    return request(`/api/items?${params.toString()}`);
  },
  getItem: (id) => request(`/api/items/${id}`),
  createItem: (data) => request('/api/items', { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (id, data) => request(`/api/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteItem: (id) => request(`/api/items/${id}`, { method: 'DELETE' }),
  toggleFavorite: (id) => request(`/api/items/${id}/favorite`, { method: 'PATCH' }),

  // Autocomplete Suggestions
  getSuggestions: () => request('/api/suggestions'),

  // AI Auto Detect
  autoDetect: (imageBase64, mimeType) => request('/api/autodetect', {
    method: 'POST',
    body: JSON.stringify({ imageBase64, mimeType })
  }),

  // Dashboard & Analytics
  getDashboardStats: () => request('/api/dashboard/stats'),
  getAnalytics: () => request('/api/analytics'),
  getActivityLogs: () => request('/api/activity-logs'),
  getNotifications: () => request('/api/notifications'),
  markNotificationRead: (id) => request(`/api/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/api/notifications/read-all', { method: 'PATCH' })
};
