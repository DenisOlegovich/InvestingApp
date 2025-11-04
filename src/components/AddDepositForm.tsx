import React, { useState } from 'react';
import { Deposit } from '../types';
import { formatNumberWithSpaces, parseFormattedNumber } from '../utils/formatNumber';
import './AddDepositForm.css';

interface AddDepositFormProps {
  onAdd: (deposit: Omit<Deposit, 'id'>) => void;
  onClose: () => void;
}

export const AddDepositForm: React.FC<AddDepositFormProps> = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    bank: '',
    amount: '',
    interestRate: '',
    currency: 'RUB' as 'RUB' | 'USD' | 'EUR',
    openingDate: '',
    maturityDate: '',
    capitalization: 'monthly' as 'monthly' | 'quarterly' | 'yearly' | 'none',
    type: 'term' as 'demand' | 'term',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name: formData.name,
      bank: formData.bank,
      amount: parseFloat(parseFormattedNumber(formData.amount)),
      interestRate: parseFloat(parseFormattedNumber(formData.interestRate)),
      currency: formData.currency,
      openingDate: formData.openingDate || undefined,
      maturityDate: formData.maturityDate || undefined,
      capitalization: formData.capitalization,
      type: formData.type,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Добавить депозит</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Название депозита *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Например: Накопительный счет"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Банк *</label>
            <input
              type="text"
              value={formData.bank}
              onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
              placeholder="Например: Сбербанк"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Сумма депозита *</label>
              <input
                type="text"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: formatNumberWithSpaces(e.target.value) })}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Валюта *</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
              >
                <option value="RUB">₽ RUB</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Процентная ставка (% годовых) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                required
                min="0"
                max="100"
              />
            </div>
            
            <div className="form-group">
              <label>Тип депозита *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="term">Срочный</option>
                <option value="demand">До востребования</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Капитализация процентов *</label>
              <select
                value={formData.capitalization}
                onChange={(e) => setFormData({ ...formData, capitalization: e.target.value as any })}
              >
                <option value="monthly">Ежемесячная</option>
                <option value="quarterly">Квартальная</option>
                <option value="yearly">Годовая</option>
                <option value="none">Без капитализации</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Дата открытия <small>(опционально)</small></label>
              <input
                type="date"
                value={formData.openingDate}
                onChange={(e) => setFormData({ ...formData, openingDate: e.target.value })}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Дата окончания (для срочного депозита)</label>
            <input
              type="date"
              value={formData.maturityDate}
              onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
              min={formData.openingDate}
            />
            <small className="hint">Оставьте пустым для депозита до востребования</small>
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

