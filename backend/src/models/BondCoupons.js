import db from '../config/database.js';

const map = (r) => ({
  id: r.id.toString(),
  securityId: r.security_id.toString(),
  ticker: r.ticker,
  couponAmount: r.coupon_amount,
  paymentDate: r.payment_date,
  createdAt: r.created_at,
});

export default {
  getAll(userId) {
    return db.prepare('SELECT * FROM bond_coupons WHERE user_id = ? ORDER BY payment_date ASC').all(userId).map(map);
  },

  getBySecurityId(userId, securityId) {
    return db.prepare('SELECT * FROM bond_coupons WHERE user_id = ? AND security_id = ? ORDER BY payment_date ASC')
      .all(userId, securityId).map(map);
  },

  create(userId, data) {
    const stmt = db.prepare(`
      INSERT INTO bond_coupons (user_id, security_id, ticker, coupon_amount, payment_date)
      VALUES (?, ?, ?, ?, ?)
    `);
    const r = stmt.run(
      userId,
      data.securityId,
      data.ticker,
      data.couponAmount,
      data.paymentDate
    );
    return r.lastInsertRowid.toString();
  },

  delete(id, userId) {
    db.prepare('DELETE FROM bond_coupons WHERE id = ? AND user_id = ?').run(id, userId);
  },
};
