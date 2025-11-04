import React, { useState } from 'react';
import { RealEstate } from '../types';
import { formatNumberWithSpaces, parseFormattedNumber } from '../utils/formatNumber';
import './AddRealEstateForm.css';

interface AddRealEstateFormProps {
  onAdd: (realEstate: Omit<RealEstate, 'id'>) => void;
  onClose: () => void;
}

export const AddRealEstateForm: React.FC<AddRealEstateFormProps> = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: 'apartment' as 'apartment' | 'house' | 'commercial',
    currentValue: '',
    purchasePrice: '',
    purchaseDate: '',
    expectedRentalYield: '',
    monthlyRent: '',
  });

  // Автоматический расчет доходности от аренды
  const calculateYield = (): number => {
    const currentVal = parseFloat(parseFormattedNumber(formData.currentValue));
    const rent = parseFloat(parseFormattedNumber(formData.monthlyRent));
    if (currentVal > 0 && rent > 0) {
      const annualRent = rent * 12;
      return (annualRent / currentVal) * 100;
    }
    return 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const calculatedYield = calculateYield();
    
    onAdd({
      name: formData.name,
      location: formData.location,
      type: formData.type,
      currentValue: parseFloat(parseFormattedNumber(formData.currentValue)),
      purchasePrice: formData.purchasePrice ? parseFloat(parseFormattedNumber(formData.purchasePrice)) : undefined,
      purchaseDate: formData.purchaseDate || undefined,
      expectedRentalYield: calculatedYield > 0 ? calculatedYield : (formData.expectedRentalYield ? parseFloat(parseFormattedNumber(formData.expectedRentalYield)) : undefined),
      monthlyRent: formData.monthlyRent ? parseFloat(parseFormattedNumber(formData.monthlyRent)) : undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Добавить недвижимость</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Название</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Местоположение</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Тип</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            >
              <option value="apartment">Квартира</option>
              <option value="house">Дом</option>
              <option value="commercial">Коммерческая недвижимость</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Текущая стоимость (₽)</label>
            <input
              type="text"
              value={formData.currentValue}
              onChange={(e) => setFormData({ ...formData, currentValue: formatNumberWithSpaces(e.target.value) })}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Цена покупки (₽) <small>(опционально)</small></label>
              <input
                type="text"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: formatNumberWithSpaces(e.target.value) })}
              />
            </div>
            
            <div className="form-group">
              <label>Дата покупки <small>(опционально)</small></label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Месячная аренда (₽) <small>(опционально)</small></label>
            <input
              type="text"
              value={formData.monthlyRent}
              onChange={(e) => setFormData({ ...formData, monthlyRent: formatNumberWithSpaces(e.target.value) })}
            />
            {calculateYield() > 0 && (
              <div style={{ 
                marginTop: '8px', 
                padding: '8px 12px', 
                background: '#e8f5e9', 
                borderRadius: '6px',
                fontSize: '14px',
                color: '#2e7d32'
              }}>
                ✓ Доходность от аренды: <strong>{calculateYield().toFixed(2)}% годовых</strong>
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Отмена</button>
            <button type="submit" className="btn-primary">Добавить</button>
          </div>
        </form>
      </div>
    </div>
  );
};

