import React, { useState, useEffect } from 'react';
import type { WatchlistItem } from '../../types/investor';
import { loadJson, saveJson } from '../../utils/storage';
import { fetchStockData } from '../../services/stockApi';

const STORAGE_KEY = 'investor_watchlist';

export const WatchlistPanel: React.FC<{
  userId?: number;
}> = ({ userId }) => {
  const key = `${STORAGE_KEY}_${userId ?? 'anon'}`;
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [ticker, setTicker] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    setItems(loadJson<WatchlistItem[]>(key, []));
  }, [key]);

  useEffect(() => {
    saveJson(key, items);
  }, [key, items]);

  const addItem = () => {
    const t = ticker.trim().toUpperCase();
    if (!t) return;
    if (items.some((i) => i.ticker === t)) return;
    const item: WatchlistItem = {
      id: crypto.randomUUID(),
      ticker: t,
      targetPrice: targetPrice ? Number(targetPrice) : undefined,
      note: note.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    setItems([item, ...items]);
    setTicker('');
    setTargetPrice('');
    setNote('');
  };

  const removeItem = (id: string) => setItems(items.filter((i) => i.id !== id));

  const refreshPrice = async (item: WatchlistItem) => {
    setLoading(item.id);
    try {
      const data = await fetchStockData(item.ticker);
      if (data) {
        setItems(items.map((i) => (i.id === item.id ? { ...i, currentPrice: data.price, name: data.name } : i)));
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="panel">
      <h2>Watchlist</h2>
      <div className="muted">Тикеры для отслеживания, цели по цене. Данные в браузере.</div>

      <div className="form-row" style={{ marginTop: 12 }}>
        <input
          className="input"
          placeholder="Тикер (SBER, AAPL...)"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <input
          className="input"
          type="number"
          placeholder="Цель по цене (опц.)"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
        />
      </div>
      <input
        className="input"
        placeholder="Заметка (опц.)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{ marginTop: 8 }}
      />
      <button className="btn" onClick={addItem} style={{ marginTop: 10 }}>
        Добавить
      </button>

      <div className="list" style={{ marginTop: 20 }}>
        {items.map((item) => (
          <div key={item.id} className="list-item">
            <div className="left">
              <div className="title">{item.ticker}</div>
              <div className="sub">{item.name || item.note || '—'}</div>
              {item.targetPrice != null && (
                <div className="sub">Цель: {item.targetPrice.toLocaleString('ru-RU')}</div>
              )}
            </div>
            <div className="right" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {item.currentPrice != null && (
                <span>{item.currentPrice.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}</span>
              )}
              <button
                className="btn"
                disabled={loading === item.id}
                onClick={() => refreshPrice(item)}
                style={{ padding: '6px 10px' }}
              >
                {loading === item.id ? '...' : 'Обновить'}
              </button>
              <button className="btn danger" onClick={() => removeItem(item.id)} style={{ padding: '6px 10px' }}>
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <div className="muted" style={{ marginTop: 12 }}>Пока пусто.</div>}
    </div>
  );
};
