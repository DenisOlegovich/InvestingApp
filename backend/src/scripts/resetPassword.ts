import dotenv from 'dotenv';
import { initDatabase } from '../config/database.js';
import User from '../models/User.js';

dotenv.config();

const email = 'den9055902096@gmail.com';
const newPassword = '1234567';

async function resetPassword(): Promise<void> {
  try {
    console.log('Инициализация базы данных...');
    initDatabase();
    const user = User.findByEmail(email);
    if (!user) {
      console.log(`❌ Пользователь с email ${email} не найден`);
      process.exit(1);
    }
    await User.updatePassword(email, newPassword);
    console.log('✅ Пароль успешно сброшен!');
    console.log(`   Email: ${email}`);
    console.log(`   Новый пароль: ${newPassword}`);
  } catch (error) {
    console.error('❌ Ошибка при сбросе пароля:', error);
    process.exit(1);
  }
  process.exit(0);
}

resetPassword();
