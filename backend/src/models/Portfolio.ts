import db from '../config/database.js';

interface SecurityInput {
  name: string;
  ticker: string;
  type: string;
  currentPrice: number;
  previousPrice: number;
  quantity: number;
  expectedDividend: number;
  dividendFrequency: string;
  currency: string;
  sector?: string | null;
  country?: string | null;
  purchaseDate?: string | null;
  couponRate?: number | null;
  couponFrequency?: string | null;
  maturityDate?: string | null;
}

interface SecurityUpdates {
  currentPrice?: number;
  previousPrice?: number;
  quantity?: number;
  sector?: string;
  country?: string;
  purchaseDate?: string;
  couponRate?: number;
  couponFrequency?: string;
  maturityDate?: string;
}

interface RealEstateInput {
  name: string;
  location: string;
  type: string;
  currentValue: number;
  purchasePrice?: number;
  purchaseDate?: string;
  expectedRentalYield?: number;
  monthlyRent?: number;
}

interface RealEstateUpdates {
  currentValue?: number;
}

interface DepositInput {
  name: string;
  bank: string;
  amount: number;
  interestRate: number;
  currency: string;
  openingDate?: string;
  maturityDate?: string;
  capitalization: string;
  type: string;
}

interface DepositUpdates {
  amount?: number;
}

interface CryptoInput {
  symbol: string;
  name: string;
  amount: number;
  currentPrice: number;
  previousPrice: number;
  stakingYield?: number;
  purchasePrice?: number;
  purchaseDate?: string;
}

interface CryptoUpdates {
  currentPrice: number;
  previousPrice: number;
  amount: number;
}

export default class Portfolio {
  static getByUserId(userId: number): {
    securities: Array<Record<string, unknown>>;
    realEstate: Array<Record<string, unknown>>;
    deposits: Array<Record<string, unknown>>;
    cryptocurrencies: Array<Record<string, unknown>>;
  } {
    const securities = db.prepare('SELECT * FROM securities WHERE user_id = ?').all(userId) as Array<Record<string, unknown>>;
    const realEstate = db.prepare('SELECT * FROM real_estate WHERE user_id = ?').all(userId) as Array<Record<string, unknown>>;
    const deposits = db.prepare('SELECT * FROM deposits WHERE user_id = ?').all(userId) as Array<Record<string, unknown>>;
    const cryptocurrencies = db.prepare('SELECT * FROM cryptocurrencies WHERE user_id = ?').all(userId) as Array<Record<string, unknown>>;

    return {
      securities: securities.map((s: Record<string, unknown>) => ({
        id: (s.id as number).toString(),
        name: s.name,
        ticker: s.ticker,
        type: s.type,
        currentPrice: s.current_price,
        previousPrice: s.previous_price,
        quantity: s.quantity,
        expectedDividend: s.expected_dividend,
        dividendFrequency: s.dividend_frequency,
        currency: s.currency,
        sector: s.sector,
        country: s.country,
        purchaseDate: s.purchase_date,
        couponRate: s.coupon_rate,
        couponFrequency: s.coupon_frequency,
        maturityDate: s.maturity_date,
      })),
      realEstate: realEstate.map((r: Record<string, unknown>) => ({
        id: (r.id as number).toString(),
        name: r.name,
        location: r.location,
        type: r.type,
        currentValue: r.current_value,
        purchasePrice: r.purchase_price,
        purchaseDate: r.purchase_date,
        expectedRentalYield: r.expected_rental_yield,
        monthlyRent: r.monthly_rent,
      })),
      deposits: deposits.map((d: Record<string, unknown>) => ({
        id: (d.id as number).toString(),
        name: d.name,
        bank: d.bank,
        amount: d.amount,
        interestRate: d.interest_rate,
        currency: d.currency,
        openingDate: d.opening_date,
        maturityDate: d.maturity_date,
        capitalization: d.capitalization,
        type: d.type,
      })),
      cryptocurrencies: cryptocurrencies.map((c: Record<string, unknown>) => ({
        id: (c.id as number).toString(),
        symbol: c.symbol,
        name: c.name,
        amount: c.amount,
        currentPrice: c.current_price,
        previousPrice: c.previous_price,
        stakingYield: c.staking_yield,
        purchasePrice: c.purchase_price,
        purchaseDate: c.purchase_date,
      })),
    };
  }

  static addSecurity(userId: number, security: SecurityInput): number {
    const stmt = db.prepare(`
      INSERT INTO securities (
        user_id, name, ticker, type, current_price, previous_price,
        quantity, expected_dividend, dividend_frequency, currency,
        sector, country, purchase_date, coupon_rate, coupon_frequency, maturity_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      userId, security.name, security.ticker, security.type,
      security.currentPrice, security.previousPrice, security.quantity,
      security.expectedDividend ?? 0, security.dividendFrequency ?? 'yearly', security.currency,
      security.sector ?? null, security.country ?? null, security.purchaseDate ?? null,
      security.couponRate ?? null, security.couponFrequency ?? null, security.maturityDate ?? null
    );
    return result.lastInsertRowid as number;
  }

  static updateSecurity(id: string, userId: number, updates: SecurityUpdates): void {
    const fields = ['current_price', 'previous_price', 'quantity'];
    const values: unknown[] = [updates.currentPrice ?? 0, updates.previousPrice ?? 0, updates.quantity ?? 0];
    if (updates.sector !== undefined) { fields.push('sector'); values.push(updates.sector); }
    if (updates.country !== undefined) { fields.push('country'); values.push(updates.country); }
    if (updates.purchaseDate !== undefined) { fields.push('purchase_date'); values.push(updates.purchaseDate); }
    if (updates.couponRate !== undefined) { fields.push('coupon_rate'); values.push(updates.couponRate); }
    if (updates.couponFrequency !== undefined) { fields.push('coupon_frequency'); values.push(updates.couponFrequency); }
    if (updates.maturityDate !== undefined) { fields.push('maturity_date'); values.push(updates.maturityDate); }
    values.push(id, userId);
    const sql = `UPDATE securities SET ${fields.map((f) => `${f} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`;
    db.prepare(sql).run(...values);
  }

  static deleteSecurity(id: string, userId: number): unknown {
    const stmt = db.prepare('DELETE FROM securities WHERE id = ? AND user_id = ?');
    return stmt.run(id, userId);
  }

  static addRealEstate(userId: number, realEstate: RealEstateInput): number {
    const stmt = db.prepare(`
      INSERT INTO real_estate (
        user_id, name, location, type, current_value,
        purchase_price, purchase_date, expected_rental_yield, monthly_rent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      userId, realEstate.name, realEstate.location, realEstate.type,
      realEstate.currentValue, realEstate.purchasePrice ?? null, realEstate.purchaseDate ?? null,
      realEstate.expectedRentalYield ?? null, realEstate.monthlyRent ?? null
    );
    return result.lastInsertRowid as number;
  }

  static updateRealEstate(id: string, userId: number, updates: RealEstateUpdates): unknown {
    const fields: string[] = [];
    const values: unknown[] = [];
    if (updates.currentValue !== undefined) {
      fields.push('current_value = ?');
      values.push(updates.currentValue);
    }
    if (fields.length === 0) throw new Error('Нет полей для обновления');
    values.push(id, userId);
    const sql = `UPDATE real_estate SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
    return db.prepare(sql).run(...values);
  }

  static deleteRealEstate(id: string, userId: number): unknown {
    const stmt = db.prepare('DELETE FROM real_estate WHERE id = ? AND user_id = ?');
    return stmt.run(id, userId);
  }

  static addDeposit(userId: number, deposit: DepositInput): number {
    const stmt = db.prepare(`
      INSERT INTO deposits (
        user_id, name, bank, amount, interest_rate, currency,
        opening_date, maturity_date, capitalization, type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      userId, deposit.name, deposit.bank, deposit.amount,
      deposit.interestRate, deposit.currency, deposit.openingDate ?? null,
      deposit.maturityDate ?? null, deposit.capitalization, deposit.type
    );
    return result.lastInsertRowid as number;
  }

  static updateDeposit(id: string, userId: number, updates: DepositUpdates): unknown {
    const fields: string[] = [];
    const values: unknown[] = [];
    if (updates.amount !== undefined) {
      fields.push('amount = ?');
      values.push(updates.amount);
    }
    if (fields.length === 0) throw new Error('Нет полей для обновления');
    values.push(id, userId);
    const sql = `UPDATE deposits SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
    return db.prepare(sql).run(...values);
  }

  static deleteDeposit(id: string, userId: number): unknown {
    const stmt = db.prepare('DELETE FROM deposits WHERE id = ? AND user_id = ?');
    return stmt.run(id, userId);
  }

  static addCryptocurrency(userId: number, crypto: CryptoInput): number {
    const stmt = db.prepare(`
      INSERT INTO cryptocurrencies (
        user_id, symbol, name, amount, current_price, previous_price,
        staking_yield, purchase_price, purchase_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      userId, crypto.symbol, crypto.name, crypto.amount,
      crypto.currentPrice, crypto.previousPrice, crypto.stakingYield ?? null,
      crypto.purchasePrice ?? null, crypto.purchaseDate ?? null
    );
    return result.lastInsertRowid as number;
  }

  static updateCryptocurrency(id: string, userId: number, updates: CryptoUpdates): unknown {
    const stmt = db.prepare(`
      UPDATE cryptocurrencies
      SET current_price = ?, previous_price = ?, amount = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);
    return stmt.run(updates.currentPrice, updates.previousPrice, updates.amount, id, userId);
  }

  static deleteCryptocurrency(id: string, userId: number): unknown {
    const stmt = db.prepare('DELETE FROM cryptocurrencies WHERE id = ? AND user_id = ?');
    return stmt.run(id, userId);
  }
}
