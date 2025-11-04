// API Client для работы с backend
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

// Получить токен из localStorage
const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Сохранить токен
export const saveToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Удалить токен (выход)
export const removeToken = (): void => {
  localStorage.removeItem('authToken');
};

// Базовый fetch с авторизацией
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Токен истек или недействителен
    removeToken();
    window.location.href = '/login';
    throw new Error('Требуется авторизация');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Неизвестная ошибка' }));
    throw new Error(error.error || 'Ошибка запроса');
  }

  return response.json();
};

// Auth API
export const authAPI = {
  register: async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка регистрации');
    }

    const data = await response.json();
    saveToken(data.token);
    return data;
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка входа');
    }

    const data = await response.json();
    saveToken(data.token);
    return data;
  },

  getMe: async () => {
    return fetchWithAuth('/auth/me');
  },

  logout: () => {
    removeToken();
  },
};

// Portfolio API
export const portfolioAPI = {
  getPortfolio: async () => {
    return fetchWithAuth('/portfolio');
  },

  // Securities
  addSecurity: async (security: any) => {
    return fetchWithAuth('/portfolio/securities', {
      method: 'POST',
      body: JSON.stringify(security),
    });
  },

  updateSecurity: async (id: string, updates: any) => {
    return fetchWithAuth(`/portfolio/securities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteSecurity: async (id: string) => {
    return fetchWithAuth(`/portfolio/securities/${id}`, {
      method: 'DELETE',
    });
  },

  // Real Estate
  addRealEstate: async (realEstate: any) => {
    return fetchWithAuth('/portfolio/real-estate', {
      method: 'POST',
      body: JSON.stringify(realEstate),
    });
  },

  updateRealEstate: async (id: string, updates: any) => {
    return fetchWithAuth(`/portfolio/real-estate/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteRealEstate: async (id: string) => {
    return fetchWithAuth(`/portfolio/real-estate/${id}`, {
      method: 'DELETE',
    });
  },

  // Deposits
  addDeposit: async (deposit: any) => {
    return fetchWithAuth('/portfolio/deposits', {
      method: 'POST',
      body: JSON.stringify(deposit),
    });
  },

  updateDeposit: async (id: string, updates: any) => {
    return fetchWithAuth(`/portfolio/deposits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteDeposit: async (id: string) => {
    return fetchWithAuth(`/portfolio/deposits/${id}`, {
      method: 'DELETE',
    });
  },

  // Cryptocurrencies
  addCryptocurrency: async (crypto: any) => {
    return fetchWithAuth('/portfolio/cryptocurrencies', {
      method: 'POST',
      body: JSON.stringify(crypto),
    });
  },

  updateCryptocurrency: async (id: string, updates: any) => {
    return fetchWithAuth(`/portfolio/cryptocurrencies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteCryptocurrency: async (id: string) => {
    return fetchWithAuth(`/portfolio/cryptocurrencies/${id}`, {
      method: 'DELETE',
    });
  },
};

