import React, { useState } from 'react';
import { RealEstate } from '../types';
import { calculatePriceChangePercent, calculateRealEstateRental, calculateRentalYield } from '../utils/calculations';
import './RealEstateTable.css';

interface RealEstateTableProps {
  realEstate: RealEstate[];
  onRemove: (id: string) => void;
  onUpdateValue: (id: string, newValue: number) => void;
}

export const RealEstateTable: React.FC<RealEstateTableProps> = ({ realEstate, onRemove, onUpdateValue }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  if (realEstate.length === 0) {
    return null;
  }

  const handleRemove = (id: string, name: string) => {
    if (window.confirm(`Вы уверены, что хотите удалить "${name}"?`)) {
      onRemove(id);
    }
  };

  const handleStartEdit = (id: string, currentValue: number) => {
    setEditingId(id);
    setEditValue(currentValue.toString());
  };

  const handleSaveEdit = (id: string) => {
    const newValue = parseFloat(editValue);
    if (newValue && newValue > 0) {
      onUpdateValue(id, newValue);
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

  return (
    <div className="table-container">
      <h2>Недвижимость</h2>
      <div className="table-wrapper">
        <table className="real-estate-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Местоположение</th>
              <th>Тип</th>
              <th>Текущая стоимость</th>
              <th>Цена покупки</th>
              <th>Дата покупки</th>
              <th>Прирост стоимости</th>
              <th>Ожидаемая аренда (год)</th>
              <th>Доходность</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {realEstate.map((property) => {
              const totalGain = property.purchasePrice ? property.currentValue - property.purchasePrice : 0;
              const totalGainPercent = property.purchasePrice ? calculatePriceChangePercent(property.currentValue, property.purchasePrice) : 0;
              const expectedRental = calculateRealEstateRental(property);
              const rentalYield = calculateRentalYield(property);
              const isGainPositive = totalGain >= 0;

              const getTypeLabel = (type: string) => {
                switch (type) {
                  case 'apartment':
                    return 'Квартира';
                  case 'house':
                    return 'Дом';
                  case 'commercial':
                    return 'Коммерческая недвижимость';
                  default:
                    return type;
                }
              };

              return (
                <tr key={property.id}>
                  <td className="name-cell" data-label="Название">{property.name}</td>
                  <td className="location-cell" data-label="Местоположение">{property.location}</td>
                  <td data-label="Тип">
                    <span className="type-badge">{getTypeLabel(property.type)}</span>
                  </td>
                  <td className="price-cell editable-cell" data-label="Текущая стоимость">
                    {editingId === property.id ? (
                      <div className="edit-wrapper">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleKeyPress(e, property.id)}
                          className="edit-input"
                          autoFocus
                          min="0"
                          step="1000"
                        />
                        <button 
                          className="save-btn" 
                          onClick={() => handleSaveEdit(property.id)}
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
                        onClick={() => handleStartEdit(property.id, property.currentValue)}
                        title="Нажмите для редактирования"
                      >
                        {property.currentValue.toLocaleString('ru-RU')} ₽
                        <span className="edit-icon">✎</span>
                      </div>
                    )}
                  </td>
                  <td data-label="Цена покупки">
                    {property.purchasePrice ? `${property.purchasePrice.toLocaleString('ru-RU')} ₽` : '—'}
                  </td>
                  <td data-label="Дата покупки">
                    {property.purchaseDate ? new Date(property.purchaseDate).toLocaleDateString('ru-RU') : '—'}
                  </td>
                  <td className={`gain-cell ${isGainPositive ? 'positive' : 'negative'}`} data-label="Прирост стоимости">
                    {property.purchasePrice ? (
                      <>
                        <span>
                          {isGainPositive ? '+' : ''}{totalGain.toLocaleString('ru-RU')} ₽
                        </span>
                        <span className="change-percent">
                          ({isGainPositive ? '+' : ''}{totalGainPercent.toFixed(2)}%)
                        </span>
                      </>
                    ) : '—'}
                  </td>
                  <td className="rental-cell" data-label="Ожидаемая аренда (год)">
                    {expectedRental > 0 ? `${expectedRental.toLocaleString('ru-RU')} ₽` : '—'}
                  </td>
                  <td className="yield-cell" data-label="Доходность">
                    {rentalYield > 0 ? `${rentalYield.toFixed(2)}% год.` : '—'}
                    {property.monthlyRent && (
                      <small style={{ display: 'block', color: '#4caf50' }}>
                        (рассчитано)
                      </small>
                    )}
                  </td>
                  <td data-label="Действия">
                    <button 
                      className="remove-btn" 
                      onClick={() => handleRemove(property.id, property.name)}
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

