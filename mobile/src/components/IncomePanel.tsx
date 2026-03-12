import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { Portfolio } from '../types';
import type { ExchangeRates } from '../utils/currencyApi';
import { convertToRUB } from '../utils/currencyApi';
import {
  calculateSecurityMonthlyDividend,
  calculateRealEstateRental,
  calculateDepositMonthlyIncome,
  calculateCryptoMonthlyIncome,
} from '../utils/calculations';
import { estimateMonthlyIncomeNext12m } from '../utils/investor';
import { formatCurrencyRub } from '../utils/format';

function monthShort(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date((y || 2025), (m || 1) - 1, 1);
  return d.toLocaleDateString('ru-RU', { month: 'short' });
}

interface IncomeItem {
  label: string;
  amount: number;
}

export function IncomePanel({ portfolio, rates }: { portfolio: Portfolio; rates: ExchangeRates }) {
  const { total, byCategory, items } = useMemo(() => {
    const securitiesItems: IncomeItem[] = portfolio.securities.map((s) => ({
      label: s.ticker || s.name,
      amount: convertToRUB(calculateSecurityMonthlyDividend(s), s.currency, rates),
    }));
    const securitiesTotal = securitiesItems.reduce((s, i) => s + i.amount, 0);

    const realEstateItems: IncomeItem[] = portfolio.realEstate.map((r) => ({
      label: r.name,
      amount: calculateRealEstateRental(r) / 12,
    }));
    const realEstateTotal = realEstateItems.reduce((s, i) => s + i.amount, 0);

    const depositsItems: IncomeItem[] = portfolio.deposits.map((d) => ({
      label: `${d.name} (${d.bank})`,
      amount: convertToRUB(calculateDepositMonthlyIncome(d), d.currency, rates),
    }));
    const depositsTotal = depositsItems.reduce((s, i) => s + i.amount, 0);

    const cryptosItems: IncomeItem[] = portfolio.cryptocurrencies.map((c) => ({
      label: c.symbol || c.name,
      amount: convertToRUB(calculateCryptoMonthlyIncome(c), 'USD', rates),
    }));
    const cryptosTotal = cryptosItems.reduce((s, i) => s + i.amount, 0);

    const total = securitiesTotal + realEstateTotal + depositsTotal + cryptosTotal;
    const byCategory = {
      dividends: securitiesTotal,
      rental: realEstateTotal,
      interest: depositsTotal,
      staking: cryptosTotal,
    };
    const items = {
      dividends: securitiesItems,
      rental: realEstateItems,
      interest: depositsItems,
      staking: cryptosItems,
    };
    return { total, byCategory, items };
  }, [portfolio, rates]);

  const monthlyData = useMemo(
    () => estimateMonthlyIncomeNext12m(portfolio, rates),
    [portfolio, rates]
  );
  const maxMonthly = Math.max(...monthlyData.map((m) => m.total), 1);

  const hasIncome = total > 0;

  return (
    <ScrollView style={styles.scroll}>
      <Text style={styles.title}>Месячный доход</Text>
      <Text style={styles.muted}>Прогноз ожидаемого месячного дохода по всем активам (в рублях).</Text>

      {!hasIncome ? (
        <Text style={styles.muted}>
          Нет данных. Добавь активы с дивидендами, арендой, процентами или стейкингом.
        </Text>
      ) : (
        <>
          <View style={styles.totalWrap}>
            <Text style={styles.total}>{formatCurrencyRub(total)}</Text>
            <Text style={styles.totalLabel}>/ месяц</Text>
          </View>

          <View style={styles.chartSection}>
            <Text style={styles.subtitle}>Доход по месяцам (прогноз)</Text>
            <View style={styles.chart}>
              {monthlyData.map((m) => {
                const heightPct = (m.total / maxMonthly) * 100;
                return (
                  <View key={m.monthKey} style={styles.chartCol}>
                    <View style={styles.chartBarWrap}>
                      <View style={[styles.chartFill, { height: `${heightPct}%` }]}>
                        <Text style={styles.chartValue}>{formatCurrencyRub(m.total)}</Text>
                      </View>
                    </View>
                    <Text style={styles.chartMonth}>{monthShort(m.monthKey)}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {byCategory.dividends > 0 && (
            <View style={styles.categorySection}>
              <Text style={styles.categoryTitle}>Дивиденды</Text>
              {items.dividends
                .filter((i) => i.amount > 0)
                .map((i) => (
                  <View key={i.label} style={styles.listItem}>
                    <Text style={styles.listLabel}>{i.label}</Text>
                    <Text style={styles.listValue}>{formatCurrencyRub(i.amount)}</Text>
                  </View>
                ))}
              <Text style={styles.categorySum}>{formatCurrencyRub(byCategory.dividends)}</Text>
            </View>
          )}

          {byCategory.rental > 0 && (
            <View style={styles.categorySection}>
              <Text style={styles.categoryTitle}>Аренда</Text>
              {items.rental
                .filter((i) => i.amount > 0)
                .map((i) => (
                  <View key={i.label} style={styles.listItem}>
                    <Text style={styles.listLabel}>{i.label}</Text>
                    <Text style={styles.listValue}>{formatCurrencyRub(i.amount)}</Text>
                  </View>
                ))}
              <Text style={styles.categorySum}>{formatCurrencyRub(byCategory.rental)}</Text>
            </View>
          )}

          {byCategory.interest > 0 && (
            <View style={styles.categorySection}>
              <Text style={styles.categoryTitle}>Проценты</Text>
              {items.interest
                .filter((i) => i.amount > 0)
                .map((i) => (
                  <View key={i.label} style={styles.listItem}>
                    <Text style={styles.listLabel}>{i.label}</Text>
                    <Text style={styles.listValue}>{formatCurrencyRub(i.amount)}</Text>
                  </View>
                ))}
              <Text style={styles.categorySum}>{formatCurrencyRub(byCategory.interest)}</Text>
            </View>
          )}

          {byCategory.staking > 0 && (
            <View style={styles.categorySection}>
              <Text style={styles.categoryTitle}>Стейкинг</Text>
              {items.staking
                .filter((i) => i.amount > 0)
                .map((i) => (
                  <View key={i.label} style={styles.listItem}>
                    <Text style={styles.listLabel}>{i.label}</Text>
                    <Text style={styles.listValue}>{formatCurrencyRub(i.amount)}</Text>
                  </View>
                ))}
              <Text style={styles.categorySum}>{formatCurrencyRub(byCategory.staking)}</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  title: { fontSize: 18, fontWeight: '600', color: '#e0e0e0', marginBottom: 8 },
  muted: { fontSize: 14, color: '#888', marginBottom: 16 },
  totalWrap: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 },
  total: { fontSize: 28, fontWeight: '700', color: '#4caf50' },
  totalLabel: { fontSize: 16, color: '#888', marginLeft: 8 },
  chartSection: {
    backgroundColor: 'rgba(26, 39, 68, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  subtitle: { fontSize: 16, fontWeight: '600', color: '#e0e0e0', marginBottom: 12 },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
  },
  chartCol: { flex: 1, alignItems: 'center' },
  chartBarWrap: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartFill: {
    width: '80%',
    minHeight: 16,
    backgroundColor: '#4caf50',
    borderRadius: 6,
    justifyContent: 'flex-end',
  },
  chartValue: { fontSize: 8, color: '#fff', textAlign: 'center' },
  chartMonth: { fontSize: 10, color: '#888', marginTop: 4 },
  categorySection: {
    backgroundColor: 'rgba(26, 39, 68, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  categoryTitle: { fontSize: 15, fontWeight: '600', color: '#e0e0e0', marginBottom: 10 },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  listLabel: { fontSize: 14, color: '#9e9e9e' },
  listValue: { fontSize: 14, fontWeight: '600', color: '#4caf50' },
  categorySum: { fontSize: 15, fontWeight: '700', color: '#4caf50', marginTop: 8, textAlign: 'right' },
});
