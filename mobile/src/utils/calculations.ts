import type { Security, RealEstate, Deposit, Crypto, Portfolio } from '../types';
import type { ExchangeRates } from './currencyApi';
import { convertToRUB } from './currencyApi';

export function calculatePriceChange(current: number, previous: number): number {
  return current - previous;
}

export function calculatePriceChangePercent(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function calculateSecurityDividend(security: Security): number {
  const annual = (security.currentPrice * security.quantity * security.expectedDividend) / 100;
  switch (security.dividendFrequency) {
    case 'monthly':
      return annual / 12;
    case 'quarterly':
      return annual / 4;
    case 'yearly':
      return annual;
    default:
      return 0;
  }
}

export function calculateSecurityMonthlyDividend(security: Security): number {
  const annual = (security.currentPrice * security.quantity * security.expectedDividend) / 100;
  return annual / 12;
}

export function calculateRealEstateRental(re: RealEstate): number {
  if (re.monthlyRent) return re.monthlyRent * 12;
  if (re.expectedRentalYield) return (re.currentValue * re.expectedRentalYield) / 100;
  return 0;
}

export function calculateDepositCurrentValue(d: Deposit): number {
  if (!d.openingDate) return d.amount;
  const opening = new Date(d.openingDate);
  const now = new Date();
  const monthsDiff =
    (now.getFullYear() - opening.getFullYear()) * 12 + (now.getMonth() - opening.getMonth());
  if (monthsDiff <= 0) return d.amount;
  const annualRate = d.interestRate / 100;
  switch (d.capitalization) {
    case 'monthly':
      return d.amount * Math.pow(1 + annualRate / 12, monthsDiff);
    case 'quarterly':
      return d.amount * Math.pow(1 + annualRate / 4, Math.floor(monthsDiff / 3));
    case 'yearly':
      return d.amount * Math.pow(1 + annualRate, Math.floor(monthsDiff / 12));
    default:
      return d.amount * (1 + (annualRate * monthsDiff) / 12);
  }
}

export function calculateDepositMonthlyIncome(d: Deposit): number {
  const annualInterest = (d.amount * d.interestRate) / 100;
  switch (d.capitalization) {
    case 'monthly':
      return d.amount * (d.interestRate / 12 / 100);
    case 'quarterly':
    case 'yearly':
    case 'none':
    default:
      return annualInterest / 12;
  }
}

export function calculateCryptoMonthlyIncome(c: Crypto): number {
  if (!c.stakingYield) return 0;
  return (c.currentPrice * c.amount * c.stakingYield) / 100 / 12;
}

export function calculateTotalPortfolioValueInRUB(p: Portfolio, rates: ExchangeRates): number {
  let sum = 0;
  for (const s of p.securities) {
    sum += convertToRUB(s.currentPrice * s.quantity, s.currency, rates);
  }
  for (const r of p.realEstate) {
    sum += convertToRUB(r.currentValue, 'RUB', rates);
  }
  for (const d of p.deposits) {
    sum += convertToRUB(d.amount, d.currency, rates);
  }
  for (const c of p.cryptocurrencies) {
    sum += convertToRUB(c.currentPrice * c.amount, 'USD', rates);
  }
  return sum;
}

export function calculateTotalExpectedIncomeInRUB(p: Portfolio, rates: ExchangeRates): number {
  let monthly = 0;
  for (const s of p.securities) {
    const div = calculateSecurityMonthlyDividend(s);
    monthly += convertToRUB(div, s.currency, rates);
  }
  for (const r of p.realEstate) {
    monthly += calculateRealEstateRental(r) / 12;
  }
  for (const d of p.deposits) {
    monthly += convertToRUB(calculateDepositMonthlyIncome(d), d.currency, rates);
  }
  for (const c of p.cryptocurrencies) {
    monthly += convertToRUB(calculateCryptoMonthlyIncome(c), 'USD', rates);
  }
  return monthly;
}
