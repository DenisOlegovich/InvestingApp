import React from 'react';

export const GamificationPanel: React.FC<{
  streakDays?: number;
  lastContributionDate?: string;
  portfolioHealth?: 'good' | 'ok' | 'attention';
}> = ({ streakDays = 0, portfolioHealth = 'ok' }) => {
  const healthLabels = { good: 'Здоровье портфеля: отлично', ok: 'Здоровье портфеля: норма', attention: 'Здоровье портфеля: внимание' };

  return (
    <div className="panel">
      <h2>Геймификация</h2>
      <div className="muted">Streak регулярных взносов, здоровье портфеля — без токсичности.</div>

      <div className="list" style={{ marginTop: 16 }}>
        <div className="list-item">
          <div className="left">
            <div className="title">Серия взносов</div>
            <div className="sub">
              {streakDays > 0
                ? `${streakDays} ${streakDays === 1 ? 'день' : streakDays < 5 ? 'дня' : 'дней'} подряд`
                : 'Начни регулярные пополнения'}
            </div>
          </div>
          <div className="right pill positive">{streakDays}</div>
        </div>
        <div className="list-item">
          <div className="left">
            <div className="title">{healthLabels[portfolioHealth]}</div>
            <div className="sub">Баланс риска и доходности</div>
          </div>
        </div>
      </div>

      <div className="muted" style={{ marginTop: 12 }}>
        Добавь взнос в разделе «Цели» или «Планировщик» — streak обновится.
      </div>
    </div>
  );
};
