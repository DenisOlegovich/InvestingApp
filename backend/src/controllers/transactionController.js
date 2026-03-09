import { validationResult } from 'express-validator';
import Transaction from '../models/Transaction.js';

export const getTransactions = (req, res) => {
  try {
    const transactions = Transaction.getAllByUserId(req.user.id);
    res.json(transactions);
  } catch (error) {
    console.error('Ошибка получения сделок:', error);
    res.status(500).json({ error: 'Ошибка при получении сделок' });
  }
};

export const addTransaction = (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      securityId,
      ticker,
      name,
      type,
      quantity,
      pricePerUnit,
      total,
      currency,
      tradeDate,
    } = req.body;

    if (!ticker || !name || !type || !quantity || !pricePerUnit || !currency || !tradeDate) {
      return res.status(400).json({ error: 'Необходимы: ticker, name, type, quantity, pricePerUnit, currency, tradeDate' });
    }

    const totalVal = total ?? quantity * pricePerUnit;
    const id = Transaction.create(req.user.id, {
      securityId: securityId || null,
      ticker,
      name,
      type,
      quantity: parseInt(quantity, 10),
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

export const deleteTransaction = (req, res) => {
  try {
    Transaction.delete(req.params.id, req.user.id);
    res.json({ message: 'Сделка удалена' });
  } catch (error) {
    console.error('Ошибка удаления сделки:', error);
    res.status(500).json({ error: 'Ошибка при удалении сделки' });
  }
};
