import React, { useMemo } from 'react';
import { Portfolio } from '../../types';
import { ExchangeRates } from '../../services/currencyApi';
import { estimateDividendEventsNext12m } from '../../utils/investor';

function fmtRub(n: number): string {
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ₽';
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

  return (
    <div className="panel">
      <h2>Календарь дивидендов (прогноз)</h2>
      <div className="muted">
        Это оценка на основе доходности и периодичности, без точных дат отсечки/выплаты.
      </div>

      <div style={{ height: 12 }} />

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

