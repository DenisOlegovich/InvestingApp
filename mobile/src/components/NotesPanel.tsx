import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { loadJson, saveJson } from '../utils/storage';
import { portfolioAPI } from '../services/api';

const STORAGE_KEY = 'investor_notes';
const SAVE_DEBOUNCE_MS = 700;

export function NotesPanel({ userId }: { userId?: number }) {
  const key = `${STORAGE_KEY}_${userId ?? 'anon'}`;
  const [text, setText] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const useBackend = Boolean(userId);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    setSaveError(null);

    (async () => {
      if (useBackend) {
        try {
          const { content } = await portfolioAPI.getNotes();
          let next = content;
          const local = await loadJson<string>(key, '');
          if (!next && local) {
            await portfolioAPI.saveNotes(local);
            next = local;
          }
          if (!cancelled) {
            setText(next);
            setLoaded(true);
          }
        } catch {
          if (!cancelled) {
            setText(await loadJson<string>(key, ''));
            setLoaded(true);
          }
        }
      } else {
        if (!cancelled) {
          setText(await loadJson<string>(key, ''));
          setLoaded(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key, useBackend]);

  useEffect(() => {
    if (!loaded) return;
    setSaveError(null);
    if (useBackend) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        portfolioAPI.saveNotes(text).catch(() => {
          setSaveError('Не удалось сохранить на сервере');
        });
      }, SAVE_DEBOUNCE_MS);
      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
      };
    }
    saveJson(key, text);
  }, [text, key, loaded, useBackend]);

  return (
    <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Инвест-дневник</Text>
      <Text style={styles.muted}>
        {useBackend
          ? 'Заметки сохраняются на сервере.'
          : 'Заметки сохраняются только на устройстве.'}
      </Text>
      {saveError ? <Text style={styles.error}>{saveError}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Почему купил SBER? Какую стратегию придерживаюсь? Уроки от последней сделки..."
        placeholderTextColor="#666"
        value={text}
        onChangeText={setText}
        multiline
        textAlignVertical="top"
        editable={loaded}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  title: { fontSize: 18, fontWeight: '600', color: '#e0e0e0', marginBottom: 8 },
  muted: { fontSize: 14, color: '#888', marginBottom: 16 },
  error: { fontSize: 14, color: '#ff8a80', marginBottom: 8 },
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
