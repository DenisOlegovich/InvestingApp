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

  console.log('База данных инициализирована успешно');
}

export default db;

