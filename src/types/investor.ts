export type AssetClass = 'securities' | 'realEstate' | 'deposits' | 'cryptocurrencies';

export interface AllocationTargets {
  byAssetClass: Record<AssetClass, number>; // проценты (0..100)
}

export interface Goal {
  id: string;
  name: string;
  targetAmountRub: number;
  currentAmountRub: number;
  targetDate?: string; // YYYY-MM-DD
  monthlyContributionRub?: number;
  goalBasket?: string;
  assetIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RiskProfile {
  riskScore?: number;
  recommendedSecurities?: number;
  recommendedRealEstate?: number;
  recommendedDeposits?: number;
  recommendedCrypto?: number;
  answersJson?: Record<string, unknown>;
}

export interface Transaction {
  id: string;
  assetType: 'security' | 'crypto';
  assetId?: string;
  tickerOrSymbol: string;
  action: 'buy' | 'sell';
  quantity: number;
  price: number;
  currency: string;
  commission?: number;
  taxCategory?: string;
  tradeDate: string;
  createdAt?: string;
}

export interface Alert {
  id: string;
  type: 'price' | 'volatility' | 'drawdown' | 'dividend' | 'rate' | 'goal';
  assetType?: string;
  assetId?: string;
  tickerOrSymbol?: string;
  targetValue?: number;
  thresholdPercent?: number;
  isActive: boolean;
  triggeredAt?: string;
}

export interface WatchlistItem {
  id: string;
  ticker: string;
  name?: string;
  targetPrice?: number;
  thesis?: string;
  note?: string; // alias for thesis, for compatibility
  checklist?: string[];
  currentPrice?: number; // runtime, from API
  createdAt?: string;
}

export interface DividendPayment {
  id: string;
  securityId: string;
  ticker: string;
  amount: number;
  currency: string;
  paymentDate: string;
  exDate?: string;
}

export interface BondCoupon {
  id: string;
  securityId: string;
  ticker: string;
  couponAmount: number;
  paymentDate: string;
}

