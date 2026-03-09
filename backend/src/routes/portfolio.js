import express from 'express';
import { body } from 'express-validator';
import {
  getPortfolio,
  addSecurity,
  updateSecurity,
  deleteSecurity,
  addRealEstate,
  updateRealEstate,
  deleteRealEstate,
  addDeposit,
  updateDeposit,
  deleteDeposit,
  addCryptocurrency,
  updateCryptocurrency,
  deleteCryptocurrency
} from '../controllers/portfolioController.js';
import {
  getTransactions,
  addTransaction,
  deleteTransaction,
} from '../controllers/transactionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Все routes требуют авторизацию
router.use(authenticateToken);

// Получить весь портфель
router.get('/', getPortfolio);

// История сделок
router.get('/transactions', getTransactions);
router.post('/transactions',
  [
    body('ticker').notEmpty().withMessage('Тикер обязателен'),
    body('name').notEmpty().withMessage('Название обязательно'),
    body('type').isIn(['buy', 'sell']).withMessage('Тип: buy или sell'),
    body('quantity').isInt({ min: 1 }).withMessage('Количество целое > 0'),
    body('pricePerUnit').isFloat({ min: 0 }).withMessage('Цена за единицу'),
    body('currency').isIn(['RUB', 'USD', 'EUR']).withMessage('Валюта: RUB, USD или EUR'),
    body('tradeDate').notEmpty().withMessage('Дата сделки обязательна'),
  ],
  addTransaction
);
router.delete('/transactions/:id', deleteTransaction);

// Ценные бумаги
router.post('/securities', addSecurity);
router.put('/securities/:id', updateSecurity);
router.delete('/securities/:id', deleteSecurity);

// Недвижимость
router.post('/real-estate', addRealEstate);
router.put('/real-estate/:id', updateRealEstate);
router.delete('/real-estate/:id', deleteRealEstate);

// Депозиты
router.post('/deposits', addDeposit);
router.put('/deposits/:id', updateDeposit);
router.delete('/deposits/:id', deleteDeposit);

// Криптовалюты
router.post('/cryptocurrencies', addCryptocurrency);
router.put('/cryptocurrencies/:id', updateCryptocurrency);
router.delete('/cryptocurrencies/:id', deleteCryptocurrency);

export default router;

