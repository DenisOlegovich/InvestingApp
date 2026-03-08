// API Client для работы с backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Получить токен из localStorage
const getToken = (): string | null => {
  return localStorage.getItem("authToken");
};

// Сохранить токен
export const saveToken = (token: string): void => {
  localStorage.setItem("authToken", token);
};

// Удалить токен (выход)
export const removeToken = (): void => {
  localStorage.removeItem("authToken");
};

// Базовый fetch с авторизацией
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Токен истек или недействителен
    removeToken();
    window.location.href = "/login";
    throw new Error("Требуется авторизация");
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Неизвестная ошибка" }));
    throw new Error(error.error || "Ошибка запроса");
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

  getMe: async () => {
    return fetchWithAuth("/auth/me");
  },

  logout: () => {
    removeToken();
  },
};

// Portfolio API
export const portfolioAPI = {
  getPortfolio: async () => {
    return fetchWithAuth("/portfolio");
  },

  // Securities
  addSecurity: async (security: any) => {
    return fetchWithAuth("/portfolio/securities", {
      method: "POST",
      body: JSON.stringify(security),
    });
  },

  updateSecurity: async (id: string, updates: any) => {
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
  addRealEstate: async (realEstate: any) => {
    return fetchWithAuth("/portfolio/real-estate", {
      method: "POST",
      body: JSON.stringify(realEstate),
    });
  },

  updateRealEstate: async (id: string, updates: any) => {
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
  addDeposit: async (deposit: any) => {
    return fetchWithAuth("/portfolio/deposits", {
      method: "POST",
      body: JSON.stringify(deposit),
    });
  },

  updateDeposit: async (id: string, updates: any) => {
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
  addCryptocurrency: async (crypto: any) => {
    return fetchWithAuth("/portfolio/cryptocurrencies", {
      method: "POST",
      body: JSON.stringify(crypto),
    });
  },

  updateCryptocurrency: async (id: string, updates: any) => {
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
};

// Extended API (goals, transactions, risk, alerts, watchlist, diary, dividends, bonds, import)
export const extendedAPI = {
  goals: {
    get: () => fetchWithAuth("/extended/goals"),
    create: (data: object) =>
      fetchWithAuth("/extended/goals", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: object) =>
      fetchWithAuth(`/extended/goals/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetchWithAuth(`/extended/goals/${id}`, { method: "DELETE" }),
  },
  transactions: {
    get: (assetType?: string) =>
      fetchWithAuth(`/extended/transactions${assetType ? `?assetType=${assetType}` : ""}`),
    create: (data: object) =>
      fetchWithAuth("/extended/transactions", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetchWithAuth(`/extended/transactions/${id}`, { method: "DELETE" }),
  },
  riskProfile: {
    get: () => fetchWithAuth("/extended/risk-profile"),
    upsert: (data: object) =>
      fetchWithAuth("/extended/risk-profile", { method: "PUT", body: JSON.stringify(data) }),
  },
  alerts: {
    get: () => fetchWithAuth("/extended/alerts"),
    create: (data: object) =>
      fetchWithAuth("/extended/alerts", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: object) =>
      fetchWithAuth(`/extended/alerts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetchWithAuth(`/extended/alerts/${id}`, { method: "DELETE" }),
  },
  watchlist: {
    get: () => fetchWithAuth("/extended/watchlist"),
    create: (data: object) =>
      fetchWithAuth("/extended/watchlist", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: object) =>
      fetchWithAuth(`/extended/watchlist/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetchWithAuth(`/extended/watchlist/${id}`, { method: "DELETE" }),
  },
  diary: {
    get: () => fetchWithAuth("/extended/diary"),
    create: (data: object) =>
      fetchWithAuth("/extended/diary", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetchWithAuth(`/extended/diary/${id}`, { method: "DELETE" }),
  },
  dividendPayments: {
    get: () => fetchWithAuth("/extended/dividend-payments"),
    create: (data: object) =>
      fetchWithAuth("/extended/dividend-payments", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetchWithAuth(`/extended/dividend-payments/${id}`, { method: "DELETE" }),
  },
  bondCoupons: {
    get: () => fetchWithAuth("/extended/bond-coupons"),
    create: (data: object) =>
      fetchWithAuth("/extended/bond-coupons", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetchWithAuth(`/extended/bond-coupons/${id}`, { method: "DELETE" }),
  },
  importCSV: (csv: string) =>
    fetchWithAuth("/extended/import/csv", {
      method: "POST",
      body: JSON.stringify({ csv }),
    }),
};
