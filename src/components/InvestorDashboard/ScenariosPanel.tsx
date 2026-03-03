import React, { useState, useMemo } from 'react';
import { Portfolio } from '../../types';
import { ExchangeRates } from '../../services/currencyApi';
import { portfolioValueByAssetClassRub, totalFromMap } from '../../utils/investor';
import { formatCurrencyRub } from '../../utils/formatNumber';

export const ScenariosPanel: React.FC<{
  portfolio: Portfolio;
  rates: ExchangeRates;
}> = ({ portfolio, rates }) => {
  const [usdChange, setUsdChange] = useState(10);
  const [marketDrop, setMarketDrop] = useState(20);

  const byClass = useMemo(() => portfolioValueByAssetClassRub(portfolio, rates), [portfolio, rates]);
  const totalBase = totalFromMap(byClass);

  const usdExposed =
    portfolio.securities.filter((s) => s.currency === 'USD').reduce((s, x) => s + x.currentPrice * x.quantity, 0) *
      rates.USD_RUB +
    portfolio.deposits
      .filter((d) => d.currency === 'USD')
      .reduce((s, d) => s + d.amount, 0) * rates.USD_RUB +
    portfolio.cryptocurrencies.reduce((s, c) => s + c.currentPrice * c.amount, 0) * rates.USD_RUB;

  const securitiesValue =
    portfolio.securities.reduce((s, x) => {
      const v = x.currentPrice * x.quantity;
      return s + (x.currency === 'RUB' ? v : x.currency === 'USD' ? v * rates.USD_RUB : v * rates.EUR_RUB);
    }, 0) +
    portfolio.cryptocurrencies.reduce((s, c) => s + c.currentPrice * c.amount * rates.USD_RUB, 0);

  const scenarioUsd = useMemo(() => {
    const factor = 1 + usdChange / 100;
    const newUsdExposed = usdExposed * factor;
    const other = totalBase - usdExposed;
    return other + newUsdExposed;
  }, [usdExposed, totalBase, usdChange]);

  const scenarioMarket = useMemo(() => {
    const dropFactor = 1 - marketDrop / 100;
    const newSecurities = securitiesValue * dropFactor;
    const other = totalBase - securitiesValue;
    return other + newSecurities;
  }, [securitiesValue, totalBase, marketDrop]);

  return (
    <div className="panel">
      <h2>Сценарии «что если»</h2>
      <div className="muted">Оценка влияния изменения курса или рынка на портфель.</div>

      <div className="income-category" style={{ marginTop: 16 }}>
        <h3 className="income-category-title">USD +{usdChange}%</h3>
        <div className="kv">
          <span className="k">Сейчас</span>
          <span className="v">{formatCurrencyRub(totalBase)}</span>
          <span className="k">При росте USD на {usdChange}%</span>
          <span className="v">{formatCurrencyRub(scenarioUsd)}</span>
          <span className="k">Разница</span>
          <span className={`v ${scenarioUsd >= totalBase ? 'pill positive' : 'pill negative'}`}>
            {scenarioUsd >= totalBase ? '+' : ''}
            {formatCurrencyRub(scenarioUsd - totalBase)}
          </span>
        </div>
        <input
          type="range"
          min="-30"
          max="50"
          value={usdChange}
          onChange={(e) => setUsdChange(Number(e.target.value))}
          style={{ width: '100%', marginTop: 8 }}
        />
      </div>

      <div className="income-category" style={{ marginTop: 16 }}>
        <h3 className="income-category-title">Рынок −{marketDrop}% (акции + крипто)</h3>
        <div className="kv">
          <span className="k">Сейчас</span>
          <span className="v">{formatCurrencyRub(totalBase)}</span>
          <span className="k">При падении на {marketDrop}%</span>
          <span className="v">{formatCurrencyRub(scenarioMarket)}</span>
          <span className="k">Разница</span>
          <span className="v pill negative">{formatCurrencyRub(scenarioMarket - totalBase)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="50"
          value={marketDrop}
          onChange={(e) => setMarketDrop(Number(e.target.value))}
          style={{ width: '100%', marginTop: 8 }}
        />
      </div>
    </div>
  );
};
