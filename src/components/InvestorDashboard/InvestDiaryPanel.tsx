import React, { useState, useEffect } from 'react';
import { extendedAPI } from '../../services/api';

interface DiaryEntry {
  id: string;
  ticker?: string;
  entry: string;
  whatWorked: boolean;
  createdAt: string;
}

export const InvestDiaryPanel: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [entry, setEntry] = useState('');
  const [ticker, setTicker] = useState('');
  const [whatWorked, setWhatWorked] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    extendedAPI.diary.get().then((r: any) => setEntries(r)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const add = async () => {
    if (!entry.trim()) return;
    await extendedAPI.diary.create({ entry: entry.trim(), ticker: ticker.trim() || undefined, whatWorked: whatWorked ?? false });
    setEntry('');
    setTicker('');
    setWhatWorked(null);
    load();
  };

  const remove = async (id: string) => {
    await extendedAPI.diary.delete(id);
    load();
  };

  return (
    <div className="panel">
      <h2>Инвест-дневник</h2>
      <div className="muted">Заметки по сделкам: тезис, что сработало/не сработало.</div>

      <div className="form-row" style={{ marginTop: 12 }}>
        <input
          className="input"
          placeholder="Тикер (опц.)"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className={`btn ${whatWorked === true ? 'active' : ''}`}
            style={{ padding: '6px 10px' }}
            onClick={() => setWhatWorked(whatWorked === true ? null : true)}
          >
            ✓ Сработало
          </button>
          <button
            className={`btn danger ${whatWorked === false ? 'active' : ''}`}
            style={{ padding: '6px 10px' }}
            onClick={() => setWhatWorked(whatWorked === false ? null : false)}
          >
            ✗ Не сработало
          </button>
        </div>
      </div>
      <textarea
        className="input"
        placeholder="Заметка..."
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        rows={3}
        style={{ marginTop: 8, resize: 'vertical' }}
      />
      <button className="btn" onClick={add} disabled={!entry.trim()} style={{ marginTop: 8 }}>
        Добавить
      </button>

      {loading ? (
        <div className="muted" style={{ marginTop: 16 }}>Загрузка...</div>
      ) : (
        <div className="list" style={{ marginTop: 16 }}>
          {entries.map((e) => (
            <div key={e.id} className="list-item">
              <div className="left">
                <div className="title">{e.ticker ? `[${e.ticker}] ` : ''}{e.entry.slice(0, 80)}{e.entry.length > 80 ? '…' : ''}</div>
                <div className="sub">
                  {e.whatWorked && '✓ Сработало | '}
                  {new Date(e.createdAt).toLocaleString('ru-RU')}
                </div>
              </div>
              <button className="btn danger" style={{ padding: '4px 8px' }} onClick={() => remove(e.id)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
