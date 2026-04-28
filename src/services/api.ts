import type {
  Security,
  RealEstate,
  Deposit,
  Crypto,
  Portfolio,
  User,
  Transaction,
} from "../types";
import type { Alert, BondCoupon, InvestDiaryEntry } from "../types/investor";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const getToken = (): string | null => localStorage.getItem("authToken");

export const hasAuthToken = (): boolean => Boolean(getToken());

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

  getNotes: async (): Promise<{ content: string }> => {
    return fetchWithAuth<{ content: string }>("/portfolio/notes");
  },

  saveNotes: async (content: string): Promise<void> => {
    await fetchWithAuth("/portfolio/notes", {
      method: "PUT",
      body: JSON.stringify({ content }),
    });
  },
};

const LS_ALERTS = "investor_ext_alerts";
const LS_COUPONS = "investor_ext_bond_coupons";
const LS_DIARY = "investor_ext_diary";
const LS_RISK = "investor_ext_risk_profile";

function readLs<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLs(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Расширенные фичи дашборда: локально в localStorage (бэкенд может быть подключён позже). */
export const extendedAPI = {
  alerts: {
    get: async (): Promise<Alert[]> => readLs<Alert[]>(LS_ALERTS, []),
    create: async (form: {
      type: Alert["type"];
      tickerOrSymbol: string;
      thresholdPercent: number;
      targetValue: number;
    }): Promise<void> => {
      const list = readLs<Alert[]>(LS_ALERTS, []);
      list.push({
        id: newId(),
        type: form.type,
        tickerOrSymbol: form.tickerOrSymbol,
        thresholdPercent: form.thresholdPercent,
        targetValue: form.targetValue,
        isActive: true,
      });
      writeLs(LS_ALERTS, list);
    },
    delete: async (id: string): Promise<void> => {
      writeLs(
        LS_ALERTS,
        readLs<Alert[]>(LS_ALERTS, []).filter((a) => a.id !== id),
      );
    },
    update: async (id: string, patch: Partial<Alert>): Promise<void> => {
      const list = readLs<Alert[]>(LS_ALERTS, []);
      const i = list.findIndex((a) => a.id === id);
      if (i >= 0) {
        list[i] = { ...list[i], ...patch };
        writeLs(LS_ALERTS, list);
      }
    },
  },
  bondCoupons: {
    get: async (): Promise<BondCoupon[]> => readLs<BondCoupon[]>(LS_COUPONS, []),
  },
  diary: {
    get: async (): Promise<InvestDiaryEntry[]> =>
      readLs<InvestDiaryEntry[]>(LS_DIARY, []),
    create: async (payload: {
      entry: string;
      ticker?: string;
      whatWorked: boolean;
    }): Promise<void> => {
      const list = readLs<InvestDiaryEntry[]>(LS_DIARY, []);
      list.unshift({
        id: newId(),
        entry: payload.entry,
        ticker: payload.ticker,
        whatWorked: payload.whatWorked,
        createdAt: new Date().toISOString(),
      });
      writeLs(LS_DIARY, list);
    },
    delete: async (id: string): Promise<void> => {
      writeLs(
        LS_DIARY,
        readLs<InvestDiaryEntry[]>(LS_DIARY, []).filter((e) => e.id !== id),
      );
    },
  },
  importCSV: async (
    _csv: string,
  ): Promise<{ imported: number; errors: { row: string; error: string }[] }> => {
    return {
      imported: 0,
      errors: [
        {
          row: "—",
          error:
            "Импорт CSV на сервере не настроен. Добавьте эндпоинт или используйте ручной ввод сделок.",
        },
      ],
    };
  },
  riskProfile: {
    upsert: async (payload: {
      riskScore: number;
      recommendedSecurities: number;
      recommendedRealEstate: number;
      recommendedDeposits: number;
      recommendedCrypto: number;
      answersJson: Record<string, number>;
    }): Promise<void> => {
      writeLs(LS_RISK, { ...payload, savedAt: new Date().toISOString() });
    },
  },
};
