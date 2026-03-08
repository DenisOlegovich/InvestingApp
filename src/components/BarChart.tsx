import React from 'react';
import './BarChart.css';

export interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  title: string;
  valueFormatter?: (value: number) => string;
  maxBars?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  valueFormatter = (v) => v.toLocaleString('ru-RU', { maximumFractionDigits: 0 }),
  maxBars = 10,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const sorted = [...data].sort((a, b) => b.value - a.value).slice(0, maxBars);

  if (total === 0 || sorted.length === 0) {
    return (
      <div className="bar-chart-container">
        <h3 className="bar-chart-title">{title}</h3>
        <div className="bar-chart-empty">Нет данных</div>
      </div>
    );
  }

  const colors = ['#667eea', '#4caf50', '#ff9800', '#ef5350', '#9c27b0', '#00bcd4', '#ffeb3b', '#795548'];

  return (
    <div className="bar-chart-container">
      <h3 className="bar-chart-title">{title}</h3>
      <div className="bar-chart-content">
        {sorted.map((item, index) => {
          const pct = (item.value / maxVal) * 100;
          const color = item.color || colors[index % colors.length];
          return (
            <div key={item.label} className="bar-chart-row">
              <div className="bar-chart-label" title={item.label}>
                {item.label.length > 16 ? item.label.slice(0, 14) + '…' : item.label}
              </div>
              <div className="bar-chart-track">
                <div
                  className="bar-chart-fill"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
              <div className="bar-chart-value">{valueFormatter(item.value)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
