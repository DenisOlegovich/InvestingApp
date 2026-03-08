import React, { useEffect, useMemo } from 'react';
import { LineChart, LineChartPoint } from '../LineChart';
import {
  saveDailyPortfolioSnapshot,
  getMonthlyPortfolioHistory,
} from '../../utils/intradayStorage';
import { formatCurrencyRub } from '../../utils/formatNumber';

interface IntradayPortfolioChartProps {
  valueAtOpen: number;
  currentValue: number;
  userId?: string | number;
}

const DAYS_TO_SHOW = 30;

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export const IntradayPortfolioChart: React.FC<IntradayPortfolioChartProps> = ({
  valueAtOpen,
  currentValue,
  userId,
}) => {
  useEffect(() => {
    if (currentValue > 0) {
      saveDailyPortfolioSnapshot(currentValue, userId);
    }
  }, [currentValue, userId]);

  const chartData = useMemo((): LineChartPoint[] => {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const stored = getMonthlyPortfolioHistory(userId);
    const byDate = new Map<string, number>();
    for (const p of stored) {
      byDate.set(p.date, p.value);
    }
    byDate.set(todayKey, currentValue);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    if (!byDate.has(yesterdayKey)) {
      byDate.set(yesterdayKey, valueAtOpen > 0 ? valueAtOpen : currentValue);
    }

    const points: LineChartPoint[] = [];
    let carriedValue: number | null = null;

    for (let i = DAYS_TO_SHOW; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const storedVal = byDate.get(key);
      const val: number = storedVal ?? carriedValue ?? (i === 0 ? currentValue : 0);
      if (val > 0) {
        carriedValue = val;
        points.push({
          time: key,
          value: val,
          label: formatDateLabel(key),
        });
      }
    }

    return points;
  }, [valueAtOpen, currentValue, userId]);

  if (currentValue <= 0 && valueAtOpen <= 0) {
    return null;
  }

  return (
    <LineChart
      data={chartData}
      title="Изменение портфеля за месяц"
      valueFormatter={formatCurrencyRub}
      height={200}
      maxLabels={8}
    />
  );
};
