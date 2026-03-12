import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { loadJson, saveJson } from '../utils/storage';

const STORAGE_KEY = 'investor_notes';

export function NotesPanel({ userId }: { userId?: number }) {
  const key = `${STORAGE_KEY}_${userId ?? 'anon'}`;
  const [text, setText] = useState('');

  const load = useCallback(async () => {
    const data = await loadJson<string>(key, '');
    setText(data);
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    saveJson(key, text);
  }, [key, text]);

  return (
    <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Инвест-дневник</Text>
      <Text style={styles.muted}>Заметки, идеи, выводы. Сохраняются локально.</Text>
      <TextInput
        style={styles.input}
        placeholder="Почему купил SBER? Какую стратегию придерживаюсь? Уроки от последней сделки..."
        placeholderTextColor="#666"
        value={text}
        onChangeText={setText}
        multiline
        textAlignVertical="top"
      />
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
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
    minHeight: 200,
  },
});
