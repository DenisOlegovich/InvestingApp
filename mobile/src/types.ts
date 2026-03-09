export interface Security {
  id: string;
  name: string;
  ticker: string;
  type: 'stock' | 'bond' | 'etf';
  currentPrice: number;
  previousPrice: number;
  quantity: number;
  expectedDividend: number;
  dividendFrequency: 'monthly' | 'quarterly' | 'yearly';
  currency: 'RUB' | 'USD' | 'EUR';
}

export interface RealEstate {
  id: string;
  name: string;
  location: string;
  type: 'apartment' | 'house' | 'commercial';
  currentValue: number;
  purchasePrice?: number;
  purchaseDate?: string;
  monthlyRent?: number;
}

export interface Deposit {
  id: string;
  name: string;
  bank: string;
  amount: number;
  interestRate: number;
  currency: 'RUB' | 'USD' | 'EUR';
  capitalization: 'monthly' | 'quarterly' | 'yearly' | 'none';
  type: 'demand' | 'term';
}

export interface Crypto {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  currentPrice: number;
  previousPrice: number;
}

export interface Portfolio {
  securities: Security[];
  realEstate: RealEstate[];
  deposits: Deposit[];
  cryptocurrencies: Crypto[];
}

export const EMPTY_PORTFOLIO: Portfolio = {
  securities: [],
  realEstate: [],
  deposits: [],
  cryptocurrencies: [],
};

export interface User {
  id: number;
  email: string;
  name: string;
}
