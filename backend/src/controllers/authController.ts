import crypto from 'crypto';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { validationResult } from 'express-validator';
import type { AuthRequest, ResetTokenData } from '../types/index.js';
import type { Response } from 'express';

const resetTokens = new Map<string, ResetTokenData>();

export const register = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password, name } = req.body;
    const existingUser = User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
    const userId = await User.create({ email, password, name });
    const user = User.findById(userId);
    if (!user) return res.status(500).json({ error: 'Ошибка при регистрации' });
    const token = generateToken(user);
    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const user = User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    const token = generateToken(user);
    res.json({
      message: 'Успешный вход',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка при входе' });
  }
};

export const getMe = (req: AuthRequest, res: Response): void | Response => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
    const user = User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({ error: 'Ошибка при получении профиля' });
  }
};

export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email } = req.body;
    const user = User.findByEmail(email);
    if (!user) {
      return res.json({ message: 'Если email существует, на него отправлена ссылка для сброса пароля' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 60 * 60 * 1000;
    resetTokens.set(email, { token, expires });
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    res.json({
      message: 'Если email существует, на него отправлена ссылка для сброса пароля',
      resetToken: process.env.NODE_ENV !== 'production' ? token : undefined,
      resetLink: process.env.NODE_ENV !== 'production' ? resetLink : undefined,
    });
  } catch (error) {
    console.error('Ошибка forgot-password:', error);
    res.status(500).json({ error: 'Ошибка при запросе сброса пароля' });
  }
};

export const resetPassword = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { token, newPassword } = req.body;
    let foundEmail: string | null = null;
    for (const [email, data] of resetTokens.entries()) {
      if (data.token === token && data.expires > Date.now()) {
        foundEmail = email;
        resetTokens.delete(email);
        break;
      }
    }
    if (!foundEmail) {
      return res.status(400).json({ error: 'Недействительная или просроченная ссылка сброса пароля' });
    }
    await User.updatePassword(foundEmail, newPassword);
    res.json({ message: 'Пароль успешно изменён. Можете войти с новым паролем.' });
  } catch (error) {
    console.error('Ошибка reset-password:', error);
    res.status(500).json({ error: 'Ошибка при сбросе пароля' });
  }
};
