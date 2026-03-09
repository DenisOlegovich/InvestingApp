import React, { useMemo } from 'react';
import { Portfolio } from '../../types';
import { ExchangeRates, convertToRUB } from '../../services/currencyApi';
import {
  calculateSecurityMonthlyDividend,
  calculateRealEstateRental,
  calculateDepositMonthlyIncome,
  calculateCryptoMonthlyIncome,
} from '../../utils/calculations';
import { estimateMonthlyIncomeNext12m } from '../../utils/investor';
import { formatCurrencyRub } from '../../utils/formatNumber';
import { PieChart, PieChartData } from '../PieChart';

function monthShort(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, (m || 1) - 1, 1);
  return d.toLocaleDateString('ru-RU', { month: 'short' });
}

interface IncomeItem {
  label: string;
  amount: number;
}

export const IncomePanel: React.FC<{
  portfolio: Portfolio;
  rates: ExchangeRates;
}> = ({ portfolio, rates }) => {
  const { total, byCategory, items } = useMemo(() => {
    const securitiesItems: IncomeItem[] = portfolio.securities.map((s) => {
      const income = calculateSecurityMonthlyDividend(s);
      return {
        label: s.ticker || s.name,
        amount: convertToRUB(income, s.currency, rates),
      };
    });
    const securitiesTotal = securitiesItems.reduce((s, i) => s + i.amount, 0);

    const realEstateItems: IncomeItem[] = portfolio.realEstate.map((r) => ({
      label: r.name,
      amount: calculateRealEstateRental(r) / 12,
    }));
    const realEstateTotal = realEstateItems.reduce((s, i) => s + i.amount, 0);

    const depositsItems: IncomeItem[] = portfolio.deposits.map((d) => {
      const income = calculateDepositMonthlyIncome(d);
      return { label: `${d.name} (${d.bank})`, amount: convertToRUB(income, d.currency, rates) };
    });
    const depositsTotal = depositsItems.reduce((s, i) => s + i.amount, 0);

    const cryptosItems: IncomeItem[] = portfolio.cryptocurrencies.map((c) => {
      const income = calculateCryptoMonthlyIncome(c);
      return { label: c.symbol || c.name, amount: convertToRUB(income, 'USD', rates) };
    });
    const cryptosTotal = cryptosItems.reduce((s, i) => s + i.amount, 0);

    const total =
      securitiesTotal + realEstateTotal + depositsTotal + cryptosTotal;

    const byCategory = {
      dividends: securitiesTotal,
      rental: realEstateTotal,
      interest: depositsTotal,
      staking: cryptosTotal,
    };

    const items = {
      dividends: securitiesItems,
      rental: realEstateItems,
      interest: depositsItems,
      staking: cryptosItems,
    };

    return { total, byCategory, items };
  }, [portfolio, rates]);

  const monthlyData = useMemo(
    () => estimateMonthlyIncomeNext12m(portfolio, rates),
    [portfolio, rates]
  );
  const maxMonthly = Math.max(...monthlyData.map((m) => m.total), 1);

  const chartData: PieChartData[] = [
    { label: 'Дивиденды', value: byCategory.dividends, color: '#667eea' },
    { label: 'Аренда', value: byCategory.rental, color: '#4caf50' },
    { label: 'Проценты', value: byCategory.interest, color: '#ff9800' },
    { label: 'Стейкинг', value: byCategory.staking, color: '#ef5350' },
  ].filter((d) => d.value > 0);

  const hasIncome = total > 0;

  return (
    <div className="panel">
      <h2>Месячный доход</h2>
      <div className="muted">
        Прогноз ожидаемого месячного дохода по всем активам (в рублях).
      </div>

      {!hasIncome ? (
        <div className="muted" style={{ marginTop: 16 }}>
          Нет данных по доходу. Добавьте активы с дивидендами, арендой, процентной ставкой или
          стейкингом.
        </div>
      ) : (
        <>
          <div className="income-total">
            {formatCurrencyRub(total)}
            <span className="income-total-label">/ месяц</span>
          </div>

          {chartData.length > 0 && (
            <div className="income-chart-wrap">
              <PieChart
                data={chartData}
                title="Распределение дохода"
                valueFormatter={formatCurrencyRub}
              />
            </div>
          )}

          <div className="income-monthly-chart">
            <h3 className="income-chart-title">Доход по месяцам (прогноз)</h3>
            <div className="dividend-chart dividend-chart-horizontal">
              <div className="dividend-chart-bars">
                {monthlyData.map((m) => {
                  const heightPct = (m.total / maxMonthly) * 100;
                  return (
                    <div key={m.monthKey} className="dividend-chart-col">
                      <div className="dividend-chart-bar-wrap">
                        <div
                          className="dividend-chart-fill dividend-chart-fill-vertical"
                          style={{ height: `${heightPct}%` }}
                          title={`${monthShort(m.monthKey)}: ${formatCurrencyRub(m.total)}`}
                        >
                          <span className="dividend-chart-value">{formatCurrencyRub(m.total)}</span>
                        </div>
                      </div>
                      <span className="dividend-chart-month-label">{monthShort(m.monthKey)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="income-breakdown">
            {byCategory.dividends > 0 && (
              <div className="income-category">
                <h3 className="income-category-title">Дивиденды (ценные бумаги)</h3>
                <div className="list">
                  {items.dividends
                    .filter((i) => i.amount > 0)
                    .map((i) => (
                      <div key={i.label} className="list-item">
                        <div className="left">
                          <div className="title">{i.label}</div>
                        </div>
                        <div className="right">{formatCurrencyRub(i.amount)}</div>
                      </div>
                    ))}
                </div>
                <div className="income-category-sum">{formatCurrencyRub(byCategory.dividends)}</div>
              </div>
            )}

            {byCategory.rental > 0 && (
              <div className="income-category">
                <h3 className="income-category-title">Аренда (недвижимость)</h3>
                <div className="list">
                  {items.rental
                    .filter((i) => i.amount > 0)
                    .map((i) => (
                      <div key={i.label} className="list-item">
                        <div className="left">
                          <div className="title">{i.label}</div>
                        </div>
                        <div className="right">{formatCurrencyRub(i.amount)}</div>
                      </div>
                    ))}
                </div>
                <div className="income-category-sum">{formatCurrencyRub(byCategory.rental)}</div>
              </div>
            )}

            {byCategory.interest > 0 && (
              <div className="income-category">
                <h3 className="income-category-title">Проценты (депозиты)</h3>
                <div className="list">
                  {items.interest
                    .filter((i) => i.amount > 0)
                    .map((i) => (
                      <div key={i.label} className="list-item">
                        <div className="left">
                          <div className="title">{i.label}</div>
                        </div>
                        <div className="right">{formatCurrencyRub(i.amount)}</div>
                      </div>
                    ))}
                </div>
                <div className="income-category-sum">{formatCurrencyRub(byCategory.interest)}</div>
              </div>
            )}

            {byCategory.staking > 0 && (
              <div className="income-category">
                <h3 className="income-category-title">Стейкинг (криптовалюты)</h3>
                <div className="list">
                  {items.staking
                    .filter((i) => i.amount > 0)
                    .map((i) => (
                      <div key={i.label} className="list-item">
                        <div className="left">
                          <div className="title">{i.label}</div>
                        </div>
                        <div className="right">{formatCurrencyRub(i.amount)}</div>
                      </div>
                    ))}
                </div>
                <div className="income-category-sum">{formatCurrencyRub(byCategory.staking)}</div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
