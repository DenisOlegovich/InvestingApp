import Portfolio from '../models/Portfolio.js';
import type { AuthRequest } from '../types/index.js';
import type { Response } from 'express';

export const getPortfolio = (req: AuthRequest, res: Response): void | Response => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
    const portfolio = Portfolio.getByUserId(req.user.id);
    res.json(portfolio);
  } catch (error) {
    console.error('Ошибка получения портфеля:', error);
    res.status(500).json({ error: 'Ошибка при получении портфеля' });
  }
};

export const addSecurity = (req: AuthRequest, res: Response): void | Response => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
    const securityId = Portfolio.addSecurity(req.user.id, req.body);
    res.status(201).json({ message: 'Ценная бумага добавлена', id: securityId.toString() });
  } catch (error) {
    console.error('Ошибка добавления ценной бумаги:', error);
    res.status(500).json({ error: 'Ошибка при добавлении ценной бумаги' });
  }
};

export const updateSecurity = (req: AuthRequest, res: Response): void | Response => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
    Portfolio.updateSecurity(String(req.params.id), req.user.id, req.body);
    res.json({ message: 'Ценная бумага обновлена' });
  } catch (error) {
    console.error('Ошибка обновления ценной бумаги:', error);
    res.status(500).json({ error: 'Ошибка при обновлении ценной бумаги' });
  }
};

export const deleteSecurity = (req: AuthRequest, res: Response): void | Response => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
    Portfolio.deleteSecurity(String(req.params.id), req.user.id);
    res.json({ message: 'Ценная бумага удалена' });
  } catch (error) {
    console.error('Ошибка удаления ценной бумаги:', error);
    res.status(500).json({ error: 'Ошибка при удалении ценной бумаги' });
  }
};

export const addRealEstate = (req: AuthRequest, res: Response): void | Response => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
    const id = Portfolio.addRealEstate(req.user.id, req.body);
    res.status(201).json({ message: 'Недвижимость добавлена', id: id.toString() });
  } catch (error) {
    console.error('Ошибка добавления недвижимости:', error);
    res.status(500).json({ error: 'Ошибка при добавлении недвижимости' });
  }
};

export const updateRealEstate = (req: AuthRequest, res: Response): void | Response => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
    Portfolio.updateRealEstate(String(req.params.id), req.user.id, req.body);
    res.json({ message: 'Недвижимость обновлена' });
  } catch (error) {
    console.error('Ошибка обновления недвижимости:', error);
    res.status(500).json({ error: 'Ошибка при обновлении недвижимости' });
  }
};

export const deleteRealEstate = (req: AuthRequest, res: Response): void | Response => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
    Portfolio.deleteRealEstate(String(req.params.id), req.user.id);
    res.json({ message: 'Недвижимость удалена' });
  } catch (error) {
    console.error('Ошибка удаления недвижимости:', error);
    res.status(500).json({ error: 'Ошибка при удалении недвижимости' });
  }
};

export const addDeposit = (req: AuthRequest, res: Response): void | Response => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
    const id = Portfolio.addDeposit(req.user.id, req.body);
    res.status(201).json({ message: 'Депозит добавлен', id: id.toString() });
  } catch (error) {
    console.error('Ошибка добавления депозита:', error);
    res.status(500).json({ error: 'Ошибка при добавлении депозита' });
  }
};

export const updateDeposit = (req: AuthRequest, res: Response): void | Response => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
    Portfolio.updateDeposit(String(req.params.id), req.user.id, req.body);
    res.json({ message: 'Депозит обновлен' });
  } catch (error) {
    console.error('Ошибка обновления депозита:', error);
    res.status(500).json({ error: 'Ошибка при обновлении депозита' });
  }
};

export const deleteDeposit = (req: AuthRequest, res: Response): void | Response => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
    Portfolio.deleteDeposit(String(req.params.id), req.user.id);
    res.json({ message: 'Депозит удален' });
  } catch (error) {
    console.error('Ошибка удаления депозита:', error);
    res.status(500).json({ error: 'Ошибка при удалении депозита' });
  }
};

export const addCryptocurrency = (req: AuthRequest, res: Response): void | Response => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
    const id = Portfolio.addCryptocurrency(req.user.id, req.body);
    res.status(201).json({ message: 'Криптовалюта добавлена', id: id.toString() });
  } catch (error) {
    console.error('Ошибка добавления криптовалюты:', error);
    res.status(500).json({ error: 'Ошибка при добавлении криптовалюты' });
  }
};

export const updateCryptocurrency = (req: AuthRequest, res: Response): void | Response => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
    Portfolio.updateCryptocurrency(String(req.params.id), req.user.id, req.body);
    res.json({ message: 'Криптовалюта обновлена' });
  } catch (error) {
    console.error('Ошибка обновления криптовалюты:', error);
    res.status(500).json({ error: 'Ошибка при обновлении криптовалюты' });
  }
};

export const deleteCryptocurrency = (req: AuthRequest, res: Response): void | Response => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
    Portfolio.deleteCryptocurrency(String(req.params.id), req.user.id);
    res.json({ message: 'Криптовалюта удалена' });
  } catch (error) {
    console.error('Ошибка удаления криптовалюты:', error);
    res.status(500).json({ error: 'Ошибка при удалении криптовалюты' });
  }
};
