import React, { useState } from 'react';
import { formatCurrencyRub } from '../../utils/formatNumber';

export const BacktestPanel: React.FC<{
  initialCapital: number;
}> = ({ initialCapital }) => {
  const [monthlyAmount, setMonthlyAmount] = useState('50000');
  const [months, setMonths] = useState('60');
  const [returnPerMonth, setReturnPerMonth] = useState('0.8');

  const m = parseFloat(monthlyAmount) || 0;
  const n = parseInt(months, 10) || 12;
  const r = parseFloat(returnPerMonth) || 0;
  const monthlyRate = r / 100;

  const dcaResult = (() => {
    if (monthlyRate === 0) {
      return initialCapital + m * n;
    }
    let value = initialCapital * Math.pow(1 + monthlyRate, n);
    for (let i = 0; i < n; i++) {
      value += m * Math.pow(1 + monthlyRate, n - i - 1);
    }
    return value;
  })();

  const lumpResult = (() => {
    const totalInvested = initialCapital + m * n;
    return totalInvested * Math.pow(1 + monthlyRate, n);
  })();

  const totalContrib = m * n;
  const dcaGain = dcaResult - initialCapital - totalContrib;
  const lumpGain = lumpResult - initialCapital - totalContrib;

  return (
    <div>
      <div className="muted">
        Симуляция стратегии регулярных пополнений vs единовременной суммы.
      </div>
      <div style={{ height: 12 }} />
      <div className="form-row">
        <label>Начальный капитал (₽)</label>
        <input type="text" value={initialCapital.toLocaleString('ru-RU')} readOnly />
      </div>
      <div className="form-row">
        <label>Ежемесячный взнос (₽)</label>
        <input
          type="number"
          value={monthlyAmount}
          onChange={(e) => setMonthlyAmount(e.target.value)}
          placeholder="50000"
        />
      </div>
      <div className="form-row">
        <label>Месяцев</label>
        <input
          type="number"
          value={months}
          onChange={(e) => setMonths(e.target.value)}
          placeholder="60"
        />
      </div>
      <div className="form-row">
        <label>Доходность в месяц (%)</label>
        <input
          type="number"
          step="0.1"
          value={returnPerMonth}
          onChange={(e) => setReturnPerMonth(e.target.value)}
          placeholder="0.8"
        />
      </div>
      <div style={{ height: 16 }} />
      <div className="kv">
        <span className="k">DCA: итог</span>
        <span className="v">{formatCurrencyRub(dcaResult)}</span>
        <span className="k">DCA: прирост</span>
        <span className={`v ${dcaGain >= 0 ? 'pill positive' : 'pill negative'}`}>
          {formatCurrencyRub(dcaGain)}
        </span>
        <span className="k">Lump sum: итог</span>
        <span className="v">{formatCurrencyRub(lumpResult)}</span>
        <span className="k">Lump sum: прирост</span>
        <span className={`v ${lumpGain >= 0 ? 'pill positive' : 'pill negative'}`}>
          {formatCurrencyRub(lumpGain)}
        </span>
      </div>
      <div className="muted" style={{ marginTop: 12 }}>
        Lump sum — если бы внесли всё сразу в начале. DCA выгоднее при падающем рынке.
      </div>
    </div>
  );
};
