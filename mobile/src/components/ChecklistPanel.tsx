import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import type { ChecklistItem } from '../types/investor';
import { loadJson, saveJson } from '../utils/storage';

const STORAGE_KEY = 'investor_checklist';

const DEFAULT_ITEMS: ChecklistItem[] = [
  { id: '1', text: 'Проверил отчётность и див. политику', done: false, category: 'purchase' },
  { id: '2', text: 'Оценил мультипликаторы (P/E, P/B)', done: false, category: 'purchase' },
  { id: '3', text: 'Определил цель по цене и объём позиции', done: false, category: 'purchase' },
  { id: '4', text: 'Проверил срок владения для налоговых льгот', done: false, category: 'purchase' },
  { id: '5', text: 'Сравнил текущие доли с целевыми', done: false, category: 'rebalance' },
  { id: '6', text: 'Рассчитал суммы для докупки/продажи', done: false, category: 'rebalance' },
  { id: '7', text: 'Учёл комиссии и налоги', done: false, category: 'rebalance' },
  { id: '8', text: 'Собрал справки о доходах (2-НДФЛ, выписки)', done: false, category: 'tax' },
  { id: '9', text: 'Подготовил декларацию 3-НДФЛ', done: false, category: 'tax' },
];

const CAT_LABELS: Record<string, string> = {
  purchase: 'Перед покупкой',
  rebalance: 'Перед ребалансом',
  tax: 'Налоги',
};

export function ChecklistPanel({ userId }: { userId?: number }) {
  const key = `${STORAGE_KEY}_${userId ?? 'anon'}`;
  const [items, setItems] = useState<ChecklistItem[]>([]);

  const load = useCallback(async () => {
    const loaded = await loadJson<ChecklistItem[]>(key, []);
    setItems(loaded.length > 0 ? loaded : DEFAULT_ITEMS);
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    saveJson(key, items);
  }, [key, items]);

  const toggle = (id: string) => {
    setItems(items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  };

  const reset = () => setItems(DEFAULT_ITEMS);

  const byCategory = items.reduce(
    (acc, i) => {
      (acc[i.category] = acc[i.category] || []).push(i);
      return acc;
    },
    {} as Record<string, ChecklistItem[]>
  );

  return (
    <ScrollView style={styles.scroll}>
      <Text style={styles.title}>Чек-листы</Text>
      <Text style={styles.muted}>Помогают не забыть важные шаги.</Text>
      <TouchableOpacity style={styles.resetBtn} onPress={reset}>
        <Text style={styles.resetBtnText}>Сбросить к умолчаниям</Text>
      </TouchableOpacity>

      {(['purchase', 'rebalance', 'tax'] as const).map(
        (cat) =>
          byCategory[cat]?.length > 0 && (
            <View key={cat} style={styles.category}>
              <Text style={styles.categoryTitle}>{CAT_LABELS[cat]}</Text>
              {byCategory[cat].map((i) => (
                <TouchableOpacity
                  key={i.id}
                  style={[styles.checkItem, i.done && styles.checkItemDone]}
                  onPress={() => toggle(i.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.checkIcon}>{i.done ? '✓' : '○'}</Text>
                  <Text style={[styles.checkText, i.done && styles.checkTextDone]}>{i.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  title: { fontSize: 18, fontWeight: '600', color: '#e0e0e0', marginBottom: 8 },
  muted: { fontSize: 14, color: '#888', marginBottom: 16 },
  resetBtn: {
    backgroundColor: 'rgba(79, 172, 254, 0.2)',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.4)',
  },
  resetBtnText: { color: '#4facfe', fontWeight: '600', fontSize: 15 },
  category: {
    marginBottom: 20,
  },
  categoryTitle: { fontSize: 16, fontWeight: '600', color: '#e0e0e0', marginBottom: 12 },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(26, 39, 68, 0.8)',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
  checkItemDone: { opacity: 0.6 },
  checkIcon: { fontSize: 18, color: '#4facfe', marginRight: 12, width: 24, textAlign: 'center' },
  checkText: { flex: 1, fontSize: 15, color: '#e0e0e0' },
  checkTextDone: { textDecorationLine: 'line-through', color: '#888' },
});
