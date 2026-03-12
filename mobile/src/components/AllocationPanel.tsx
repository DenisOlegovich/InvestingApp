import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import type { Portfolio } from '../types';
import type { ExchangeRates } from '../utils/currencyApi';
import type { AllocationTargets, AssetClass } from '../types/investor';
import {
  normalizeTargets,
  portfolioValueByAssetClassRub,
  totalFromMap,
} from '../utils/investor';
import { formatCurrencyRub } from '../utils/format';

const LABELS: Record<AssetClass, string> = {
  securities: 'Ценные бумаги',
  realEstate: 'Недвижимость',
  deposits: 'Депозиты',
  cryptocurrencies: 'Криптовалюты',
};

const ASSET_KEYS: AssetClass[] = ['securities', 'realEstate', 'deposits', 'cryptocurrencies'];

export function AllocationPanel({
  portfolio,
  rates,
  targets,
  onChangeTargets,
}: {
  portfolio: Portfolio;
  rates: ExchangeRates;
  targets: AllocationTargets;
  onChangeTargets: (t: AllocationTargets) => void;
}) {
  const [draft, setDraft] = useState<AllocationTargets>(targets);

  const values = useMemo(() => portfolioValueByAssetClassRub(portfolio, rates), [portfolio, rates]);
  const total = totalFromMap(values);

  const currentPct = useMemo(() => {
    if (total <= 0)
      return { securities: 0, realEstate: 0, deposits: 0, cryptocurrencies: 0 };
    return {
      securities: (values.securities / total) * 100,
      realEstate: (values.realEstate / total) * 100,
      deposits: (values.deposits / total) * 100,
      cryptocurrencies: (values.cryptocurrencies / total) * 100,
    };
  }, [values, total]);

  const normalizedTargets = useMemo(() => normalizeTargets(targets), [targets]);

  const applyDraft = () => {
    onChangeTargets(normalizeTargets(draft));
  };

  return (
    <ScrollView style={styles.scroll}>
      <Text style={styles.title}>Аллокация и ребаланс</Text>
      <Text style={styles.muted}>
        Текущие доли по стоимости в рублях. Рекомендации — сколько добавить/убавить.
      </Text>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Текущая структура</Text>
        {ASSET_KEYS.map((k) => (
          <View key={k} style={styles.barRow}>
            <Text style={styles.barLabel}>{LABELS[k]}</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.min(100, currentPct[k])}%` }]} />
            </View>
            <Text style={styles.pct}>{currentPct[k].toFixed(1)}%</Text>
          </View>
        ))}
        <Text style={styles.muted}>Итого: {formatCurrencyRub(total)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Цели (%)</Text>
        {ASSET_KEYS.map((k) => (
          <View key={k} style={styles.inputRow}>
            <Text style={styles.inputLabel}>{LABELS[k]}</Text>
            <TextInput
              style={styles.input}
              value={String(draft.byAssetClass[k])}
              keyboardType="numeric"
              onChangeText={(v) =>
                setDraft({
                  byAssetClass: { ...draft.byAssetClass, [k]: Number(v) || 0 },
                })
              }
            />
          </View>
        ))}
        <TouchableOpacity style={styles.btn} onPress={applyDraft}>
          <Text style={styles.btnText}>Сохранить цели</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Подсказки по ребалансу</Text>
        {total <= 0 ? (
          <Text style={styles.muted}>Добавь активы — появятся подсказки.</Text>
        ) : (
          ASSET_KEYS.map((k) => {
            const target = normalizedTargets.byAssetClass[k];
            const cur = currentPct[k];
            const diffPct = target - cur;
            const diffRub = (diffPct / 100) * total;
            const abs = Math.abs(diffRub);
            const action =
              diffRub > 0 ? 'добавить' : diffRub < 0 ? 'снизить' : 'держать';
            const headline =
              action === 'держать'
                ? `${LABELS[k]} — ок`
                : `${LABELS[k]} — ${action} ≈ ${formatCurrencyRub(abs)}`;
            return (
              <View key={k} style={styles.listItem}>
                <View>
                  <Text style={styles.listTitle}>{headline}</Text>
                  <Text style={styles.listSub}>
                    Сейчас {cur.toFixed(1)}% → цель {target.toFixed(1)}% ({diffPct >= 0 ? '+' : ''}
                    {diffPct.toFixed(1)} п.п.)
                  </Text>
                </View>
                <Text style={styles.listValue}>{formatCurrencyRub(values[k])}</Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  title: { fontSize: 18, fontWeight: '600', color: '#e0e0e0', marginBottom: 8 },
  muted: { fontSize: 14, color: '#888', marginBottom: 16 },
  subtitle: { fontSize: 16, fontWeight: '600', color: '#e0e0e0', marginBottom: 12 },
  section: {
    backgroundColor: 'rgba(26, 39, 68, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
  barRow: { marginBottom: 12 },
  barLabel: { fontSize: 14, color: '#9e9e9e', marginBottom: 4 },
  track: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#4facfe', borderRadius: 4 },
  pct: { fontSize: 12, color: '#4facfe', marginTop: 2 },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  inputLabel: { fontSize: 14, color: '#9e9e9e', flex: 1 },
  input: {
    width: 80,
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: '#e0e0e0',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  btn: { backgroundColor: '#4facfe', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
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
