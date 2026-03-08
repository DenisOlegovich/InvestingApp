import db from '../config/database.js';

const map = (r) => ({
  id: r.id.toString(),
  ticker: r.ticker,
  name: r.name,
  targetPrice: r.target_price,
  thesis: r.thesis,
  checklist: r.checklist_json ? JSON.parse(r.checklist_json) : [],
  createdAt: r.created_at,
});

export default {
  getAll(userId) {
    return db.prepare('SELECT * FROM watchlist WHERE user_id = ? ORDER BY created_at DESC').all(userId).map(map);
  },

  create(userId, data) {
    const stmt = db.prepare(`
      INSERT INTO watchlist (user_id, ticker, name, target_price, thesis, checklist_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const r = stmt.run(
      userId,
      data.ticker,
      data.name ?? null,
      data.targetPrice ?? null,
      data.thesis ?? null,
      data.checklist ? JSON.stringify(data.checklist) : null
    );
    return r.lastInsertRowid.toString();
  },

  update(id, userId, data) {
    const fields = [];
    const values = [];
    if (data.ticker !== undefined) { fields.push('ticker = ?'); values.push(data.ticker); }
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.targetPrice !== undefined) { fields.push('target_price = ?'); values.push(data.targetPrice); }
    if (data.thesis !== undefined) { fields.push('thesis = ?'); values.push(data.thesis); }
    if (data.checklist !== undefined) { fields.push('checklist_json = ?'); values.push(JSON.stringify(data.checklist)); }
    if (fields.length) {
      values.push(id, userId);
      db.prepare(`UPDATE watchlist SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`).run(...values);
    }
  },

  delete(id, userId) {
    db.prepare('DELETE FROM watchlist WHERE id = ? AND user_id = ?').run(id, userId);
  },
};
