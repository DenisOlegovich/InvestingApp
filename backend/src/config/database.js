import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');

// Создаем подключение к базе данных
const db = new Database(dbPath, {
  verbose: console.log // Логируем SQL запросы в development
});

// Включаем поддержку внешних ключей
db.pragma('foreign_keys = ON');

// Инициализация схемы базы данных
export function initDatabase() {
  console.log('Инициализация базы данных...');

  // Таблица пользователей
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица ценных бумаг
  db.exec(`
    CREATE TABLE IF NOT EXISTS securities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      ticker TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('stock', 'bond', 'etf')),
      current_price REAL NOT NULL,
      previous_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      expected_dividend REAL NOT NULL,
      dividend_frequency TEXT NOT NULL CHECK(dividend_frequency IN ('monthly', 'quarterly', 'yearly')),
      currency TEXT NOT NULL CHECK(currency IN ('RUB', 'USD', 'EUR')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Таблица недвижимости
  db.exec(`
    CREATE TABLE IF NOT EXISTS real_estate (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('apartment', 'house', 'commercial')),
      current_value REAL NOT NULL,
      purchase_price REAL,
      purchase_date TEXT,
      expected_rental_yield REAL,
      monthly_rent REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Таблица депозитов
  db.exec(`
    CREATE TABLE IF NOT EXISTS deposits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      bank TEXT NOT NULL,
      amount REAL NOT NULL,
      interest_rate REAL NOT NULL,
      currency TEXT NOT NULL CHECK(currency IN ('RUB', 'USD', 'EUR')),
      opening_date TEXT,
      maturity_date TEXT,
      capitalization TEXT NOT NULL CHECK(capitalization IN ('monthly', 'quarterly', 'yearly', 'none')),
      type TEXT NOT NULL CHECK(type IN ('demand', 'term')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Таблица криптовалют
  db.exec(`
    CREATE TABLE IF NOT EXISTS cryptocurrencies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      symbol TEXT NOT NULL,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      current_price REAL NOT NULL,
      previous_price REAL NOT NULL,
      staking_yield REAL,
      purchase_price REAL,
      purchase_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Расширение securities: sector, country для скринера; bond поля
  try {
    db.exec('ALTER TABLE securities ADD COLUMN sector TEXT');
  } catch (_) {}
  try {
    db.exec('ALTER TABLE securities ADD COLUMN country TEXT');
  } catch (_) {}
  try {
    db.exec('ALTER TABLE securities ADD COLUMN purchase_date TEXT');
  } catch (_) {}
  try {
    db.exec('ALTER TABLE securities ADD COLUMN coupon_rate REAL');
  } catch (_) {}
  try {
    db.exec('ALTER TABLE securities ADD COLUMN coupon_frequency TEXT');
  } catch (_) {}
  try {
    db.exec('ALTER TABLE securities ADD COLUMN maturity_date TEXT');
  } catch (_) {}

  // Цели (server-side)
  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      target_amount_rub REAL NOT NULL,
      current_amount_rub REAL NOT NULL,
      target_date TEXT,
      monthly_contribution_rub REAL,
      goal_basket TEXT,
      asset_ids TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Риск-профиль
  db.exec(`
    CREATE TABLE IF NOT EXISTS risk_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      risk_score INTEGER,
      recommended_securities REAL,
      recommended_real_estate REAL,
      recommended_deposits REAL,
      recommended_crypto REAL,
      answers_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Транзакции (для FIFO/LIFO, P&L)
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      asset_type TEXT NOT NULL CHECK(asset_type IN ('security', 'crypto')),
      asset_id TEXT,
      ticker_or_symbol TEXT NOT NULL,
      action TEXT NOT NULL CHECK(action IN ('buy', 'sell')),
      quantity REAL NOT NULL,
      price REAL NOT NULL,
      currency TEXT NOT NULL,
      commission REAL DEFAULT 0,
      tax_category TEXT,
      trade_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Дивидендные выплаты (фактические)
  db.exec(`
    CREATE TABLE IF NOT EXISTS dividend_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      security_id INTEGER NOT NULL,
      ticker TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      payment_date TEXT NOT NULL,
      ex_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Купоны облигаций
  db.exec(`
    CREATE TABLE IF NOT EXISTS bond_coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      security_id INTEGER NOT NULL,
      ticker TEXT NOT NULL,
      coupon_amount REAL NOT NULL,
      payment_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Алерты
  db.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('price', 'volatility', 'drawdown', 'dividend', 'rate', 'goal')),
      asset_type TEXT,
      asset_id TEXT,
      ticker_or_symbol TEXT,
      target_value REAL,
      threshold_percent REAL,
      is_active INTEGER DEFAULT 1,
      triggered_at TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Watchlist с целями и тезисами
  db.exec(`
    CREATE TABLE IF NOT EXISTS watchlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      ticker TEXT NOT NULL,
      name TEXT,
      target_price REAL,
      thesis TEXT,
      checklist_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Инвест-дневник
  db.exec(`
    CREATE TABLE IF NOT EXISTS invest_diary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      trade_id INTEGER,
      ticker TEXT,
      entry TEXT NOT NULL,
      what_worked INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Геймификация: streak взносов
  db.exec(`
    CREATE TABLE IF NOT EXISTS contribution_streaks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      streak_date TEXT NOT NULL,
      amount_rub REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, streak_date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Публичные портфели (социальный режим)
  db.exec(`
    CREATE TABLE IF NOT EXISTS public_portfolios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      display_name TEXT,
      delay_days INTEGER DEFAULT 7,
      show_amounts INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Бенчмарки (кеш)
  db.exec(`
    CREATE TABLE IF NOT EXISTS benchmark_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL,
      date_str TEXT NOT NULL,
      value REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(symbol, date_str)
    )
  `);

  console.log('База данных инициализирована успешно');
}

export default db;

