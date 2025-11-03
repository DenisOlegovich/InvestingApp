# Информация о Backend

## ✅ Бэкенд создан на Node.js + Express

### Технологии:
- **Node.js** - runtime
- **Express** - веб-фреймворк
- **SQLite** (better-sqlite3) - база данных
- **JWT** (jsonwebtoken) - авторизация
- **bcryptjs** - хеширование паролей
- **CORS** - для взаимодействия с frontend

### Структура проекта:

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Подключение к SQLite
│   ├── models/
│   │   ├── User.js               # Модель пользователя
│   │   └── Portfolio.js          # Модель портфеля
│   ├── controllers/
│   │   ├── authController.js     # Логика авторизации
│   │   └── portfolioController.js # Логика портфеля
│   ├── middleware/
│   │   └── auth.js               # JWT middleware
│   ├── routes/
│   │   ├── auth.js               # Маршруты авторизации
│   │   └── portfolio.js          # Маршруты портфеля
│   ├── scripts/
│   │   └── initDatabase.js       # Инициализация БД
│   └── server.js                 # Главный файл сервера
├── package.json
├── .env                          # Переменные окружения
└── database.sqlite               # База данных SQLite

```

### Запуск бэкенда:

```bash
cd backend
npm install        # Установка зависимостей
npm run init-db    # Инициализация базы данных
npm run dev        # Запуск в режиме разработки
```

Сервер будет доступен на `http://localhost:3001`

### API Endpoints:

**Авторизация:**
- POST `/api/auth/register` - регистрация
- POST `/api/auth/login` - вход
- GET `/api/auth/me` - получить текущего пользователя

**Портфель** (требуется авторизация):
- GET `/api/portfolio` - получить весь портфель
- POST `/api/portfolio/securities` - добавить ценную бумагу
- PUT `/api/portfolio/securities/:id` - обновить ценную бумагу
- DELETE `/api/portfolio/securities/:id` - удалить ценную бумагу
- POST `/api/portfolio/real-estate` - добавить недвижимость
- DELETE `/api/portfolio/real-estate/:id` - удалить недвижимость
- POST `/api/portfolio/deposits` - добавить депозит
- DELETE `/api/portfolio/deposits/:id` - удалить депозит
- POST `/api/portfolio/cryptocurrencies` - добавить криптовалюту
- PUT `/api/portfolio/cryptocurrencies/:id` - обновить криптовалюту
- DELETE `/api/portfolio/cryptocurrencies/:id` - удалить криптовалюту

### База данных:

SQLite с 5 таблицами:
1. `users` - пользователи
2. `securities` - ценные бумаги
3. `real_estate` - недвижимость
4. `deposits` - депозиты
5. `cryptocurrencies` - криптовалюты

Все таблицы связаны с пользователем через `user_id` с CASCADE DELETE.

### Безопасность:

- ✅ Пароли хешируются с bcrypt (10 rounds)
- ✅ JWT токены с истечением через 7 дней
- ✅ CORS ограничен только frontend URL
- ✅ SQL injection защита (prepared statements)
- ✅ Валидация входных данных (express-validator)

