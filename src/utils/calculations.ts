import { Security, RealEstate, Deposit, Crypto, Portfolio } from '../types';
import { ExchangeRates, convertToRUB } from '../services/currencyApi';

export function calculatePriceChange(current: number, previous: number): number {
  return current - previous;
}

export function calculatePriceChangePercent(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

// Возвращает дивиденды за УКАЗАННЫЙ период (согласно dividendFrequency)
export function calculateSecurityDividend(security: Security): number {
  const annualDividend = (security.currentPrice * security.quantity * security.expectedDividend) / 100;
  
  switch (security.dividendFrequency) {
    case 'monthly':
      return annualDividend / 12; // Месячные дивиденды
    case 'quarterly':
      return annualDividend / 4; // Квартальные дивиденды
    case 'yearly':
      return annualDividend; // Годовые дивиденды
    default:
      return 0;
  }
}

// Возвращает МЕСЯЧНЫЙ эквивалент дивидендов (для расчета месячного дохода)
export function calculateSecurityMonthlyDividend(security: Security): number {
  const annualDividend = (security.currentPrice * security.quantity * security.expectedDividend) / 100;
  return annualDividend / 12; // Всегда месячный эквивалент
}

// Возвращает ГОДОВУЮ арендную плату
export function calculateRealEstateRental(realEstate: RealEstate): number {
  if (realEstate.monthlyRent) {
    return realEstate.monthlyRent * 12; // годовая арендная плата
  }
  // Если monthlyRent не указана, но есть expectedRentalYield
  if (realEstate.expectedRentalYield) {
    return (realEstate.currentValue * realEstate.expectedRentalYield) / 100;
  }
  return 0;
}

// Возвращает доходность от аренды в процентах годовых
export function calculateRentalYield(realEstate: RealEstate): number {
  if (!realEstate.monthlyRent || realEstate.currentValue === 0) {
    return realEstate.expectedRentalYield || 0;
  }
  const annualRent = realEstate.monthlyRent * 12;
  return (annualRent / realEstate.currentValue) * 100;
}

export function calculateDepositMonthlyIncome(deposit: Deposit): number {
  // Рассчитываем месячный доход от депозита
  const annualInterest = (deposit.amount * deposit.interestRate) / 100;
  
  switch (deposit.capitalization) {
    case 'monthly':
      // При ежемесячной капитализации месячный доход увеличивается
      const monthlyRate = deposit.interestRate / 12 / 100;
      return deposit.amount * monthlyRate;
    case 'quarterly':
      return annualInterest / 12; // Упрощенный расчет для квартальной
    case 'yearly':
      return annualInterest / 12;
    case 'none':
    default:
      return annualInterest / 12; // Простые проценты, выплачиваемые ежемесячно
  }
}

export function calculateDepositCurrentValue(deposit: Deposit): number {
  // Если дата открытия не указана, возвращаем исходную сумму
  if (!deposit.openingDate) {
    return deposit.amount;
  }

  // Рассчитываем текущую стоимость депозита с учетом капитализации
  const openingDate = new Date(deposit.openingDate);
  const now = new Date();
  const monthsDiff = (now.getFullYear() - openingDate.getFullYear()) * 12 + 
                     (now.getMonth() - openingDate.getMonth());
  
  if (monthsDiff <= 0) {
    return deposit.amount;
  }

  const annualRate = deposit.interestRate / 100;
  
  switch (deposit.capitalization) {
    case 'monthly':
      // Сложные проценты с ежемесячной капитализацией
      const monthlyRate = annualRate / 12;
      return deposit.amount * Math.pow(1 + monthlyRate, monthsDiff);
    case 'quarterly':
      // Квартальная капитализация
      const quarters = Math.floor(monthsDiff / 3);
      const quarterlyRate = annualRate / 4;
      return deposit.amount * Math.pow(1 + quarterlyRate, quarters);
    case 'yearly':
      // Годовая капитализация
      const years = Math.floor(monthsDiff / 12);
      return deposit.amount * Math.pow(1 + annualRate, years);
    case 'none':
    default:
      // Простые проценты
      return deposit.amount * (1 + (annualRate * monthsDiff) / 12);
  }
}

export function calculateCryptoMonthlyIncome(crypto: Crypto): number {
  if (!crypto.stakingYield) return 0;
  const totalValue = crypto.currentPrice * crypto.amount;
  return (totalValue * crypto.stakingYield / 100) / 12;
}

// Рассчитывает общую стоимость портфеля в РУБЛЯХ с учетом курсов валют
export function calculateTotalPortfolioValueInRUB(
  portfolio: Portfolio,
  rates: ExchangeRates
): number {
  const securitiesValue = portfolio.securities.reduce((sum, security) => {
    const value = security.currentPrice * security.quantity;
    return sum + convertToRUB(value, security.currency, rates);
  }, 0);

  const realEstateValue = portfolio.realEstate.reduce(
    (sum, property) => sum + property.currentValue,
    0
  );

  const depositsValue = portfolio.deposits.reduce((sum, deposit) => {
    const value = calculateDepositCurrentValue(deposit);
    return sum + convertToRUB(value, deposit.currency, rates);
  }, 0);

  const cryptosValue = portfolio.cryptocurrencies.reduce((sum, crypto) => {
    const value = crypto.currentPrice * crypto.amount;
    return sum + convertToRUB(value, 'USD', rates);
  }, 0);

  return securitiesValue + realEstateValue + depositsValue + cryptosValue;
}

// Рассчитывает ожидаемый месячный доход в РУБЛЯХ с учетом курсов валют
export function calculateTotalExpectedIncomeInRUB(
  portfolio: Portfolio,
  rates: ExchangeRates
): number {
  const securitiesDividends = portfolio.securities.reduce((sum, security) => {
    const income = calculateSecurityMonthlyDividend(security);
    return sum + convertToRUB(income, security.currency, rates);
  }, 0);

  const realEstateRental = portfolio.realEstate.reduce(
    (sum, property) => sum + calculateRealEstateRental(property) / 12,
    0
  );

  const depositsIncome = portfolio.deposits.reduce((sum, deposit) => {
    const income = calculateDepositMonthlyIncome(deposit);
    return sum + convertToRUB(income, deposit.currency, rates);
  }, 0);

  const cryptosIncome = portfolio.cryptocurrencies.reduce((sum, crypto) => {
    const income = calculateCryptoMonthlyIncome(crypto);
    return sum + convertToRUB(income, 'USD', rates);
  }, 0);

  return securitiesDividends + realEstateRental + depositsIncome + cryptosIncome;
}

