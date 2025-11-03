import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe } from '../controllers/authController.js';
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

export default router;

