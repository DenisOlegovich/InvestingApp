import db from '../config/database.js';

export default {
  record(userId, dateStr, amountRub) {
    const existing = db.prepare('SELECT id FROM contribution_streaks WHERE user_id = ? AND streak_date = ?').get(userId, dateStr);
    if (existing) {
      db.prepare('UPDATE contribution_streaks SET amount_rub = ? WHERE id = ?').run(amountRub ?? 0, existing.id);
    } else {
      db.prepare('INSERT INTO contribution_streaks (user_id, streak_date, amount_rub) VALUES (?, ?, ?)').run(userId, dateStr, amountRub ?? 0);
    }
  },

  getStreak(userId) {
    const rows = db.prepare(`
      SELECT streak_date, amount_rub FROM contribution_streaks
      WHERE user_id = ? ORDER BY streak_date DESC LIMIT 90
    `).all(userId);
    return rows;
  },
};
