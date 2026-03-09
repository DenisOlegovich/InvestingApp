import type {
  Security,
  RealEstate,
  Deposit,
  Crypto,
  Portfolio,
  User,
  Transaction,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const getToken = (): string | null => localStorage.getItem("authToken");

export const saveToken = (token: string): void => {
  localStorage.setItem("authToken", token);
};

export const removeToken = (): void => {
  localStorage.removeItem("authToken");
};

/** Событие при 401 — приложение может подписаться и переключиться на экран входа */
export const AUTH_UNAUTHORIZED_EVENT = "auth:unauthorized";

const fetchWithAuth = async <T>(
  url: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${url}`, { ...options, headers });

  if (response.status === 401) {
    removeToken();
    window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
    throw new Error("Требуется авторизация");
  }

  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => ({ error: "Неизвестная ошибка" }));
    throw new Error(body.error || "Ошибка запроса");
  }

  return response.json();
};

// Auth API
export const authAPI = {
  register: async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Ошибка регистрации");
    }

    const data = await response.json();
    saveToken(data.token);
    return data;
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Ошибка входа");
    }

    const data = await response.json();
    saveToken(data.token);
    return data;
  },

  getMe: async (): Promise<User> => {
    return fetchWithAuth<User>("/auth/me");
  },

  logout: () => {
    removeToken();
  },

  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Ошибка запроса");
    }
    return response.json();
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Ошибка сброса пароля");
    }
    return response.json();
  },
};

// Portfolio API
export const portfolioAPI = {
  getPortfolio: async (): Promise<Portfolio> => {
    return fetchWithAuth<Portfolio>("/portfolio");
  },

  addSecurity: async (security: Omit<Security, "id">) => {
    return fetchWithAuth<{ id: string }>("/portfolio/securities", {
      method: "POST",
      body: JSON.stringify(security),
    });
  },

  updateSecurity: async (id: string, updates: Partial<Security>) => {
    return fetchWithAuth(`/portfolio/securities/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  deleteSecurity: async (id: string) => {
    return fetchWithAuth(`/portfolio/securities/${id}`, {
      method: "DELETE",
    });
  },

  // Real Estate
  addRealEstate: async (realEstate: Omit<RealEstate, "id">) => {
    return fetchWithAuth<{ id: string }>("/portfolio/real-estate", {
      method: "POST",
      body: JSON.stringify(realEstate),
    });
  },

  updateRealEstate: async (id: string, updates: Partial<RealEstate>) => {
    return fetchWithAuth(`/portfolio/real-estate/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  deleteRealEstate: async (id: string) => {
    return fetchWithAuth(`/portfolio/real-estate/${id}`, {
      method: "DELETE",
    });
  },

  // Deposits
  addDeposit: async (deposit: Omit<Deposit, "id">) => {
    return fetchWithAuth<{ id: string }>("/portfolio/deposits", {
      method: "POST",
      body: JSON.stringify(deposit),
    });
  },

  updateDeposit: async (id: string, updates: Partial<Deposit>) => {
    return fetchWithAuth(`/portfolio/deposits/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  deleteDeposit: async (id: string) => {
    return fetchWithAuth(`/portfolio/deposits/${id}`, {
      method: "DELETE",
    });
  },

  // Cryptocurrencies
  addCryptocurrency: async (crypto: Omit<Crypto, "id">) => {
    return fetchWithAuth<{ id: string }>("/portfolio/cryptocurrencies", {
      method: "POST",
      body: JSON.stringify(crypto),
    });
  },

  updateCryptocurrency: async (id: string, updates: Partial<Crypto>) => {
    return fetchWithAuth(`/portfolio/cryptocurrencies/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  deleteCryptocurrency: async (id: string) => {
    return fetchWithAuth(`/portfolio/cryptocurrencies/${id}`, {
      method: "DELETE",
    });
  },

  getTransactions: async (): Promise<Transaction[]> => {
    return fetchWithAuth<Transaction[]>("/portfolio/transactions");
  },

  addTransaction: async (tx: Omit<Transaction, "id" | "createdAt">) => {
    return fetchWithAuth<{ id: string }>("/portfolio/transactions", {
      method: "POST",
      body: JSON.stringify(tx),
    });
  },

  deleteTransaction: async (id: string) => {
    return fetchWithAuth(`/portfolio/transactions/${id}`, {
      method: "DELETE",
    });
  },
};
