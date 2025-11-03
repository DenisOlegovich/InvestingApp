import { useState, useEffect } from 'react';
import { Portfolio } from './components/Portfolio';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { Portfolio as PortfolioType } from './types';
import { authAPI, portfolioAPI } from './services/api';
import './App.css';

type AuthView = 'login' | 'register' | 'portfolio';

function App() {
  const [authView, setAuthView] = useState<AuthView>('login');
  const [portfolio, setPortfolio] = useState<PortfolioType>({
    securities: [],
    realEstate: [],
    deposits: [],
    cryptocurrencies: [],
  });
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Проверка авторизации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const userData = await authAPI.getMe();
          setUser(userData);
          setAuthView('portfolio');
          
          // Загрузить портфель с сервера
          const portfolioData = await portfolioAPI.getPortfolio();
          setPortfolio(portfolioData);
        } catch (error) {
          console.error('Ошибка авторизации:', error);
          localStorage.removeItem('authToken');
          setAuthView('login');
        }
      } else {
        setAuthView('login');
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleAuthSuccess = async () => {
    try {
      const userData = await authAPI.getMe();
      setUser(userData);
      
      // Загрузить портфель с сервера
      const portfolioData = await portfolioAPI.getPortfolio();
      setPortfolio(portfolioData);
      
      setAuthView('portfolio');
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setPortfolio({
      securities: [],
      realEstate: [],
      deposits: [],
      cryptocurrencies: [],
    });
    setAuthView('login');
  };

  const handleUpdatePortfolio = (newPortfolio: PortfolioType) => {
    setPortfolio(newPortfolio);
    // Данные синхронизируются через API при каждом действии
  };

  if (loading) {
    return (
      <div className="app">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: 'white',
          fontSize: '24px'
        }}>
          Загрузка...
        </div>
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

