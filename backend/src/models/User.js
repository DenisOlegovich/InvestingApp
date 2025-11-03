import db from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  // Создать нового пользователя
  static async create({ email, password, name }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const stmt = db.prepare(`
      INSERT INTO users (email, password, name)
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(email, hashedPassword, name);
    return result.lastInsertRowid;
  }

  // Найти пользователя по email
  static findByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  }

  // Найти пользователя по ID
  static findById(id) {
    const stmt = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?');
    return stmt.get(id);
  }

  // Проверить пароль
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Получить всех пользователей (для админки)
  static getAll() {
    const stmt = db.prepare('SELECT id, email, name, created_at FROM users');
    return stmt.all();
  }

  // Обновить пользователя
  static update(id, { name, email }) {
    const stmt = db.prepare(`
      UPDATE users 
      SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(name, email, id);
  }

  // Удалить пользователя
  static delete(id) {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    return stmt.run(id);
  }
}

export default User;

