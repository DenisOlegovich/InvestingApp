import React, { useMemo } from 'react';
import { Portfolio } from '../../types';
import { ExchangeRates } from '../../services/currencyApi';
import { computeDailyPnLRub, computePriceAlerts } from '../../utils/investor';
import { formatCurrencyRub } from '../../utils/formatNumber';
import { calculateTotalPortfolioValueInRUB, calculatePortfolioValueAtOpenInRUB } from '../../utils/calculations';
import { IntradayPortfolioChart } from './IntradayPortfolioChart';

export const InvestorDashboard: React.FC<{
  portfolio: Portfolio;
  rates: ExchangeRates;
  userId?: string | number;
}> = ({ portfolio, rates, userId }) => {
  const dailyPnL = useMemo(() => computeDailyPnLRub(portfolio, rates), [portfolio, rates]);
  const alerts = useMemo(() => computePriceAlerts(portfolio, 5), [portfolio]);
  const valueAtOpen = useMemo(() => calculatePortfolioValueAtOpenInRUB(portfolio, rates), [portfolio, rates]);
  const currentValue = useMemo(() => calculateTotalPortfolioValueInRUB(portfolio, rates), [portfolio, rates]);

  const pillClass = dailyPnL >= 0 ? 'pill positive' : 'pill negative';

  return (
    <div className="dashboard-grid">
      <div className="panel">
        <h2>Дашборд</h2>
        <div className="kv">
          <div className="k">Дневное изменение (акции + крипта)</div>
          <div className="v">
            <span className={pillClass}>
              {dailyPnL >= 0 ? '+' : ''}
              {formatCurrencyRub(dailyPnL)}
            </span>
          </div>
          <div className="k">Алерты (|изменение| ≥ 5%)</div>
          <div className="v">{alerts.length}</div>
        </div>

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
          Подсказка: “дневное изменение” считается из `previousPrice → currentPrice`. Для депозитов и
          недвижимости дневной P&L не считается.
        </div>

        {currentValue > 0 && (
          <>
            <div style={{ height: 20 }} />
            <IntradayPortfolioChart
              valueAtOpen={valueAtOpen}
              currentValue={currentValue}
              userId={userId}
            />
          </>
        )}
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
        <div style={{ height: 12 }} />
        <div className="muted">
          Дальше можно добавить бенчмарки, налоги и импорт сделок — это уже “вторая итерация”.
        </div>
      </div>
    </div>
  );
};

