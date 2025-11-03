import dotenv from 'dotenv';
import { initDatabase } from '../config/database.js';

dotenv.config();

console.log('Запуск инициализации базы данных...');
initDatabase();
console.log('Готово! База данных инициализирована.');
process.exit(0);

