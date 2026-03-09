import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe, forgotPassword, resetPassword } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Регистрация
router.post('/register',
  [
    body('email').isEmail().withMessage('Неверный формат email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен быть минимум 6 символов'),
    body('name').notEmpty().withMessage('Имя обязательно')
  ],
  register
);

// Вход
router.post('/login',
  [
    body('email').isEmail().withMessage('Неверный формат email'),
    body('password').notEmpty().withMessage('Пароль обязателен')
  ],
  login
);

// Получить текущего пользователя
router.get('/me', authenticateToken, getMe);

// Забыли пароль
router.post('/forgot-password',
  [body('email').isEmail().withMessage('Неверный формат email')],
  forgotPassword
);

// Сброс пароля по токену
router.post('/reset-password',
  [
    body('token').notEmpty().withMessage('Токен обязателен'),
    body('newPassword').isLength({ min: 6 }).withMessage('Пароль должен быть минимум 6 символов'),
  ],
  resetPassword
);

export default router;

