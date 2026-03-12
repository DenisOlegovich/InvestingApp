import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { WatchlistItem } from '../types/investor';
import { loadJson, saveJson } from '../utils/storage';

const STORAGE_KEY = 'investor_watchlist';

export function WatchlistPanel({ userId }: { userId?: number }) {
  const key = `${STORAGE_KEY}_${userId ?? 'anon'}`;
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [ticker, setTicker] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    const data = await loadJson<WatchlistItem[]>(key, []);
    setItems(data);
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    saveJson(key, items);
  }, [key, items]);

  const addItem = () => {
    const t = ticker.trim().toUpperCase();
    if (!t) return;
    if (items.some((i) => i.ticker === t)) return;
    const item: WatchlistItem = {
      id: crypto.randomUUID(),
      ticker: t,
      targetPrice: targetPrice ? Number(targetPrice) : undefined,
      note: note.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    setItems([item, ...items]);
    setTicker('');
    setTargetPrice('');
    setNote('');
  };

  const removeItem = (id: string) => {
    Alert.alert('Удалить?', '', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => setItems(items.filter((i) => i.id !== id)) },
    ]);
  };

  // На мобильном без stock API упрощённо — только список
  return (
    <ScrollView style={styles.scroll}>
      <Text style={styles.title}>Watchlist</Text>
      <Text style={styles.muted}>Тикеры для отслеживания. Сохраняются локально.</Text>

      <TextInput
        style={styles.input}
        placeholder="Тикер (SBER, AAPL...)"
        placeholderTextColor="#666"
        value={ticker}
        onChangeText={setTicker}
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.inputHalf]}
          placeholder="Цель по цене (опц.)"
          placeholderTextColor="#666"
          value={targetPrice}
          onChangeText={setTargetPrice}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.inputHalf]}
          placeholder="Заметка (опц.)"
          placeholderTextColor="#666"
          value={note}
          onChangeText={setNote}
        />
      </View>
      <TouchableOpacity style={styles.btn} onPress={addItem}>
        <Text style={styles.btnText}>Добавить</Text>
      </TouchableOpacity>

      <View style={styles.list}>
        {items.map((item) => (
          <View key={item.id} style={styles.listItem}>
            <View style={styles.listLeft}>
              <Text style={styles.listTitle}>{item.ticker}</Text>
              <Text style={styles.listSub}>{item.name || item.note || '—'}</Text>
              {item.targetPrice != null && (
                <Text style={styles.listSub}>Цель: {item.targetPrice.toLocaleString('ru-RU')}</Text>
              )}
            </View>
            <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(item.id)}>
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  title: { fontSize: 18, fontWeight: '600', color: '#e0e0e0', marginBottom: 8 },
  muted: { fontSize: 14, color: '#888', marginBottom: 16 },
  input: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: '#e0e0e0',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
  inputHalf: { flex: 1, marginHorizontal: 4 },
  row: { flexDirection: 'row', marginBottom: 10 },
  btn: { backgroundColor: '#4facfe', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  list: {},
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 39, 68, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
  listLeft: { flex: 1 },
  listTitle: { fontSize: 16, fontWeight: '600', color: '#e0e0e0' },
  listSub: { fontSize: 13, color: '#888', marginTop: 4 },
  removeBtn: { padding: 10 },
  removeBtnText: { color: '#ff5252', fontSize: 18 },
});
