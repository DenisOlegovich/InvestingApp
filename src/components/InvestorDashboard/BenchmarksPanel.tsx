import React, { useMemo } from 'react';
import { formatCurrencyRub } from '../../utils/formatNumber';

/** Статичные бенчмарки (можно заменить на API) */
const BENCHMARKS = [
  { id: 'imoex', name: 'IMOEX', yieldYtd: 8.5, yield1y: 12 },
  { id: 'sp500', name: 'S&P 500', yieldYtd: 15, yield1y: 22 },
  { id: 'rfr', name: 'Ключевая ставка ЦБ', yieldYtd: 16, yield1y: 16 },
];

export const BenchmarksPanel: React.FC<{
  portfolioValueRub: number;
  portfolioReturnYtdPercent?: number;
  portfolioReturn1yPercent?: number;
}> = ({ portfolioValueRub, portfolioReturnYtdPercent = 0, portfolioReturn1yPercent = 0 }) => {
  const comparison = useMemo(() => {
    return BENCHMARKS.map((b) => ({
      ...b,
      diffYtd: (portfolioReturnYtdPercent - b.yieldYtd).toFixed(1),
      diff1y: (portfolioReturn1yPercent - b.yield1y).toFixed(1),
    }));
  }, [portfolioReturnYtdPercent, portfolioReturn1yPercent]);

  return (
    <div className="panel">
      <h2>Бенчмарки</h2>
      <div className="muted">
        Сравнение доходности портфеля с индексами. YTD — с начала года, 1Y — за год.
      </div>
      <div style={{ height: 12 }} />
      <div className="kv">
        <span className="k">Стоимость портфеля</span>
        <span className="v">{formatCurrencyRub(portfolioValueRub)}</span>
        <span className="k">Доходность YTD (если есть история)</span>
        <span className={`v ${portfolioReturnYtdPercent >= 0 ? 'pill positive' : 'pill negative'}`}>
          {portfolioReturnYtdPercent >= 0 ? '+' : ''}{portfolioReturnYtdPercent.toFixed(1)}%
        </span>
        <span className="k">Доходность за год</span>
        <span className={`v ${portfolioReturn1yPercent >= 0 ? 'pill positive' : 'pill negative'}`}>
          {portfolioReturn1yPercent >= 0 ? '+' : ''}{portfolioReturn1yPercent.toFixed(1)}%
        </span>
      </div>
      <div style={{ height: 14 }} />
      <div className="list">
        {comparison.map((b) => (
          <div key={b.id} className="list-item">
            <div className="left">
              <div className="title">{b.name}</div>
              <div className="sub">
                YTD: {b.yieldYtd}% • 1Y: {b.yield1y}%
              </div>
            </div>
            <div className="right">
              <span className={Number(b.diffYtd) >= 0 ? 'pill positive' : 'pill negative'}>
                {Number(b.diffYtd) >= 0 ? '+' : ''}{b.diffYtd} п.п.
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="muted" style={{ marginTop: 12 }}>
        Источник индексов: ориентировочные значения. Для точных данных подключите API котировок.
      </div>
    </div>
  );
};
