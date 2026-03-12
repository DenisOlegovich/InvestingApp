import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import type { Crypto } from '../types';
import { portfolioAPI } from '../services/api';

interface Props {
  onAdded: () => void;
  onCancel: () => void;
}

export function AddCryptoScreen({ onAdded, onCancel }: Props) {
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    setError('');
    const amt = parseFloat(amount.replace(',', '.'));
    const price = parseFloat(currentPrice.replace(',', '.'));
    if (!symbol.trim() || !name.trim() || isNaN(amt) || amt <= 0 || isNaN(price) || price <= 0) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);
    try {
      const data: Omit<Crypto, 'id'> = {
        symbol: symbol.trim().toUpperCase(),
        name: name.trim(),
        amount: amt,
        currentPrice: price,
        previousPrice: price,
      };
      await portfolioAPI.addCryptocurrency(data);
      onAdded();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Text style={styles.title}>Добавить криптовалюту</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>Символ</Text>
        <TextInput style={styles.input} placeholder="BTC, ETH..." placeholderTextColor="#888" value={symbol} onChangeText={(t) => setSymbol(t.toUpperCase())} />

        <Text style={styles.label}>Название</Text>
        <TextInput style={styles.input} placeholder="Bitcoin" placeholderTextColor="#888" value={name} onChangeText={setName} />

        <Text style={styles.label}>Количество</Text>
        <TextInput style={styles.input} placeholder="0.5" placeholderTextColor="#888" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />

        <Text style={styles.label}>Цена (USD)</Text>
        <TextInput style={styles.input} placeholder="45000" placeholderTextColor="#888" value={currentPrice} onChangeText={setCurrentPrice} keyboardType="decimal-pad" />

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleAdd} disabled={loading}>
          {loading ? <ActivityIndicator color="#0a0e1a" /> : <Text style={styles.buttonText}>Добавить</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Отмена</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1729' },
  form: { padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#e0e0e0', marginBottom: 24 },
  error: { color: '#ff5252', marginBottom: 12, fontSize: 14 },
  label: { fontSize: 14, color: '#b0b0b0', marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(15, 23, 41, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.3)',
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
    fontSize: 16,
    color: '#e0e0e0',
  },
  button: { backgroundColor: '#4facfe', padding: 20, minHeight: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#0a0e1a', fontSize: 18, fontWeight: '600' },
  cancelBtn: { marginTop: 20, paddingVertical: 14, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#888', fontSize: 16 },
});
