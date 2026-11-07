# Inline-режим бота на Cloudflare Workers

Після налаштування в будь-якому чаті Telegram:
- `@твій_бот` — угорі з'являється кнопка **«Відкрити CRYPTO HUNTERS»**, вона одразу запускає застосунок;
- `@твій_бот SOL` (або кілька: `@твій_бот SOL ETH`) — картка монети: ціна, зміна за 24 год, Heat і RSI на 1h / 4h / 1d, тренд, кнопки «Повний аналіз» і «Відкрити в Telegram» (застосунок відкривається одразу на графіку цієї монети).

Файл сервера: `server/telegram-worker.js`.

## 0. Перевір, чи бот уже має сервер (важливо)

Відкрий у браузері (підстав свій токен):

    https://api.telegram.org/bot<ТОКЕН>/getWebhookInfo

- Якщо в `"url"` є адреса — збережи її: це адреса твого теперішнього сервера. На кроці 2 її треба вписати у `FORWARD_URL`, тоді команди й повідомлення бота й далі йтимуть туди, а Cloudflare оброблятиме лише inline.
- Якщо `"url": ""`, а твій `heat-server.js` усе ж відповідає боту, він працює через polling. Після кроку 3 polling перестане отримувати повідомлення. У такому разі спершу напиши мені, і я переведу `heat-server.js` на прийом через Cloudflare.
- Якщо бот більше ніде не працює — нічого робити не треба.

## 1. Створи Worker

1. Зареєструйся або увійди на https://dash.cloudflare.com (безкоштовно).
2. **Workers & Pages → Create → Create Worker**, назва, наприклад, `crypto-hunters-bot` → **Deploy**.
3. **Edit code**, видали весь код і встав увесь вміст `server/telegram-worker.js` → **Deploy**.

## 2. Додай налаштування

**Settings → Variables and Secrets → Add**:

| Назва | Тип | Значення |
|---|---|---|
| `BOT_TOKEN` | Secret | токен бота з @BotFather |
| `WEBHOOK_SECRET` | Secret | будь-який довгий випадковий набір літер і цифр, напр. `ch7kq2...` (лише латиниця й цифри) |
| `BOT_USERNAME` | Text | ім'я бота без `@` |
| `FORWARD_URL` | Text | лише якщо на кроці 0 була адреса — встав її сюди |
| `APP_URL` | Text | не обов'язково; за замовчуванням `https://nickch7813.github.io/heat-index/` |

Збережи (**Deploy**).

## 3. Підключи бота до Worker

Відкрий у браузері (адресу Worker видно в його налаштуваннях):

    https://crypto-hunters-bot.<твій-піддомен>.workers.dev/setup?secret=<WEBHOOK_SECRET>

Має з'явитися `"ok": true`.

## 4. Увімкни inline-режим у @BotFather

1. `/setinline` → вибери бота → надішли підказку, наприклад `Тікер монети, напр. BTC або SOL…`.
2. `/mybots` → бот → **Bot Settings → Configure Mini App** → увімкни й вкажи `https://nickch7813.github.io/heat-index/` (потрібно для кнопки «Відкрити в Telegram»).

## 5. Перевір

У будь-якому чаті напиши `@твій_бот` — має з'явитися кнопка відкриття застосунку, а `@твій_бот SOL` — картка монети.

Якщо щось не так, відкрий `https://crypto-hunters-bot.<піддомен>.workers.dev/status?secret=<WEBHOOK_SECRET>`: у `last_error_message` буде видно причину.

Безкоштовного тарифу Cloudflare (100 000 запитів на день) вистачить із запасом. Дані беруться з публічних API Binance (дзеркало data-api.binance.vision, яке не блокується за регіоном) і Bybit, без ключів.
