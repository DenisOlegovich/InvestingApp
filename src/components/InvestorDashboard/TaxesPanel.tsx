import React, { useMemo } from 'react';
import { Portfolio } from '../../types';
import { ExchangeRates } from '../../services/currencyApi';
import { convertToRUB } from '../../services/currencyApi';

const HOLDING_TAX_FREE_MONTHS = 36; // 3 года для бумаг
const DIVIDEND_TAX_RATE = 0.13;
const PROFIT_TAX_RATE = 0.13;

export const TaxesPanel: React.FC<{
  portfolio: Portfolio;
  rates: ExchangeRates;
}> = ({ portfolio, rates }) => {
  const { unrealizedProfit, dividendEstimate, taxHints } = useMemo(() => {
    let unrealized = 0;
    let divEst = 0;
    const hints: string[] = [];

    for (const s of portfolio.securities) {
      const cost = (s as any).purchasePrice ? (s as any).purchasePrice * s.quantity : s.currentPrice * s.quantity;
      const value = s.currentPrice * s.quantity;
      const pnl = value - cost;
      unrealized += convertToRUB(pnl, s.currency, rates);

      const purchaseDate = (s as any).purchaseDate || s.purchaseDate;
      if (purchaseDate) {
        const months = (Date.now() - new Date(purchaseDate).getTime()) / (30 * 24 * 60 * 60 * 1000);
        if (pnl > 0 && months < HOLDING_TAX_FREE_MONTHS) {
          hints.push(`${s.ticker}: владение ${months.toFixed(0)} мес. До льготы осталось ≈ ${Math.ceil(HOLDING_TAX_FREE_MONTHS - months)} мес.`);
        } else if (pnl > 0 && months >= HOLDING_TAX_FREE_MONTHS) {
          hints.push(`${s.ticker}: владение > 3 лет — прибыль не облагается`);
        }
      }

      if (s.expectedDividend && s.expectedDividend > 0) {
        const annualDiv = (s.currentPrice * s.quantity * s.expectedDividend) / 100;
        divEst += convertToRUB(annualDiv, s.currency, rates);
      }
    }

    for (const c of portfolio.cryptocurrencies || []) {
      const cost = c.purchasePrice ? c.purchasePrice * c.amount : c.currentPrice * c.amount;
      const value = c.currentPrice * c.amount;
      unrealized += convertToRUB(value - cost, 'USD', rates);
    }

    return {
      unrealizedProfit: unrealized,
      dividendEstimate: divEst,
      taxHints: hints.slice(0, 10),
    };
  }, [portfolio, rates]);

  const taxOnDiv = dividendEstimate * DIVIDEND_TAX_RATE;
  const taxOnProfit = Math.max(0, unrealizedProfit) * PROFIT_TAX_RATE;

  return (
    <div className="panel">
      <h2>Налоги</h2>
      <div className="muted">Учёт налога на прибыль/дивиденды, сроки владения, отчёт для декларации.</div>

      <div className="kv" style={{ marginTop: 16 }}>
        <div className="k">Нереализованная прибыль (оценка)</div>
        <div className={`v pill ${unrealizedProfit >= 0 ? 'positive' : 'negative'}`}>
          {unrealizedProfit >= 0 ? '+' : ''}{unrealizedProfit.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
        </div>
        <div className="k">Прогноз дивидендов (год)</div>
        <div className="v">{dividendEstimate.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽</div>
        <div className="k">Налог на дивиденды (13%)</div>
        <div className="v">{taxOnDiv.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽</div>
        <div className="k">Налог при продаже (если продать сейчас, 13%)</div>
        <div className="v">{taxOnProfit.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽</div>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3 style={{ marginBottom: 8 }}>Сроки владения</h3>
        <div className="muted">Прибыль от акций РФ не облагается, если владение больше 3 лет.</div>
        <div className="list" style={{ marginTop: 12 }}>
          {taxHints.length === 0 ? (
            <div className="muted">Укажи purchaseDate у бумаг — покажу подсказки.</div>
          ) : (
            taxHints.map((h, i) => (
              <div key={i} className="list-item">
                <div className="sub">{h}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="muted" style={{ marginTop: 16 }}>
        Отчёт для 3-НДФЛ формируется на основе транзакций и фактических выплат. Добавь транзакции в разделе «Транзакции».
      </div>
    </div>
  );
};
