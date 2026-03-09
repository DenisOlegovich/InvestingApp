import { useState, useEffect, useCallback } from 'react';
import { Portfolio } from './components/Portfolio';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { ForgotPasswordForm } from './components/Auth/ForgotPasswordForm';
import { ResetPasswordForm } from './components/Auth/ResetPasswordForm';
import { Portfolio as PortfolioType, User, EMPTY_PORTFOLIO } from './types';
import { authAPI, portfolioAPI, AUTH_UNAUTHORIZED_EVENT } from './services/api';
import './App.css';

type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'portfolio';

async function loadUserAndPortfolio(): Promise<{ user: User; portfolio: PortfolioType }> {
  const [userData, portfolioData] = await Promise.all([
    authAPI.getMe(),
    portfolioAPI.getPortfolio(),
  ]);
  return { user: userData, portfolio: portfolioData };
}

function App() {
  const [authView, setAuthView] = useState<AuthView>('login');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioType>(EMPTY_PORTFOLIO);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setResetToken(token);
      setAuthView('reset-password');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleAuthSuccess = useCallback(async () => {
    try {
      const { user: userData, portfolio: portfolioData } = await loadUserAndPortfolio();
      setUser(userData);
      setPortfolio(portfolioData);
      setAuthView('portfolio');
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          await handleAuthSuccess();
        } catch {
          setAuthView('login');
        }
      } else {
        setAuthView('login');
      }
      setLoading(false);
    };
    checkAuth();
  }, [handleAuthSuccess]);

  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      setPortfolio(EMPTY_PORTFOLIO);
      setAuthView('login');
    };
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setPortfolio(EMPTY_PORTFOLIO);
    setAuthView('login');
  };

  const handleUpdatePortfolio = (newPortfolio: PortfolioType) => {
    setPortfolio(newPortfolio);
    // Данные синхронизируются через API при каждом действии
  };

  if (loading) {
    return (
      <div className="app">
        <div className="app-loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="app">
      {authView === 'login' && (
        <LoginForm
          onSuccess={handleAuthSuccess}
          onSwitchToRegister={() => setAuthView('register')}
          onSwitchToForgotPassword={() => setAuthView('forgot-password')}
        />
      )}

      {authView === 'register' && (
        <RegisterForm
          onSuccess={handleAuthSuccess}
          onSwitchToLogin={() => setAuthView('login')}
        />
      )}

      {authView === 'forgot-password' && (
        <ForgotPasswordForm
          onSuccess={(msg, token) => {
            if (token) {
              setResetToken(token);
              setAuthView('reset-password');
            } else {
              alert(msg);
              setAuthView('login');
            }
          }}
          onSwitchToLogin={() => setAuthView('login')}
        />
      )}

      {authView === 'reset-password' && resetToken && (
        <ResetPasswordForm
          token={resetToken}
          onSuccess={() => {
            setResetToken(null);
            setAuthView('login');
          }}
          onSwitchToLogin={() => {
            setResetToken(null);
            setAuthView('login');
          }}
        />
      )}

      {authView === 'portfolio' && user && (
        <Portfolio 
          portfolio={portfolio} 
          onUpdatePortfolio={handleUpdatePortfolio}
          user={user}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;

