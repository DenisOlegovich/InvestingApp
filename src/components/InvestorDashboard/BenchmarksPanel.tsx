import React, { useState, useEffect } from 'react';

const BENCHMARKS: Record<string, { label: string; mockReturn?: number }> = {
  SP500: { label: 'S&P 500', mockReturn: 12 },
  IMOEX: { label: 'IMOEX', mockReturn: 8 },
  inflation: { label: 'Инфляция РФ', mockReturn: 6 },
  deposit: { label: 'Депозит', mockReturn: 16 },
};

export const BenchmarksPanel: React.FC<{
  portfolioReturn?: number;
  portfolioValue: number;
}> = ({ portfolioReturn = 0 }) => {
  const [benchmarkData, setBenchmarkData] = useState<Record<string, number>>({});

  useEffect(() => {
    const data: Record<string, number> = {};
    for (const [k, v] of Object.entries(BENCHMARKS)) {
      data[k] = v.mockReturn ?? 0;
    }
    setBenchmarkData(data);
  }, []);

  const yourReturn = portfolioReturn;

  return (
    <div className="panel">
      <h2>Сравнение с бенчмарками</h2>
      <div className="muted">S&P 500, IMOEX, инфляция, депозит — обогнал или отстал.</div>

      <div className="list" style={{ marginTop: 16 }}>
        {Object.entries(BENCHMARKS).map(([key, { label }]) => {
          const bench = benchmarkData[key] ?? 0;
          const diff = yourReturn - bench;
          return (
            <div key={key} className="list-item">
              <div className="left">
                <div className="title">{label}</div>
                <div className="sub">Бенчмарк: {bench.toFixed(1)}% годовых</div>
              </div>
              <div className={`right pill ${diff > 0 ? 'positive' : diff < 0 ? 'negative' : ''}`}>
                {diff > 0 ? 'Обогнал' : diff < 0 ? 'Отстал' : '—'} {Math.abs(diff).toFixed(1)} п.п.
              </div>
            </div>
          );
        })}
      </div>
      <div className="muted" style={{ marginTop: 12 }}>
        Твоя доходность рассчитывается по P&L. Бенчмарки — mock. Позже можно подключить реальные индексы.
      </div>
    </div>
  );
};
