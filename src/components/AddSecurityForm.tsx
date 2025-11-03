import React, { useState } from 'react';
import { Security } from '../types';
import { fetchStockData } from '../services/stockApi';
import './AddSecurityForm.css';

interface AddSecurityFormProps {
  onAdd: (security: Omit<Security, 'id'>) => void;
  onClose: () => void;
}

export const AddSecurityForm: React.FC<AddSecurityFormProps> = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    ticker: '',
    type: 'stock' as 'stock' | 'bond' | 'etf',
    quantity: '',
  });
  const [loadedData, setLoadedData] = useState<{
    name: string;
    currentPrice: number;
    previousPrice: number;
    expectedDividend: number;
    dividendFrequency: 'monthly' | 'quarterly' | 'yearly';
    currency: 'RUB' | 'USD' | 'EUR';
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTickerBlur = async () => {
    const ticker = formData.ticker.toUpperCase().trim();
    if (!ticker) return;

    setLoading(true);
    setError(null);
    
    try {
      const stockData = await fetchStockData(ticker);
      if (stockData) {
        setLoadedData({
          name: stockData.name,
          currentPrice: stockData.price,
          previousPrice: stockData.previousClose,
          expectedDividend: stockData.dividendYield || 0,
          dividendFrequency: stockData.dividendFrequency || 'yearly',
          currency: stockData.currency,
        });
      } else {
        setError('Не удалось загрузить данные по тикеру. Проверьте правильность тикера.');
        setLoadedData(null);
      }
    } catch (err) {
      setError('Ошибка при загрузке данных. Попробуйте позже.');
      setLoadedData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loadedData) {
      setError('Пожалуйста, загрузите данные по тикеру перед добавлением');
      return;
    }

    if (!formData.quantity || parseInt(formData.quantity) < 1) {
      setError('Укажите количество (минимум 1)');
      return;
    }

    onAdd({
      name: loadedData.name,
      ticker: formData.ticker.toUpperCase().trim(),
      type: formData.type,
      currentPrice: loadedData.currentPrice,
      previousPrice: loadedData.previousPrice, // При добавлении previousPrice = previousClose из API
      quantity: parseInt(formData.quantity),
      expectedDividend: loadedData.expectedDividend,
      dividendFrequency: loadedData.dividendFrequency,
      currency: loadedData.currency,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Добавить ценную бумагу</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Тикер *</label>
            <div className="input-with-button">
              <input
                type="text"
                value={formData.ticker}
                onChange={(e) => {
                  setFormData({ ...formData, ticker: e.target.value });
                  setLoadedData(null);
                  setError(null);
                }}
                onBlur={handleTickerBlur}
                placeholder="Например: SBER (₽), AAPL ($), MSFT ($), TSLA ($)"
                required
                disabled={loading}
              />
              {loading && <span className="loading-spinner">⏳</span>}
            </div>
            <small className="hint">Введите тикер и нажмите вне поля для автоматической загрузки</small>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {loadedData && (
            <div className="loaded-data-preview">
              <h3>Загруженные данные:</h3>
              <div className="preview-grid">
                <div className="preview-item">
                  <span className="preview-label">Название:</span>
                  <span className="preview-value">{loadedData.name}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Текущая цена:</span>
                  <span className="preview-value">
                    {loadedData.currentPrice.toLocaleString('ru-RU')} {loadedData.currency === 'USD' ? '$' : loadedData.currency === 'EUR' ? '€' : '₽'}
                  </span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Предыдущая цена:</span>
                  <span className="preview-value">
                    {loadedData.previousPrice.toLocaleString('ru-RU')} {loadedData.currency === 'USD' ? '$' : loadedData.currency === 'EUR' ? '€' : '₽'}
                  </span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Изменение:</span>
                  <span className={`preview-value ${loadedData.currentPrice >= loadedData.previousPrice ? 'positive' : 'negative'}`}>
                    {(loadedData.currentPrice - loadedData.previousPrice).toFixed(2)} {loadedData.currency === 'USD' ? '$' : loadedData.currency === 'EUR' ? '€' : '₽'}
                    ({((loadedData.currentPrice - loadedData.previousPrice) / loadedData.previousPrice * 100).toFixed(2)}%)
                  </span>
                </div>
                {loadedData.expectedDividend > 0 && (
                  <div className="preview-item">
                    <span className="preview-label">Дивидендная доходность:</span>
                    <span className="preview-value">{loadedData.expectedDividend.toFixed(2)}% годовых</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label>Тип</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              disabled={loading}
            >
              <option value="stock">Акция</option>
              <option value="bond">Облигация</option>
              <option value="etf">ETF</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Количество *</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
              min="1"
              placeholder="Введите количество"
              disabled={loading || !loadedData}
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Отмена
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading || !loadedData || !formData.quantity}
            >
              {loading ? 'Загрузка...' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

