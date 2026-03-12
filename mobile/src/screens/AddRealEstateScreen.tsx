import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import type { RealEstate } from '../types';
import { portfolioAPI } from '../services/api';

interface Props {
  onAdded: () => void;
  onCancel: () => void;
}

export function AddRealEstateScreen({ onAdded, onCancel }: Props) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    setError('');
    const val = parseFloat(currentValue.replace(',', '.'));
    const rent = monthlyRent ? parseFloat(monthlyRent.replace(',', '.')) : 0;
    if (!name.trim() || !location.trim() || isNaN(val) || val <= 0) {
      setError('Заполните название, адрес и стоимость');
      return;
    }

    setLoading(true);
    try {
      const data: Omit<RealEstate, 'id'> = {
        name: name.trim(),
        location: location.trim(),
        type: 'apartment',
        currentValue: val,
        monthlyRent: rent > 0 ? rent : undefined,
      };
      await portfolioAPI.addRealEstate(data);
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
        <Text style={styles.title}>Добавить недвижимость</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>Название</Text>
        <TextInput style={styles.input} placeholder="Квартира, офис..." placeholderTextColor="#888" value={name} onChangeText={setName} />

        <Text style={styles.label}>Адрес / расположение</Text>
        <TextInput style={styles.input} placeholder="г. Москва, ул. Примерная" placeholderTextColor="#888" value={location} onChangeText={setLocation} />

        <Text style={styles.label}>Оценочная стоимость (₽)</Text>
        <TextInput style={styles.input} placeholder="15000000" placeholderTextColor="#888" value={currentValue} onChangeText={setCurrentValue} keyboardType="decimal-pad" />

        <Text style={styles.label}>Аренда в месяц (₽, опционально)</Text>
        <TextInput style={styles.input} placeholder="150000" placeholderTextColor="#888" value={monthlyRent} onChangeText={setMonthlyRent} keyboardType="decimal-pad" />

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
