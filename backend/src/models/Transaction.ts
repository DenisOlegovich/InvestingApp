import db from '../config/database.js';

interface TransactionRow {
  id: number;
  security_id: number | null;
  ticker: string;
  name: string;
  type: string;
  quantity: number;
  price_per_unit: number;
  total: number;
  currency: string;
  trade_date: string;
  created_at?: string;
}

interface CreateTransactionData {
  securityId?: string | null;
  ticker: string;
  name: string;
  type: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
  currency: string;
  tradeDate: string;
}

export default class Transaction {
  static getAllByUserId(userId: number): Array<{
    id: string;
    securityId: string | null;
    ticker: string;
    name: string;
    type: string;
    quantity: number;
    pricePerUnit: number;
    total: number;
    currency: string;
    tradeDate: string;
    createdAt?: string;
  }> {
    const stmt = db.prepare(`
      SELECT id, security_id, ticker, name, type, quantity, price_per_unit, total, currency, trade_date, created_at
      FROM transactions
      WHERE user_id = ?
      ORDER BY trade_date DESC, created_at DESC
    `);
    const rows = stmt.all(userId) as TransactionRow[];
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

  static create(userId: number, data: CreateTransactionData): number {
    const { securityId, ticker, name, type, quantity, pricePerUnit, total, currency, tradeDate } = data;
    const stmt = db.prepare(`
      INSERT INTO transactions (user_id, security_id, ticker, name, type, quantity, price_per_unit, total, currency, trade_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(userId, securityId || null, ticker, name, type, quantity, pricePerUnit, total, currency, tradeDate);
    return result.lastInsertRowid as number;
  }

  static delete(id: string, userId: number): unknown {
    const stmt = db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?');
    return stmt.run(id, userId);
  }
}
