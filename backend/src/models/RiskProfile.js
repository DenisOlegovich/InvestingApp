import db from '../config/database.js';

const map = (r) => ({
  id: r.id.toString(),
  riskScore: r.risk_score,
  recommendedSecurities: r.recommended_securities,
  recommendedRealEstate: r.recommended_real_estate,
  recommendedDeposits: r.recommended_deposits,
  recommendedCrypto: r.recommended_crypto,
  answersJson: r.answers_json ? JSON.parse(r.answers_json) : null,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export default {
  getByUserId(userId) {
    const r = db.prepare('SELECT * FROM risk_profiles WHERE user_id = ?').get(userId);
    return r ? map(r) : null;
  },

  upsert(userId, data) {
    const existing = db.prepare('SELECT id FROM risk_profiles WHERE user_id = ?').get(userId);
    if (existing) {
      db.prepare(`
        UPDATE risk_profiles SET
          risk_score = ?, recommended_securities = ?, recommended_real_estate = ?,
          recommended_deposits = ?, recommended_crypto = ?, answers_json = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(
        data.riskScore,
        data.recommendedSecurities,
        data.recommendedRealEstate,
        data.recommendedDeposits,
        data.recommendedCrypto,
        data.answersJson ? JSON.stringify(data.answersJson) : null,
        userId
      );
    } else {
      db.prepare(`
        INSERT INTO risk_profiles (user_id, risk_score, recommended_securities, recommended_real_estate, recommended_deposits, recommended_crypto, answers_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        data.riskScore,
        data.recommendedSecurities,
        data.recommendedRealEstate,
        data.recommendedDeposits,
        data.recommendedCrypto,
        data.answersJson ? JSON.stringify(data.answersJson) : null
      );
    }
  },
};
