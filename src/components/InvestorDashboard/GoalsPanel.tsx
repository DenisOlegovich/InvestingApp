import React, { useMemo, useState } from 'react';
import type { Goal } from '../../types/investor';
import { formatCurrencyRub } from '../../utils/formatNumber';

function monthsBetween(now: Date, target: Date): number {
  const y = target.getFullYear() - now.getFullYear();
  const m = target.getMonth() - now.getMonth();
  return y * 12 + m + (target.getDate() >= now.getDate() ? 0 : -1);
}

export const GoalsPanel: React.FC<{
  goals: Goal[];
  onChange: (goals: Goal[]) => void;
}> = ({ goals, onChange }) => {
  const [name, setName] = useState('');
  const [targetAmountRub, setTargetAmountRub] = useState<number>(1_000_000);
  const [currentAmountRub, setCurrentAmountRub] = useState<number>(0);
  const [targetDate, setTargetDate] = useState<string>('');
  const [monthlyContributionRub, setMonthlyContributionRub] = useState<number>(0);

  const now = useMemo(() => new Date(), []);

  const addGoal = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const g: Goal = {
      id: crypto.randomUUID(),
      name: trimmed,
      targetAmountRub: Math.max(0, Number(targetAmountRub) || 0),
      currentAmountRub: Math.max(0, Number(currentAmountRub) || 0),
      targetDate: targetDate || undefined,
      monthlyContributionRub: Math.max(0, Number(monthlyContributionRub) || 0) || undefined,
      createdAt: new Date().toISOString(),
    };
    onChange([g, ...goals]);
    setName('');
  };

  const removeGoal = (id: string) => onChange(goals.filter(g => g.id !== id));

  return (
    <div className="panel">
      <h2>Цели</h2>
      <div className="muted">
        Хранишь цели локально в браузере. Дальше можно перенести это в базу.
      </div>

      <div className="form-row single">
        <input
          className="input"
          placeholder="Название цели (например: Подушка 6 месяцев)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-row">
        <input
          className="input"
          type="number"
          min={0}
          value={targetAmountRub}
          onChange={(e) => setTargetAmountRub(Number(e.target.value))}
          placeholder="Целевая сумма, ₽"
        />
        <input
          className="input"
          type="number"
          min={0}
          value={currentAmountRub}
          onChange={(e) => setCurrentAmountRub(Number(e.target.value))}
          placeholder="Текущая сумма, ₽"
        />
      </div>
      <div className="form-row">
        <input
          className="input"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
        />
        <input
          className="input"
          type="number"
          min={0}
          value={monthlyContributionRub}
          onChange={(e) => setMonthlyContributionRub(Number(e.target.value))}
          placeholder="Ежемесячный взнос, ₽"
        />
      </div>
      <div className="btn-row">
        <button className="btn" onClick={addGoal}>
          Добавить цель
        </button>
      </div>

      <div style={{ height: 14 }} />

      {goals.length === 0 ? (
        <div className="muted">Пока нет целей.</div>
      ) : (
        <div className="list">
          {goals.map((g) => {
            const pct =
              g.targetAmountRub > 0
                ? Math.min(100, (g.currentAmountRub / g.targetAmountRub) * 100)
                : 0;

            const monthsLeft =
              g.targetDate ? monthsBetween(now, new Date(g.targetDate)) : null;
            const requiredMonthly =
              monthsLeft && monthsLeft > 0
                ? Math.max(0, (g.targetAmountRub - g.currentAmountRub) / monthsLeft)
                : null;

            return (
              <div key={g.id} className="list-item">
                <div className="left" style={{ width: '100%' }}>
                  <div className="title">{g.name}</div>
                  <div className="sub">
                    {formatCurrencyRub(g.currentAmountRub)} из {formatCurrencyRub(g.targetAmountRub)}
                    {g.targetDate ? ` • дедлайн: ${g.targetDate}` : ''}
                  </div>
                  <div className="progress" aria-label="progress">
                    <div style={{ width: `${pct}%` }} />
                  </div>
                  <div className="sub">
                    {requiredMonthly !== null
                      ? `Нужно откладывать ≈ ${formatCurrencyRub(requiredMonthly)} / мес`
                      : g.monthlyContributionRub
                        ? `План: ${formatCurrencyRub(g.monthlyContributionRub)} / мес`
                        : 'Задай дедлайн или взнос — покажу прогноз'}
                  </div>
                </div>
                <div className="right">
                  <button className="btn danger" onClick={() => removeGoal(g.id)}>
                    Удалить
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

