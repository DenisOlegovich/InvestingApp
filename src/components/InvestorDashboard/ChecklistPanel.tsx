import React, { useState, useEffect } from 'react';
import type { ChecklistItem } from '../../types/investor';
import { loadJson, saveJson } from '../../utils/storage';

const STORAGE_KEY = 'investor_checklist';

const DEFAULT_ITEMS: ChecklistItem[] = [
  { id: '1', text: 'Проверил отчётность и див. политику', done: false, category: 'purchase' },
  { id: '2', text: 'Оценил мультипликаторы (P/E, P/B)', done: false, category: 'purchase' },
  { id: '3', text: 'Определил цель по цене и объём позиции', done: false, category: 'purchase' },
  { id: '4', text: 'Проверил срок владения для налоговых льгот', done: false, category: 'purchase' },
  { id: '5', text: 'Сравнил текущие доли с целевыми', done: false, category: 'rebalance' },
  { id: '6', text: 'Рассчитал суммы для докупки/продажи', done: false, category: 'rebalance' },
  { id: '7', text: 'Учёл комиссии и налоги', done: false, category: 'rebalance' },
  { id: '8', text: 'Собрал справки о доходах (2-НДФЛ, выписки)', done: false, category: 'tax' },
  { id: '9', text: 'Подготовил декларацию 3-НДФЛ', done: false, category: 'tax' },
];

export const ChecklistPanel: React.FC<{ userId?: number }> = ({ userId }) => {
  const key = `${STORAGE_KEY}_${userId ?? 'anon'}`;
  const [items, setItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    const loaded = loadJson<ChecklistItem[]>(key, []);
    setItems(loaded.length > 0 ? loaded : DEFAULT_ITEMS);
  }, [key]);

  useEffect(() => {
    saveJson(key, items);
  }, [key, items]);

  const toggle = (id: string) => {
    setItems(items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  };

  const reset = () => setItems(DEFAULT_ITEMS);

  const byCategory = items.reduce(
    (acc, i) => {
      (acc[i.category] = acc[i.category] || []).push(i);
      return acc;
    },
    {} as Record<string, ChecklistItem[]>
  );

  const catLabels: Record<string, string> = {
    purchase: 'Перед покупкой',
    rebalance: 'Перед ребалансом',
    tax: 'Налоги',
  };

  return (
    <div className="panel">
      <h2>Чек-листы</h2>
      <div className="muted">Помогают не забыть важные шаги.</div>
      <button className="btn" onClick={reset} style={{ marginTop: 12 }}>
        Сбросить к умолчаниям
      </button>

      {(['purchase', 'rebalance', 'tax'] as const).map(
        (cat) =>
          byCategory[cat]?.length > 0 && (
            <div key={cat} className="income-category" style={{ marginTop: 16 }}>
              <h3 className="income-category-title">{catLabels[cat]}</h3>
              <div className="list">
                {byCategory[cat].map((i) => (
                  <div
                    key={i.id}
                    className={`list-item checklist-item ${i.done ? 'checklist-done' : ''}`}
                    onClick={() => toggle(i.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && toggle(i.id)}
                  >
                    <span className="checklist-check">{i.done ? '✓' : '○'}</span>
                    <span className="checklist-text">{i.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )
      )}
    </div>
  );
};
