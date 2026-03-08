import db from '../config/database.js';

const map = (r) => ({
  id: r.id.toString(),
  name: r.name,
  targetAmountRub: r.target_amount_rub,
  currentAmountRub: r.current_amount_rub,
  targetDate: r.target_date,
  monthlyContributionRub: r.monthly_contribution_rub,
  goalBasket: r.goal_basket,
  assetIds: r.asset_ids ? r.asset_ids.split(',').filter(Boolean) : [],
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export default {
  getAll(userId) {
    const rows = db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    return rows.map(map);
  },

  create(userId, data) {
    const stmt = db.prepare(`
      INSERT INTO goals (user_id, name, target_amount_rub, current_amount_rub, target_date, monthly_contribution_rub, goal_basket, asset_ids)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const r = stmt.run(
      userId,
      data.name,
      data.targetAmountRub,
      data.currentAmountRub ?? 0,
      data.targetDate ?? null,
      data.monthlyContributionRub ?? null,
      data.goalBasket ?? null,
      Array.isArray(data.assetIds) ? data.assetIds.join(',') : null
    );
    return r.lastInsertRowid.toString();
  },

  update(id, userId, data) {
    const fields = [];
    const values = [];
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.targetAmountRub !== undefined) { fields.push('target_amount_rub = ?'); values.push(data.targetAmountRub); }
    if (data.currentAmountRub !== undefined) { fields.push('current_amount_rub = ?'); values.push(data.currentAmountRub); }
    if (data.targetDate !== undefined) { fields.push('target_date = ?'); values.push(data.targetDate); }
    if (data.monthlyContributionRub !== undefined) { fields.push('monthly_contribution_rub = ?'); values.push(data.monthlyContributionRub); }
    if (data.goalBasket !== undefined) { fields.push('goal_basket = ?'); values.push(data.goalBasket); }
    if (data.assetIds !== undefined) { fields.push('asset_ids = ?'); values.push(Array.isArray(data.assetIds) ? data.assetIds.join(',') : null); }
    if (fields.length === 0) return;
    values.push(id, userId);
    db.prepare(`UPDATE goals SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`).run(...values);
  },

  delete(id, userId) {
    db.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?').run(id, userId);
  },
};
