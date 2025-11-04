import React from 'react';
import { Portfolio } from '../types';
import { 
  calculateDepositCurrentValue, 
  calculateDepositMonthlyIncome,
  calculateSecurityMonthlyDividend,
  calculateRealEstateRental,
  calculateCryptoMonthlyIncome
} from '../utils/calculations';
import { ExchangeRates, convertToRUB } from '../services/currencyApi';
import { PieChart, PieChartData } from './PieChart';
import './PortfolioCharts.css';

interface PortfolioChartsProps {
  portfolio: Portfolio;
  exchangeRates: ExchangeRates | null;
}

export const PortfolioCharts: React.FC<PortfolioChartsProps> = ({ portfolio, exchangeRates }) => {
  // Если курсы еще не загружены, используем дефолтные значения
  const rates = exchangeRates || { USD_RUB: 92.50, EUR_RUB: 100.00, lastUpdate: new Date() };

  // Рассчитываем стоимость в рублях с учетом валюты
  const securitiesValueRub = portfolio.securities.reduce((sum, security) => {
    const value = security.currentPrice * security.quantity;
    return sum + convertToRUB(value, security.currency, rates);
  }, 0);

  const realEstateValueRub = portfolio.realEstate.reduce(
    (sum, property) => sum + property.currentValue,
    0
  );

  const depositsValueRub = portfolio.deposits.reduce((sum, deposit) => {
    const value = calculateDepositCurrentValue(deposit);
    return sum + convertToRUB(value, deposit.currency, rates);
  }, 0);

  const cryptosValueRub = portfolio.cryptocurrencies.reduce((sum, crypto) => {
    const value = crypto.currentPrice * crypto.amount;
    return sum + convertToRUB(value, 'USD', rates);
  }, 0);

  // Рассчитываем месячный доход в рублях с учетом валюты
  const securitiesIncomeRub = portfolio.securities.reduce((sum, security) => {
    const income = calculateSecurityMonthlyDividend(security);
    const incomeInRub = convertToRUB(income, security.currency, rates);
    console.log('Security dividend:', security.name, {
      ticker: security.ticker,
      currentPrice: security.currentPrice,
      quantity: security.quantity,
      expectedDividend: security.expectedDividend,
      dividendFrequency: security.dividendFrequency,
      currency: security.currency,
      monthlyIncomeInCurrency: income,
      monthlyIncomeInRub: incomeInRub,
      rate: security.currency === 'USD' ? rates.USD_RUB : security.currency === 'EUR' ? rates.EUR_RUB : 1
    });
    return sum + incomeInRub;
  }, 0);

  const realEstateIncomeRub = portfolio.realEstate.reduce(
    (sum, property) => {
      const annualRental = calculateRealEstateRental(property);
      const monthlyRental = annualRental / 12;
      console.log('Real Estate income:', property.name, {
        monthlyRent: property.monthlyRent,
        expectedRentalYield: property.expectedRentalYield,
        currentValue: property.currentValue,
        annualRental,
        monthlyRental
      });
      return sum + monthlyRental;
    },
    0
  );

  const depositsIncomeRub = portfolio.deposits.reduce((sum, deposit) => {
    const income = calculateDepositMonthlyIncome(deposit);
    return sum + convertToRUB(income, deposit.currency, rates);
  }, 0);

  const cryptosIncomeRub = portfolio.cryptocurrencies.reduce((sum, crypto) => {
    const income = calculateCryptoMonthlyIncome(crypto);
    return sum + convertToRUB(income, 'USD', rates);
  }, 0);

  // Данные для диаграммы стоимости
  const valueChartData: PieChartData[] = [
    {
      label: 'Ценные бумаги',
      value: securitiesValueRub,
      color: '#667eea',
    },
    {
      label: 'Недвижимость',
      value: realEstateValueRub,
      color: '#4caf50',
    },
    {
      label: 'Депозиты',
      value: depositsValueRub,
      color: '#ff9800',
    },
    {
      label: 'Криптовалюты',
      value: cryptosValueRub,
      color: '#ef5350',
    },
  ].filter(item => item.value > 0);

  // Данные для диаграммы доходности
  const incomeChartData: PieChartData[] = [
    {
      label: 'Дивиденды от акций',
      value: securitiesIncomeRub,
      color: '#667eea',
    },
    {
      label: 'Аренда недвижимости',
      value: realEstateIncomeRub,
      color: '#4caf50',
    },
    {
      label: 'Проценты по депозитам',
      value: depositsIncomeRub,
      color: '#ff9800',
    },
    {
      label: 'Стейкинг крипты',
      value: cryptosIncomeRub,
      color: '#ef5350',
    },
  ].filter(item => item.value > 0);

  const totalValue = securitiesValueRub + realEstateValueRub + depositsValueRub + cryptosValueRub;
  const totalIncome = securitiesIncomeRub + realEstateIncomeRub + depositsIncomeRub + cryptosIncomeRub;

  if (totalValue === 0) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽`;
  };

  // Логирование для отладки
  console.log('Income breakdown:', {
    securities: securitiesIncomeRub,
    realEstate: realEstateIncomeRub,
    deposits: depositsIncomeRub,
    cryptos: cryptosIncomeRub,
    total: totalIncome
  });

  return (
    <div className="portfolio-charts">
      <div className="charts-note">
        Все суммы приведены к рублям. Курс конвертации: 1 USD = {rates.USD_RUB.toFixed(2)} ₽, 1 EUR = {rates.EUR_RUB.toFixed(2)} ₽
        {exchangeRates && (
          <span className="rates-timestamp">
            {' '}(обновлено: {exchangeRates.lastUpdate.toLocaleTimeString('ru-RU')})
          </span>
        )}
      </div>
      <div className="charts-grid">
        <PieChart 
          data={valueChartData} 
          title="Распределение по стоимости" 
          valueFormatter={formatCurrency}
        />
        {totalIncome > 0 && (
          <PieChart 
            data={incomeChartData} 
            title="Распределение месячного дохода" 
            valueFormatter={formatCurrency}
          />
        )}
      </div>
    </div>
  );
};

