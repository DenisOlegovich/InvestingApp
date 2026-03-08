import React, { useState } from 'react';
import { extendedAPI } from '../../services/api';

export const ImportCSVPanel: React.FC = () => {
  const [csv, setCsv] = useState('');
  const [result, setResult] = useState<{ imported: number; errors: { row: string; error: string }[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!csv.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await extendedAPI.importCSV(csv) as { imported: number; errors: { row: string; error: string }[] };
      setResult(r);
    } catch (e: any) {
      setResult({ imported: 0, errors: [{ row: '', error: e.message || 'Ошибка' }] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <h2>Импорт CSV</h2>
      <div className="muted">
        Вставь CSV из брокера. Колонки: ticker/symbol, action (buy/sell), quantity, price, date, currency, commission.
      </div>
      <textarea
        className="input"
        placeholder="ticker,action,quantity,price,date,currency,commission&#10;SBER,buy,10,250,2024-01-15,RUB,10"
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
        rows={8}
        style={{ marginTop: 12, resize: 'vertical' }}
      />
      <button className="btn" onClick={submit} disabled={loading || !csv.trim()} style={{ marginTop: 12 }}>
        {loading ? 'Импорт...' : 'Импортировать'}
      </button>
      {result && (
        <div className="muted" style={{ marginTop: 12 }}>
          Импортировано: {result.imported}. Ошибок: {result.errors.length}.
          {result.errors.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,160,160,0.9)' }}>
              {result.errors.slice(0, 5).map((e, i) => (
                <div key={i}>{e.error}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
