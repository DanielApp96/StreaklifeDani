# StreakLife — Expo Version 📱
## Phone-Only Workflow Guide

---

## 🚀 Стъпка 1: Качи кода в Expo Snack

1. Отвори **snack.expo.dev** от телефона/браузъра
2. Създай нов Snack (безплатно, без регистрация)
3. Изтрий примерния код
4. Копирай файловете един по един от тук

**Ред на копиране:**
```
App.js
src/theme/index.js
src/utils/storage.js
src/utils/streakUtils.js
src/context/HabitContext.js
src/components/HabitCard.js
src/screens/HomeScreen.js
src/screens/AddHabitScreen.js
src/screens/HabitDetailScreen.js
src/navigation/AppNavigator.js
```

---

## 📱 Стъпка 2: Тествай на телефона

1. Инсталирай **Expo Go** от Play Store
2. В Snack натисни "Run" → сканирай QR кода
3. Апп-ът се зарежда на телефона ти на живо!

---

## ☁️ Стъпка 3: Build за Play Store (без компютър!)

1. Регистрирай се на **expo.dev** (безплатно)
2. Инсталирай **EAS CLI** — използвай Termux на телефона:
   ```
   npm install -g eas-cli
   eas login
   eas build --platform android
   ```
3. EAS строи APK в облака (~15 мин)
4. Сваляш готовия `.aab` файл

---

## 🏪 Стъпка 4: Качи в Play Store

1. Отвори **play.google.com/console** от телефона
2. Плати $25 за Developer акаунт (еднократно)
3. Създай нов апп → качи `.aab` файла
4. Попълни описание, скрийншоти → Публикувай!

---

## 💰 Монетизация (следваща фаза)

- **Безплатно:** до 3 навика + банер реклами (AdMob)
- **Premium €2.99/м:** неограничени навици, без реклами

---

## 📁 Структура на проекта

```
App.js                          ← Входна точка
src/
├── theme/index.js              ← Цветове и стилове
├── utils/
│   ├── storage.js              ← Запазване на данни
│   └── streakUtils.js          ← Streak логика
├── context/HabitContext.js     ← Глобален стейт
├── components/HabitCard.js     ← Карта с навик
├── screens/
│   ├── HomeScreen.js           ← Главен екран
│   ├── AddHabitScreen.js       ← Добавяне/Редактиране
│   └── HabitDetailScreen.js    ← Детайли + статистика
└── navigation/AppNavigator.js  ← Навигация
```
