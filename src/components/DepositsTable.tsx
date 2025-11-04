import React from 'react';
import { Deposit } from '../types';
import { calculateDepositMonthlyIncome, calculateDepositCurrentValue } from '../utils/calculations';
import './DepositsTable.css';

interface DepositsTableProps {
  deposits: Deposit[];
  onRemove: (id: string) => void;
}

export const DepositsTable: React.FC<DepositsTableProps> = ({ deposits, onRemove }) => {
  if (deposits.length === 0) {
    return null;
  }

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'RUB':
      default:
        return '₽';
    }
  };

  const getCapitalizationLabel = (cap: string) => {
    switch (cap) {
      case 'monthly':
        return 'Ежемесячная';
      case 'quarterly':
        return 'Квартальная';
      case 'yearly':
        return 'Годовая';
      case 'none':
        return 'Без капитализации';
      default:
        return cap;
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'demand' ? 'До востребования' : 'Срочный';
  };

  return (
    <div className="table-container">
      <h2>Депозиты ({deposits.length})</h2>
      <div className="table-wrapper">
        <table className="deposits-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Банк</th>
              <th>Тип</th>
              <th>Сумма депозита</th>
              <th>Текущая стоимость</th>
              <th>Процентная ставка</th>
              <th>Капитализация</th>
              <th>Дата открытия</th>
              <th>Дата окончания</th>
              <th>Месячный доход</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map((deposit) => {
              const currentValue = calculateDepositCurrentValue(deposit);
              const monthlyIncome = calculateDepositMonthlyIncome(deposit);
              const currencySymbol = getCurrencySymbol(deposit.currency);
              const gain = currentValue - deposit.amount;

              return (
                <tr key={deposit.id}>
                  <td className="name-cell">{deposit.name}</td>
                  <td>{deposit.bank}</td>
                  <td>
                    <span className="type-badge">{getTypeLabel(deposit.type)}</span>
                  </td>
                  <td className="amount-cell">
                    {deposit.amount.toLocaleString('ru-RU', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })} {currencySymbol}
                  </td>
                  <td className="value-cell">
                    {currentValue.toLocaleString('ru-RU', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })} {currencySymbol}
                    {gain > 0 && (
                      <span className="gain-indicator positive">
                        (+{gain.toLocaleString('ru-RU', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })})
                      </span>
                    )}
                  </td>
                  <td className="rate-cell">{deposit.interestRate.toFixed(2)}% год.</td>
                  <td>{getCapitalizationLabel(deposit.capitalization)}</td>
                  <td>{deposit.openingDate ? new Date(deposit.openingDate).toLocaleDateString('ru-RU') : '—'}</td>
                  <td>
                    {deposit.maturityDate 
                      ? new Date(deposit.maturityDate).toLocaleDateString('ru-RU')
                      : '—'
                    }
                  </td>
                  <td className="income-cell">
                    {monthlyIncome.toLocaleString('ru-RU', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })} {currencySymbol}
                  </td>
                  <td>
                    <button 
                      className="remove-btn" 
                      onClick={() => onRemove(deposit.id)}
                      title="Удалить"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

