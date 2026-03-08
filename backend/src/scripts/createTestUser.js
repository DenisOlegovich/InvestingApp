import dotenv from 'dotenv';
import { initDatabase } from '../config/database.js';
import User from '../models/User.js';

dotenv.config();

async function createTestUser() {
  try {
    console.log('Инициализация базы данных...');
    initDatabase();

    const testEmail = 'test@test.com';
    const testPassword = '123456';
    const testName = 'Тестовый пользователь';

    // Проверяем, существует ли уже тестовый пользователь
    const existingUser = User.findByEmail(testEmail);
    
    if (existingUser) {
      console.log('✅ Тестовый пользователь уже существует:');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Имя: ${existingUser.name}`);
      return;
    }

    // Создаем тестового пользователя
    console.log('Создание тестового пользователя...');
    const userId = await User.create({
      email: testEmail,
      password: testPassword,
      name: testName
    });

    console.log('✅ Тестовый пользователь успешно создан!');
    console.log(`   ID: ${userId}`);
    console.log(`   Email: ${testEmail}`);
    console.log(`   Пароль: ${testPassword}`);
    console.log(`   Имя: ${testName}`);
  } catch (error) {
    console.error('❌ Ошибка при создании тестового пользователя:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

createTestUser();

