import React, { useState } from 'react';
import { Deposit } from '../types';
import { calculateDepositMonthlyIncome, calculateDepositCurrentValue } from '../utils/calculations';
import './DepositsTable.css';

interface DepositsTableProps {
  deposits: Deposit[];
  onRemove: (id: string) => void;
  onUpdateAmount: (id: string, newAmount: number) => void;
}

export const DepositsTable: React.FC<DepositsTableProps> = ({ deposits, onRemove, onUpdateAmount }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  if (deposits.length === 0) {
    return null;
  }

  const handleRemove = (id: string, name: string) => {
    if (window.confirm(`Вы уверены, что хотите удалить "${name}"?`)) {
      onRemove(id);
    }
  };

  const handleStartEdit = (id: string, currentAmount: number) => {
    setEditingId(id);
    setEditValue(currentAmount.toString());
  };

  const handleSaveEdit = (id: string) => {
    const newAmount = parseFloat(editValue);
    if (newAmount && newAmount > 0) {
      onUpdateAmount(id, newAmount);
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(id);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

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
      <h2>Депозиты</h2>
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
                  <td className="name-cell" data-label="Название">{deposit.name}</td>
                  <td data-label="Банк">{deposit.bank}</td>
                  <td data-label="Тип">
                    <span className="type-badge">{getTypeLabel(deposit.type)}</span>
                  </td>
                  <td className="amount-cell editable-cell" data-label="Сумма депозита">
                    {editingId === deposit.id ? (
                      <div className="edit-wrapper">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleKeyPress(e, deposit.id)}
                          className="edit-input"
                          autoFocus
                          min="0"
                          step="1000"
                        />
                        <button 
                          className="save-btn" 
                          onClick={() => handleSaveEdit(deposit.id)}
                          title="Сохранить"
                        >
                          ✓
                        </button>
                        <button 
                          className="cancel-btn" 
                          onClick={handleCancelEdit}
                          title="Отмена"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="editable-value"
                        onClick={() => handleStartEdit(deposit.id, deposit.amount)}
                        title="Нажмите для редактирования"
                      >
                        {deposit.amount.toLocaleString('ru-RU', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })} {currencySymbol}
                        <span className="edit-icon">✎</span>
                      </div>
                    )}
                  </td>
                  <td className="value-cell" data-label="Текущая стоимость">
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
                  <td className="rate-cell" data-label="Процентная ставка">{deposit.interestRate.toFixed(2)}% год.</td>
                  <td data-label="Капитализация">{getCapitalizationLabel(deposit.capitalization)}</td>
                  <td data-label="Дата открытия">{deposit.openingDate ? new Date(deposit.openingDate).toLocaleDateString('ru-RU') : '—'}</td>
                  <td data-label="Дата окончания">
                    {deposit.maturityDate 
                      ? new Date(deposit.maturityDate).toLocaleDateString('ru-RU')
                      : '—'
                    }
                  </td>
                  <td className="income-cell" data-label="Месячный доход">
                    {monthlyIncome.toLocaleString('ru-RU', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })} {currencySymbol}
                  </td>
                  <td data-label="Действия">
                    <button 
                      className="remove-btn" 
                      onClick={() => handleRemove(deposit.id, deposit.name)}
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

