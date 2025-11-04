import React from 'react';
import './PieChart.css';

export interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  title: string;
  valueFormatter?: (value: number) => string;
}

export const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  title, 
  valueFormatter = (v) => v.toLocaleString('ru-RU', { maximumFractionDigits: 2 }) 
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return (
      <div className="pie-chart-container">
        <h3 className="pie-chart-title">{title}</h3>
        <div className="pie-chart-empty">Нет данных</div>
      </div>
    );
  }

  // Рассчитываем сегменты круга
  let currentAngle = 0;
  const segments = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    return {
      ...item,
      percentage,
      startAngle,
      endAngle,
    };
  });

  // Функция для создания пути SVG сегмента
  const createArc = (startAngle: number, endAngle: number): string => {
    const centerX = 100;
    const centerY = 100;
    const radius = 80;

    // Корректируем углы: вычитаем 90 чтобы начинать сверху
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const isFullCircle = segments.length === 1 && segments[0].percentage >= 99.9;

  // Логирование для отладки
  console.log('PieChart:', title, {
    segmentsCount: segments.length,
    segments: segments.map(s => ({
      label: s.label,
      value: s.value,
      percentage: s.percentage,
      startAngle: s.startAngle,
      endAngle: s.endAngle
    })),
    isFullCircle,
    total
  });

  return (
    <div className="pie-chart-container">
      <h3 className="pie-chart-title">{title}</h3>
      <div className="pie-chart-content">
        <svg viewBox="0 0 200 200" className="pie-chart-svg">
          {isFullCircle ? (
            // Для полного круга используем элемент circle
            <circle
              cx="100"
              cy="100"
              r="80"
              fill={segments[0].color}
              className="pie-segment"
            />
          ) : (
            // Для нескольких сегментов используем path
            segments.map((segment, index) => {
              const arcPath = createArc(segment.startAngle, segment.endAngle);
              return (
                <g key={index}>
                  <path
                    d={arcPath}
                    fill={segment.color}
                    className="pie-segment"
                  />
                </g>
              );
            })
          )}
        </svg>
        <div className="pie-chart-legend">
          {segments.map((segment, index) => (
            <div key={index} className="legend-item">
              <div className="legend-color" style={{ backgroundColor: segment.color }}></div>
              <div className="legend-info">
                <div className="legend-label">{segment.label}</div>
                <div className="legend-value">
                  {valueFormatter(segment.value)} ({segment.percentage.toFixed(1)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

