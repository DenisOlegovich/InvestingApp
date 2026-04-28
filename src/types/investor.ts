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
  createdAt: string; // ISO
}

export interface WatchlistItem {
  id: string;
  ticker: string;
  name?: string;
  targetPrice?: number;
  currentPrice?: number;
  note?: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  category: 'purchase' | 'rebalance' | 'tax';
}

export type AlertType =
  | 'price'
  | 'volatility'
  | 'drawdown'
  | 'dividend'
  | 'rate'
  | 'goal';

export interface Alert {
  id: string;
  type: AlertType;
  tickerOrSymbol: string;
  thresholdPercent?: number;
  targetValue?: number;
  triggeredAt?: string;
  isActive: boolean;
}

export interface BondCoupon {
  securityId: string;
  ticker: string;
  paymentDate: string;
  couponAmount: number;
}

export interface InvestDiaryEntry {
  id: string;
  ticker?: string;
  entry: string;
  whatWorked: boolean;
  createdAt: string;
}

