import React, { useState } from 'react';
import { RealEstate } from '../types';
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
    const currentVal = parseFloat(formData.currentValue);
    const rent = parseFloat(formData.monthlyRent);
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
      currentValue: parseFloat(formData.currentValue),
      purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
      purchaseDate: formData.purchaseDate || undefined,
      expectedRentalYield: calculatedYield > 0 ? calculatedYield : (formData.expectedRentalYield ? parseFloat(formData.expectedRentalYield) : undefined),
      monthlyRent: formData.monthlyRent ? parseFloat(formData.monthlyRent) : undefined,
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
              <option value="commercial">Коммерческая</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Текущая стоимость (₽)</label>
            <input
              type="number"
              step="0.01"
              value={formData.currentValue}
              onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Цена покупки (₽) <small>(опционально)</small></label>
              <input
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
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
          
          <div className="form-row">
            <div className="form-group">
              <label>
                Доходность от аренды (% годовых) 
                {calculateYield() > 0 && (
                  <small style={{ color: '#4caf50', fontWeight: 'bold' }}>
                    {' '}(рассчитано: {calculateYield().toFixed(2)}%)
                  </small>
                )}
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.expectedRentalYield}
                onChange={(e) => setFormData({ ...formData, expectedRentalYield: e.target.value })}
                disabled={calculateYield() > 0}
                placeholder="Рассчитается автоматически при указании аренды"
              />
            </div>
            
            <div className="form-group">
              <label>Месячная аренда (₽) - опционально</label>
              <input
                type="number"
                step="0.01"
                value={formData.monthlyRent}
                onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
              />
            </div>
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

