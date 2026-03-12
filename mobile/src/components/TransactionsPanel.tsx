import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import type { Transaction, Security } from '../types';
import { portfolioAPI } from '../services/api';
import { formatCurrency } from '../utils/format';

export function TransactionsPanel({
  securities,
  onRefresh,
}: {
  securities: Security[];
  onRefresh?: () => void;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    ticker: '',
    name: '',
    type: 'buy' as 'buy' | 'sell',
    quantity: '1',
    pricePerUnit: '0',
    currency: 'RUB' as 'RUB' | 'USD' | 'EUR',
    tradeDate: new Date().toISOString().slice(0, 10),
  });

  const loadTransactions = useCallback(async () => {
    try {
      const data = await portfolioAPI.getTransactions();
      setTransactions(data);
    } catch (e) {
      console.error('Ошибка загрузки сделок:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const onRefreshHandler = async () => {
    setRefreshing(true);
    await loadTransactions();
    onRefresh?.();
    setRefreshing(false);
  };

  const handleAdd = async () => {
    const ticker = form.ticker.trim();
    const name = form.name.trim();
    const quantity = Number(form.quantity) || 0;
    const pricePerUnit = Number(form.pricePerUnit) || 0;
    if (!ticker || !name || quantity < 1 || pricePerUnit <= 0) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }
    try {
      await portfolioAPI.addTransaction({
        ticker,
        name,
        type: form.type,
        quantity,
        pricePerUnit,
        total: quantity * pricePerUnit,
        currency: form.currency,
        tradeDate: form.tradeDate,
      });
      setForm({
        ticker: '',
        name: '',
        type: 'buy',
        quantity: '1',
        pricePerUnit: '0',
        currency: 'RUB',
        tradeDate: new Date().toISOString().slice(0, 10),
      });
      setShowForm(false);
      loadTransactions();
      onRefresh?.();
    } catch (err) {
      Alert.alert('Ошибка', err instanceof Error ? err.message : 'Не удалось добавить');
    }
  };

  const handleDelete = (tx: Transaction) => {
    Alert.alert('Удалить сделку?', `${tx.ticker} ${tx.type} ${tx.quantity}`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await portfolioAPI.deleteTransaction(tx.id);
            loadTransactions();
            onRefresh?.();
          } catch (err) {
            Alert.alert('Ошибка', err instanceof Error ? err.message : 'Не удалось удалить');
          }
        },
      },
    ]);
  };

  const fillFromSecurity = (s: Security) => {
    setForm((f) => ({
      ...f,
      ticker: s.ticker,
      name: s.name,
      currency: s.currency,
      pricePerUnit: String(s.currentPrice),
    }));
  };

  return (
    <ScrollView
      style={styles.scroll}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefreshHandler} tintColor="#4facfe" />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>История сделок</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowForm(!showForm)}
        >
          <Text style={styles.addBtnText}>{showForm ? 'Отмена' : '+ Добавить'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Тикер (SBER)"
            placeholderTextColor="#666"
            value={form.ticker}
            onChangeText={(v) => setForm((f) => ({ ...f, ticker: v.toUpperCase() }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Название"
            placeholderTextColor="#666"
            value={form.name}
            onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
          />
          {securities.length > 0 && (
            <View style={styles.quickRow}>
              {securities.slice(0, 5).map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.quickBtn}
                  onPress={() => fillFromSecurity(s)}
                >
                  <Text style={styles.quickBtnText}>{s.ticker}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.typeBtn, form.type === 'buy' && styles.typeBtnActive]}
              onPress={() => setForm((f) => ({ ...f, type: 'buy' }))}
            >
              <Text style={form.type === 'buy' ? styles.typeBtnTextActive : styles.typeBtnText}>
                Покупка
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, form.type === 'sell' && styles.typeBtnActive]}
              onPress={() => setForm((f) => ({ ...f, type: 'sell' }))}
            >
              <Text style={form.type === 'sell' ? styles.typeBtnTextActive : styles.typeBtnText}>
                Продажа
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.inputHalf]}
              placeholder="Кол-во"
              placeholderTextColor="#666"
              value={form.quantity}
              onChangeText={(v) => setForm((f) => ({ ...f, quantity: v }))}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.inputHalf]}
              placeholder="Цена"
              placeholderTextColor="#666"
              value={form.pricePerUnit}
              onChangeText={(v) => setForm((f) => ({ ...f, pricePerUnit: v }))}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.currencyBtn, form.currency === 'RUB' && styles.currencyBtnActive]}
              onPress={() => setForm((f) => ({ ...f, currency: 'RUB' }))}
            >
              <Text style={form.currency === 'RUB' ? styles.currencyBtnTextActive : styles.currencyBtnText}>
                ₽
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.currencyBtn, form.currency === 'USD' && styles.currencyBtnActive]}
              onPress={() => setForm((f) => ({ ...f, currency: 'USD' }))}
            >
              <Text style={form.currency === 'USD' ? styles.currencyBtnTextActive : styles.currencyBtnText}>
                $
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.currencyBtn, form.currency === 'EUR' && styles.currencyBtnActive]}
              onPress={() => setForm((f) => ({ ...f, currency: 'EUR' }))}
            >
              <Text style={form.currency === 'EUR' ? styles.currencyBtnTextActive : styles.currencyBtnText}>
                €
              </Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Дата (YYYY-MM-DD)"
            placeholderTextColor="#666"
            value={form.tradeDate}
            onChangeText={(v) => setForm((f) => ({ ...f, tradeDate: v }))}
          />
          <TouchableOpacity style={styles.submitBtn} onPress={handleAdd}>
            <Text style={styles.submitBtnText}>Сохранить</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <Text style={styles.muted}>Загрузка...</Text>
      ) : transactions.length === 0 ? (
        <Text style={styles.muted}>Нет сделок</Text>
      ) : (
        transactions.map((tx) => (
          <View key={tx.id} style={styles.card}>
            <View style={styles.cardRow}>
              <View>
                <Text style={styles.cardTitle}>
                  {tx.ticker} — {tx.type === 'buy' ? 'Покупка' : 'Продажа'}
                </Text>
                <Text style={styles.cardSub}>
                  {tx.quantity} × {formatCurrency(tx.pricePerUnit, tx.currency)} ={' '}
                  {formatCurrency(tx.total, tx.currency)}
                </Text>
                <Text style={styles.cardDate}>{tx.tradeDate}</Text>
              </View>
              <TouchableOpacity style={styles.delBtn} onPress={() => handleDelete(tx)}>
                <Text style={styles.delBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '600', color: '#e0e0e0' },
  addBtn: { backgroundColor: '#4facfe', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  form: {
    backgroundColor: 'rgba(26, 39, 68, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
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
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  quickBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(79, 172, 254, 0.2)',
    borderRadius: 8,
  },
  quickBtnText: { color: '#4facfe', fontSize: 14 },
  typeBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
  },
  typeBtnActive: { backgroundColor: '#4facfe' },
  typeBtnText: { color: '#888' },
  typeBtnTextActive: { color: '#fff', fontWeight: '600' },
  currencyBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
  },
  currencyBtnActive: { backgroundColor: 'rgba(79, 172, 254, 0.4)' },
  currencyBtnText: { color: '#888' },
  currencyBtnTextActive: { color: '#4facfe', fontWeight: '600' },
  submitBtn: {
    backgroundColor: '#4caf50',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  muted: { fontSize: 14, color: '#888', marginTop: 20 },
  card: {
    backgroundColor: 'rgba(26, 39, 68, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#e0e0e0' },
  cardSub: { fontSize: 14, color: '#9e9e9e', marginTop: 4 },
  cardDate: { fontSize: 12, color: '#666', marginTop: 4 },
  delBtn: { padding: 8 },
  delBtnText: { color: '#ff5252', fontSize: 18 },
});
