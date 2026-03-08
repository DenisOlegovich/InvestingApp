import React, { useState } from 'react';

const CARDS: { term: string; definition: string }[] = [
  { term: 'YTM (Yield to Maturity)', definition: 'Доходность к погашению облигации — годовая норма прибыли при удержании до погашения с учётом купонов и цены.' },
  { term: 'Див. отсечка (ex-date)', definition: 'Дата отсечки — на следующий день после неё купленные акции не дают право на дивиденды.' },
  { term: 'Бета (β)', definition: 'Чувствительность актива к движению рынка. β > 1 — волатильнее рынка, β < 1 — спокойнее.' },
  { term: 'FIFO', definition: 'First In, First Out — при продаже списываются сначала самые ранние покупки. Влияет на налог.' },
  { term: 'LIFO', definition: 'Last In, First Out — списываются последние покупки. Альтернатива FIFO для расчёта налога.' },
  { term: 'DCA', definition: 'Dollar Cost Averaging — регулярная покупка фиксированной суммы независимо от цены.' },
  { term: 'Ребалансировка', definition: 'Приведение портфеля к целевой структуре: докупать недооценённые классы, снижать перегретые.' },
];

export const EducationCards: React.FC = () => {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="panel">
      <h2>Обучающие карточки</h2>
      <div className="muted">Короткие определения терминов</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {CARDS.map((c) => (
          <div
            key={c.term}
            className="list-item"
            style={{ cursor: 'pointer', flex: '1 1 200px', maxWidth: 280 }}
            onClick={() => setOpen(open === c.term ? null : c.term)}
          >
            <div className="left">
              <div className="title">{c.term}</div>
              {open === c.term && <div className="sub" style={{ marginTop: 6 }}>{c.definition}</div>}
            </div>
            <div className="right">{open === c.term ? '−' : '+'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
