# Investor Portfolio — мобильное приложение

React Native (Expo) приложение на базе веб-версии портфолио инвестора.

## Запуск

1. Убедитесь, что backend запущен на порту 3001:
   ```bash
   cd ../backend && npm run start
   ```

2. Запустите приложение:
   ```bash
   npm start
   ```

3. Откройте в Expo Go (сканируя QR-код) или запустите эмулятор:
   - iOS: `npm run ios`
   - Android: `npm run android`

## API URL

- **iOS Simulator**: `http://localhost:3001`
- **Android Emulator**: `http://10.0.2.2:3001` (автоматически)
- **Физическое устройство**: замените в `src/services/api.ts` на IP вашего компьютера в сети

## Функции

- Вход / Регистрация
- Просмотр портфеля (акции, депозиты, криптовалюта)
- Добавление ценных бумаг
- Удаление активов
- Pull-to-refresh
