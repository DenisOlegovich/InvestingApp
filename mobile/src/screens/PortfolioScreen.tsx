import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Portfolio, Security, User } from '../types';
import { portfolioAPI } from '../services/api';
import { formatCurrency } from '../utils/format';

interface Props {
  portfolio: Portfolio;
  onUpdatePortfolio: (p: Portfolio) => void;
  user: User;
  onLogout: () => void;
  onAddSecurity?: () => void;
}

type Tab = 'securities' | 'deposits' | 'crypto';

export function PortfolioScreen({ portfolio, onUpdatePortfolio, user, onLogout, onAddSecurity }: Props) {
  const [tab, setTab] = useState<Tab>('securities');
  const [refreshing, setRefreshing] = useState(false);

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
    await loadPortfolio();
    setRefreshing(false);
  };

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

  const totalValue =
    portfolio.securities.reduce((s, i) => s + i.currentPrice * i.quantity, 0) +
    portfolio.deposits.reduce((s, i) => s + i.amount, 0) +
    portfolio.cryptocurrencies.reduce((s, i) => s + i.currentPrice * i.amount, 0);

  const renderSecurity = ({ item }: { item: Security }) => {
    const value = item.currentPrice * item.quantity;
    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardValue}>{formatCurrency(value, item.currency)}</Text>
        </View>
        <Text style={styles.cardSub}>{item.ticker} • {item.quantity} шт.</Text>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => handleRemoveSecurity(item)}
        >
          <Text style={styles.removeBtnText}>Удалить</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderDeposit = ({ item }: { item: Portfolio['deposits'][0] }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardValue}>{formatCurrency(item.amount, item.currency)}</Text>
      </View>
      <Text style={styles.cardSub}>{item.bank} • {item.interestRate}% год.</Text>
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => {
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
        }}
      >
        <Text style={styles.removeBtnText}>Удалить</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCrypto = ({ item }: { item: Portfolio['cryptocurrencies'][0] }) => {
    const value = item.currentPrice * item.amount;
    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardValue}>{formatCurrency(value, 'USD')}</Text>
        </View>
        <Text style={styles.cardSub}>{item.symbol} • {item.amount}</Text>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => {
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
          }}
        >
          <Text style={styles.removeBtnText}>Удалить</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const listData =
    tab === 'securities'
      ? portfolio.securities
      : tab === 'deposits'
        ? portfolio.deposits
        : portfolio.cryptocurrencies;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Привет, {user.name}</Text>
          <Text style={styles.total}>Всего: {formatCurrency(totalValue)}</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Выход</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {(['securities', 'deposits', 'crypto'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'securities' ? 'Акции' : t === 'deposits' ? 'Депозиты' : 'Крипто'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          tab === 'securities' && onAddSecurity ? (
            <TouchableOpacity style={styles.addBtn} onPress={onAddSecurity}>
              <Text style={styles.addBtnText}>+ Добавить ценную бумагу</Text>
            </TouchableOpacity>
          ) : null
        }
        renderItem={
          tab === 'securities'
            ? renderSecurity
            : tab === 'deposits'
              ? renderDeposit
              : renderCrypto
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4facfe" />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Пока ничего нет</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1729',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(79, 172, 254, 0.2)',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e0e0e0',
  },
  total: {
    fontSize: 14,
    color: '#4facfe',
    marginTop: 4,
  },
  logoutBtn: {
    padding: 8,
  },
  logoutText: {
    color: '#ff5252',
    fontSize: 14,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: 'rgba(79, 172, 254, 0.2)',
  },
  tabText: {
    color: '#888',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#4facfe',
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(26, 31, 58, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e0e0',
    flex: 1,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4facfe',
  },
  cardSub: {
    fontSize: 13,
    color: '#888',
    marginTop: 6,
  },
  removeBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  removeBtnText: {
    color: '#ff5252',
    fontSize: 14,
  },
  addBtn: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    backgroundColor: 'rgba(79, 172, 254, 0.2)',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.4)',
  },
  addBtnText: {
    color: '#4facfe',
    fontSize: 16,
    fontWeight: '600',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
});
