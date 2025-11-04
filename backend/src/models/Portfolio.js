import db from '../config/database.js';

class Portfolio {
  // Получить весь портфель пользователя
  static getByUserId(userId) {
    const securities = db.prepare('SELECT * FROM securities WHERE user_id = ?').all(userId);
    const realEstate = db.prepare('SELECT * FROM real_estate WHERE user_id = ?').all(userId);
    const deposits = db.prepare('SELECT * FROM deposits WHERE user_id = ?').all(userId);
    const cryptocurrencies = db.prepare('SELECT * FROM cryptocurrencies WHERE user_id = ?').all(userId);

    // Преобразуем snake_case в camelCase для frontend
    return {
      securities: securities.map(s => ({
        id: s.id.toString(),
        name: s.name,
        ticker: s.ticker,
        type: s.type,
        currentPrice: s.current_price,
        previousPrice: s.previous_price,
        quantity: s.quantity,
        expectedDividend: s.expected_dividend,
        dividendFrequency: s.dividend_frequency,
        currency: s.currency
      })),
      realEstate: realEstate.map(r => ({
        id: r.id.toString(),
        name: r.name,
        location: r.location,
        type: r.type,
        currentValue: r.current_value,
        purchasePrice: r.purchase_price,
        purchaseDate: r.purchase_date,
        expectedRentalYield: r.expected_rental_yield,
        monthlyRent: r.monthly_rent
      })),
      deposits: deposits.map(d => ({
        id: d.id.toString(),
        name: d.name,
        bank: d.bank,
        amount: d.amount,
        interestRate: d.interest_rate,
        currency: d.currency,
        openingDate: d.opening_date,
        maturityDate: d.maturity_date,
        capitalization: d.capitalization,
        type: d.type
      })),
      cryptocurrencies: cryptocurrencies.map(c => ({
        id: c.id.toString(),
        symbol: c.symbol,
        name: c.name,
        amount: c.amount,
        currentPrice: c.current_price,
        previousPrice: c.previous_price,
        stakingYield: c.staking_yield,
        purchasePrice: c.purchase_price,
        purchaseDate: c.purchase_date
      }))
    };
  }

  // Добавить ценную бумагу
  static addSecurity(userId, security) {
    const stmt = db.prepare(`
      INSERT INTO securities (
        user_id, name, ticker, type, current_price, previous_price,
        quantity, expected_dividend, dividend_frequency, currency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      userId, security.name, security.ticker, security.type,
      security.currentPrice, security.previousPrice, security.quantity,
      security.expectedDividend, security.dividendFrequency, security.currency
    );
    
    return result.lastInsertRowid;
  }

  // Обновить ценную бумагу
  static updateSecurity(id, userId, updates) {
    const stmt = db.prepare(`
      UPDATE securities
      SET current_price = ?, previous_price = ?, quantity = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);
    
    return stmt.run(
      updates.currentPrice,
      updates.previousPrice,
      updates.quantity,
      id,
      userId
    );
  }

  // Удалить ценную бумагу
  static deleteSecurity(id, userId) {
    const stmt = db.prepare('DELETE FROM securities WHERE id = ? AND user_id = ?');
    return stmt.run(id, userId);
  }

  // Аналогичные методы для недвижимости
  static addRealEstate(userId, realEstate) {
    const stmt = db.prepare(`
      INSERT INTO real_estate (
        user_id, name, location, type, current_value,
        purchase_price, purchase_date, expected_rental_yield, monthly_rent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      userId, realEstate.name, realEstate.location, realEstate.type,
      realEstate.currentValue, realEstate.purchasePrice, realEstate.purchaseDate,
      realEstate.expectedRentalYield, realEstate.monthlyRent
    );
    
    return result.lastInsertRowid;
  }

  static updateRealEstate(id, userId, updates) {
    const fields = [];
    const values = [];

    if (updates.currentValue !== undefined) {
      fields.push('current_value = ?');
      values.push(updates.currentValue);
    }

    if (fields.length === 0) {
      throw new Error('Нет полей для обновления');
    }

    values.push(id, userId);
    const sql = `UPDATE real_estate SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
    const stmt = db.prepare(sql);
    return stmt.run(...values);
  }

  static deleteRealEstate(id, userId) {
    const stmt = db.prepare('DELETE FROM real_estate WHERE id = ? AND user_id = ?');
    return stmt.run(id, userId);
  }

  // Методы для депозитов
  static addDeposit(userId, deposit) {
    const stmt = db.prepare(`
      INSERT INTO deposits (
        user_id, name, bank, amount, interest_rate, currency,
        opening_date, maturity_date, capitalization, type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      userId, deposit.name, deposit.bank, deposit.amount,
      deposit.interestRate, deposit.currency, deposit.openingDate,
      deposit.maturityDate, deposit.capitalization, deposit.type
    );
    
    return result.lastInsertRowid;
  }

  static updateDeposit(id, userId, updates) {
    const fields = [];
    const values = [];

    if (updates.amount !== undefined) {
      fields.push('amount = ?');
      values.push(updates.amount);
    }

    if (fields.length === 0) {
      throw new Error('Нет полей для обновления');
    }

    values.push(id, userId);
    const sql = `UPDATE deposits SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
    const stmt = db.prepare(sql);
    return stmt.run(...values);
  }

  static deleteDeposit(id, userId) {
    const stmt = db.prepare('DELETE FROM deposits WHERE id = ? AND user_id = ?');
    return stmt.run(id, userId);
  }

  // Методы для криптовалют
  static addCryptocurrency(userId, crypto) {
    const stmt = db.prepare(`
      INSERT INTO cryptocurrencies (
        user_id, symbol, name, amount, current_price, previous_price,
        staking_yield, purchase_price, purchase_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      userId, crypto.symbol, crypto.name, crypto.amount,
      crypto.currentPrice, crypto.previousPrice, crypto.stakingYield,
      crypto.purchasePrice, crypto.purchaseDate
    );
    
    return result.lastInsertRowid;
  }

  static updateCryptocurrency(id, userId, updates) {
    const stmt = db.prepare(`
      UPDATE cryptocurrencies
      SET current_price = ?, previous_price = ?, amount = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);
    
    return stmt.run(
      updates.currentPrice,
      updates.previousPrice,
      updates.amount,
      id,
      userId
    );
  }

  static deleteCryptocurrency(id, userId) {
    const stmt = db.prepare('DELETE FROM cryptocurrencies WHERE id = ? AND user_id = ?');
    return stmt.run(id, userId);
  }
}

export default Portfolio;

