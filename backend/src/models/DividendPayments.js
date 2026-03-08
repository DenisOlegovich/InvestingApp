import db from '../config/database.js';

const map = (r) => ({
  id: r.id.toString(),
  securityId: r.security_id.toString(),
  ticker: r.ticker,
  amount: r.amount,
  currency: r.currency,
  paymentDate: r.payment_date,
  exDate: r.ex_date,
  createdAt: r.created_at,
});

export default {
  getAll(userId) {
    return db.prepare('SELECT * FROM dividend_payments WHERE user_id = ? ORDER BY payment_date DESC').all(userId).map(map);
  },

  create(userId, data) {
    const stmt = db.prepare(`
      INSERT INTO dividend_payments (user_id, security_id, ticker, amount, currency, payment_date, ex_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const r = stmt.run(
      userId,
      data.securityId,
      data.ticker,
      data.amount,
      data.currency,
      data.paymentDate,
      data.exDate ?? null
    );
    return r.lastInsertRowid.toString();
  },

  delete(id, userId) {
    db.prepare('DELETE FROM dividend_payments WHERE id = ? AND user_id = ?').run(id, userId);
  },
};
