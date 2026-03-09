import React, { useMemo, useState } from 'react';
import { Portfolio } from '../../types';
import { ExchangeRates } from '../../services/currencyApi';
import type { AllocationTargets, AssetClass } from '../../types/investor';
import {
  normalizeTargets,
  portfolioValueByAssetClassRub,
  totalFromMap,
} from '../../utils/investor';
import { formatCurrencyRub } from '../../utils/formatNumber';

const LABELS: Record<AssetClass, string> = {
  securities: 'Ценные бумаги',
  realEstate: 'Недвижимость',
  deposits: 'Депозиты',
  cryptocurrencies: 'Криптовалюты',
};

export const AllocationPanel: React.FC<{
  portfolio: Portfolio;
  rates: ExchangeRates;
  targets: AllocationTargets;
  onChangeTargets: (targets: AllocationTargets) => void;
}> = ({ portfolio, rates, targets, onChangeTargets }) => {
  const [draft, setDraft] = useState<AllocationTargets>(targets);

  const values = useMemo(() => portfolioValueByAssetClassRub(portfolio, rates), [portfolio, rates]);
  const total = totalFromMap(values);

  const currentPct = useMemo(() => {
    if (total <= 0) return { securities: 0, realEstate: 0, deposits: 0, cryptocurrencies: 0 };
    return {
      securities: (values.securities / total) * 100,
      realEstate: (values.realEstate / total) * 100,
      deposits: (values.deposits / total) * 100,
      cryptocurrencies: (values.cryptocurrencies / total) * 100,
    };
  }, [values, total]);

  const normalizedTargets = useMemo(() => normalizeTargets(targets), [targets]);

  const applyDraft = () => {
    onChangeTargets(normalizeTargets(draft));
  };

  return (
    <div className="panel">
      <h2>Аллокация и ребаланс</h2>
      <div className="muted">
        Текущие доли считаются по стоимости в рублях. Рекомендации — сколько “добавить/убавить”
        для возврата к целевым процентам.
      </div>

      <div style={{ height: 12 }} />

      <div className="two-col">
        <div className="panel" style={{ padding: 14 }}>
          <h2 style={{ marginBottom: 10 }}>Текущая структура</h2>
          {(['securities', 'realEstate', 'deposits', 'cryptocurrencies'] as AssetClass[]).map((k) => (
            <div key={k} className="bar" style={{ marginBottom: 10 }}>
              <div className="label">{LABELS[k]}</div>
              <div className="track">
                <div className="fill" style={{ width: `${Math.min(100, currentPct[k])}%` }} />
              </div>
              <div className="pct">{currentPct[k].toFixed(1)}%</div>
            </div>
          ))}
          <div className="muted">Итого: {formatCurrencyRub(total)}</div>
        </div>

        <div className="panel" style={{ padding: 14 }}>
          <h2 style={{ marginBottom: 10 }}>Цели (%)</h2>
          {(['securities', 'realEstate', 'deposits', 'cryptocurrencies'] as AssetClass[]).map((k) => (
            <div key={k} className="form-row" style={{ gridTemplateColumns: '1fr 140px', marginTop: 0 }}>
              <div className="muted" style={{ alignSelf: 'center' }}>
                {LABELS[k]}
              </div>
              <input
                className="input"
                type="number"
                min={0}
                max={100}
                value={draft.byAssetClass[k]}
                onChange={(e) =>
                  setDraft({
                    byAssetClass: { ...draft.byAssetClass, [k]: Number(e.target.value) },
                  })
                }
              />
            </div>
          ))}
          <div className="btn-row">
            <button className="btn" onClick={applyDraft}>
              Сохранить цели
            </button>
          </div>
          <div className="muted">
            Сохранено: {Object.values(normalizedTargets.byAssetClass).reduce((s, v) => s + v, 0).toFixed(0)}%
          </div>
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div className="panel" style={{ padding: 14 }}>
        <h2 style={{ marginBottom: 10 }}>Подсказки по ребалансу</h2>
        {total <= 0 ? (
          <div className="muted">Добавь активы — появятся подсказки.</div>
        ) : (
          <div className="list">
            {(['securities', 'realEstate', 'deposits', 'cryptocurrencies'] as AssetClass[]).map((k) => {
              const target = normalizedTargets.byAssetClass[k];
              const cur = currentPct[k];
              const diffPct = target - cur;
              const diffRub = (diffPct / 100) * total;
              const abs = Math.abs(diffRub);
              const action = diffRub > 0 ? 'добавить' : diffRub < 0 ? 'снизить' : 'держать';
              const headline =
                action === 'держать'
                  ? `${LABELS[k]} — ок`
                  : `${LABELS[k]} — ${action} ≈ ${formatCurrencyRub(abs)}`;
              return (
                <div key={k} className="list-item">
                  <div className="left">
                    <div className="title">{headline}</div>
                    <div className="sub">
                      Сейчас {cur.toFixed(1)}% → цель {target.toFixed(1)}% ({diffPct >= 0 ? '+' : ''}
                      {diffPct.toFixed(1)} п.п.)
                    </div>
                  </div>
                  <div className="right">{formatCurrencyRub(values[k])}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

