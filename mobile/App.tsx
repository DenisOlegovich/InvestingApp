import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';

import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from './src/screens/ResetPasswordScreen';
import { PortfolioScreen } from './src/screens/PortfolioScreen';
import { AddSecurityScreen } from './src/screens/AddSecurityScreen';
import { AddRealEstateScreen } from './src/screens/AddRealEstateScreen';
import { AddDepositScreen } from './src/screens/AddDepositScreen';
import { AddCryptoScreen } from './src/screens/AddCryptoScreen';

import { authAPI, portfolioAPI } from './src/services/api';
import type { Portfolio, User } from './src/types';
import { EMPTY_PORTFOLIO } from './src/types';

const Stack = createNativeStackNavigator();

async function loadUserAndPortfolio(): Promise<{ user: User; portfolio: Portfolio }> {
  const [user, portfolio] = await Promise.all([
    authAPI.getMe(),
    portfolioAPI.getPortfolio(),
  ]);
  return { user, portfolio };
}

export default function App() {
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot-password' | 'reset-password' | 'portfolio'>('login');
  const [resetToken, setResetToken] = useState('');
  const [portfolio, setPortfolio] = useState<Portfolio>(EMPTY_PORTFOLIO);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const handleAuthSuccess = useCallback(async () => {
    try {
      const { user: u, portfolio: p } = await loadUserAndPortfolio();
      setUser(u);
      setPortfolio(p);
      setAuthView('portfolio');
    } catch (e) {
      setAuthView('login');
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          await handleAuthSuccess();
        } else {
          setAuthView('login');
        }
      } catch {
        setAuthView('login');
      }
      setLoading(false);
    })();
  }, [handleAuthSuccess]);

  const handleLogout = useCallback(async () => {
    await authAPI.logout();
    setUser(null);
    setPortfolio(EMPTY_PORTFOLIO);
    setAuthView('login');
  }, []);

  const handleUpdatePortfolio = useCallback((p: Portfolio) => {
    setPortfolio(p);
  }, []);

  const refreshPortfolio = useCallback(async () => {
    try {
      const p = await portfolioAPI.getPortfolio();
      setPortfolio(p);
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4facfe" />
        <Text style={styles.loadingText}>Загрузка...</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  if (authView === 'login') {
    return (
      <>
        <LoginScreen
          onSuccess={handleAuthSuccess}
          onSwitchToRegister={() => setAuthView('register')}
          onSwitchToForgotPassword={() => setAuthView('forgot-password')}
        />
        <StatusBar style="light" />
      </>
    );
  }

  if (authView === 'register') {
    return (
      <>
        <RegisterScreen
          onSuccess={handleAuthSuccess}
          onSwitchToLogin={() => setAuthView('login')}
        />
        <StatusBar style="light" />
      </>
    );
  }

  if (authView === 'forgot-password') {
    return (
      <>
        <ForgotPasswordScreen
          onSuccess={(msg, token) => {
            if (token) {
              setResetToken(token);
              setAuthView('reset-password');
            } else {
              Alert.alert('Информация', msg);
              setAuthView('login');
            }
          }}
          onSwitchToLogin={() => setAuthView('login')}
        />
        <StatusBar style="light" />
      </>
    );
  }

  if (authView === 'reset-password' && resetToken) {
    return (
      <>
        <ResetPasswordScreen
          token={resetToken}
          onSuccess={() => {
            setResetToken('');
            setAuthView('login');
            Alert.alert('Успех', 'Пароль изменён');
          }}
          onSwitchToLogin={() => {
            setResetToken('');
            setAuthView('login');
          }}
        />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: '#4facfe',
          background: '#0f1729',
          card: '#0f1729',
          text: '#e0e0e0',
          border: 'rgba(79, 172, 254, 0.2)',
          notification: '#1976d2',
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0f1729' },
          headerTintColor: '#e0e0e0',
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="Portfolio" options={{ headerShown: false }}>
          {({ navigation }) =>
            user ? (
              <PortfolioScreen
                portfolio={portfolio}
                onUpdatePortfolio={handleUpdatePortfolio}
                user={user}
                onLogout={handleLogout}
                onAddSecurity={() => navigation.navigate('AddSecurity')}
                onAddRealEstate={() => navigation.navigate('AddRealEstate')}
                onAddDeposit={() => navigation.navigate('AddDeposit')}
                onAddCrypto={() => navigation.navigate('AddCrypto')}
                theme={theme}
                onThemeToggle={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              />
            ) : null
          }
        </Stack.Screen>
        <Stack.Screen name="AddSecurity" options={{ title: 'Добавить бумагу', presentation: 'modal' }}>
          {({ navigation }) => (
            <AddSecurityScreen
              onAdded={() => {
                refreshPortfolio();
                navigation.goBack();
              }}
              onCancel={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="AddRealEstate" options={{ title: 'Добавить недвижимость', presentation: 'modal' }}>
          {({ navigation }) => (
            <AddRealEstateScreen
              onAdded={() => {
                refreshPortfolio();
                navigation.goBack();
              }}
              onCancel={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="AddDeposit" options={{ title: 'Добавить депозит', presentation: 'modal' }}>
          {({ navigation }) => (
            <AddDepositScreen
              onAdded={() => {
                refreshPortfolio();
                navigation.goBack();
              }}
              onCancel={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="AddCrypto" options={{ title: 'Добавить криптовалюту', presentation: 'modal' }}>
          {({ navigation }) => (
            <AddCryptoScreen
              onAdded={() => {
                refreshPortfolio();
                navigation.goBack();
              }}
              onCancel={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f1729',
  },
  loadingText: {
    color: '#888',
    marginTop: 12,
  },
});
