# Investor Portfolio Backend API

Backend API для приложения управления инвестиционным портфелем.

## Технологии

- **Node.js** + **Express** - сервер
- **SQLite** (better-sqlite3) - база данных
- **JWT** - авторизация
- **bcryptjs** - хеширование паролей

## Установка

```bash
cd backend
npm install
```

## Настройка

1. Скопируйте `.env.example` в `.env`:
```bash
cp .env.example .env
```

2. Измените настройки в `.env`:
- `JWT_SECRET` - секретный ключ для JWT (обязательно измените!)
- `PORT` - порт сервера (по умолчанию 3001)
- `FRONTEND_URL` - URL фронтенда для CORS

## Запуск

### Инициализация базы данных
```bash
npm run init-db
```

### Development режим (с автоперезагрузкой)
```bash
npm run dev
```

### Production режим
```bash
npm start
```

## API Endpoints

### Авторизация

#### Регистрация
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "Имя Пользователя"
}
```

#### Вход
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Ответ:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Имя Пользователя"
  }
}
```

#### Получить профиль
```
GET /api/auth/me
Authorization: Bearer <token>
```

### Портфель

Все endpoints требуют авторизации (header: `Authorization: Bearer <token>`)

#### Получить весь портфель
```
GET /api/portfolio
```

#### Добавить ценную бумагу
```
POST /api/portfolio/securities
Content-Type: application/json

{
  "name": "Сбербанк",
  "ticker": "SBER",
  "type": "stock",
  "currentPrice": 285.50,
  "previousPrice": 282.30,
  "quantity": 10,
  "expectedDividend": 8.5,
  "dividendFrequency": "yearly",
  "currency": "RUB"
}
```

#### Обновить ценную бумагу
```
PUT /api/portfolio/securities/:id
```

#### Удалить ценную бумагу
```
DELETE /api/portfolio/securities/:id
```

#### Добавить недвижимость
```
POST /api/portfolio/real-estate
```

#### Добавить депозит
```
POST /api/portfolio/deposits
```

#### Добавить криптовалюту
```
POST /api/portfolio/cryptocurrencies
```

## Структура базы данных

- `users` - пользователи
- `securities` - ценные бумаги
- `real_estate` - недвижимость
- `deposits` - депозиты
- `cryptocurrencies` - криптовалюты

Все таблицы активов связаны с пользователем через `user_id`.

## Безопасность

- Пароли хешируются с помощью bcrypt
- JWT токены для авторизации
- CORS настроен для конкретного frontend URL
- SQL injection защита через prepared statements

## Разработка

Сервер автоматически перезагружается при изменениях (nodemon).

Логи запросов выводятся в консоль в формате:
```
2024-11-03T10:30:45.123Z - GET /api/portfolio
```

