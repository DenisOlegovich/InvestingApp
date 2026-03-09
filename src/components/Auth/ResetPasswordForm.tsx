import { useState } from 'react';
import { authAPI } from '../../services/api';
import './AuthForms.css';

interface ResetPasswordFormProps {
  token: string;
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  token,
  onSuccess,
  onSwitchToLogin,
}) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен быть минимум 6 символов');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сброса пароля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <h2>Новый пароль</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">Новый пароль</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm">Повторите пароль</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={6}
            />
          </div>
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Сохранение...' : 'Сохранить пароль'}
          </button>
        </form>
        <div className="auth-switch">
          <button onClick={onSwitchToLogin}>Вернуться к входу</button>
        </div>
      </div>
    </div>
  );
};
