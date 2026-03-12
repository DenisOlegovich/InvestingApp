import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Security, RealEstate, Deposit, Crypto, Portfolio, User, Transaction } from '../types';

// iOS Simulator: localhost. Android Emulator: 10.0.2.2.
// ФИЗ. УСТРОЙСТВО: замени на IP компьютера в сети, напр. 'http://192.168.1.100:3001'
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

  forgotPassword: async (email: string) => {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Ошибка запроса');
    }
    return res.json();
  },

  resetPassword: async (token: string, newPassword: string) => {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Ошибка сброса');
    }
    return res.json();
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

  updateSecurity: async (id: string, updates: Partial<Security>) => {
    return fetchWithAuth(`/portfolio/securities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
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

  updateRealEstate: async (id: string, updates: Partial<RealEstate>) => {
    return fetchWithAuth(`/portfolio/real-estate/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
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

  updateDeposit: async (id: string, updates: Partial<Deposit>) => {
    return fetchWithAuth(`/portfolio/deposits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
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

  updateCryptocurrency: async (id: string, updates: Partial<Crypto>) => {
    return fetchWithAuth(`/portfolio/cryptocurrencies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteCryptocurrency: async (id: string) => {
    return fetchWithAuth(`/portfolio/cryptocurrencies/${id}`, { method: 'DELETE' });
  },

  getTransactions: async (): Promise<Transaction[]> => {
    return fetchWithAuth<Transaction[]>('/portfolio/transactions');
  },

  addTransaction: async (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    return fetchWithAuth<{ id: string }>('/portfolio/transactions', {
      method: 'POST',
      body: JSON.stringify(tx),
    });
  },

  deleteTransaction: async (id: string) => {
    return fetchWithAuth(`/portfolio/transactions/${id}`, { method: 'DELETE' });
  },
};
