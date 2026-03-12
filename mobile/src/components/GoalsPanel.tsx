import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import type { Goal } from '../types/investor';
import { loadJson, saveJson } from '../utils/storage';
import { formatCurrencyRub } from '../utils/format';

const STORAGE_KEY = 'investor_v1';

function monthsBetween(now: Date, target: Date): number {
  const y = target.getFullYear() - now.getFullYear();
  const m = target.getMonth() - now.getMonth();
  return y * 12 + m + (target.getDate() >= now.getDate() ? 0 : -1);
}

export function GoalsPanel({ userId }: { userId?: number }) {
  const key = `${STORAGE_KEY}_${userId ?? 'anon'}_goals`;
  const [goals, setGoals] = useState<Goal[]>([]);
  const [name, setName] = useState('');
  const [targetAmountRub, setTargetAmountRub] = useState('1000000');
  const [currentAmountRub, setCurrentAmountRub] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [monthlyContributionRub, setMonthlyContributionRub] = useState('');

  const load = useCallback(async () => {
    const data = await loadJson<Goal[]>(key, []);
    setGoals(data);
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    saveJson(key, goals);
  }, [key, goals]);

  const addGoal = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const g: Goal = {
      id: crypto.randomUUID(),
      name: trimmed,
      targetAmountRub: Math.max(0, Number(targetAmountRub) || 0),
      currentAmountRub: Math.max(0, Number(currentAmountRub) || 0),
      targetDate: targetDate || undefined,
      monthlyContributionRub:
        Number(monthlyContributionRub) > 0 ? Number(monthlyContributionRub) : undefined,
      createdAt: new Date().toISOString(),
    };
    setGoals([g, ...goals]);
    setName('');
    setTargetAmountRub('1000000');
    setCurrentAmountRub('0');
    setTargetDate('');
    setMonthlyContributionRub('');
  };

  const removeGoal = (id: string) => {
    Alert.alert('Удалить цель?', '', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => setGoals(goals.filter((g) => g.id !== id)) },
    ]);
  };

  const now = useMemo(() => new Date(), []);

  return (
    <ScrollView style={styles.scroll}>
      <Text style={styles.title}>Цели</Text>
      <Text style={styles.muted}>Цели сохраняются локально на устройстве.</Text>

      <TextInput
        style={styles.input}
        placeholder="Название цели (Подушка 6 мес)"
        placeholderTextColor="#666"
        value={name}
        onChangeText={setName}
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.inputHalf]}
          placeholder="Цель, ₽"
          placeholderTextColor="#666"
          value={targetAmountRub}
          onChangeText={setTargetAmountRub}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.inputHalf]}
          placeholder="Сейчас, ₽"
          placeholderTextColor="#666"
          value={currentAmountRub}
          onChangeText={setCurrentAmountRub}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.inputHalf]}
          placeholder="Дедлайн (YYYY-MM-DD)"
          placeholderTextColor="#666"
          value={targetDate}
          onChangeText={setTargetDate}
        />
        <TextInput
          style={[styles.input, styles.inputHalf]}
          placeholder="Взнос/мес, ₽"
          placeholderTextColor="#666"
          value={monthlyContributionRub}
          onChangeText={setMonthlyContributionRub}
          keyboardType="numeric"
        />
      </View>
      <TouchableOpacity style={styles.btn} onPress={addGoal}>
        <Text style={styles.btnText}>Добавить цель</Text>
      </TouchableOpacity>

      {goals.length === 0 ? (
        <Text style={styles.muted}>Пока нет целей.</Text>
      ) : (
        goals.map((g) => {
          const pct =
            g.targetAmountRub > 0
              ? Math.min(100, (g.currentAmountRub / g.targetAmountRub) * 100)
              : 0;
          const monthsLeft = g.targetDate ? monthsBetween(now, new Date(g.targetDate)) : null;
          const requiredMonthly =
            monthsLeft && monthsLeft > 0
              ? Math.max(0, (g.targetAmountRub - g.currentAmountRub) / monthsLeft)
              : null;

          return (
            <View key={g.id} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.cardLeft}>
                  <Text style={styles.cardTitle}>{g.name}</Text>
                  <Text style={styles.cardSub}>
                    {formatCurrencyRub(g.currentAmountRub)} из {formatCurrencyRub(g.targetAmountRub)}
                    {g.targetDate ? ` • ${g.targetDate}` : ''}
                  </Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.cardSub}>
                    {requiredMonthly !== null
                      ? `Нужно ≈ ${formatCurrencyRub(requiredMonthly)} / мес`
                      : g.monthlyContributionRub
                        ? `План: ${formatCurrencyRub(g.monthlyContributionRub)} / мес`
                        : 'Задай дедлайн или взнос'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeGoal(g.id)}>
                  <Text style={styles.removeBtnText}>Удалить</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
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
  card: {
    backgroundColor: 'rgba(26, 39, 68, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLeft: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#e0e0e0' },
  cardSub: { fontSize: 13, color: '#888', marginTop: 6 },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#4facfe', borderRadius: 3 },
  removeBtn: { padding: 10, marginLeft: 12 },
  removeBtnText: { color: '#ff5252', fontSize: 14 },
});
