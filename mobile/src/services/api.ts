import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Security, RealEstate, Deposit, Crypto, Portfolio, User } from '../types';

// iOS Simulator: localhost, Android Emulator: 10.0.2.2 (host machine)
const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001';
const API_URL = `${API_BASE}/api`;

const TOKEN_KEY = 'authToken';

const getToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(TOKEN_KEY);
};

export const saveToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

const fetchWithAuth = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${url}`, { ...options, headers });

  if (response.status === 401) {
    await removeToken();
    throw new Error('Требуется авторизация');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'Неизвестная ошибка' }));
    throw new Error(body.error || 'Ошибка запроса');
  }

  return response.json();
};

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
    await saveToken(data.token);
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
    await saveToken(data.token);
    return data;
  },

  getMe: async (): Promise<User> => {
    return fetchWithAuth<User>('/auth/me');
  },

  logout: async () => {
    await removeToken();
  },
};

export const portfolioAPI = {
  getPortfolio: async (): Promise<Portfolio> => {
    return fetchWithAuth<Portfolio>('/portfolio');
  },

  addSecurity: async (security: Omit<Security, 'id'>) => {
    return fetchWithAuth<{ id: string }>('/portfolio/securities', {
      method: 'POST',
      body: JSON.stringify(security),
    });
  },

  deleteSecurity: async (id: string) => {
    return fetchWithAuth(`/portfolio/securities/${id}`, { method: 'DELETE' });
  },

  addRealEstate: async (data: Omit<RealEstate, 'id'>) => {
    return fetchWithAuth<{ id: string }>('/portfolio/real-estate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteRealEstate: async (id: string) => {
    return fetchWithAuth(`/portfolio/real-estate/${id}`, { method: 'DELETE' });
  },

  addDeposit: async (deposit: Omit<Deposit, 'id'>) => {
    return fetchWithAuth<{ id: string }>('/portfolio/deposits', {
      method: 'POST',
      body: JSON.stringify(deposit),
    });
  },

  deleteDeposit: async (id: string) => {
    return fetchWithAuth(`/portfolio/deposits/${id}`, { method: 'DELETE' });
  },

  addCryptocurrency: async (crypto: Omit<Crypto, 'id'>) => {
    return fetchWithAuth<{ id: string }>('/portfolio/cryptocurrencies', {
      method: 'POST',
      body: JSON.stringify(crypto),
    });
  },

  deleteCryptocurrency: async (id: string) => {
    return fetchWithAuth(`/portfolio/cryptocurrencies/${id}`, { method: 'DELETE' });
  },
};
