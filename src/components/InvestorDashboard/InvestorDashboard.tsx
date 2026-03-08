import React, { useMemo } from 'react';
import { Portfolio } from '../../types';
import { ExchangeRates } from '../../services/currencyApi';
import { convertToRUB } from '../../services/currencyApi';
import { computeDailyPnLRub, computePriceAlerts } from '../../utils/investor';
import { EducationCards } from './EducationCards';

function fmtRub(n: number): string {
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ₽';
}

export const InvestorDashboard: React.FC<{
  portfolio: Portfolio;
  rates: ExchangeRates;
  totalValue: number;
}> = ({ portfolio, rates, totalValue }) => {
  const dailyPnL = useMemo(() => computeDailyPnLRub(portfolio, rates), [portfolio, rates]);
  const alerts = useMemo(() => computePriceAlerts(portfolio, 5), [portfolio]);

  const topMovements = useMemo(() => {
    const items: { name: string; change: number; changePct: number }[] = [];
    for (const s of portfolio.securities) {
      const pct = s.previousPrice ? ((s.currentPrice - s.previousPrice) / s.previousPrice) * 100 : 0;
      const changeRub = (s.currentPrice - s.previousPrice) * s.quantity;
      const changeRubConverted = convertToRUB(changeRub, s.currency, rates);
      items.push({ name: s.ticker, change: changeRubConverted, changePct: pct });
    }
    for (const c of portfolio.cryptocurrencies || []) {
      const pct = c.previousPrice ? ((c.currentPrice - c.previousPrice) / c.previousPrice) * 100 : 0;
      const changeUsd = (c.currentPrice - c.previousPrice) * c.amount;
      const changeRub = convertToRUB(changeUsd, 'USD', rates);
      items.push({ name: c.symbol, change: changeRub, changePct: pct });
    }
    return items.sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 5);
  }, [portfolio, rates]);

  const pillClass = dailyPnL >= 0 ? 'pill positive' : 'pill negative';

  return (
    <div className="dashboard-grid">
      <div className="panel">
        <h2>Дашборд «сегодня»</h2>
        <div className="kv">
          <div className="k">Дневное изменение (акции + крипта)</div>
          <div className="v">
            <span className={pillClass}>
              {dailyPnL >= 0 ? '+' : ''}
              {fmtRub(dailyPnL)}
            </span>
          </div>
          <div className="k">Общая стоимость</div>
          <div className="v">{fmtRub(totalValue)}</div>
          <div className="k">Алерты (|изменение| ≥ 5%)</div>
          <div className="v">{alerts.length}</div>
        </div>

        {topMovements.length > 0 && (
          <>
            <div style={{ height: 14 }} />
            <h3 style={{ marginBottom: 8 }}>Топ-движения</h3>
            <div className="list">
              {topMovements.map((m) => (
                <div key={m.name} className="list-item">
                  <div className="left">
                    <div className="title">{m.name}</div>
                  </div>
                  <div className={`right pill ${m.change >= 0 ? 'positive' : 'negative'}`}>
                    {m.change >= 0 ? '+' : ''}{fmtRub(m.change)} ({m.changePct >= 0 ? '+' : ''}{m.changePct.toFixed(1)}%)
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ height: 14 }} />

        {alerts.length === 0 ? (
          <div className="muted">Пока алертов нет.</div>
        ) : (
          <div className="list">
            {alerts.slice(0, 8).map((a) => (
              <div key={a.kind + a.id} className="list-item">
                <div className="left">
                  <div className="title">{a.title}</div>
                  <div className="sub">{a.kind === 'crypto' ? 'Крипто' : 'Ценная бумага'}</div>
                </div>
                <div className="right">
                  {a.changePercent >= 0 ? '+' : ''}
                  {a.changePercent.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ height: 12 }} />
        <div className="muted">
          Дневное изменение: previousPrice → currentPrice. Депозиты и недвижимость не участвуют.
        </div>
      </div>

      <div className="panel">
        <h2>Быстрые метрики</h2>
        <div className="kv">
          <div className="k">Активов (бумаг)</div>
          <div className="v">{portfolio.securities.length}</div>
          <div className="k">Недвижимость</div>
          <div className="v">{portfolio.realEstate.length}</div>
          <div className="k">Депозиты</div>
          <div className="v">{portfolio.deposits.length}</div>
          <div className="k">Крипто</div>
          <div className="v">{portfolio.cryptocurrencies.length}</div>
          <div className="k">Курсы</div>
          <div className="v">
            USD {rates.USD_RUB.toFixed(2)} • EUR {rates.EUR_RUB.toFixed(2)}
          </div>
        </div>
      </div>

      <div style={{ gridColumn: '1 / -1' }}>
        <EducationCards />
      </div>
    </div>
  );
};

