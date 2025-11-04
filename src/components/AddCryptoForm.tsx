import React, { useState } from 'react';
import { Crypto } from '../types';
import { fetchCryptoData } from '../services/cryptoApi';
import { formatNumberWithSpaces, parseFormattedNumber } from '../utils/formatNumber';
import './AddCryptoForm.css';

interface AddCryptoFormProps {
  onAdd: (crypto: Omit<Crypto, 'id'>) => void;
  onClose: () => void;
}

export const AddCryptoForm: React.FC<AddCryptoFormProps> = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    symbol: '',
    amount: '',
    stakingYield: '',
    purchasePrice: '',
    purchaseDate: '',
  });
  const [loadedData, setLoadedData] = useState<{
    name: string;
    currentPrice: number;
    previousPrice: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSymbolBlur = async () => {
    const symbol = formData.symbol.toUpperCase().trim();
    if (!symbol) return;

    setLoading(true);
    setError(null);
    
    try {
      const cryptoData = await fetchCryptoData(symbol);
      if (cryptoData) {
        setLoadedData({
          name: cryptoData.name,
          currentPrice: cryptoData.price,
          previousPrice: cryptoData.previousPrice,
        });
      } else {
        setError('Не удалось загрузить данные по символу. Проверьте правильность символа (например: BTC, ETH).');
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
      setError('Пожалуйста, загрузите данные по символу перед добавлением');
      return;
    }

    if (!formData.amount || parseFloat(parseFormattedNumber(formData.amount)) <= 0) {
      setError('Укажите количество (больше 0)');
      return;
    }

    onAdd({
      symbol: formData.symbol.toUpperCase().trim(),
      name: loadedData.name,
      amount: parseFloat(parseFormattedNumber(formData.amount)),
      currentPrice: loadedData.currentPrice,
      previousPrice: loadedData.previousPrice,
      stakingYield: formData.stakingYield ? parseFloat(parseFormattedNumber(formData.stakingYield)) : undefined,
      purchasePrice: formData.purchasePrice ? parseFloat(parseFormattedNumber(formData.purchasePrice)) : undefined,
      purchaseDate: formData.purchaseDate || undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Добавить криптовалюту</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Символ криптовалюты *</label>
            <div className="input-with-button">
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => {
                  setFormData({ ...formData, symbol: e.target.value });
                  setLoadedData(null);
                  setError(null);
                }}
                onBlur={handleSymbolBlur}
                placeholder="Например: BTC, ETH, SOL, ADA"
                required
                disabled={loading}
              />
              {loading && <span className="loading-spinner">⏳</span>}
            </div>
            <small className="hint">Введите символ и нажмите вне поля для автоматической загрузки</small>
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
                    ${loadedData.currentPrice.toLocaleString('ru-RU')}
                  </span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Предыдущая цена:</span>
                  <span className="preview-value">
                    ${loadedData.previousPrice.toLocaleString('ru-RU')}
                  </span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Изменение:</span>
                  <span className={`preview-value ${loadedData.currentPrice >= loadedData.previousPrice ? 'positive' : 'negative'}`}>
                    ${(loadedData.currentPrice - loadedData.previousPrice).toFixed(2)}
                    ({((loadedData.currentPrice - loadedData.previousPrice) / loadedData.previousPrice * 100).toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label>Количество *</label>
            <input
              type="text"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: formatNumberWithSpaces(e.target.value) })}
              required
              disabled={loading || !loadedData}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Доходность стейкинга (% годовых)</label>
              <input
                type="number"
                step="0.01"
                value={formData.stakingYield}
                onChange={(e) => setFormData({ ...formData, stakingYield: e.target.value })}
                placeholder="Опционально"
                min="0"
                max="100"
                disabled={loading || !loadedData}
              />
            </div>
            
            <div className="form-group">
              <label>Цена покупки ($)</label>
              <input
                type="text"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: formatNumberWithSpaces(e.target.value) })}
                disabled={loading || !loadedData}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Дата покупки</label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              disabled={loading || !loadedData}
            />
            <small className="hint">Опционально, для расчета прироста стоимости</small>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Отмена
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading || !loadedData || !formData.amount}
            >
              {loading ? 'Загрузка...' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

