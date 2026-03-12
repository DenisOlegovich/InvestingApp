import type { Portfolio, Security } from '../types';
import type { ExchangeRates } from './currencyApi';
import { convertToRUB } from './currencyApi';
import {
  calculateDepositCurrentValue,
  calculateDepositMonthlyIncome,
  calculateCryptoMonthlyIncome,
  calculatePriceChange,
  calculatePriceChangePercent,
  calculateRealEstateRental,
  calculateSecurityDividend,
  calculateSecurityMonthlyDividend,
} from './calculations';
import type { AllocationTargets, AssetClass } from '../types/investor';

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export type DividendEvent = {
  monthKey: string;
  title: string;
  amountInRub: number;
  amountInAssetCurrency: number;
  currency: 'RUB' | 'USD' | 'EUR';
};

export function estimateDividendEventsNext12m(
  securities: Security[],
  rates: ExchangeRates,
  now = new Date()
): DividendEvent[] {
  const events: DividendEvent[] = [];
  for (const s of securities) {
    if (!s.expectedDividend || s.expectedDividend <= 0) continue;
    const perPayment = calculateSecurityDividend(s);
    const perMonthEquivalent = calculateSecurityMonthlyDividend(s);
    if (s.dividendFrequency === 'monthly') {
      for (let i = 0; i < 12; i++) {
        const month = addMonths(now, i);
        events.push({
          monthKey: toMonthKey(month),
          title: `${s.ticker || s.name} — дивиденды`,
          amountInAssetCurrency: perMonthEquivalent,
          amountInRub: convertToRUB(perMonthEquivalent, s.currency, rates),
          currency: s.currency,
        });
      }
    } else if (s.dividendFrequency === 'quarterly') {
      for (const i of [0, 3, 6, 9]) {
        const month = addMonths(now, i);
        events.push({
          monthKey: toMonthKey(month),
          title: `${s.ticker || s.name} — дивиденды (квартал)`,
          amountInAssetCurrency: perPayment,
          amountInRub: convertToRUB(perPayment, s.currency, rates),
          currency: s.currency,
        });
      }
    } else {
      const month = addMonths(now, 11);
      events.push({
        monthKey: toMonthKey(month),
        title: `${s.ticker || s.name} — дивиденды (год)`,
        amountInAssetCurrency: perPayment,
        amountInRub: convertToRUB(perPayment, s.currency, rates),
        currency: s.currency,
      });
    }
  }
  return events;
}

export type MonthlyIncomeData = { monthKey: string; total: number; dividends: number; other: number };

export function estimateMonthlyIncomeNext12m(
  portfolio: Portfolio,
  rates: ExchangeRates,
  now = new Date()
): MonthlyIncomeData[] {
  const dividendEvents = estimateDividendEventsNext12m(portfolio.securities, rates, now);
  const rentalMonthly = portfolio.realEstate.reduce(
    (s, r) => s + calculateRealEstateRental(r) / 12,
    0
  );
  const interestMonthly = portfolio.deposits.reduce(
    (s, d) => s + convertToRUB(calculateDepositMonthlyIncome(d), d.currency, rates),
    0
  );
  const stakingMonthly = portfolio.cryptocurrencies.reduce(
    (s, c) => s + convertToRUB(calculateCryptoMonthlyIncome(c), 'USD', rates),
    0
  );
  const otherMonthly = rentalMonthly + interestMonthly + stakingMonthly;
  const dividendByMonth = new Map<string, number>();
  for (const e of dividendEvents) {
    dividendByMonth.set(e.monthKey, (dividendByMonth.get(e.monthKey) || 0) + e.amountInRub);
  }
  const result: MonthlyIncomeData[] = [];
  for (let i = 0; i < 12; i++) {
    const month = addMonths(now, i);
    const monthKey = toMonthKey(month);
    const dividends = dividendByMonth.get(monthKey) || 0;
    result.push({ monthKey, total: dividends + otherMonthly, dividends, other: otherMonthly });
  }
  return result;
}

export const DEFAULT_TARGETS: AllocationTargets = {
  byAssetClass: { securities: 50, realEstate: 20, deposits: 20, cryptocurrencies: 10 },
};

export function clampPercent(n: number): number {
  if (Number.isNaN(n) || !Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export function normalizeTargets(targets: AllocationTargets): AllocationTargets {
  const byAssetClass = { ...targets.byAssetClass };
  const keys = Object.keys(byAssetClass) as AssetClass[];
  for (const k of keys) byAssetClass[k] = clampPercent(byAssetClass[k]);
  const sum = keys.reduce((s, k) => s + byAssetClass[k], 0);
  if (sum <= 0) return DEFAULT_TARGETS;
  for (const k of keys) byAssetClass[k] = (byAssetClass[k] / sum) * 100;
  return { byAssetClass };
}

export function portfolioValueByAssetClassRub(
  portfolio: Portfolio,
  rates: ExchangeRates
): Record<AssetClass, number> {
  const securities = portfolio.securities.reduce(
    (sum, s) => sum + convertToRUB(s.currentPrice * s.quantity, s.currency, rates),
    0
  );
  const realEstate = portfolio.realEstate.reduce((sum, r) => sum + r.currentValue, 0);
  const deposits = portfolio.deposits.reduce(
    (sum, d) => sum + convertToRUB(calculateDepositCurrentValue(d), d.currency, rates),
    0
  );
  const cryptocurrencies = portfolio.cryptocurrencies.reduce(
    (sum, c) => sum + convertToRUB(c.currentPrice * c.amount, 'USD', rates),
    0
  );
  return { securities, realEstate, deposits, cryptocurrencies };
}

export function totalFromMap(map: Record<string, number>): number {
  return Object.values(map).reduce((s, v) => s + v, 0);
}

export function computeDailyPnLRub(portfolio: Portfolio, rates: ExchangeRates): number {
  const securitiesPnL = portfolio.securities.reduce(
    (sum, s) =>
      sum + convertToRUB(calculatePriceChange(s.currentPrice, s.previousPrice) * s.quantity, s.currency, rates),
    0
  );
  const cryptoPnL = portfolio.cryptocurrencies.reduce(
    (sum, c) =>
      sum + convertToRUB((c.currentPrice - c.previousPrice) * c.amount, 'USD', rates),
    0
  );
  return securitiesPnL + cryptoPnL;
}

export type PriceAlert = { kind: 'security' | 'crypto'; id: string; title: string; changePercent: number };

export function computePriceAlerts(portfolio: Portfolio, thresholdPercent = 5): PriceAlert[] {
  const alerts: PriceAlert[] = [];
  for (const s of portfolio.securities) {
    const pct = calculatePriceChangePercent(s.currentPrice, s.previousPrice);
    if (Math.abs(pct) >= thresholdPercent) {
      alerts.push({ kind: 'security', id: s.id, title: s.ticker || s.name, changePercent: pct });
    }
  }
  for (const c of portfolio.cryptocurrencies) {
    const pct = calculatePriceChangePercent(c.currentPrice, c.previousPrice);
    if (Math.abs(pct) >= thresholdPercent) {
      alerts.push({ kind: 'crypto', id: c.id, title: c.symbol, changePercent: pct });
    }
  }
  return alerts;
}
