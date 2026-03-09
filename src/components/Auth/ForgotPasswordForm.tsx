import { useState } from 'react';
import { authAPI } from '../../services/api';
import './AuthForms.css';

interface ForgotPasswordFormProps {
  onSuccess: (msg: string, token?: string) => void;
  onSwitchToLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authAPI.forgotPassword(email);
      const msg = data.message;
      onSuccess(msg, data.resetToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка запроса');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <h2>Восстановление пароля</h2>
        <p className="auth-form-hint">Введите email, указанный при регистрации</p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Отправка...' : 'Отправить ссылку'}
          </button>
        </form>
        <div className="auth-switch">
          <span>Вспомнили пароль? </span>
          <button onClick={onSwitchToLogin}>Войти</button>
        </div>
      </div>
    </div>
  );
};
