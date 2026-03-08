import { useState, useEffect, useCallback } from 'react';
import { Portfolio } from './components/Portfolio';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { Portfolio as PortfolioType, User, EMPTY_PORTFOLIO } from './types';
import { authAPI, portfolioAPI, AUTH_UNAUTHORIZED_EVENT } from './services/api';
import './App.css';

type AuthView = 'login' | 'register' | 'portfolio';

async function loadUserAndPortfolio(): Promise<{ user: User; portfolio: PortfolioType }> {
  const [userData, portfolioData] = await Promise.all([
    authAPI.getMe(),
    portfolioAPI.getPortfolio(),
  ]);
  return { user: userData, portfolio: portfolioData };
}

function App() {
  const [authView, setAuthView] = useState<AuthView>('login');
  const [portfolio, setPortfolio] = useState<PortfolioType>(EMPTY_PORTFOLIO);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
        />
      )}
      
      {authView === 'register' && (
        <RegisterForm 
          onSuccess={handleAuthSuccess}
          onSwitchToLogin={() => setAuthView('login')}
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

