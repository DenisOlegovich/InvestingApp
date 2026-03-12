export type AssetClass = 'securities' | 'realEstate' | 'deposits' | 'cryptocurrencies';

export interface AllocationTargets {
  byAssetClass: Record<AssetClass, number>;
}

export interface Goal {
  id: string;
  name: string;
  targetAmountRub: number;
  currentAmountRub: number;
  targetDate?: string;
  monthlyContributionRub?: number;
  createdAt: string;
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
