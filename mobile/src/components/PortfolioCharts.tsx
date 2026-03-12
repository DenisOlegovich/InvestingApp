import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { Portfolio } from '../types';
import type { ExchangeRates } from '../utils/currencyApi';
import { convertToRUB } from '../utils/currencyApi';
import {
  calculateDepositCurrentValue,
  calculateDepositMonthlyIncome,
  calculateSecurityMonthlyDividend,
  calculateRealEstateRental,
  calculateCryptoMonthlyIncome,
} from '../utils/calculations';

interface Props {
  portfolio: Portfolio;
  rates: ExchangeRates;
}

function formatRub(value: number): string {
  return `${value.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽`;
}

export function PortfolioCharts({ portfolio, rates }: Props) {
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
});
