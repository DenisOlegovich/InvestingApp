import db from '../config/database.js';

const map = (r) => ({
  id: r.id.toString(),
  assetType: r.asset_type,
  assetId: r.asset_id,
  tickerOrSymbol: r.ticker_or_symbol,
  action: r.action,
  quantity: r.quantity,
  price: r.price,
  currency: r.currency,
  commission: r.commission ?? 0,
  taxCategory: r.tax_category,
  tradeDate: r.trade_date,
  createdAt: r.created_at,
});

export default {
  getAll(userId, { assetType, limit = 200 } = {}) {
    let sql = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [userId];
    if (assetType) {
      sql += ' AND asset_type = ?';
      params.push(assetType);
    }
    sql += ' ORDER BY trade_date DESC, id DESC LIMIT ?';
    params.push(limit);
    return db.prepare(sql).all(...params).map(map);
  },

  create(userId, data) {
    const stmt = db.prepare(`
      INSERT INTO transactions (user_id, asset_type, asset_id, ticker_or_symbol, action, quantity, price, currency, commission, tax_category, trade_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const r = stmt.run(
      userId,
      data.assetType,
      data.assetId ?? null,
      data.tickerOrSymbol,
      data.action,
      data.quantity,
      data.price,
      data.currency,
      data.commission ?? 0,
      data.taxCategory ?? null,
      data.tradeDate
    );
    return r.lastInsertRowid.toString();
  },

  delete(id, userId) {
    db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(id, userId);
  },
};
