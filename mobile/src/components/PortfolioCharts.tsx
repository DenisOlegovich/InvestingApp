import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { Portfolio } from '../types';
import type { AllocationTargets, AssetClass } from '../types/investor';
import type { ExchangeRates } from '../utils/currencyApi';
import { convertToRUB } from '../utils/currencyApi';
import {
  calculateDepositCurrentValue,
  calculateDepositMonthlyIncome,
  calculateSecurityMonthlyDividend,
  calculateRealEstateRental,
  calculateCryptoMonthlyIncome,
} from '../utils/calculations';
import { portfolioValueByAssetClassRub } from '../utils/investor';
import {
  getMonthlyPortfolioHistory,
  saveDailyPortfolioSnapshot,
} from '../utils/intradayStorage';

const SECURITY_TYPE_LABELS: Record<string, string> = {
  stock: 'Акции',
  bond: 'Облигации',
  etf: 'ETF',
};

const ASSET_LABELS: Record<AssetClass, string> = {
  securities: 'Ценные бумаги',
  realEstate: 'Недвижимость',
  deposits: 'Депозиты',
  cryptocurrencies: 'Крипто',
};

interface Props {
  portfolio: Portfolio;
  rates: ExchangeRates;
  targets?: AllocationTargets;
  currentValue?: number;
  valueAtOpen?: number;
  userId?: number;
}

function formatRub(value: number): string {
  return `${value.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽`;
}

export function PortfolioCharts({
  portfolio,
  rates,
  targets,
  currentValue = 0,
  valueAtOpen = 0,
  userId,
}: Props) {
  const securitiesValueRub = portfolio.securities.reduce(
    (sum, s) => sum + convertToRUB(s.currentPrice * s.quantity, s.currency, rates),
    0
  );
  const realEstateValueRub = portfolio.realEstate.reduce((sum, r) => sum + r.currentValue, 0);
  const depositsValueRub = portfolio.deposits.reduce(
    (sum, d) => sum + convertToRUB(calculateDepositCurrentValue(d), d.currency, rates),
    0
  );
  const cryptosValueRub = portfolio.cryptocurrencies.reduce(
    (sum, c) => sum + convertToRUB(c.currentPrice * c.amount, 'USD', rates),
    0
  );

  const securitiesIncomeRub = portfolio.securities.reduce(
    (sum, s) => sum + convertToRUB(calculateSecurityMonthlyDividend(s), s.currency, rates),
    0
  );
  const realEstateIncomeRub = portfolio.realEstate.reduce(
    (sum, r) => sum + calculateRealEstateRental(r) / 12,
    0
  );
  const depositsIncomeRub = portfolio.deposits.reduce(
    (sum, d) => sum + convertToRUB(calculateDepositMonthlyIncome(d), d.currency, rates),
    0
  );
  const cryptosIncomeRub = portfolio.cryptocurrencies.reduce(
    (sum, c) => sum + convertToRUB(calculateCryptoMonthlyIncome(c), 'USD', rates),
    0
  );

  const valueItems = [
    { label: 'Ценные бумаги', value: securitiesValueRub, color: '#667eea' },
    { label: 'Недвижимость', value: realEstateValueRub, color: '#4caf50' },
    { label: 'Депозиты', value: depositsValueRub, color: '#ff9800' },
    { label: 'Крипто', value: cryptosValueRub, color: '#ef5350' },
  ].filter((i) => i.value > 0);

  const incomeItems = [
    { label: 'Дивиденды', value: securitiesIncomeRub, color: '#667eea' },
    { label: 'Аренда', value: realEstateIncomeRub, color: '#4caf50' },
    { label: 'Проценты', value: depositsIncomeRub, color: '#ff9800' },
    { label: 'Стейкинг', value: cryptosIncomeRub, color: '#ef5350' },
  ].filter((i) => i.value > 0);

  const topHoldings = [
    ...portfolio.securities.map((s) => ({
      label: s.ticker || s.name,
      value: convertToRUB(s.currentPrice * s.quantity, s.currency, rates),
    })),
    ...portfolio.realEstate.map((r) => ({
      label: r.name.length > 14 ? r.name.slice(0, 12) + '…' : r.name,
      value: r.currentValue,
    })),
    ...portfolio.deposits.map((d) => ({
      label: d.name,
      value: convertToRUB(calculateDepositCurrentValue(d), d.currency, rates),
    })),
    ...portfolio.cryptocurrencies.map((c) => ({
      label: c.symbol,
      value: convertToRUB(c.currentPrice * c.amount, 'USD', rates),
    })),
  ]
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const totalValue = securitiesValueRub + realEstateValueRub + depositsValueRub + cryptosValueRub;
  const maxHolding = Math.max(...topHoldings.map((h) => h.value), 1);

  const securitiesByType = useMemo(() => {
    const byType = portfolio.securities.reduce<Record<string, number>>((acc, s) => {
      const val = convertToRUB(s.currentPrice * s.quantity, s.currency, rates);
      acc[s.type] = (acc[s.type] || 0) + val;
      return acc;
    }, {});
    return Object.entries(byType).map(([type, val]) => ({
      label: SECURITY_TYPE_LABELS[type] || type,
      value: val,
      color: type === 'stock' ? '#667eea' : type === 'bond' ? '#4caf50' : '#ff9800',
    }));
  }, [portfolio.securities, rates]);

  const allocationData = useMemo(() => {
    if (!targets) return null;
    const byClass = portfolioValueByAssetClassRub(portfolio, rates);
    const total =
      byClass.securities + byClass.realEstate + byClass.deposits + byClass.cryptocurrencies;
    return { currentByClass: byClass, targetByClass: targets.byAssetClass, totalValue: total };
  }, [portfolio, rates, targets]);

  const [historyData, setHistoryData] = useState<{ date: string; value: number }[]>([]);

  useEffect(() => {
    if (currentValue > 0) {
      saveDailyPortfolioSnapshot(currentValue, userId);
    }
  }, [currentValue, userId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await getMonthlyPortfolioHistory(userId);
      const today = new Date();
      const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const byDate = new Map<string, number>();
      for (const p of stored) byDate.set(p.date, p.value);
      byDate.set(todayKey, currentValue);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      if (!byDate.has(yesterdayKey) && valueAtOpen > 0) byDate.set(yesterdayKey, valueAtOpen);

      const points: { date: string; value: number }[] = [];
      let carried: number | null = null;
      for (let i = 14; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const val = byDate.get(key) ?? carried ?? (i === 0 ? currentValue : 0);
        if (val > 0) {
          carried = val;
          points.push({ date: key, value: val });
        }
      }
      if (!cancelled) setHistoryData(points);
    })();
    return () => { cancelled = true; };
  }, [currentValue, valueAtOpen, userId]);

  const maxHistoryVal = Math.max(...historyData.map((h) => h.value), 1);

  if (totalValue === 0) {
    return (
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Графики</Text>
        <Text style={styles.muted}>Добавьте активы для отображения графиков</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.note}>
        Курс: USD {rates.USD_RUB.toFixed(2)} ₽ · EUR {rates.EUR_RUB.toFixed(2)} ₽
      </Text>

      {valueItems.length > 0 && (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Распределение по стоимости</Text>
          {valueItems.map((item, i) => {
            const pct = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
            return (
              <View key={i} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendLabel}>{item.label}</Text>
                <Text style={styles.legendValue}>{formatRub(item.value)}</Text>
                <Text style={styles.legendPct}>({pct.toFixed(1)}%)</Text>
              </View>
            );
          })}
        </View>
      )}

      {topHoldings.length > 0 && (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Топ позиций по стоимости</Text>
          {topHoldings.map((item, i) => {
            const pct = (item.value / maxHolding) * 100;
            return (
              <View key={i} style={styles.barRow}>
                <Text style={styles.barLabel} numberOfLines={1}>
                  {item.label}
                </Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.max(pct, 2)}%`,
                        backgroundColor: ['#667eea', '#4caf50', '#ff9800', '#ef5350', '#9c27b0'][i % 5],
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barValue}>{formatRub(item.value)}</Text>
              </View>
            );
          })}
        </View>
      )}

      {(securitiesIncomeRub > 0 || realEstateIncomeRub > 0 || depositsIncomeRub > 0 || cryptosIncomeRub > 0) &&
        incomeItems.length > 0 && (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Распределение месячного дохода</Text>
            {incomeItems.map((item, i) => {
              const totalIncome =
                securitiesIncomeRub + realEstateIncomeRub + depositsIncomeRub + cryptosIncomeRub;
              const pct = totalIncome > 0 ? (item.value / totalIncome) * 100 : 0;
              return (
                <View key={i} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendLabel}>{item.label}</Text>
                  <Text style={styles.legendValue}>{formatRub(item.value)}</Text>
                  <Text style={styles.legendPct}>({pct.toFixed(1)}%)</Text>
                </View>
              );
            })}
          </View>
        )}

      {portfolio.securities.length > 0 && securitiesByType.length > 0 && (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Ценные бумаги по типу</Text>
          {securitiesByType.map((item, i) => {
            const pct = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
            return (
              <View key={i} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendLabel}>{item.label}</Text>
                <Text style={styles.legendValue}>{formatRub(item.value)}</Text>
                <Text style={styles.legendPct}>({pct.toFixed(1)}%)</Text>
              </View>
            );
          })}
        </View>
      )}

      {allocationData && allocationData.totalValue > 0 && (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Текущая vs целевая аллокация</Text>
          {(['securities', 'realEstate', 'deposits', 'cryptocurrencies'] as AssetClass[]).map((k) => {
            const curPct =
              (allocationData.currentByClass[k] / allocationData.totalValue) * 100;
            const tgtPct = allocationData.targetByClass[k] || 0;
            return (
              <View key={k} style={styles.allocationRow}>
                <Text style={styles.allocationLabel}>{ASSET_LABELS[k]}</Text>
                <View style={styles.allocationBarTrack}>
                  <View
                    style={[styles.allocationBar, styles.allocationBarCurrent, { flex: curPct }]}
                  />
                  <View
                    style={[styles.allocationBar, styles.allocationBarTarget, { flex: tgtPct }]}
                  />
                </View>
                <Text style={styles.allocationValues}>
                  <Text style={styles.allocationCur}>{curPct.toFixed(0)}%</Text>
                  {' / '}
                  <Text style={styles.allocationTgt}>{tgtPct.toFixed(0)}%</Text>
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {historyData.length >= 2 && (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Изменение портфеля за 2 недели</Text>
          <View style={styles.historyChart}>
            {historyData.slice(-10).map((h, i) => {
              const hDate = new Date(h.date + 'T12:00:00');
              const shortLabel = hDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
              const pct = (h.value / maxHistoryVal) * 100;
              return (
                <View key={h.date} style={styles.historyRow}>
                  <Text style={styles.historyLabel}>{shortLabel}</Text>
                  <View style={styles.historyBarTrack}>
                    <View style={[styles.historyBarFill, { width: `${Math.max(pct, 3)}%` }]} />
                  </View>
                  <Text style={styles.historyValue}>{formatRub(h.value)}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  note: { fontSize: 12, color: '#9e9e9e', marginBottom: 16 },
  block: {
    marginBottom: 24,
    backgroundColor: 'rgba(26, 31, 58, 0.8)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e0e0',
    marginBottom: 16,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendLabel: { flex: 1, fontSize: 14, color: '#e0e0e0' },
  legendValue: { fontSize: 14, fontWeight: '600', color: '#4facfe', marginRight: 6 },
  legendPct: { fontSize: 12, color: '#888' },
  barRow: {
    marginBottom: 12,
  },
  barLabel: {
    fontSize: 13,
    color: '#e0e0e0',
    marginBottom: 4,
    maxWidth: 120,
  },
  barTrack: {
    height: 24,
    backgroundColor: 'rgba(79, 172, 254, 0.15)',
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  barValue: {
    fontSize: 12,
    color: '#4facfe',
    marginTop: 4,
    fontWeight: '600',
  },
  panel: {
    backgroundColor: 'rgba(26, 31, 58, 0.8)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
  panelTitle: { fontSize: 18, fontWeight: '600', color: '#e0e0e0', marginBottom: 16 },
  muted: { fontSize: 14, color: '#888' },
  allocationRow: { marginBottom: 12 },
  allocationLabel: { fontSize: 13, color: '#e0e0e0', marginBottom: 4 },
  allocationBarTrack: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginBottom: 4,
  },
  allocationBar: { minWidth: 2 },
  allocationBarCurrent: { backgroundColor: '#4facfe' },
  allocationBarTarget: { backgroundColor: 'rgba(76, 175, 80, 0.5)', borderRightWidth: 2, borderRightColor: '#4caf50' },
  allocationValues: { fontSize: 12, color: '#888' },
  allocationCur: { color: '#4facfe', fontWeight: '600' },
  allocationTgt: { color: '#4caf50', fontWeight: '500' },
  historyChart: { gap: 8 },
  historyRow: { marginBottom: 8 },
  historyLabel: { fontSize: 12, color: '#9e9e9e', marginBottom: 4 },
  historyBarTrack: {
    height: 20,
    backgroundColor: 'rgba(79, 172, 254, 0.15)',
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  historyBarFill: {
    height: '100%',
    backgroundColor: '#4facfe',
    borderRadius: 4,
  },
  historyValue: { fontSize: 12, color: '#4facfe', marginTop: 4, fontWeight: '600' },
});
