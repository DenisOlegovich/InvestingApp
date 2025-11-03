import React, { useState } from 'react';
import { Security } from '../types';
import { calculatePriceChange, calculatePriceChangePercent, calculateSecurityDividend } from '../utils/calculations';
import './SecuritiesTable.css';

interface SecuritiesTableProps {
  securities: Security[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  updatingPrices?: boolean;
}

export const SecuritiesTable: React.FC<SecuritiesTableProps> = ({ 
  securities, 
  onRemove,
  onUpdateQuantity,
  updatingPrices = false 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  if (securities.length === 0) {
    return null;
  }

  const handleStartEdit = (id: string, currentQuantity: number) => {
    setEditingId(id);
    setEditValue(currentQuantity.toString());
  };

  const handleSaveEdit = (id: string) => {
    const newQuantity = parseInt(editValue);
    if (newQuantity && newQuantity > 0) {
      onUpdateQuantity(id, newQuantity);
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
      <h2>Ценные бумаги ({securities.length})</h2>
      <div className="table-wrapper">
        <table className="securities-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Тикер</th>
              <th>Тип</th>
              <th>Количество</th>
              <th>Текущая цена</th>
              <th>Предыдущая цена</th>
              <th>Изменение</th>
              <th>Общая стоимость</th>
              <th>Дивидендная доходность</th>
              <th>Ожидаемые дивиденды</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {securities.map((security) => {
              const priceChange = calculatePriceChange(security.currentPrice, security.previousPrice);
              const priceChangePercent = calculatePriceChangePercent(security.currentPrice, security.previousPrice);
              const totalValue = security.currentPrice * security.quantity;
              const expectedDividend = calculateSecurityDividend(security);
              const isPositive = priceChange >= 0;

              const getTypeLabel = (type: string) => {
                switch (type) {
                  case 'stock':
                    return 'Акция';
                  case 'bond':
                    return 'Облигация';
                  case 'etf':
                    return 'ETF';
                  default:
                    return type;
                }
              };

              const getFrequencyLabel = (freq: string) => {
                switch (freq) {
                  case 'monthly':
                    return 'мес.';
                  case 'quarterly':
                    return 'кв.';
                  case 'yearly':
                    return 'год';
                  default:
                    return freq;
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

              const currency = security.currency || 'RUB';
              const currencySymbol = getCurrencySymbol(currency);

              return (
                <tr key={security.id} className={updatingPrices ? 'updating' : ''}>
                  <td className="name-cell">{security.name}</td>
                  <td className="ticker-cell">
                    <span className="ticker-badge">{security.ticker}</span>
                  </td>
                  <td>{getTypeLabel(security.type)}</td>
                  <td 
                    className="quantity-cell" 
                    onClick={() => handleStartEdit(security.id, security.quantity)}
                    title="Нажмите для изменения"
                  >
                    {editingId === security.id ? (
                      <input
                        type="number"
                        className="quantity-input"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleSaveEdit(security.id)}
                        onKeyDown={(e) => handleKeyDown(e, security.id)}
                        autoFocus
                        min="1"
                      />
                    ) : (
                      <span className="quantity-value">{security.quantity} шт.</span>
                    )}
                  </td>
                  <td className="price-cell">
                    {security.currentPrice.toLocaleString('ru-RU', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })} {currencySymbol}
                  </td>
                  <td>
                    {security.previousPrice.toLocaleString('ru-RU', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })} {currencySymbol}
                  </td>
                  <td className={`change-cell ${isPositive ? 'positive' : 'negative'}`}>
                    <span>
                      {isPositive ? '+' : ''}{priceChange.toLocaleString('ru-RU', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })} {currencySymbol}
                    </span>
                    <span className="change-percent">
                      ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                    </span>
                  </td>
                  <td className="total-cell">
                    {totalValue.toLocaleString('ru-RU', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })} {currencySymbol}
                  </td>
                  <td>{security.expectedDividend.toFixed(2)}% год.</td>
                  <td className="dividend-cell">
                    {expectedDividend.toLocaleString('ru-RU', { 
                      maximumFractionDigits: 2 
                    })} {currencySymbol} / {getFrequencyLabel(security.dividendFrequency)}
                  </td>
                  <td>
                    <button 
                      className="remove-btn" 
                      onClick={() => onRemove(security.id)}
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

