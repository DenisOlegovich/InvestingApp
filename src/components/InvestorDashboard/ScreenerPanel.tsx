import React, { useMemo, useState } from 'react';
import { Portfolio } from '../../types';
import { ExchangeRates } from '../../services/currencyApi';
import type { AllocationTargets } from '../../types/investor';
import { totalFromMap, portfolioValueByAssetClassRub } from '../../utils/investor';

export const ScreenerPanel: React.FC<{
  portfolio: Portfolio;
  rates: ExchangeRates;
  targets: AllocationTargets;
}> = ({ portfolio, rates, targets }) => {
  const [filterSector, setFilterSector] = useState<string>('');
  const [filterCurrency, setFilterCurrency] = useState<string>('');
  const [filterCountry, setFilterCountry] = useState<string>('');

  const values = useMemo(() => portfolioValueByAssetClassRub(portfolio, rates), [portfolio, rates]);
  const total = totalFromMap(values);
  const targetPcts = targets.byAssetClass;

  const items = useMemo(() => {
    const list: { name: string; value: number; pct: number; targetPct: number; diff: number; sector?: string; currency?: string; country?: string; type: string }[] = [];
    for (const s of portfolio.securities) {
      const v = s.currentPrice * s.quantity * (s.currency === 'USD' ? rates.USD_RUB : s.currency === 'EUR' ? rates.EUR_RUB : 1);
      const pct = total > 0 ? (v / total) * 100 : 0;
      const targetPct = targetPcts.securities / Math.max(1, portfolio.securities.length);
      list.push({
        name: `${s.ticker} (${s.name})`,
        value: v,
        pct,
        targetPct,
        diff: pct - targetPct,
        sector: s.sector,
        currency: s.currency,
        country: s.country,
        type: 'security',
      });
    }
    for (const c of portfolio.cryptocurrencies || []) {
      const v = c.currentPrice * c.amount * rates.USD_RUB;
      const pct = total > 0 ? (v / total) * 100 : 0;
      const targetPct = targetPcts.cryptocurrencies / Math.max(1, (portfolio.cryptocurrencies?.length || 0));
      list.push({
        name: `${c.symbol} (${c.name})`,
        value: v,
        pct,
        targetPct,
        diff: pct - targetPct,
        currency: 'USD',
        type: 'crypto',
      });
    }
    return list.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
  }, [portfolio, rates, total, targetPcts]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (filterSector && i.sector !== filterSector) return false;
      if (filterCurrency && i.currency !== filterCurrency) return false;
      if (filterCountry && i.country !== filterCountry) return false;
      return true;
    });
  }, [items, filterSector, filterCurrency, filterCountry]);

  const sectors = useMemo(() => [...new Set(items.map((i) => i.sector).filter(Boolean))] as string[], [items]);
  const currencies = useMemo(() => [...new Set(items.map((i) => i.currency).filter(Boolean))] as string[], [items]);
  const countries = useMemo(() => [...new Set(items.map((i) => i.country).filter(Boolean))] as string[], [items]);

  return (
    <div className="panel">
      <h2>Скринер портфеля</h2>
      <div className="muted">Что перегрето/недовес. Фильтры по сектору, валюте, стране.</div>

      <div className="form-row" style={{ marginTop: 12 }}>
        <select className="input" value={filterSector} onChange={(e) => setFilterSector(e.target.value)}>
          <option value="">Все сектора</option>
          {sectors.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select className="input" value={filterCurrency} onChange={(e) => setFilterCurrency(e.target.value)}>
          <option value="">Все валюты</option>
          {currencies.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className="input" value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}>
          <option value="">Все страны</option>
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="list" style={{ marginTop: 16 }}>
        {filtered.map((i) => (
          <div key={i.name} className="list-item">
            <div className="left">
              <div className="title">{i.name}</div>
              <div className="sub">
                {i.sector && `${i.sector} • `}
                {i.currency} • доля {i.pct.toFixed(1)}%
              </div>
            </div>
            <div className={`right pill ${i.diff > 2 ? 'negative' : i.diff < -2 ? 'positive' : ''}`}>
              {i.diff > 0 ? 'Перегрев' : 'Недовес'} {Math.abs(i.diff).toFixed(1)} п.п.
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div className="muted" style={{ marginTop: 16 }}>Нет данных после фильтра.</div>}
    </div>
  );
};
