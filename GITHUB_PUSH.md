# Загрузка на GitHub

## ✅ Уже выполнено:

1. ✅ Git репозиторий инициализирован
2. ✅ Все файлы добавлены
3. ✅ Commit создан
4. ✅ Remote origin настроен на `https://github.com/DenisOlegovich/InvestingApp`
5. ✅ Ветка переименована в `main`

## 📤 Осталось выполнить push:

Откройте терминал и выполните:

```bash
cd /Users/denis/Desktop/Програмирование/App
git push -u origin main
```

Вам будет предложено ввести:
- **Username**: ваш GitHub username
- **Password**: Personal Access Token (PAT)

### 🔑 Как получить Personal Access Token (если нужен):

1. Перейдите на GitHub: https://github.com/settings/tokens
2. Нажмите "Generate new token" → "Generate new token (classic)"
3. Выберите scopes: `repo` (полный доступ к репозиториям)
4. Нажмите "Generate token"
5. Скопируйте токен (он показывается только один раз!)
6. Используйте этот токен вместо пароля при push

### 🔄 Альтернативный способ (SSH):

Если у вас настроен SSH ключ:

```bash
cd /Users/denis/Desktop/Програмирование/App
git remote set-url origin git@github.com:DenisOlegovich/InvestingApp.git
git push -u origin main
```

---

## ✅ После успешного push:

Ваш проект будет доступен на:
**https://github.com/DenisOlegovich/InvestingApp**

## 📦 Что включено в репозиторий:

- ✅ Frontend (React + TypeScript)
- ✅ Backend (Node.js + Express)
- ✅ Документация (README, SETUP, START)
- ✅ .gitignore (исключает .env, database.sqlite, логи)
- ✅ 62 файла, 12930+ строк кода

## 🚫 Что НЕ загружается (в .gitignore):

- node_modules/
- dist/
- .env файлы
- database.sqlite
- *.log файлы

