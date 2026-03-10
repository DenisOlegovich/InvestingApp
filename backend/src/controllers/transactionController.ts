import { validationResult } from 'express-validator';
import Transaction from '../models/Transaction.js';
import type { AuthRequest } from '../types/index.js';
import type { Response } from 'express';

export const getTransactions = (req: AuthRequest, res: Response): void | Response => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
    const transactions = Transaction.getAllByUserId(req.user.id);
    res.json(transactions);
  } catch (error) {
    console.error('Ошибка получения сделок:', error);
    res.status(500).json({ error: 'Ошибка при получении сделок' });
  }
};

export const addTransaction = (req: AuthRequest, res: Response): void | Response => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { securityId, ticker, name, type, quantity, pricePerUnit, total, currency, tradeDate } = req.body;
    if (!ticker || !name || !type || !quantity || !pricePerUnit || !currency || !tradeDate) {
      return res.status(400).json({ error: 'Необходимы: ticker, name, type, quantity, pricePerUnit, currency, tradeDate' });
    }
    if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
    const totalVal = total ?? quantity * pricePerUnit;
    const id = Transaction.create(req.user.id, {
      securityId: securityId || null,
      ticker,
      name,
      type,
      quantity: parseInt(String(quantity), 10),
      pricePerUnit: parseFloat(pricePerUnit),
      total: parseFloat(totalVal),
      currency,
      tradeDate,
    });
    res.status(201).json({ id: String(id), message: 'Сделка добавлена' });
  } catch (error) {
    console.error('Ошибка добавления сделки:', error);
    res.status(500).json({ error: 'Ошибка при добавлении сделки' });
  }
};

export const deleteTransaction = (req: AuthRequest, res: Response): void | Response => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
    Transaction.delete(String(req.params.id), req.user.id);
    res.json({ message: 'Сделка удалена' });
  } catch (error) {
    console.error('Ошибка удаления сделки:', error);
    res.status(500).json({ error: 'Ошибка при удалении сделки' });
  }
};
