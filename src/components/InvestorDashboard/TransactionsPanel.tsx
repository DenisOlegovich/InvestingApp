import React, { useState, useEffect } from 'react';
import { extendedAPI } from '../../services/api';
import type { Transaction } from '../../types/investor';

function fmt(n: number): string {
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
}

export const TransactionsPanel: React.FC<{
  onAddTransaction?: () => void;
}> = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    assetType: 'security' as 'security' | 'crypto',
    tickerOrSymbol: '',
    action: 'buy' as 'buy' | 'sell',
    quantity: 0,
    price: 0,
    currency: 'RUB',
    commission: 0,
    tradeDate: new Date().toISOString().slice(0, 10),
  });

  const load = () => {
    setLoading(true);
    extendedAPI.transactions.get().then(setTransactions).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async () => {
    if (!form.tickerOrSymbol || form.quantity <= 0 || form.price <= 0) return;
    await extendedAPI.transactions.create({
      ...form,
      tradeDate: form.tradeDate,
    });
    setForm({ ...form, tickerOrSymbol: '', quantity: 0, price: 0 });
    setShowForm(false);
    load();
  };

  const remove = async (id: string) => {
    await extendedAPI.transactions.delete(id);
    load();
  };

  return (
    <div className="panel">
      <h2>Транзакции и P&L</h2>
      <div className="muted">История сделок. FIFO/LIFO — в расчёте налогов. Реализованная прибыль — по проданным лотам.</div>

      <div className="btn-row" style={{ marginTop: 12 }}>
        <button className="btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Скрыть форму' : '+ Добавить сделку'}
        </button>
      </div>

      {showForm && (
        <div className="panel" style={{ marginTop: 16, padding: 14 }}>
          <div className="form-row">
            <select
              className="input"
              value={form.assetType}
              onChange={(e) => setForm({ ...form, assetType: e.target.value as 'security' | 'crypto' })}
            >
              <option value="security">Ценная бумага</option>
              <option value="crypto">Крипто</option>
            </select>
            <select
              className="input"
              value={form.action}
              onChange={(e) => setForm({ ...form, action: e.target.value as 'buy' | 'sell' })}
            >
              <option value="buy">Покупка</option>
              <option value="sell">Продажа</option>
            </select>
          </div>
          <div className="form-row" style={{ marginTop: 8 }}>
            <input
              className="input"
              placeholder="Тикер (SBER, BTC...)"
              value={form.tickerOrSymbol}
              onChange={(e) => setForm({ ...form, tickerOrSymbol: e.target.value.toUpperCase() })}
            />
            <input
              className="input"
              type="number"
              placeholder="Количество"
              value={form.quantity || ''}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            />
          </div>
          <div className="form-row" style={{ marginTop: 8 }}>
            <input
              className="input"
              type="number"
              placeholder="Цена"
              value={form.price || ''}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
            <input
              className="input"
              type="number"
              placeholder="Комиссия"
              value={form.commission || ''}
              onChange={(e) => setForm({ ...form, commission: Number(e.target.value) })}
            />
          </div>
          <div className="form-row" style={{ marginTop: 8 }}>
            <input
              className="input"
              type="date"
              value={form.tradeDate}
              onChange={(e) => setForm({ ...form, tradeDate: e.target.value })}
            />
            <select
              className="input"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              <option value="RUB">RUB</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <button className="btn" onClick={submit} style={{ marginTop: 12 }}>
            Сохранить
          </button>
        </div>
      )}

      {loading ? (
        <div className="muted" style={{ marginTop: 16 }}>Загрузка...</div>
      ) : transactions.length === 0 ? (
        <div className="muted" style={{ marginTop: 16 }}>Нет транзакций. Добавьте первую.</div>
      ) : (
        <div className="list" style={{ marginTop: 16 }}>
          {transactions.slice(0, 50).map((t) => (
            <div key={t.id} className="list-item">
              <div className="left">
                <div className="title">{t.tickerOrSymbol} — {t.action === 'buy' ? 'Покупка' : 'Продажа'}</div>
                <div className="sub">
                  {t.quantity} × {fmt(t.price)} {t.currency}
                  {t.commission ? ` | комиссия ${fmt(t.commission)}` : ''} | {t.tradeDate}
                </div>
              </div>
              <div className="right">
                <span className={t.action === 'sell' ? 'pill negative' : 'pill positive'}>
                  {t.action === 'buy' ? '−' : '+'}{fmt(t.quantity * t.price + (t.action === 'buy' ? t.commission || 0 : -(t.commission || 0)))}
                </span>
                <button className="btn danger" style={{ marginLeft: 8, padding: '4px 8px' }} onClick={() => remove(t.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
