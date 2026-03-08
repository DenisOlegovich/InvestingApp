import React from 'react';
import { Portfolio } from '../../types';
import { calculateTotalPortfolioValueInRUB } from '../../utils/calculations';
import { ExchangeRates } from '../../services/currencyApi';

function fmtRub(n: number): string {
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 2 }) + ' ₽';
}

export const ReportsPanel: React.FC<{
  portfolio: Portfolio;
  rates: ExchangeRates;
}> = ({ portfolio, rates }) => {
  const total = calculateTotalPortfolioValueInRUB(portfolio, rates);

  const exportText = () => {
    const lines = [
      `Отчёт по портфелю — ${new Date().toLocaleDateString('ru-RU')}`,
      '',
      `Общая стоимость: ${fmtRub(total)}`,
      '',
      '--- Активы ---',
      ...portfolio.securities.map((s) => `${s.ticker}: ${s.quantity} × ${s.currentPrice} ${s.currency}`),
      ...(portfolio.cryptocurrencies || []).map((c) => `${c.symbol}: ${c.amount} × ${c.currentPrice} USD`),
      ...portfolio.deposits.map((d) => `${d.name}: ${d.amount} ${d.currency}`),
      ...portfolio.realEstate.map((r) => `${r.name}: ${r.currentValue} ₽`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-report-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJson = () => {
    const data = {
      date: new Date().toISOString(),
      totalValueRub: total,
      portfolio,
      rates,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="panel">
      <h2>Отчёты</h2>
      <div className="muted">Экспорт в TXT/JSON. PDF/Excel — в roadmap.</div>

      <div className="kv" style={{ marginTop: 16 }}>
        <div className="k">Общая стоимость</div>
        <div className="v">{fmtRub(total)}</div>
      </div>

      <div className="btn-row" style={{ marginTop: 20 }}>
        <button className="btn" onClick={exportText}>
          Скачать TXT
        </button>
        <button className="btn" onClick={exportJson}>
          Скачать JSON
        </button>
      </div>

      <div className="muted" style={{ marginTop: 16 }}>
        PDF и Excel — в следующих версиях. «Письмо самому себе» — сохрани отчёт и поставь напоминание перечитать через год.
      </div>
    </div>
  );
};
