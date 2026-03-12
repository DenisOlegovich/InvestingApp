import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import type { Portfolio } from '../types';
import type { ExchangeRates } from '../utils/currencyApi';
import { portfolioValueByAssetClassRub, totalFromMap } from '../utils/investor';
import { formatCurrencyRub } from '../utils/format';

export function ScenariosPanel({
  portfolio,
  rates,
}: {
  portfolio: Portfolio;
  rates: ExchangeRates;
}) {
  const [usdChange, setUsdChange] = useState('10');
  const [marketDrop, setMarketDrop] = useState('20');

  const usdVal = Number(usdChange) || 0;
  const marketVal = Number(marketDrop) || 0;

  const byClass = useMemo(() => portfolioValueByAssetClassRub(portfolio, rates), [portfolio, rates]);
  const totalBase = totalFromMap(byClass);

  const usdExposed =
    portfolio.securities
      .filter((s) => s.currency === 'USD')
      .reduce((s, x) => s + x.currentPrice * x.quantity, 0) *
      rates.USD_RUB +
    portfolio.deposits
      .filter((d) => d.currency === 'USD')
      .reduce((s, d) => s + d.amount, 0) *
      rates.USD_RUB +
    portfolio.cryptocurrencies.reduce(
      (s, c) => s + c.currentPrice * c.amount * rates.USD_RUB,
      0
    );

  const securitiesValue =
    portfolio.securities.reduce((s, x) => {
      const v = x.currentPrice * x.quantity;
      return (
        s +
        (x.currency === 'RUB'
          ? v
          : x.currency === 'USD'
            ? v * rates.USD_RUB
            : v * rates.EUR_RUB)
      );
    }, 0) +
    portfolio.cryptocurrencies.reduce(
      (s, c) => s + c.currentPrice * c.amount * rates.USD_RUB,
      0
    );

  const scenarioUsd = useMemo(() => {
    const factor = 1 + usdVal / 100;
    const newUsdExposed = usdExposed * factor;
    const other = totalBase - usdExposed;
    return other + newUsdExposed;
  }, [usdExposed, totalBase, usdVal]);

  const scenarioMarket = useMemo(() => {
    const dropFactor = 1 - marketVal / 100;
    const newSecurities = securitiesValue * dropFactor;
    const other = totalBase - securitiesValue;
    return other + newSecurities;
  }, [securitiesValue, totalBase, marketVal]);

  return (
    <ScrollView style={styles.scroll}>
      <Text style={styles.title}>Сценарии «что если»</Text>
      <Text style={styles.muted}>
        Оценка влияния изменения курса USD или падения рынка на портфель.
      </Text>

      <View style={styles.section}>
        <Text style={styles.subtitle}>USD {usdVal >= 0 ? '+' : ''}{usdVal}%</Text>
        <Text style={styles.label}>Изменение USD, % (-30…50)</Text>
        <TextInput
          style={styles.input}
          value={usdChange}
          onChangeText={setUsdChange}
          keyboardType="numeric"
        />
        <View style={styles.kv}>
          <View style={styles.kvRow}>
            <Text style={styles.k}>Сейчас</Text>
            <Text style={styles.v}>{formatCurrencyRub(totalBase)}</Text>
          </View>
          <View style={styles.kvRow}>
            <Text style={styles.k}>При росте USD на {usdVal}%</Text>
            <Text style={styles.v}>{formatCurrencyRub(scenarioUsd)}</Text>
          </View>
          <View style={styles.kvRow}>
            <Text style={styles.k}>Разница</Text>
            <Text
              style={[
                styles.v,
                scenarioUsd >= totalBase ? styles.positive : styles.negative,
              ]}
            >
              {scenarioUsd >= totalBase ? '+' : ''}
              {formatCurrencyRub(scenarioUsd - totalBase)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Рынок −{marketVal}% (акции + крипто)</Text>
        <Text style={styles.label}>Падение рынка, % (0…50)</Text>
        <TextInput
          style={styles.input}
          value={marketDrop}
          onChangeText={setMarketDrop}
          keyboardType="numeric"
        />
        <View style={styles.kv}>
          <View style={styles.kvRow}>
            <Text style={styles.k}>Сейчас</Text>
            <Text style={styles.v}>{formatCurrencyRub(totalBase)}</Text>
          </View>
          <View style={styles.kvRow}>
            <Text style={styles.k}>При падении на {marketVal}%</Text>
            <Text style={styles.v}>{formatCurrencyRub(scenarioMarket)}</Text>
          </View>
          <View style={styles.kvRow}>
            <Text style={styles.k}>Разница</Text>
            <Text style={[styles.v, styles.negative]}>
              {formatCurrencyRub(scenarioMarket - totalBase)}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  title: { fontSize: 18, fontWeight: '600', color: '#e0e0e0', marginBottom: 8 },
  muted: { fontSize: 14, color: '#888', marginBottom: 16 },
  section: {
    backgroundColor: 'rgba(26, 39, 68, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
  subtitle: { fontSize: 16, fontWeight: '600', color: '#e0e0e0', marginBottom: 12 },
  kv: { gap: 10 },
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  k: { fontSize: 14, color: '#9e9e9e' },
  v: { fontSize: 15, fontWeight: '600', color: '#4facfe' },
  positive: { color: '#4caf50' },
  negative: { color: '#ff5252' },
  label: { fontSize: 14, color: '#9e9e9e', marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: '#e0e0e0',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
});
