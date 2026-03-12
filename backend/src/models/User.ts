import db from '../config/database.js';
import bcrypt from 'bcryptjs';

interface CreateUserData {
  email: string;
  password: string;
  name: string;
}

interface UserRow {
  id: number;
  email: string;
  password: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export default class User {
  static async create({ email, password, name }: CreateUserData): Promise<number> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare(`INSERT INTO users (email, password, name) VALUES (?, ?, ?)`);
    const result = stmt.run(email, hashedPassword, name);
    return result.lastInsertRowid as number;
  }

  static findByEmail(email: string): UserRow | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)');
    return stmt.get(email) as UserRow | undefined;
  }

  static findById(id: number): { id: number; email: string; name: string; created_at?: string } | undefined {
    const stmt = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?');
    return stmt.get(id) as { id: number; email: string; name: string; created_at?: string } | undefined;
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static getAll(): Array<{ id: number; email: string; name: string; created_at?: string }> {
    const stmt = db.prepare('SELECT id, email, name, created_at FROM users');
    return stmt.all() as Array<{ id: number; email: string; name: string; created_at?: string }>;
  }

  static async updatePassword(email: string, newPassword: string): Promise<unknown> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const stmt = db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE LOWER(email) = LOWER(?)');
    return stmt.run(hashedPassword, email);
  }

  static update(
    id: number,
    { name, email }: { name?: string; email?: string }
  ): unknown {
    const stmt = db.prepare(
      `UPDATE users SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    );
    return stmt.run(name, email, id);
  }

  static delete(id: number): unknown {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    return stmt.run(id);
  }
}
