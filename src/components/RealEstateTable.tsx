import React from 'react';
import { RealEstate } from '../types';
import { calculatePriceChangePercent, calculateRealEstateRental, calculateRentalYield } from '../utils/calculations';
import './RealEstateTable.css';

interface RealEstateTableProps {
  realEstate: RealEstate[];
  onRemove: (id: string) => void;
}

export const RealEstateTable: React.FC<RealEstateTableProps> = ({ realEstate, onRemove }) => {
  if (realEstate.length === 0) {
    return null;
  }

  return (
    <div className="table-container">
      <h2>Недвижимость ({realEstate.length})</h2>
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
                    return 'Коммерческая';
                  default:
                    return type;
                }
              };

              return (
                <tr key={property.id}>
                  <td className="name-cell">{property.name}</td>
                  <td className="location-cell">{property.location}</td>
                  <td>
                    <span className="type-badge">{getTypeLabel(property.type)}</span>
                  </td>
                  <td className="price-cell">
                    {property.currentValue.toLocaleString('ru-RU')} ₽
                  </td>
                  <td>
                    {property.purchasePrice ? `${property.purchasePrice.toLocaleString('ru-RU')} ₽` : '—'}
                  </td>
                  <td>
                    {property.purchaseDate ? new Date(property.purchaseDate).toLocaleDateString('ru-RU') : '—'}
                  </td>
                  <td className={`gain-cell ${isGainPositive ? 'positive' : 'negative'}`}>
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
                  <td className="rental-cell">
                    {expectedRental > 0 ? `${expectedRental.toLocaleString('ru-RU')} ₽` : '—'}
                  </td>
                  <td className="yield-cell">
                    {rentalYield > 0 ? `${rentalYield.toFixed(2)}% год.` : '—'}
                    {property.monthlyRent && (
                      <small style={{ display: 'block', color: '#4caf50' }}>
                        (рассчитано)
                      </small>
                    )}
                  </td>
                  <td>
                    <button 
                      className="remove-btn" 
                      onClick={() => onRemove(property.id)}
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

