import Goals from '../models/Goals.js';
import Transactions from '../models/Transactions.js';
import RiskProfile from '../models/RiskProfile.js';
import Alerts from '../models/Alerts.js';
import Watchlist from '../models/Watchlist.js';
import InvestDiary from '../models/InvestDiary.js';
import DividendPayments from '../models/DividendPayments.js';
import BondCoupons from '../models/BondCoupons.js';

export const getGoals = (req, res) => {
  try {
    const data = Goals.getAll(req.user.id);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка получения целей' });
  }
};

export const createGoal = (req, res) => {
  try {
    const id = Goals.create(req.user.id, req.body);
    res.status(201).json({ id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка создания цели' });
  }
};

export const updateGoal = (req, res) => {
  try {
    Goals.update(req.params.id, req.user.id, req.body);
    res.json({ message: 'Цель обновлена' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка обновления цели' });
  }
};

export const deleteGoal = (req, res) => {
  try {
    Goals.delete(req.params.id, req.user.id);
    res.json({ message: 'Цель удалена' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка удаления цели' });
  }
};

export const getTransactions = (req, res) => {
  try {
    const data = Transactions.getAll(req.user.id, { assetType: req.query.assetType, limit: 500 });
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка получения транзакций' });
  }
};

export const createTransaction = (req, res) => {
  try {
    const id = Transactions.create(req.user.id, req.body);
    res.status(201).json({ id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка создания транзакции' });
  }
};

export const deleteTransaction = (req, res) => {
  try {
    Transactions.delete(req.params.id, req.user.id);
    res.json({ message: 'Транзакция удалена' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка удаления транзакции' });
  }
};

export const getRiskProfile = (req, res) => {
  try {
    const data = RiskProfile.getByUserId(req.user.id);
    res.json(data || {});
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка получения риск-профиля' });
  }
};

export const upsertRiskProfile = (req, res) => {
  try {
    RiskProfile.upsert(req.user.id, req.body);
    res.json({ message: 'Риск-профиль сохранён' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка сохранения риск-профиля' });
  }
};

export const getAlerts = (req, res) => {
  try {
    const data = Alerts.getAll(req.user.id);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка получения алертов' });
  }
};

export const createAlert = (req, res) => {
  try {
    const id = Alerts.create(req.user.id, req.body);
    res.status(201).json({ id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка создания алерта' });
  }
};

export const updateAlert = (req, res) => {
  try {
    Alerts.update(req.params.id, req.user.id, req.body);
    res.json({ message: 'Алерт обновлён' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка обновления алерта' });
  }
};

export const deleteAlert = (req, res) => {
  try {
    Alerts.delete(req.params.id, req.user.id);
    res.json({ message: 'Алерт удалён' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка удаления алерта' });
  }
};

export const getWatchlist = (req, res) => {
  try {
    const data = Watchlist.getAll(req.user.id);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка получения watchlist' });
  }
};

export const createWatchlistItem = (req, res) => {
  try {
    const id = Watchlist.create(req.user.id, req.body);
    res.status(201).json({ id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка создания элемента' });
  }
};

export const updateWatchlistItem = (req, res) => {
  try {
    Watchlist.update(req.params.id, req.user.id, req.body);
    res.json({ message: 'Элемент обновлён' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка обновления' });
  }
};

export const deleteWatchlistItem = (req, res) => {
  try {
    Watchlist.delete(req.params.id, req.user.id);
    res.json({ message: 'Элемент удалён' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка удаления' });
  }
};

export const getInvestDiary = (req, res) => {
  try {
    const data = InvestDiary.getAll(req.user.id, 100);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка получения дневника' });
  }
};

export const createDiaryEntry = (req, res) => {
  try {
    const id = InvestDiary.create(req.user.id, req.body);
    res.status(201).json({ id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка создания записи' });
  }
};

export const deleteDiaryEntry = (req, res) => {
  try {
    InvestDiary.delete(req.params.id, req.user.id);
    res.json({ message: 'Запись удалена' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка удаления' });
  }
};

export const getDividendPayments = (req, res) => {
  try {
    const data = DividendPayments.getAll(req.user.id);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка получения выплат' });
  }
};

export const createDividendPayment = (req, res) => {
  try {
    const id = DividendPayments.create(req.user.id, req.body);
    res.status(201).json({ id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка создания выплаты' });
  }
};

export const deleteDividendPayment = (req, res) => {
  try {
    DividendPayments.delete(req.params.id, req.user.id);
    res.json({ message: 'Выплата удалена' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка удаления' });
  }
};

export const getBondCoupons = (req, res) => {
  try {
    const data = BondCoupons.getAll(req.user.id);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка получения купонов' });
  }
};

export const createBondCoupon = (req, res) => {
  try {
    const id = BondCoupons.create(req.user.id, req.body);
    res.status(201).json({ id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка создания купона' });
  }
};

export const deleteBondCoupon = (req, res) => {
  try {
    BondCoupons.delete(req.params.id, req.user.id);
    res.json({ message: 'Купон удалён' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка удаления' });
  }
};
