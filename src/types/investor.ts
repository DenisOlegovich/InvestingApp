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

