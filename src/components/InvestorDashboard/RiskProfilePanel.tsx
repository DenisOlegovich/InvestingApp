import React, { useState } from 'react';
import { Portfolio } from '../../types';
import { ExchangeRates } from '../../services/currencyApi';
import { portfolioValueByAssetClassRub, totalFromMap } from '../../utils/investor';
import { extendedAPI } from '../../services/api';

const QUESTIONS = [
  { id: 'q1', text: 'Ваш инвестиционный горизонт?', opts: ['< 1 года (1)', '1–3 года (2)', '3–5 лет (3)', '5–10 лет (4)', '> 10 лет (5)'] },
  { id: 'q2', text: 'Реакция на просадку −20%?', opts: ['Паникую, продаю (1)', 'Тревожно (2)', 'Нормально (3)', 'Докупаю (4)', 'Докупаю больше (5)'] },
  { id: 'q3', text: 'Опыт на рынке?', opts: ['Нет (1)', 'До года (2)', '1–3 года (3)', '3–5 лет (4)', '> 5 лет (5)'] },
  { id: 'q4', text: 'Доля рисковых активов?', opts: ['0% (1)', 'До 25% (2)', '25–50% (3)', '50–75% (4)', '> 75% (5)'] },
];

function scoreToAllocation(score: number) {
  const s = Math.max(1, Math.min(5, score));
  if (s <= 1) return { securities: 10, realEstate: 10, deposits: 70, cryptocurrencies: 10 };
  if (s <= 2) return { securities: 30, realEstate: 15, deposits: 45, cryptocurrencies: 10 };
  if (s <= 3) return { securities: 50, realEstate: 20, deposits: 20, cryptocurrencies: 10 };
  if (s <= 4) return { securities: 60, realEstate: 15, deposits: 15, cryptocurrencies: 10 };
  return { securities: 70, realEstate: 10, deposits: 10, cryptocurrencies: 10 };
}

export const RiskProfilePanel: React.FC<{
  portfolio: Portfolio;
  rates: ExchangeRates;
}> = ({ portfolio, rates }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);

  const score = Object.values(answers).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(answers).length);
  const recommended = scoreToAllocation(score);
  const values = portfolioValueByAssetClassRub(portfolio, rates);
  const total = totalFromMap(values);
  const currentPct = total > 0 ? {
    securities: (values.securities / total) * 100,
    realEstate: (values.realEstate / total) * 100,
    deposits: (values.deposits / total) * 100,
    cryptocurrencies: (values.cryptocurrencies / total) * 100,
  } : { securities: 0, realEstate: 0, deposits: 0, cryptocurrencies: 0 };

  const save = async () => {
    await extendedAPI.riskProfile.upsert({
      riskScore: score,
      recommendedSecurities: recommended.securities,
      recommendedRealEstate: recommended.realEstate,
      recommendedDeposits: recommended.deposits,
      recommendedCrypto: recommended.cryptocurrencies,
      answersJson: answers,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="panel">
      <h2>Риск-профиль</h2>
      <div className="muted">Анкета + рекомендуемая структура vs текущая</div>

      <div style={{ marginTop: 16 }}>
        {QUESTIONS.map((q) => (
          <div key={q.id} className="form-row" style={{ marginBottom: 12 }}>
            <div className="k" style={{ gridColumn: '1 / -1' }}>{q.text}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, gridColumn: '1 / -1' }}>
              {q.opts.map((o, i) => {
                const val = i + 1;
                const isSel = answers[q.id] === val;
                return (
                  <button
                    key={o}
                    className={`btn ${isSel ? 'active' : ''}`}
                    style={{ padding: '6px 12px', fontSize: 13 }}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: val }))}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="two-col" style={{ marginTop: 20 }}>
        <div>
          <h3 style={{ marginBottom: 8 }}>Рекомендуемая структура</h3>
          <div className="list">
            {(['securities', 'realEstate', 'deposits', 'cryptocurrencies'] as const).map((k) => (
              <div key={k} className="list-item">
                <div className="left">
                  <div className="title">
                    {k === 'securities' && 'Ценные бумаги'}
                    {k === 'realEstate' && 'Недвижимость'}
                    {k === 'deposits' && 'Депозиты'}
                    {k === 'cryptocurrencies' && 'Крипто'}
                  </div>
                </div>
                <div className="right">{recommended[k]}%</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 style={{ marginBottom: 8 }}>Текущая vs рекомендация</h3>
          <div className="list">
            {(['securities', 'realEstate', 'deposits', 'cryptocurrencies'] as const).map((k) => {
              const cur = currentPct[k];
              const rec = recommended[k];
              const diff = cur - rec;
              return (
                <div key={k} className="list-item">
                  <div className="left">
                    <div className="title">
                      {k === 'securities' && 'Ценные бумаги'}
                      {k === 'realEstate' && 'Недвижимость'}
                      {k === 'deposits' && 'Депозиты'}
                      {k === 'cryptocurrencies' && 'Крипто'}
                    </div>
                    <div className="sub">Сейчас {cur.toFixed(1)}% / цель {rec}%</div>
                  </div>
                  <div className={`right pill ${diff > 5 ? 'negative' : diff < -5 ? 'positive' : ''}`}>
                    {diff > 0 ? '+' : ''}{diff.toFixed(1)} п.п.
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="btn-row" style={{ marginTop: 16 }}>
        <button className="btn" onClick={save} disabled={Object.keys(answers).length === 0}>
          {saved ? 'Сохранено' : 'Сохранить профиль'}
        </button>
      </div>
    </div>
  );
};
