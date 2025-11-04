import React, { useState } from 'react';
import { Crypto } from '../types';
import { calculatePriceChange, calculatePriceChangePercent } from '../utils/calculations';
import './CryptosTable.css';

interface CryptosTableProps {
  cryptocurrencies: Crypto[];
  onRemove: (id: string) => void;
  onUpdateAmount: (id: string, newAmount: number) => void;
  updatingPrices?: boolean;
}

export const CryptosTable: React.FC<CryptosTableProps> = ({ 
  cryptocurrencies, 
  onRemove,
  onUpdateAmount,
  updatingPrices = false 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  if (cryptocurrencies.length === 0) {
    return null;
  }

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

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(id);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="table-container">
      <h2>Криптовалюты</h2>
      <div className="table-wrapper">
        <table className="cryptos-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Символ</th>
              <th>Количество</th>
              <th>Текущая цена</th>
              <th>Предыдущая цена</th>
              <th>Изменение</th>
              <th>Общая стоимость</th>
              <th>Стейкинг доходность</th>
              <th>Месячный доход</th>
              <th>Прирост стоимости</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {cryptocurrencies.map((crypto) => {
              const priceChange = calculatePriceChange(crypto.currentPrice, crypto.previousPrice);
              const priceChangePercent = calculatePriceChangePercent(crypto.currentPrice, crypto.previousPrice);
              const totalValue = crypto.currentPrice * crypto.amount;
              const isPositive = priceChange >= 0;
              
              // Рассчитываем месячный доход от стейкинга
              const monthlyStakingIncome = crypto.stakingYield 
                ? (totalValue * crypto.stakingYield / 100) / 12 
                : 0;

              // Рассчитываем прирост с момента покупки
              const purchaseGain = crypto.purchasePrice 
                ? (crypto.currentPrice - crypto.purchasePrice) * crypto.amount 
                : 0;
              const purchaseGainPercent = crypto.purchasePrice 
                ? calculatePriceChangePercent(crypto.currentPrice, crypto.purchasePrice) 
                : 0;
              const isGainPositive = purchaseGain >= 0;

              return (
                <tr key={crypto.id} className={updatingPrices ? 'updating' : ''}>
                  <td className="name-cell">{crypto.name}</td>
                  <td className="symbol-cell">
                    <span className="symbol-badge">{crypto.symbol}</span>
                  </td>
                  <td 
                    className="amount-cell" 
                    onClick={() => handleStartEdit(crypto.id, crypto.amount)}
                    title="Нажмите для изменения"
                  >
                    {editingId === crypto.id ? (
                      <input
                        type="number"
                        className="amount-input"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleSaveEdit(crypto.id)}
                        onKeyDown={(e) => handleKeyDown(e, crypto.id)}
                        autoFocus
                        step="0.00000001"
                        min="0.00000001"
                      />
                    ) : (
                      <span className="amount-value">
                        {crypto.amount.toLocaleString('ru-RU', { 
                          maximumFractionDigits: 8 
                        })}
                      </span>
                    )}
                  </td>
                  <td className="price-cell">
                    ${crypto.currentPrice.toLocaleString('ru-RU', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </td>
                  <td>
                    ${crypto.previousPrice.toLocaleString('ru-RU', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </td>
                  <td className={`change-cell ${isPositive ? 'positive' : 'negative'}`}>
                    <span>
                      {isPositive ? '+' : ''}${priceChange.toLocaleString('ru-RU', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </span>
                    <span className="change-percent">
                      ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                    </span>
                  </td>
                  <td className="total-cell">
                    ${totalValue.toLocaleString('ru-RU', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </td>
                  <td className="staking-cell">
                    {crypto.stakingYield ? `${crypto.stakingYield.toFixed(2)}% год.` : '—'}
                  </td>
                  <td className="income-cell">
                    {monthlyStakingIncome > 0 
                      ? `$${monthlyStakingIncome.toLocaleString('ru-RU', { 
                          maximumFractionDigits: 2 
                        })}`
                      : '—'
                    }
                  </td>
                  <td className={crypto.purchasePrice ? `gain-cell ${isGainPositive ? 'positive' : 'negative'}` : ''}>
                    {crypto.purchasePrice ? (
                      <>
                        <span>
                          {isGainPositive ? '+' : ''}${purchaseGain.toLocaleString('ru-RU', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </span>
                        <span className="change-percent">
                          ({isGainPositive ? '+' : ''}{purchaseGainPercent.toFixed(2)}%)
                        </span>
                      </>
                    ) : '—'}
                  </td>
                  <td>
                    <button 
                      className="remove-btn" 
                      onClick={() => onRemove(crypto.id)}
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

