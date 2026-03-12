import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { formatCurrencyRub } from '../utils/format';

export function DCAPanel({ currentPortfolioValue }: { currentPortfolioValue: number }) {
  const [monthlyAmount, setMonthlyAmount] = useState('50000');
  const [months, setMonths] = useState('12');
  const [expectedYield, setExpectedYield] = useState('10');

  const m = Number(monthlyAmount) || 0;
  const n = Number(months) || 0;
  const r = Number(expectedYield) || 0;

  const totalContributions = m * n;
  const monthlyRate = r / 100 / 12;
  const futureValue =
    monthlyRate > 0
      ? currentPortfolioValue * Math.pow(1 + monthlyRate, n) +
        m * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate)
      : currentPortfolioValue + m * n;

  const gain = futureValue - currentPortfolioValue - totalContributions;

  return (
    <ScrollView style={styles.scroll}>
      <Text style={styles.title}>Планировщик DCA</Text>
      <Text style={styles.muted}>
        Оценка роста портфеля при регулярных пополнениях и ожидаемой доходности.
      </Text>

      <View style={styles.section}>
        <Text style={styles.label}>Ежемесячный взнос, ₽</Text>
        <TextInput
          style={styles.input}
          value={monthlyAmount}
          onChangeText={setMonthlyAmount}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Месяцев</Text>
        <TextInput
          style={styles.input}
          value={months}
          onChangeText={setMonths}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Ожидаемая доходность, % годовых</Text>
        <TextInput
          style={styles.input}
          value={expectedYield}
          onChangeText={setExpectedYield}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.resultSection}>
        <Text style={styles.subtitle}>Прогноз</Text>
        <View style={styles.kv}>
          <Text style={styles.k}>Текущая стоимость</Text>
          <Text style={styles.v}>{formatCurrencyRub(currentPortfolioValue)}</Text>
          <Text style={styles.k}>Сумма взносов</Text>
          <Text style={styles.v}>{formatCurrencyRub(totalContributions)}</Text>
          <Text style={styles.k}>Через {n || 0} мес.</Text>
          <Text style={styles.v}>{formatCurrencyRub(futureValue)}</Text>
          <Text style={styles.k}>Прирост</Text>
          <Text style={[styles.v, gain >= 0 ? styles.positive : styles.negative]}>
            {formatCurrencyRub(gain)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  title: { fontSize: 18, fontWeight: '600', color: '#e0e0e0', marginBottom: 8 },
  muted: { fontSize: 14, color: '#888', marginBottom: 16 },
  section: { marginBottom: 16 },
  label: { fontSize: 14, color: '#9e9e9e', marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: '#e0e0e0',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
  resultSection: {
    backgroundColor: 'rgba(26, 39, 68, 0.8)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
  subtitle: { fontSize: 16, fontWeight: '600', color: '#e0e0e0', marginBottom: 12 },
  kv: { gap: 8 },
  k: { fontSize: 14, color: '#9e9e9e' },
  v: { fontSize: 15, fontWeight: '600', color: '#4facfe', marginBottom: 8 },
  positive: { color: '#4caf50' },
  negative: { color: '#ff5252' },
});
