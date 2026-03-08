import React, { useState, useEffect } from 'react';
import { extendedAPI } from '../../services/api';
import type { Alert } from '../../types/investor';

const TYPE_LABELS: Record<string, string> = {
  price: 'Цена',
  volatility: 'Волатильность',
  drawdown: 'Просадка',
  dividend: 'Дивиденды',
  rate: 'Ставка',
  goal: 'Цель',
};

export const AlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: 'price' as Alert['type'],
    tickerOrSymbol: '',
    thresholdPercent: 5,
    targetValue: 0,
  });

  const load = () => {
    setLoading(true);
    extendedAPI.alerts.get().then((r: any) => setAlerts(r)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const add = async () => {
    await extendedAPI.alerts.create(form);
    setForm({ ...form, tickerOrSymbol: '', thresholdPercent: 5, targetValue: 0 });
    setShowForm(false);
    load();
  };

  const remove = async (id: string) => {
    await extendedAPI.alerts.delete(id);
    load();
  };

  const toggle = async (a: Alert) => {
    await extendedAPI.alerts.update(a.id, { isActive: !a.isActive });
    load();
  };

  return (
    <div className="panel">
      <h2>Алерты</h2>
      <div className="muted">Цена, волатильность, просадка, дивиденды, ставка, достижение цели.</div>

      <button className="btn" onClick={() => setShowForm(!showForm)} style={{ marginTop: 12 }}>
        {showForm ? 'Скрыть' : '+ Добавить алерт'}
      </button>

      {showForm && (
        <div className="panel" style={{ marginTop: 16, padding: 14 }}>
          <div className="form-row">
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Alert['type'] })}>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <input
              className="input"
              placeholder="Тикер"
              value={form.tickerOrSymbol}
              onChange={(e) => setForm({ ...form, tickerOrSymbol: e.target.value })}
            />
          </div>
          <div className="form-row" style={{ marginTop: 8 }}>
            <input
              className="input"
              type="number"
              placeholder="Порог %"
              value={form.thresholdPercent || ''}
              onChange={(e) => setForm({ ...form, thresholdPercent: Number(e.target.value) })}
            />
            <input
              className="input"
              type="number"
              placeholder="Целевое значение"
              value={form.targetValue || ''}
              onChange={(e) => setForm({ ...form, targetValue: Number(e.target.value) })}
            />
          </div>
          <button className="btn" onClick={add} style={{ marginTop: 12 }}>Добавить</button>
        </div>
      )}

      {loading ? (
        <div className="muted" style={{ marginTop: 16 }}>Загрузка...</div>
      ) : (
        <div className="list" style={{ marginTop: 16 }}>
          {alerts.map((a) => (
            <div key={a.id} className="list-item">
              <div className="left">
                <div className="title">{TYPE_LABELS[a.type] || a.type} {a.tickerOrSymbol && `• ${a.tickerOrSymbol}`}</div>
                <div className="sub">
                  {[a.thresholdPercent && `Порог ${a.thresholdPercent}%`, a.targetValue && `Цель ${a.targetValue}`, a.triggeredAt && `Сработал ${a.triggeredAt}`].filter(Boolean).join(' | ')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" style={{ padding: '4px 8px' }} onClick={() => toggle(a)}>
                  {a.isActive ? 'Выкл' : 'Вкл'}
                </button>
                <button className="btn danger" style={{ padding: '4px 8px' }} onClick={() => remove(a.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {alerts.length === 0 && !loading && <div className="muted" style={{ marginTop: 16 }}>Пока нет алертов.</div>}
    </div>
  );
};
