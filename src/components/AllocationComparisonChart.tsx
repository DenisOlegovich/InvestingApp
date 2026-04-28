import React from 'react';
import type { AssetClass } from '../types/investor';
import { formatCurrencyRub } from '../utils/formatNumber';
import './AllocationComparisonChart.css';

const LABELS: Record<AssetClass, string> = {
  securities: 'Ценные бумаги',
  realEstate: 'Недвижимость',
  deposits: 'Депозиты',
  cryptocurrencies: 'Криптовалюты',
};

const ASSET_KEYS: AssetClass[] = ['securities', 'realEstate', 'deposits', 'cryptocurrencies'];

interface Props {
  currentByClass: Record<AssetClass, number>;
  targetByClass: Record<AssetClass, number>;
  totalValue: number;
}

export const AllocationComparisonChart: React.FC<Props> = ({
  currentByClass,
  targetByClass,
  totalValue,
}) => {
  if (totalValue <= 0) return null;

  return (
    <div className="allocation-comparison-chart">
      <h3 className="allocation-comparison-title">Текущая vs целевая аллокация</h3>
      <div className="allocation-comparison-legend">
        <span className="allocation-legend-item">
          <span className="allocation-legend-dot current" /> Текущая
        </span>
        <span className="allocation-legend-item">
          <span className="allocation-legend-dot target" /> Целевая
        </span>
      </div>
      <div className="allocation-comparison-content">
        {ASSET_KEYS.map((k) => {
          const curPct = totalValue > 0 ? (currentByClass[k] / totalValue) * 100 : 0;
          const tgtPct = targetByClass[k] || 0;
          const curVal = currentByClass[k] || 0;
          return (
            <div key={k} className="allocation-row">
              <div className="allocation-label">{LABELS[k]}</div>
              <div className="allocation-bars-track">
                <div
                  className="allocation-bar allocation-bar-current"
                  style={{ width: `${Math.min(curPct, 100)}%` }}
                  title={`Текущая: ${curPct.toFixed(1)}% (${formatCurrencyRub(curVal)})`}
                />
                <div
                  className="allocation-bar allocation-bar-target"
                  style={{ width: `${Math.min(tgtPct, 100)}%` }}
                  title={`Цель: ${tgtPct.toFixed(1)}%`}
                />
              </div>
              <div className="allocation-values">
                <span className="allocation-current">{curPct.toFixed(0)}%</span>
                <span className="allocation-target">{tgtPct.toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
