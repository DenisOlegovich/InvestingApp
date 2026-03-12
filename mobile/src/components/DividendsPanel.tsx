import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { Portfolio } from '../types';
import type { ExchangeRates } from '../utils/currencyApi';
import { estimateDividendEventsNext12m } from '../utils/investor';
import { formatCurrencyRub } from '../utils/format';

function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date((y || 2025), (m || 1) - 1, 1);
  return d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

function monthShort(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date((y || 2025), (m || 1) - 1, 1);
  return d.toLocaleDateString('ru-RU', { month: 'short' });
}

export function DividendsPanel({
  portfolio,
  rates,
}: {
  portfolio: Portfolio;
  rates: ExchangeRates;
}) {
  const groups = useMemo(() => {
    const events = estimateDividendEventsNext12m(portfolio.securities, rates);
    const map = new Map<string, { total: number; items: { title: string; rub: number }[] }>();
    for (const e of events) {
      const entry = map.get(e.monthKey) || { total: 0, items: [] };
      entry.total += e.amountInRub;
      entry.items.push({ title: e.title, rub: e.amountInRub });
      map.set(e.monthKey, entry);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [portfolio.securities, rates]);

  const maxAmount = Math.max(...groups.map(([, g]) => g.total), 1);

  return (
    <ScrollView style={styles.scroll}>
      <Text style={styles.title}>Календарь дивидендов (прогноз)</Text>
      <Text style={styles.muted}>
        Оценка на основе доходности и периодичности, без точных дат выплаты.
      </Text>

      {groups.length === 0 ? (
        <Text style={styles.muted}>
          Нет данных по дивидендам. Укажи expectedDividend и dividendFrequency у бумаг.
        </Text>
      ) : (
        <>
          <View style={styles.chart}>
            {groups.map(([monthKey, g]) => {
              const heightPct = (g.total / maxAmount) * 100;
              return (
                <View key={monthKey} style={styles.chartCol}>
                  <View style={styles.chartBarWrap}>
                    <View style={[styles.chartFill, { height: `${heightPct}%` }]}>
                      <Text style={styles.chartValue}>{formatCurrencyRub(g.total)}</Text>
                    </View>
                  </View>
                  <Text style={styles.chartMonth}>{monthShort(monthKey)}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.listSection}>
            {groups.map(([monthKey, g]) => (
              <View key={monthKey} style={styles.listItem}>
                <View>
                  <Text style={styles.listTitle}>{monthLabel(monthKey)}</Text>
                  <Text style={styles.listSub}>
                    {g.items.slice(0, 4).map((it) => it.title).join(' • ')}
                    {g.items.length > 4 ? ` • +${g.items.length - 4}` : ''}
                  </Text>
                </View>
                <Text style={styles.listValue}>{formatCurrencyRub(g.total)}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  title: { fontSize: 18, fontWeight: '600', color: '#e0e0e0', marginBottom: 8 },
  muted: { fontSize: 14, color: '#888', marginBottom: 16 },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 180,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  chartCol: { flex: 1, alignItems: 'center', marginHorizontal: 4 },
  chartBarWrap: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartFill: {
    width: '80%',
    minHeight: 20,
    backgroundColor: '#4facfe',
    borderRadius: 6,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 4,
  },
  chartValue: { fontSize: 9, color: '#fff', fontWeight: '600' },
  chartMonth: { fontSize: 11, color: '#888', marginTop: 6 },
  listSection: {
    backgroundColor: 'rgba(26, 39, 68, 0.8)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  listTitle: { fontSize: 15, fontWeight: '600', color: '#e0e0e0' },
  listSub: { fontSize: 13, color: '#888', marginTop: 4 },
  listValue: { fontSize: 14, fontWeight: '600', color: '#4facfe' },
});
