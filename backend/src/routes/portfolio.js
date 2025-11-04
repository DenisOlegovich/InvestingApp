import express from 'express';
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
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Все routes требуют авторизацию
router.use(authenticateToken);

// Получить весь портфель
router.get('/', getPortfolio);

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

