export interface Security {
  id: string;
  name: string;
  ticker: string;
  type: 'stock' | 'bond' | 'etf';
  currentPrice: number;
  previousPrice: number;
  quantity: number;
  expectedDividend: number; // в процентах годовых
  dividendFrequency: 'monthly' | 'quarterly' | 'yearly';
  currency: 'RUB' | 'USD' | 'EUR'; // Валюта цены
}

export interface RealEstate {
  id: string;
  name: string;
  location: string;
  type: 'apartment' | 'house' | 'commercial';
  currentValue: number;
  purchasePrice?: number; // Опционально
  purchaseDate?: string; // Опционально
  expectedRentalYield?: number; // в процентах годовых (опционально, рассчитывается автоматически)
  monthlyRent?: number;
}

export interface Deposit {
  id: string;
  name: string;
  bank: string;
  amount: number; // Сумма депозита
  interestRate: number; // Процентная ставка годовых
  currency: 'RUB' | 'USD' | 'EUR';
  openingDate: string; // Дата открытия
  maturityDate?: string; // Дата окончания (опционально, для срочных депозитов)
  capitalization: 'monthly' | 'quarterly' | 'yearly' | 'none'; // Капитализация процентов
  type: 'demand' | 'term'; // До востребования или срочный
}

export interface Crypto {
  id: string;
  symbol: string; // Тикер криптовалюты (BTC, ETH, etc.)
  name: string;
  amount: number; // Количество монет
  currentPrice: number; // Текущая цена в USD
  previousPrice: number; // Предыдущая цена
  stakingYield?: number; // Доходность стейкинга (% годовых, опционально)
  purchasePrice?: number; // Цена покупки (опционально)
  purchaseDate?: string; // Дата покупки (опционально)
}

export interface Portfolio {
  securities: Security[];
  realEstate: RealEstate[];
  deposits: Deposit[];
  cryptocurrencies: Crypto[];
}

export type PortfolioItem = Security | RealEstate | Deposit | Crypto;

