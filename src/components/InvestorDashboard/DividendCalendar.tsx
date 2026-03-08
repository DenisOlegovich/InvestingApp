import React, { useMemo } from 'react';
import { Portfolio } from '../../types';
import { ExchangeRates } from '../../services/currencyApi';
import { estimateDividendEventsNext12m } from '../../utils/investor';
import { convertToRUB } from '../../services/currencyApi';

function fmtRub(n: number): string {
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ₽';
}

function yieldOnCost(annualDivInAsset: number, costBasis: number, currency: string, rates: ExchangeRates): number {
  if (costBasis <= 0) return 0;
  const costRub = convertToRUB(costBasis, currency as 'RUB'|'USD'|'EUR', rates);
  const divRub = convertToRUB(annualDivInAsset, currency as 'RUB'|'USD'|'EUR', rates);
  return costRub > 0 ? (divRub / costRub) * 100 : 0;
}

function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, (m || 1) - 1, 1);
  return d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

export const DividendCalendar: React.FC<{
  portfolio: Portfolio;
  rates: ExchangeRates;
}> = ({ portfolio, rates }) => {
  const groups = useMemo(() => {
    const events = estimateDividendEventsNext12m(portfolio.securities, rates);
    const map = new Map<string, { total: number; items: { title: string; rub: number }[] }>();
    for (const e of events) {
      const entry = map.get(e.monthKey) || { total: 0, items: [] };
      entry.total += e.amountInRub;
      entry.items.push({ title: e.title, rub: e.amountInRub });
      map.set(e.monthKey, entry);
    }
    const sorted = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    return sorted;
  }, [portfolio.securities, rates]);

  const yieldItems = useMemo(() => {
    return portfolio.securities
      .filter((s) => s.expectedDividend && s.expectedDividend > 0)
      .map((s) => {
        const costBasis = (s as any).purchasePrice ? (s as any).purchasePrice * s.quantity : s.currentPrice * s.quantity;
        const annualDiv = (s.currentPrice * s.quantity * s.expectedDividend) / 100;
        const yoc = yieldOnCost(annualDiv, costBasis, s.currency, rates);
        return { ticker: s.ticker, yoc, expectedYield: s.expectedDividend };
      });
  }, [portfolio.securities, rates]);

  return (
    <div className="panel">
      <h2>Календарь дивидендов (прогноз)</h2>
      <div className="muted">
        Оценка по доходности и периодичности. Yield on cost — если указана цена покупки.
      </div>

      <div style={{ height: 12 }} />

      {yieldItems.length > 0 && (
        <>
          <h3 style={{ marginTop: 16, marginBottom: 8 }}>Yield on cost</h3>
          <div className="list">
            {yieldItems.map((y) => (
              <div key={y.ticker} className="list-item">
                <div className="left">
                  <div className="title">{y.ticker}</div>
                  <div className="sub">Ожидаемая див. доходность {y.expectedYield.toFixed(2)}%</div>
                </div>
                <div className="right">YoC {y.yoc.toFixed(2)}%</div>
              </div>
            ))}
          </div>
        </>
      )}

      {groups.length === 0 ? (
        <div className="muted">
          Нет данных по дивидендам. Укажи `expectedDividend` и `dividendFrequency` у бумаг.
        </div>
      ) : (
        <div className="list">
          {groups.map(([monthKey, g]) => (
            <div key={monthKey} className="list-item">
              <div className="left">
                <div className="title">{monthLabel(monthKey)}</div>
                <div className="sub">
                  {g.items
                    .slice(0, 4)
                    .map((it) => it.title)
                    .join(' • ')}
                  {g.items.length > 4 ? ` • +${g.items.length - 4} ещё` : ''}
                </div>
              </div>
              <div className="right">{fmtRub(g.total)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

