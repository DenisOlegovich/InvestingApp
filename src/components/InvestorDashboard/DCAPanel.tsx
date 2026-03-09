import React, { useState } from 'react';
import { formatCurrencyRub } from '../../utils/formatNumber';

export const DCAPanel: React.FC<{
  currentPortfolioValue: number;
}> = ({ currentPortfolioValue }) => {
  const [monthlyAmount, setMonthlyAmount] = useState(50000);
  const [months, setMonths] = useState(12);
  const [expectedYield, setExpectedYield] = useState(10);

  const totalContributions = monthlyAmount * months;
  const monthlyRate = expectedYield / 100 / 12;
  const futureValue =
    monthlyRate > 0
      ? currentPortfolioValue * Math.pow(1 + monthlyRate, months) +
        monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
      : currentPortfolioValue + monthlyAmount * months;

  const gain = futureValue - currentPortfolioValue - totalContributions;

  return (
    <div className="panel">
      <h2>Планировщик DCA</h2>
      <div className="muted">
        Оценка роста портфеля при регулярных пополнениях и ожидаемой доходности.
      </div>

      <div className="income-category" style={{ marginTop: 16 }}>
        <div className="form-row">
          <label className="k">Ежемесячный взнос, ₽</label>
          <input
            className="input"
            type="number"
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(Number(e.target.value))}
          />
        </div>
        <div className="form-row" style={{ marginTop: 8 }}>
          <label className="k">Месяцев</label>
          <input
            className="input"
            type="number"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
          />
        </div>
        <div className="form-row" style={{ marginTop: 8 }}>
          <label className="k">Ожидаемая доходность, % годовых</label>
          <input
            className="input"
            type="number"
            step="0.5"
            value={expectedYield}
            onChange={(e) => setExpectedYield(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="income-category" style={{ marginTop: 20 }}>
        <h3 className="income-category-title">Прогноз</h3>
        <div className="kv">
          <span className="k">Текущая стоимость</span>
          <span className="v">{formatCurrencyRub(currentPortfolioValue)}</span>
          <span className="k">Сумма взносов</span>
          <span className="v">{formatCurrencyRub(totalContributions)}</span>
          <span className="k">Через {months} мес.</span>
          <span className="v">{formatCurrencyRub(futureValue)}</span>
          <span className="k">Прирост (дивиденды/рост)</span>
          <span className="v pill positive">{formatCurrencyRub(gain)}</span>
        </div>
      </div>
    </div>
  );
};
