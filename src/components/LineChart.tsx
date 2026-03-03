import React from 'react';
import './LineChart.css';

export interface LineChartPoint {
  time: string;
  value: number;
  label?: string;
}

interface LineChartProps {
  data: LineChartPoint[];
  title: string;
  valueFormatter?: (value: number) => string;
  height?: number;
  positiveColor?: string;
  negativeColor?: string;
  maxLabels?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  valueFormatter = (v) =>
    v.toLocaleString('ru-RU', { maximumFractionDigits: 0, minimumFractionDigits: 0 }),
  height = 180,
  positiveColor = 'var(--app-accent-strong)',
  negativeColor = '#ef5350',
  maxLabels,
}) => {
  if (!data || data.length < 2) {
    return (
      <div className="line-chart-container">
        <h3 className="line-chart-title">{title}</h3>
        <div className="line-chart-empty">Нужно минимум 2 точки</div>
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;
  const padding = range * 0.05;
  const yMin = minVal - padding;
  const yMax = maxVal + padding;
  const yRange = yMax - yMin;

  const w = 400;
  const h = height - 40;
  const padLeft = 50;
  const padRight = 16;
  const plotW = w - padLeft - padRight;

  const toX = (i: number) => padLeft + (i / (data.length - 1)) * plotW;
  const toY = (v: number) => h - ((v - yMin) / yRange) * h;

  const pathD = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.value)}`)
    .join(' ');
  const areaD = `${pathD} L ${toX(data.length - 1)} ${h} L ${toX(0)} ${h} Z`;

  const firstVal = data[0].value;
  const lastVal = data[data.length - 1].value;
  const isPositive = lastVal >= firstVal;
  const lineColor = isPositive ? positiveColor : negativeColor;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const shouldShowLabel = (i: number) => {
    if (!maxLabels || data.length <= maxLabels) return true;
    const step = Math.max(1, Math.floor(data.length / maxLabels));
    return i === 0 || i === data.length - 1 || i % step === 0;
  };

  return (
    <div className="line-chart-container">
      <h3 className="line-chart-title">{title}</h3>
      <div className="line-chart-content">
        <svg viewBox={`0 0 ${w} ${height}`} className="line-chart-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="lineChartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#lineChartGrad)" />
          <path d={pathD} fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {data.map((d, i) => (
            <circle
              key={i}
              cx={toX(i)}
              cy={toY(d.value)}
              r={i === 0 || i === data.length - 1 ? 4 : 2}
              fill={lineColor}
            />
          ))}
          {data.map((d, i) =>
            shouldShowLabel(i) ? (
              <text
                key={`label-${i}`}
                x={toX(i)}
                y={height - 8}
                textAnchor="middle"
                className="line-chart-axis-label"
                fontSize="10"
              >
                {d.label || formatTime(d.time)}
              </text>
            ) : null
          )}
        </svg>
        <div className="line-chart-legend">
          <span>
            {data.length > 7 ? 'Начало периода' : 'Начало'}: {valueFormatter(firstVal)} → Сейчас: {valueFormatter(lastVal)}
          </span>
          <span className={isPositive ? 'positive' : 'negative'}>
            {lastVal >= firstVal ? '+' : ''}
            {(((lastVal - firstVal) / (firstVal || 1)) * 100).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
};
