import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { authAPI } from '../services/api';

interface Props {
  token: string;
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function ResetPasswordScreen({ token, onSuccess, onSwitchToLogin }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }
    if (password.length < 6) {
      setError('Пароль минимум 6 символов');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сброса');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.form}>
        <Text style={styles.title}>Новый пароль</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>Новый пароль</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>Повторите пароль</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#888"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#0a0e1a" /> : <Text style={styles.buttonText}>Сохранить</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={onSwitchToLogin} style={styles.link}>
          <Text style={styles.linkText}>Вернуться к входу</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0f1729' },
  form: { maxWidth: 400, width: '100%', alignSelf: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#e0e0e0', marginBottom: 24, textAlign: 'center' },
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
  button: {
    backgroundColor: '#4facfe',
    padding: 20,
    minHeight: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#0a0e1a', fontSize: 18, fontWeight: '600' },
  link: { marginTop: 24, paddingVertical: 12, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  linkText: { color: '#4facfe', fontSize: 16 },
});
