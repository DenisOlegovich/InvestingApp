import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Portfolio, Security, RealEstate, Deposit, Crypto, User } from '../types';
import type { AllocationTargets } from '../types/investor';
import { portfolioAPI } from '../services/api';
import { formatCurrency, formatCurrencyRub } from '../utils/format';
import {
  calculateTotalPortfolioValueInRUB,
  calculateTotalExpectedIncomeInRUB,
} from '../utils/calculations';
import { fetchExchangeRates, type ExchangeRates } from '../utils/currencyApi';
import { computeDailyPnLRub, computePriceAlerts, DEFAULT_TARGETS } from '../utils/investor';
import { loadJson, saveJson } from '../utils/storage';
import { PortfolioCharts } from '../components/PortfolioCharts';
import { AllocationPanel } from '../components/AllocationPanel';
import { DividendsPanel } from '../components/DividendsPanel';
import { IncomePanel } from '../components/IncomePanel';
import { GoalsPanel } from '../components/GoalsPanel';
import { WatchlistPanel } from '../components/WatchlistPanel';
import { DCAPanel } from '../components/DCAPanel';
import { ScenariosPanel } from '../components/ScenariosPanel';
import { ChecklistPanel } from '../components/ChecklistPanel';
import { NotesPanel } from '../components/NotesPanel';
import { ToolsPanel } from '../components/ToolsPanel';
import { TransactionsPanel } from '../components/TransactionsPanel';

const TARGETS_KEY = 'investor_v1_targets';
const ALERT_KEY = 'investor_alert_threshold';

interface Props {
  portfolio: Portfolio;
  onUpdatePortfolio: (p: Portfolio) => void;
  user: User;
  onLogout: () => void;
  onAddSecurity?: () => void;
  onAddRealEstate?: () => void;
  onAddDeposit?: () => void;
  onAddCrypto?: () => void;
  theme?: 'dark' | 'light';
  onThemeToggle?: () => void;
}

type Tab =
  | 'dashboard'
  | 'assets'
  | 'charts'
  | 'allocation'
  | 'dividends'
  | 'income'
  | 'goals'
  | 'watchlist'
  | 'dca'
  | 'scenarios'
  | 'checklist'
  | 'notes'
  | 'tools'
  | 'transactions';

const TAB_LABELS: Record<Tab, string> = {
  dashboard: 'Дашборд',
  assets: 'Активы',
  charts: 'Графики',
  allocation: 'Аллокация',
  dividends: 'Дивиденды',
  income: 'Доход',
  goals: 'Цели',
  watchlist: 'Watchlist',
  dca: 'DCA',
  scenarios: 'Сценарии',
  checklist: 'Чек-лист',
  notes: 'Заметки',
  tools: 'Инструменты',
  transactions: 'Сделки',
};

export function PortfolioScreen({
  portfolio,
  onUpdatePortfolio,
  user,
  onLogout,
  onAddSecurity,
  onAddRealEstate,
  onAddDeposit,
  onAddCrypto,
  theme = 'dark',
  onThemeToggle,
}: Props) {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [refreshing, setRefreshing] = useState(false);
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [targets, setTargets] = useState<AllocationTargets>(DEFAULT_TARGETS);
  const [alertThreshold, setAlertThreshold] = useState(5);

  const loadRates = useCallback(async () => {
    const r = await fetchExchangeRates();
    setRates(r);
  }, []);

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  useEffect(() => {
    loadJson<AllocationTargets>(`${TARGETS_KEY}_${user.id}`, DEFAULT_TARGETS).then(setTargets);
  }, [user.id]);

  useEffect(() => {
    loadJson<string>(ALERT_KEY, '5').then((v) => setAlertThreshold(Number(v) || 5));
  }, []);

  useEffect(() => {
    saveJson(`${TARGETS_KEY}_${user.id}`, targets);
  }, [user.id, targets]);

  const loadPortfolio = useCallback(async () => {
    try {
      const data = await portfolioAPI.getPortfolio();
      onUpdatePortfolio(data);
    } catch (e) {
      console.error(e);
    }
  }, [onUpdatePortfolio]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadPortfolio(), loadRates()]);
    setRefreshing(false);
  };

  const r = rates || { USD_RUB: 92.5, EUR_RUB: 100, lastUpdate: new Date() };
  const totalValue = calculateTotalPortfolioValueInRUB(portfolio, r);
  const monthlyIncome = calculateTotalExpectedIncomeInRUB(portfolio, r);
  const dailyPnL = computeDailyPnLRub(portfolio, r);
  const alerts = computePriceAlerts(portfolio, alertThreshold);

  const handleRemoveSecurity = (item: Security) => {
    Alert.alert('Удалить', `Удалить ${item.name}?`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await portfolioAPI.deleteSecurity(item.id);
            onUpdatePortfolio({
              ...portfolio,
              securities: portfolio.securities.filter((s) => s.id !== item.id),
            });
          } catch (e) {
            Alert.alert('Ошибка', 'Не удалось удалить');
          }
        },
      },
    ]);
  };

  const handleRemoveRealEstate = (item: RealEstate) => {
    Alert.alert('Удалить', `Удалить ${item.name}?`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await portfolioAPI.deleteRealEstate(item.id);
            onUpdatePortfolio({
              ...portfolio,
              realEstate: portfolio.realEstate.filter((re) => re.id !== item.id),
            });
          } catch (e) {
            Alert.alert('Ошибка', 'Не удалось удалить');
          }
        },
      },
    ]);
  };

  const handleRemoveDeposit = (item: Deposit) => {
    Alert.alert('Удалить', `Удалить ${item.name}?`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await portfolioAPI.deleteDeposit(item.id);
            onUpdatePortfolio({
              ...portfolio,
              deposits: portfolio.deposits.filter((d) => d.id !== item.id),
            });
          } catch (e) {
            Alert.alert('Ошибка', 'Не удалось удалить');
          }
        },
      },
    ]);
  };

  const handleRemoveCrypto = (item: Crypto) => {
    Alert.alert('Удалить', `Удалить ${item.name}?`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await portfolioAPI.deleteCryptocurrency(item.id);
            onUpdatePortfolio({
              ...portfolio,
              cryptocurrencies: portfolio.cryptocurrencies.filter((c) => c.id !== item.id),
            });
          } catch (e) {
            Alert.alert('Ошибка', 'Не удалось удалить');
          }
        },
      },
    ]);
  };

  const renderAssetCard = (
    title: string,
    value: string,
    sub: string,
    onRemove: () => void
  ) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{value}</Text>
      </View>
      <Text style={styles.cardSub}>{sub}</Text>
      <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
        <Text style={styles.removeBtnText}>Удалить</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDashboard = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Дашборд</Text>
        {(dailyPnL !== 0 || alerts.length > 0) && (
          <View style={styles.dashboardHighlights}>
            {dailyPnL !== 0 && (
              <View style={styles.highlightRow}>
                <Text style={styles.k}>Дневной P&L</Text>
                <Text style={[styles.v, dailyPnL >= 0 ? styles.positive : styles.negative]}>
                  {dailyPnL >= 0 ? '+' : ''}{formatCurrencyRub(dailyPnL)}
                </Text>
              </View>
            )}
            {alerts.length > 0 && (
              <View style={styles.alertSection}>
                <Text style={styles.alertTitle}>Алерты (изменение ≥{alertThreshold}%)</Text>
                {alerts.slice(0, 5).map((a) => (
                  <Text key={a.id} style={styles.alertItem}>
                    {a.title}: {a.changePercent >= 0 ? '+' : ''}{a.changePercent.toFixed(1)}%
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}
        <View style={styles.kv}>
          <Text style={styles.k}>Активов (бумаг)</Text>
          <Text style={styles.v}>{portfolio.securities.length}</Text>
          <Text style={styles.k}>Недвижимость</Text>
          <Text style={styles.v}>{portfolio.realEstate.length}</Text>
          <Text style={styles.k}>Депозиты</Text>
          <Text style={styles.v}>{portfolio.deposits.length}</Text>
          <Text style={styles.k}>Крипто</Text>
          <Text style={styles.v}>{portfolio.cryptocurrencies.length}</Text>
          <Text style={styles.k}>Курсы</Text>
          <Text style={styles.v}>USD {r.USD_RUB.toFixed(2)} • EUR {r.EUR_RUB.toFixed(2)}</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderAssets = () => (
    <ScrollView style={styles.tabContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4facfe" />}>
      {onAddSecurity && (
        <TouchableOpacity style={styles.addBtn} onPress={onAddSecurity}>
          <Text style={styles.addBtnText}>+ Ценная бумага</Text>
        </TouchableOpacity>
      )}
      {onAddRealEstate && (
        <TouchableOpacity style={styles.addBtn} onPress={onAddRealEstate}>
          <Text style={styles.addBtnText}>+ Недвижимость</Text>
        </TouchableOpacity>
      )}
      {onAddDeposit && (
        <TouchableOpacity style={styles.addBtn} onPress={onAddDeposit}>
          <Text style={styles.addBtnText}>+ Депозит</Text>
        </TouchableOpacity>
      )}
      {onAddCrypto && (
        <TouchableOpacity style={styles.addBtn} onPress={onAddCrypto}>
          <Text style={styles.addBtnText}>+ Криптовалюта</Text>
        </TouchableOpacity>
      )}

      {portfolio.securities.map((s) =>
        renderAssetCard(
          s.name,
          formatCurrency(s.currentPrice * s.quantity, s.currency),
          `${s.ticker} • ${s.quantity} шт.`,
          () => handleRemoveSecurity(s)
        )
      )}
      {portfolio.realEstate.map((re) =>
        renderAssetCard(re.name, formatCurrency(re.currentValue), re.location, () => handleRemoveRealEstate(re))
      )}
      {portfolio.deposits.map((d) =>
        renderAssetCard(d.name, formatCurrency(d.amount, d.currency), `${d.bank} • ${d.interestRate}%`, () => handleRemoveDeposit(d))
      )}
      {portfolio.cryptocurrencies.map((c) =>
        renderAssetCard(c.name, formatCurrency(c.currentPrice * c.amount, 'USD'), `${c.symbol} • ${c.amount}`, () => handleRemoveCrypto(c))
      )}
    </ScrollView>
  );

  const renderCharts = () => (
    <PortfolioCharts portfolio={portfolio} rates={r} />
  );

  const renderTabContent = () => {
    switch (tab) {
      case 'dashboard':
        return renderDashboard();
      case 'assets':
        return renderAssets();
      case 'charts':
        return renderCharts();
      case 'allocation':
        return (
          <AllocationPanel
            portfolio={portfolio}
            rates={r}
            targets={targets}
            onChangeTargets={setTargets}
          />
        );
      case 'dividends':
        return <DividendsPanel portfolio={portfolio} rates={r} />;
      case 'income':
        return <IncomePanel portfolio={portfolio} rates={r} />;
      case 'goals':
        return <GoalsPanel userId={user.id} />;
      case 'watchlist':
        return <WatchlistPanel userId={user.id} />;
      case 'dca':
        return <DCAPanel currentPortfolioValue={totalValue} />;
      case 'scenarios':
        return <ScenariosPanel portfolio={portfolio} rates={r} />;
      case 'checklist':
        return <ChecklistPanel userId={user.id} />;
      case 'notes':
        return <NotesPanel userId={user.id} />;
      case 'tools':
        return <ToolsPanel portfolio={portfolio} userName={user.name} />;
      case 'transactions':
        return (
          <TransactionsPanel
            securities={portfolio.securities}
            onRefresh={onRefresh}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, theme === 'light' && styles.containerLight]} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Мой инвестиционный портфель</Text>
          <View style={styles.userRow}>
            {onThemeToggle && (
              <TouchableOpacity style={styles.themeBtn} onPress={onThemeToggle}>
                <Text>{theme === 'dark' ? '☀️' : '🌙'}</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.userName}>👤 {user.name}</Text>
            <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Выйти</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={[styles.statCard, styles.statPortfolio]}>
          <Text style={styles.statLabel}>Общая стоимость</Text>
          <Text style={styles.statValue}>
            {totalValue.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
          </Text>
        </View>
        <View style={[styles.statCard, styles.statIncome]}>
          <Text style={styles.statLabel}>Месячный доход</Text>
          <Text style={[styles.statValue, styles.incomeValue]}>
            {monthlyIncome.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContainer}
      >
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{TAB_LABELS[t]}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.content}>{renderTabContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1729' },
  containerLight: { backgroundColor: '#eae6e0' },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(79, 172, 254, 0.2)',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#e0e0e0', marginBottom: 8 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  themeBtn: { padding: 12, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  userName: { fontSize: 14, color: '#e0e0e0' },
  logoutBtn: { marginLeft: 'auto', paddingVertical: 10, paddingHorizontal: 16, minHeight: 44, justifyContent: 'center' },
  logoutText: { color: '#ff5252', fontSize: 16, fontWeight: '600' },
  stats: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statPortfolio: {
    backgroundColor: 'rgba(26, 39, 68, 1)',
    borderColor: 'rgba(79, 172, 254, 0.3)',
  },
  statIncome: {
    backgroundColor: 'rgba(26, 58, 46, 0.8)',
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  statLabel: { fontSize: 12, color: '#9e9e9e', marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '700', color: '#4facfe' },
  incomeValue: { color: '#4caf50' },
  positive: { color: '#4caf50' },
  negative: { color: '#ff5252' },
  dashboardHighlights: { marginBottom: 16 },
  highlightRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  alertSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  alertTitle: { fontSize: 14, color: '#ff9800', fontWeight: '600', marginBottom: 8 },
  alertItem: { fontSize: 13, color: '#e0e0e0', marginBottom: 4 },
  tabsScroll: { maxHeight: 56 },
  tabsContainer: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    minHeight: 44,
    borderRadius: 10,
    marginRight: 8,
    justifyContent: 'center',
  },
  tabActive: { backgroundColor: 'rgba(79, 172, 254, 0.2)' },
  tabText: { fontSize: 15, color: '#888' },
  tabTextActive: { color: '#4facfe', fontWeight: '600' },
  content: { flex: 1, padding: 16 },
  tabContent: { flex: 1 },
  panel: {
    backgroundColor: 'rgba(26, 31, 58, 0.8)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
  panelTitle: { fontSize: 18, fontWeight: '600', color: '#e0e0e0', marginBottom: 16 },
  kv: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  k: { fontSize: 14, color: '#9e9e9e', width: '45%' },
  v: { fontSize: 14, color: '#4facfe', fontWeight: '600', width: '45%' },
  muted: { fontSize: 14, color: '#888', marginTop: 12 },
  addBtn: {
    marginBottom: 12,
    padding: 20,
    minHeight: 56,
    backgroundColor: 'rgba(79, 172, 254, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.4)',
  },
  addBtnText: { color: '#4facfe', fontSize: 17, fontWeight: '600' },
  card: {
    backgroundColor: 'rgba(26, 31, 58, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#e0e0e0', flex: 1 },
  cardValue: { fontSize: 16, fontWeight: '700', color: '#4facfe' },
  cardSub: { fontSize: 13, color: '#888', marginTop: 6 },
  removeBtn: { marginTop: 14, paddingVertical: 10, paddingHorizontal: 16, alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  removeBtnText: { color: '#ff5252', fontSize: 16 },
});
