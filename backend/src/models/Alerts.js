import db from '../config/database.js';

const map = (r) => ({
  id: r.id.toString(),
  type: r.type,
  assetType: r.asset_type,
  assetId: r.asset_id,
  tickerOrSymbol: r.ticker_or_symbol,
  targetValue: r.target_value,
  thresholdPercent: r.threshold_percent,
  isActive: r.is_active === 1,
  triggeredAt: r.triggered_at,
  createdAt: r.created_at,
});

export default {
  getAll(userId) {
    return db.prepare('SELECT * FROM alerts WHERE user_id = ? ORDER BY created_at DESC').all(userId).map(map);
  },

  create(userId, data) {
    const stmt = db.prepare(`
      INSERT INTO alerts (user_id, type, asset_type, asset_id, ticker_or_symbol, target_value, threshold_percent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const r = stmt.run(
      userId,
      data.type,
      data.assetType ?? null,
      data.assetId ?? null,
      data.tickerOrSymbol ?? null,
      data.targetValue ?? null,
      data.thresholdPercent ?? null
    );
    return r.lastInsertRowid.toString();
  },

  update(id, userId, data) {
    const updates = [];
    const values = [];
    if (data.isActive !== undefined) { updates.push('is_active = ?'); values.push(data.isActive ? 1 : 0); }
    if (data.triggeredAt !== undefined) { updates.push('triggered_at = ?'); values.push(data.triggeredAt); }
    if (updates.length) {
      values.push(id, userId);
      db.prepare(`UPDATE alerts SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...values);
    }
  },

  delete(id, userId) {
    db.prepare('DELETE FROM alerts WHERE id = ? AND user_id = ?').run(id, userId);
  },
};
