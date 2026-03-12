import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import type { Portfolio } from '../types';
import { portfolioAPI } from '../services/api';
import { formatCurrencyRub } from '../utils/format';
import { loadJson, saveJson } from '../utils/storage';

const ALERT_KEY = 'investor_alert_threshold';

export function ToolsPanel({
  portfolio,
  userName,
}: {
  portfolio: Portfolio;
  userName: string;
}) {
  const [calcSum, setCalcSum] = useState('');
  const [calcRate, setCalcRate] = useState('');
  const [calcYears, setCalcYears] = useState('');
  const [calcResult, setCalcResult] = useState<number | null>(null);
  const [iisSum, setIisSum] = useState('');
  const [iisYears, setIisYears] = useState('');
  const [iisResult, setIisResult] = useState<{ deduction: number; total: number } | null>(null);
  const [alertThreshold, setAlertThreshold] = useState('5');
  const [taxReport, setTaxReport] = useState<{
    buys: number;
    sells: number;
    realized: number;
    count: number;
  } | null>(null);

  useEffect(() => {
    loadJson<string>(ALERT_KEY, '5').then((v) => setAlertThreshold(v || '5'));
  }, []);

  useEffect(() => {
    saveJson(ALERT_KEY, alertThreshold);
  }, [alertThreshold]);

  useEffect(() => {
    portfolioAPI
      .getTransactions()
      .then((txs) => {
        let buys = 0,
          sells = 0;
        for (const t of txs) {
          if (t.type === 'buy') buys += t.total;
          else sells += t.total;
        }
        setTaxReport({
          buys,
          sells,
          realized: Math.round((sells - buys) * 100) / 100,
          count: txs.length,
        });
      })
      .catch(() => setTaxReport({ buys: 0, sells: 0, realized: 0, count: 0 }));
  }, []);

  const handleExportJson = async () => {
    const data = {
      portfolio,
      userName,
      exportedAt: new Date().toISOString(),
    };
    try {
      await Share.share({
        message: JSON.stringify(data, null, 2),
        title: 'Портфель (JSON)',
      });
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось экспортировать');
    }
  };

  const handleCalcCompound = () => {
    const sum = parseFloat((calcSum || '').replace(',', '.'));
    const rate = parseFloat((calcRate || '').replace(',', '.')) / 100;
    const years = parseFloat((calcYears || '').replace(',', '.'));
    if (!sum || !rate || !years) return;
    setCalcResult(sum * Math.pow(1 + rate, years));
  };

  const handleCalcIIS = () => {
    const sum = parseFloat((iisSum || '').replace(',', '.'));
    const years = parseFloat((iisYears || '').replace(',', '.'));
    if (!sum || !years) return;
    const deduction = Math.min(sum * years, 400000 * years);
    setIisResult({ deduction, total: sum * years });
  };

  return (
    <ScrollView style={styles.scroll}>
      <Text style={styles.title}>Инструменты</Text>

      <View style={styles.section}>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExportJson}>
          <Text style={styles.exportBtnText}>Экспорт в JSON</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Сложный процент</Text>
        <Text style={styles.label}>Сумма, ₽</Text>
        <TextInput
          style={styles.input}
          value={calcSum}
          onChangeText={setCalcSum}
          keyboardType="numeric"
          placeholder="100000"
          placeholderTextColor="#666"
        />
        <Text style={styles.label}>Доходность, % годовых</Text>
        <TextInput
          style={styles.input}
          value={calcRate}
          onChangeText={setCalcRate}
          keyboardType="numeric"
          placeholder="10"
          placeholderTextColor="#666"
        />
        <Text style={styles.label}>Лет</Text>
        <TextInput
          style={styles.input}
          value={calcYears}
          onChangeText={setCalcYears}
          keyboardType="numeric"
          placeholder="5"
          placeholderTextColor="#666"
        />
        <TouchableOpacity style={styles.calcBtn} onPress={handleCalcCompound}>
          <Text style={styles.calcBtnText}>Рассчитать</Text>
        </TouchableOpacity>
        {calcResult !== null && (
          <Text style={styles.result}>
            Результат: {formatCurrencyRub(calcResult, { maxFractionDigits: 2 })}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>ИИС — вычет</Text>
        <Text style={styles.label}>Взнос в год, ₽</Text>
        <TextInput
          style={styles.input}
          value={iisSum}
          onChangeText={setIisSum}
          keyboardType="numeric"
          placeholder="400000"
          placeholderTextColor="#666"
        />
        <Text style={styles.label}>Лет</Text>
        <TextInput
          style={styles.input}
          value={iisYears}
          onChangeText={setIisYears}
          keyboardType="numeric"
          placeholder="3"
          placeholderTextColor="#666"
        />
        <TouchableOpacity style={styles.calcBtn} onPress={handleCalcIIS}>
          <Text style={styles.calcBtnText}>Рассчитать</Text>
        </TouchableOpacity>
        {iisResult && (
          <Text style={styles.result}>
            Вычет: {formatCurrencyRub(iisResult.deduction)} за {iisResult.total.toLocaleString('ru-RU')} ₽
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Порог алертов, %</Text>
        <Text style={styles.muted}>Изменение цены актива для уведомления на дашборде</Text>
        <TextInput
          style={styles.input}
          value={alertThreshold}
          onChangeText={setAlertThreshold}
          keyboardType="numeric"
          placeholder="5"
          placeholderTextColor="#666"
        />
      </View>

      {taxReport && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Налог (по сделкам)</Text>
          <View style={styles.kv}>
            <Text style={styles.k}>Покупок</Text>
            <Text style={styles.v}>{formatCurrencyRub(taxReport.buys)}</Text>
            <Text style={styles.k}>Продаж</Text>
            <Text style={styles.v}>{formatCurrencyRub(taxReport.sells)}</Text>
            <Text style={styles.k}>Реализ. прибыль</Text>
            <Text
              style={[
                styles.v,
                taxReport.realized >= 0 ? styles.positive : styles.negative,
              ]}
            >
              {formatCurrencyRub(taxReport.realized)}
            </Text>
            <Text style={styles.k}>Сделок</Text>
            <Text style={styles.v}>{taxReport.count}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  title: { fontSize: 18, fontWeight: '600', color: '#e0e0e0', marginBottom: 16 },
  section: {
    backgroundColor: 'rgba(26, 39, 68, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
  subtitle: { fontSize: 16, fontWeight: '600', color: '#e0e0e0', marginBottom: 12 },
  label: { fontSize: 14, color: '#9e9e9e', marginBottom: 6 },
  muted: { fontSize: 13, color: '#888', marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: '#e0e0e0',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
  exportBtn: {
    backgroundColor: '#4facfe',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  exportBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  calcBtn: {
    backgroundColor: 'rgba(79, 172, 254, 0.3)',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  calcBtnText: { color: '#4facfe', fontWeight: '600', fontSize: 16 },
  result: { fontSize: 16, fontWeight: '600', color: '#4caf50', marginTop: 12 },
  kv: { gap: 8 },
  k: { fontSize: 14, color: '#9e9e9e' },
  v: { fontSize: 15, fontWeight: '600', color: '#4facfe' },
  positive: { color: '#4caf50' },
  negative: { color: '#ff5252' },
});
