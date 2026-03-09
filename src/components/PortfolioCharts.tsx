import React from 'react';
import { Portfolio } from '../types';
import {
  calculateDepositCurrentValue,
  calculateDepositMonthlyIncome,
  calculateSecurityMonthlyDividend,
  calculateRealEstateRental,
  calculateCryptoMonthlyIncome,
} from '../utils/calculations';
import { ExchangeRates, convertToRUB } from '../services/currencyApi';
import { PieChart, PieChartData } from './PieChart';
import { BarChart, BarChartData } from './BarChart';
import { formatCurrencyRub } from '../utils/formatNumber';
import './PortfolioCharts.css';

interface PortfolioChartsProps {
  portfolio: Portfolio;
  exchangeRates: ExchangeRates | null;
}

const TYPE_LABELS: Record<string, string> = {
  apartment: 'Квартира',
  house: 'Дом',
  commercial: 'Коммерческая',
};

const INSTRUMENT_COLORS = ['#667eea', '#4caf50', '#ff9800', '#ef5350', '#9c27b0', '#00bcd4', '#8bc34a', '#e91e63'];

export const PortfolioCharts: React.FC<PortfolioChartsProps> = ({ portfolio, exchangeRates }) => {
  const rates = exchangeRates || { USD_RUB: 92.50, EUR_RUB: 100.00, lastUpdate: new Date() };

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

  const securitiesIncomeRub = portfolio.securities.reduce((sum, security) => {
    const income = calculateSecurityMonthlyDividend(security);
    return sum + convertToRUB(income, security.currency, rates);
  }, 0);

  const realEstateIncomeRub = portfolio.realEstate.reduce(
    (sum, property) => sum + calculateRealEstateRental(property) / 12,
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

  const valueChartData: PieChartData[] = [
    { label: 'Ценные бумаги', value: securitiesValueRub, color: '#667eea' },
    { label: 'Недвижимость', value: realEstateValueRub, color: '#4caf50' },
    { label: 'Депозиты', value: depositsValueRub, color: '#ff9800' },
    { label: 'Криптовалюты', value: cryptosValueRub, color: '#ef5350' },
  ].filter((item) => item.value > 0);

  const incomeChartData: PieChartData[] = [
    { label: 'Дивиденды от акций', value: securitiesIncomeRub, color: '#667eea' },
    { label: 'Аренда недвижимости', value: realEstateIncomeRub, color: '#4caf50' },
    { label: 'Проценты по депозитам', value: depositsIncomeRub, color: '#ff9800' },
    { label: 'Стейкинг крипты', value: cryptosIncomeRub, color: '#ef5350' },
  ].filter((item) => item.value > 0);

  const totalValue = securitiesValueRub + realEstateValueRub + depositsValueRub + cryptosValueRub;

  const rubValue = portfolio.securities
    .filter((s) => s.currency === 'RUB')
    .reduce((sum, s) => sum + s.currentPrice * s.quantity, 0) +
    portfolio.realEstate.reduce((sum, r) => sum + r.currentValue, 0) +
    portfolio.deposits
      .filter((d) => d.currency === 'RUB')
      .reduce((sum, d) => sum + calculateDepositCurrentValue(d), 0);

  const usdValue = portfolio.securities
    .filter((s) => s.currency === 'USD')
    .reduce((sum, s) => sum + s.currentPrice * s.quantity, 0) * rates.USD_RUB +
    portfolio.deposits
      .filter((d) => d.currency === 'USD')
      .reduce((sum, d) => sum + calculateDepositCurrentValue(d), 0) *
      rates.USD_RUB +
    portfolio.cryptocurrencies.reduce((sum, c) => sum + c.currentPrice * c.amount, 0) * rates.USD_RUB;

  const eurValue = portfolio.securities
    .filter((s) => s.currency === 'EUR')
    .reduce((sum, s) => sum + s.currentPrice * s.quantity, 0) * rates.EUR_RUB +
    portfolio.deposits
      .filter((d) => d.currency === 'EUR')
      .reduce((sum, d) => sum + calculateDepositCurrentValue(d), 0) * rates.EUR_RUB;

  const currencyChartData: PieChartData[] = [
    { label: 'RUB', value: rubValue, color: '#2196f3' },
    { label: 'USD', value: usdValue, color: '#4caf50' },
    { label: 'EUR', value: eurValue, color: '#ff9800' },
  ].filter((item) => item.value > 0);

  const securitiesByInstrument: PieChartData[] = portfolio.securities.map((s, i) => {
    const val = convertToRUB(s.currentPrice * s.quantity, s.currency, rates);
    return {
      label: s.ticker || s.name,
      value: val,
      color: INSTRUMENT_COLORS[i % INSTRUMENT_COLORS.length],
    };
  }).filter((item) => item.value > 0);

  const realEstateByType = portfolio.realEstate.reduce(
    (acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + r.currentValue;
      return acc;
    },
    {} as Record<string, number>
  );
  const realEstateTypeChartData: PieChartData[] = Object.entries(realEstateByType).map(
    ([type, val]) => ({
      label: TYPE_LABELS[type] || type,
      value: val,
      color: type === 'apartment' ? '#4caf50' : type === 'house' ? '#8bc34a' : '#cddc39',
    })
  );

  const topHoldingsData: BarChartData[] = [
    ...portfolio.securities.map((s) => ({
      label: s.ticker || s.name,
      value: convertToRUB(s.currentPrice * s.quantity, s.currency, rates),
    })),
    ...portfolio.realEstate.map((r) => ({
      label: r.name.length > 16 ? r.name.slice(0, 14) + '…' : r.name,
      value: r.currentValue,
    })),
    ...portfolio.deposits.map((d) => ({
      label: d.name,
      value: convertToRUB(calculateDepositCurrentValue(d), d.currency, rates),
    })),
    ...portfolio.cryptocurrencies.map((c) => ({
      label: c.symbol || c.name,
      value: convertToRUB(c.currentPrice * c.amount, 'USD', rates),
    })),
  ];

  if (totalValue === 0) {
    return null;
  }

  return (
    <div className="portfolio-charts">
      <div className="charts-note">
        Все суммы приведены к рублям. Курс: 1 USD = {rates.USD_RUB.toFixed(2)} ₽, 1 EUR = {rates.EUR_RUB.toFixed(2)} ₽
        {exchangeRates && (
          <span className="rates-timestamp">
            {' '}(обновлено: {exchangeRates.lastUpdate.toLocaleTimeString('ru-RU')})
          </span>
        )}
      </div>
      <div className="charts-grid">
        <PieChart data={valueChartData} title="Распределение по стоимости" valueFormatter={formatCurrencyRub} />
        {portfolio.securities.length > 0 && securitiesByInstrument.length > 0 && (
          <PieChart
            data={securitiesByInstrument}
            title="Ценные бумаги по инструментам"
            valueFormatter={formatCurrencyRub}
          />
        )}
        {currencyChartData.length > 0 && (
          <PieChart data={currencyChartData} title="По валютам" valueFormatter={formatCurrencyRub} />
        )}
        {portfolio.realEstate.length > 0 && realEstateTypeChartData.length > 0 && (
          <PieChart
            data={realEstateTypeChartData}
            title="Типы недвижимости"
            valueFormatter={formatCurrencyRub}
          />
        )}
        {valueChartData.reduce((s, i) => s + i.value, 0) > 0 && (
          <BarChart
            data={topHoldingsData}
            title="Топ позиций по стоимости"
            valueFormatter={formatCurrencyRub}
            maxBars={12}
          />
        )}
        {securitiesIncomeRub + realEstateIncomeRub + depositsIncomeRub + cryptosIncomeRub > 0 && (
          <PieChart
            data={incomeChartData}
            title="Распределение месячного дохода"
            valueFormatter={formatCurrencyRub}
          />
        )}
      </div>
    </div>
  );
};

