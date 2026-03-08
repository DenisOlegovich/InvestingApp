import db from '../config/database.js';

const map = (r) => ({
  id: r.id.toString(),
  tradeId: r.trade_id,
  ticker: r.ticker,
  entry: r.entry,
  whatWorked: r.what_worked === 1,
  createdAt: r.created_at,
});

export default {
  getAll(userId, limit = 100) {
    return db.prepare('SELECT * FROM invest_diary WHERE user_id = ? ORDER BY created_at DESC LIMIT ?').all(userId, limit).map(map);
  },

  create(userId, data) {
    const stmt = db.prepare(`
      INSERT INTO invest_diary (user_id, trade_id, ticker, entry, what_worked)
      VALUES (?, ?, ?, ?, ?)
    `);
    const r = stmt.run(
      userId,
      data.tradeId ?? null,
      data.ticker ?? null,
      data.entry,
      data.whatWorked ? 1 : 0
    );
    return r.lastInsertRowid.toString();
  },

  delete(id, userId) {
    db.prepare('DELETE FROM invest_diary WHERE id = ? AND user_id = ?').run(id, userId);
  },
};
