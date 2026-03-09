import db from '../config/database.js';

class Transaction {
  static getAllByUserId(userId) {
    const stmt = db.prepare(`
      SELECT id, security_id, ticker, name, type, quantity, price_per_unit, total, currency, trade_date, created_at
      FROM transactions
      WHERE user_id = ?
      ORDER BY trade_date DESC, created_at DESC
    `);
    const rows = stmt.all(userId);
    return rows.map((r) => ({
      id: String(r.id),
      securityId: r.security_id ? String(r.security_id) : null,
      ticker: r.ticker,
      name: r.name,
      type: r.type,
      quantity: r.quantity,
      pricePerUnit: r.price_per_unit,
      total: r.total,
      currency: r.currency,
      tradeDate: r.trade_date,
      createdAt: r.created_at,
    }));
  }

  static create(userId, data) {
    const { securityId, ticker, name, type, quantity, pricePerUnit, total, currency, tradeDate } = data;
    const stmt = db.prepare(`
      INSERT INTO transactions (user_id, security_id, ticker, name, type, quantity, price_per_unit, total, currency, trade_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(userId, securityId || null, ticker, name, type, quantity, pricePerUnit, total, currency, tradeDate);
    return result.lastInsertRowid;
  }

  static delete(id, userId) {
    const stmt = db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?');
    return stmt.run(id, userId);
  }
}

export default Transaction;
