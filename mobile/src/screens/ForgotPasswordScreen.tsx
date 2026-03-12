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
  onSuccess: (msg: string, token?: string) => void;
  onSwitchToLogin: () => void;
}

export function ForgotPasswordScreen({ onSuccess, onSwitchToLogin }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await authAPI.forgotPassword(email);
      onSuccess(data.message || 'Ссылка отправлена на email', data.resetToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка запроса');
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
        <Text style={styles.title}>Восстановление пароля</Text>
        <Text style={styles.hint}>Введите email, указанный при регистрации</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#0a0e1a" /> : <Text style={styles.buttonText}>Отправить</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={onSwitchToLogin} style={styles.link}>
          <Text style={styles.linkText}>Вспомнили пароль? Войти</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0f1729',
  },
  form: { maxWidth: 400, width: '100%', alignSelf: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#e0e0e0', marginBottom: 12, textAlign: 'center' },
  hint: { fontSize: 14, color: '#9e9e9e', marginBottom: 20, textAlign: 'center' },
  error: { color: '#ff5252', marginBottom: 12, fontSize: 14 },
  input: {
    backgroundColor: 'rgba(15, 23, 41, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.3)',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
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
