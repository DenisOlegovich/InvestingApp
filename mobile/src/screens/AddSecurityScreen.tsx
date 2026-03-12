import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import type { Security } from '../types';
import { portfolioAPI } from '../services/api';

interface Props {
  onAdded: () => void;
  onCancel: () => void;
}

export function AddSecurityScreen({ onAdded, onCancel }: Props) {
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    setError('');
    const price = parseFloat(currentPrice.replace(',', '.'));
    const qty = parseInt(quantity, 10);
    if (!name.trim() || !ticker.trim() || isNaN(price) || price <= 0 || isNaN(qty) || qty <= 0) {
      setError('Заполните все поля корректно');
      return;
    }

    setLoading(true);
    try {
      const data: Omit<Security, 'id'> = {
        name: name.trim(),
        ticker: ticker.toUpperCase().trim(),
        type: 'stock',
        currentPrice: price,
        previousPrice: price,
        quantity: qty,
        expectedDividend: 0,
        dividendFrequency: 'yearly',
        currency: 'RUB',
      };
      await portfolioAPI.addSecurity(data);
      onAdded();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка добавления');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Text style={styles.title}>Добавить ценную бумагу</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>Название</Text>
        <TextInput
          style={styles.input}
          placeholder="Например: Сбербанк"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Тикер</Text>
        <TextInput
          style={styles.input}
          placeholder="SBER, AAPL..."
          placeholderTextColor="#888"
          value={ticker}
          onChangeText={(t) => setTicker(t.toUpperCase())}
        />

        <Text style={styles.label}>Цена</Text>
        <TextInput
          style={styles.input}
          placeholder="285.50"
          placeholderTextColor="#888"
          value={currentPrice}
          onChangeText={setCurrentPrice}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Количество</Text>
        <TextInput
          style={styles.input}
          placeholder="10"
          placeholderTextColor="#888"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="number-pad"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAdd}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0a0e1a" />
          ) : (
            <Text style={styles.buttonText}>Добавить</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Отмена</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1729',
  },
  form: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e0e0e0',
    marginBottom: 24,
  },
  error: {
    color: '#ff5252',
    marginBottom: 12,
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    color: '#b0b0b0',
    marginBottom: 8,
  },
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
  button: {
    backgroundColor: '#4facfe',
    padding: 20,
    minHeight: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#0a0e1a',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelBtn: {
    marginTop: 20,
    paddingVertical: 14,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#888',
    fontSize: 16,
  },
});
