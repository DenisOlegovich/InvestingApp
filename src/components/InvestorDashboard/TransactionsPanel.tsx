import React, { useState, useEffect } from 'react';
import type { Transaction, Security } from '../../types';
import { portfolioAPI } from '../../services/api';
import './TransactionsPanel.css';

interface TransactionsPanelProps {
  securities: Security[];
  onRefresh?: () => void;
}

export const TransactionsPanel: React.FC<TransactionsPanelProps> = ({ securities, onRefresh }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{
    ticker: string;
    name: string;
    type: 'buy' | 'sell';
    quantity: number;
    pricePerUnit: number;
    currency: 'RUB' | 'USD' | 'EUR';
    tradeDate: string;
  }>({
    ticker: '',
    name: '',
    type: 'buy',
    quantity: 1,
    pricePerUnit: 0,
    currency: 'RUB',
    tradeDate: new Date().toISOString().slice(0, 10),
  });

  const loadTransactions = async () => {
    try {
      const data = await portfolioAPI.getTransactions();
      setTransactions(data);
    } catch (e) {
      console.error('Ошибка загрузки сделок:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ticker.trim() || !form.name.trim() || form.quantity < 1 || form.pricePerUnit <= 0) {
      alert('Заполните все поля');
      return;
    }
    try {
      await portfolioAPI.addTransaction({
        ...form,
        total: form.quantity * form.pricePerUnit,
      });
      setForm({
        ticker: '',
        name: '',
        type: 'buy',
        quantity: 1,
        pricePerUnit: 0,
        currency: 'RUB',
        tradeDate: new Date().toISOString().slice(0, 10),
      });
      setShowForm(false);
      loadTransactions();
      onRefresh?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка добавления');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить сделку?')) return;
    try {
      await portfolioAPI.deleteTransaction(id);
      loadTransactions();
      onRefresh?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка удаления');
    }
  };

  const fillFromSecurity = (s: Security) => {
    setForm((f) => ({
      ...f,
      ticker: s.ticker,
      name: s.name,
      currency: s.currency,
      pricePerUnit: s.currentPrice,
    }));
  };

  return (
    <div className="transactions-panel">
      <div className="transactions-header">
        <h3>История сделок</h3>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Отмена' : '+ Добавить сделку'}
        </button>
      </div>

      {showForm && (
        <form className="transaction-form" onSubmit={handleAdd}>
          <div className="form-row">
            <label>
              <span>Тикер</span>
              <input
                value={form.ticker}
                onChange={(e) => setForm((f) => ({ ...f, ticker: e.target.value.toUpperCase() }))}
                placeholder="SBER"
                list="tickers-list"
              />
            </label>
            <datalist id="tickers-list">
              {securities.map((s) => (
                <option key={s.id} value={s.ticker} />
              ))}
            </datalist>
            <label>
              <span>Название</span>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Сбербанк"
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              <span>Тип</span>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'buy' | 'sell' }))}
              >
                <option value="buy">Покупка</option>
                <option value="sell">Продажа</option>
              </select>
            </label>
            <label>
              <span>Кол-во</span>
              <input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: parseInt(e.target.value, 10) || 0 }))}
              />
            </label>
            <label>
              <span>Цена за шт.</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.pricePerUnit || ''}
                onChange={(e) => setForm((f) => ({ ...f, pricePerUnit: parseFloat(e.target.value) || 0 }))}
              />
            </label>
            <label>
              <span>Валюта</span>
              <select
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value as 'RUB' | 'USD' | 'EUR' }))}
              >
                <option value="RUB">RUB</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </label>
            <label>
              <span>Дата</span>
              <input
                type="date"
                value={form.tradeDate}
                onChange={(e) => setForm((f) => ({ ...f, tradeDate: e.target.value }))}
              />
            </label>
          </div>
          {securities.length > 0 && (
            <div className="quick-fill">
              <span>Быстро:</span>
              {securities.slice(0, 5).map((s) => (
                <button key={s.id} type="button" onClick={() => fillFromSecurity(s)}>
                  {s.ticker}
                </button>
              ))}
            </div>
          )}
          <button type="submit" className="btn-submit">
            Сохранить
          </button>
        </form>
      )}

      {loading ? (
        <p>Загрузка...</p>
      ) : transactions.length === 0 ? (
        <p className="empty-message">Нет сделок. Добавьте первую сделку.</p>
      ) : (
        <div className="transactions-table-wrap">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Тикер</th>
                <th>Тип</th>
                <th>Кол-во</th>
                <th>Цена</th>
                <th>Сумма</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.tradeDate}</td>
                  <td>{t.ticker}</td>
                  <td className={t.type === 'buy' ? 'type-buy' : 'type-sell'}>
                    {t.type === 'buy' ? 'Покупка' : 'Продажа'}
                  </td>
                  <td>{t.quantity}</td>
                  <td>
                    {t.pricePerUnit.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} {t.currency}
                  </td>
                  <td>
                    {t.total.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} {t.currency}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() => handleDelete(t.id)}
                      title="Удалить"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
