import express from 'express';
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getTransactions,
  createTransaction,
  deleteTransaction,
  getRiskProfile,
  upsertRiskProfile,
  getAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  getWatchlist,
  createWatchlistItem,
  updateWatchlistItem,
  deleteWatchlistItem,
  getInvestDiary,
  createDiaryEntry,
  deleteDiaryEntry,
  getDividendPayments,
  createDividendPayment,
  deleteDividendPayment,
  getBondCoupons,
  createBondCoupon,
  deleteBondCoupon,
} from '../controllers/extendedController.js';
import { importCSV } from '../controllers/importController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/goals', getGoals);
router.post('/goals', createGoal);
router.put('/goals/:id', updateGoal);
router.delete('/goals/:id', deleteGoal);

router.get('/transactions', getTransactions);
router.post('/transactions', createTransaction);
router.delete('/transactions/:id', deleteTransaction);

router.get('/risk-profile', getRiskProfile);
router.put('/risk-profile', upsertRiskProfile);

router.get('/alerts', getAlerts);
router.post('/alerts', createAlert);
router.put('/alerts/:id', updateAlert);
router.delete('/alerts/:id', deleteAlert);

router.get('/watchlist', getWatchlist);
router.post('/watchlist', createWatchlistItem);
router.put('/watchlist/:id', updateWatchlistItem);
router.delete('/watchlist/:id', deleteWatchlistItem);

router.get('/diary', getInvestDiary);
router.post('/diary', createDiaryEntry);
router.delete('/diary/:id', deleteDiaryEntry);

router.get('/dividend-payments', getDividendPayments);
router.post('/dividend-payments', createDividendPayment);
router.delete('/dividend-payments/:id', deleteDividendPayment);

router.get('/bond-coupons', getBondCoupons);
router.post('/bond-coupons', createBondCoupon);
router.delete('/bond-coupons/:id', deleteBondCoupon);

router.post('/import/csv', importCSV);

export default router;
