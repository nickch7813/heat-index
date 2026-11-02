/* CRYPTO HUNTERS: the glue between the tools.
   build.py copies this script (with assets/ch.css and assets/tips.js) into every page, so a page never depends
   on a separate file that might be missing or cached: the page tag carries data-tool, data-ver and data-root.
   It gives every page the same top bar (brand, version, Telegram channel, tools), one shared light/dark theme,
   links from a coin to the other tools (each tool opens in its own browser tab), notifications and hover hints,
   and screenshots with the watermark. */
(function () {
  "use strict";
  var VERSION = "1.03";   // the site version, set by build.py on every update and shown in the header
  var me = document.currentScript, TOOL = (me && me.dataset.tool) || "heat";
  var PAGE_VER = (me && me.dataset.ver) || VERSION;   // the version the page itself was built with
  var ROOT = me && me.dataset.root != null ? new URL(me.dataset.root || "./", location.href).href.replace(/[?#].*$/, "")
    : me && me.src ? me.src.replace(/assets\/ch\.js(\?.*)?$/, "") : "./";
  var CHANNEL = "Cr_hunters", CHANNEL_URL = "https://t.me/" + CHANNEL, WATERMARK = "t.me/" + CHANNEL, BRAND = "CRYPTO HUNTERS";
  var REPO = "https://github.com/nickch7813/heat-index";
  // The logo is built in, so the header never depends on a separate image file (or its cache).
  var LOGO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="70 70 500 500" aria-hidden="true" focusable="false"><rect x="70" y="70" width="500" height="500" rx="120" fill="#0B0E14"/><circle cx="320" cy="320" r="200" fill="none" stroke="#F5A524" stroke-width="22"/><circle cx="320" cy="320" r="120" fill="none" stroke="#F5A524" stroke-width="6" stroke-opacity=".35"/><path d="M320 96v80M320 464v80M96 320h80M464 320h80" stroke="#F5A524" stroke-width="22" stroke-linecap="round"/><path d="M230 160v80M275 200v85M320 250v70" stroke="#F0475B" stroke-width="6"/><rect x="215" y="175" width="30" height="50" rx="4" fill="#F0475B"/><rect x="260" y="215" width="30" height="55" rx="4" fill="#F0475B"/><rect x="305" y="262" width="30" height="40" rx="4" fill="#F0475B"/><path d="M365 225v85M410 160v95" stroke="#2EBD85" stroke-width="6"/><rect x="350" y="240" width="30" height="60" rx="4" fill="#2EBD85"/><rect x="395" y="175" width="30" height="70" rx="4" fill="#2EBD85"/><circle cx="320" cy="320" r="14" fill="#F5A524"/></svg>';
  var THEME_KEY = "heat.theme";   // the key of Heat Index, so the main app and the tools share one theme

  // ---------- the tools ----------
  var IC = {
    heat: '<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.4-4 2.6-5.2.3 1.7 1.1 2.7 2.2 3.2C11.4 9 11 6 12 3z"/>',
    lab: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3M7.5 15h9"/>',
    elliott: '<path d="M3 17l4-6 3 3 4-9 3 6 4-4"/>',
    whales: '<path d="M3 13c2-4 6-6 10-5 3 .8 5 3 8 2-1 4-5 7-10 7-4 0-7-1.5-8-4zM17 8c.5-2 2-3 4-3"/><circle cx="8" cy="12" r=".6"/>',
    liq: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12l6-6"/>',
    volume: '<path d="M4 20V14M9 20V10M14 20V13M19 20V4"/>',
    bot: '<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9.5 16.5h5"/>'
  };
  var TOOLS = [
    { id: "heat", path: "" },
    { id: "lab", path: "coin-lab/" },
    { id: "elliott", path: "elliott/" },
    { id: "whales", path: "whales/" },
    { id: "liq", path: "liquidations/" },
    { id: "volume", path: "volume/" },
    { id: "bot", path: "paper-bot/" }
  ];
  var L = {
    uk: { heat: ["Heat Index", "Heat"], lab: ["Coin Lab", "Coin Lab"], elliott: ["Хвилі Елліотта", "Хвилі"], whales: ["Китовий сонар", "Кити"], liq: ["Радар ліквідацій", "Ліквідації"], volume: ["Сплески об’ємів", "Об’єми"], bot: ["Бот-трейдер", "Бот"],
      an: "Аналіз:", open: "Відкрити {c} у «{t}» (нова вкладка)", tools: "Інструменти", tg: "Телеграм-канал", cam: "Скріншот", wait: "Готую зображення…", save: "Зберегти", share: "Поділитися", copy: "Копіювати", copied: "Скопійовано", close: "Закрити", fail: "Не вдалося створити зображення: {e}", hint: "На телефоні можна також утримати зображення, щоб зберегти його.", nfa: "Не фінансова порада", src: "Код", log: "Журнал сповіщень", logAll: "Усі", logEmpty: "Поки що сповіщень немає. Тут збираються сповіщення з усіх інструментів: сигнали зон Heat Index (дзвіночок на картці монети), сповіщення Coin Lab і нові сплески об’ємів.", notif: "Сповіщення", tLog: "Журнал", tRules: "Правила", tSet: "Налаштування", alerts: "Цінові сповіщення", alAdd: "Сповіщення", alAddT: "Налаштувати сповіщення для {c}", now: "Зараз", dist: "до цілі {d}%", waiting: "Чекає першої перевірки", active: "Активне", off: "Вимкнене", firedOff: "Спрацювало", once: "Один раз", every: "Щоразу, пауза {m} хв", repeatEvery: "Щоразу, з паузою", lastFired: "Спрацювало: {t}", edit: "Змінити", del: "Видалити", delQ: "Видалити це сповіщення?", rulesEmpty: "Ще немає жодного сповіщення. Створіть перше: наприклад, коли ціна досягне певного рівня або підійде до нього ближче ніж на 1%.", rulesHint: "Ціни перевіряються кожні {s} с, поки відкрита хоча б одна вкладка будь-якого інструмента.", newRule: "Нове сповіщення", cancel: "Скасувати", save2: "Зберегти", k_reach: "ціна досягне {v}", k_above: "ціна вище {v}", k_below: "ціна нижче {v}", k_near: "ціна ближче ніж на {d}% до {v}", k_up24: "зростання за 24 год від {v}", k_dn24: "падіння за 24 год від {v}", k_rsiLo: "RSI {tf} нижче {v}", k_rsiHi: "RSI {tf} вище {v}", o_reach: "Ціна досягне рівня", o_above: "Ціна вище рівня", o_below: "Ціна нижче рівня", o_near: "Наближення до ціни", o_up24: "Зростання за 24 год, %", o_dn24: "Падіння за 24 год, %", o_rsiLo: "RSI нижче рівня (перепроданість)", o_rsiHi: "RSI вище рівня (перекупленість)", h_reach: "Спрацює, коли ціна дійде до рівня з будь-якого боку: вгору, якщо рівень вищий за поточну ціну, вниз, якщо нижчий.", h_above: "Спрацює, коли ціна буде на рівні або вище.", h_below: "Спрацює, коли ціна буде на рівні або нижче.", h_near: "Спрацює, коли ціна підійде до рівня ближче, ніж на вказаний відсоток, з будь-якого боку. Зручно, щоб встигнути підготуватися до входу чи виходу.", h_up24: "Спрацює, коли зміна ціни за 24 години досягне вказаного зростання.", h_dn24: "Спрацює, коли ціна за 24 години впаде на вказаний відсоток або більше.", h_rsiLo: "RSI 14 на вибраному таймфреймі, з поточною свічкою. 30 і нижче вважається перепроданістю.", h_rsiHi: "RSI 14 на вибраному таймфреймі, з поточною свічкою. 70 і вище вважається перекупленістю.", fCoin: "Монета", fQuote: "Котирування", fEx: "Біржа", fKind: "Умова", fPrice: "Ціна, {q}", fRsi: "Рівень RSI", fPct: "Відсоток", fNear: "Відстань, %", fTf: "Таймфрейм", fRepeat: "Повтор", fCd: "Пауза, хв", fNote: "Нотатка (необов’язково)", fNoteP: "напр. план входу", fCoinNeed: "Введіть тікер монети, напр. BTC", fValNeed: "Вкажіть значення більше нуля", fRsiNeed: "RSI має бути від 1 до 99", loading: "Завантажую ціну…", noPair: "Пару {p} не знайдено на {e}", errData: "Немає даних", onoff: "Увімкнути або вимкнути", sSound: "Звуковий сигнал", sBrowser: "Сповіщення браузера", perm_default: "Браузер ще не дав дозволу на сповіщення.", perm_granted: "Дозвіл браузера є.", perm_denied: "Браузер заборонив сповіщення для цього сайту. Дозвольте їх у налаштуваннях сайту в браузері.", perm_unsupported: "Тут сповіщення браузера недоступні (наприклад, усередині Telegram), але на екрані, звуком і в Telegram-бот усе працює.", allow: "Дозволити", sTg: "Надсилати в Telegram через свого бота", sToken: "Токен бота", sChat: "Chat ID або @канал", sTgHint: "Створіть бота в @BotFather, додайте його в чат чи канал і вкажіть його ID.", test: "Перевірити", tgTestMsg: "тестове сповіщення", tgOk: "Надіслано", tgFail: "Помилка: {e}", sEvery: "Як часто перевіряти", sec: "кожні {s} с", sNote: "Перевірка йде прямо в браузері, поки відкрита хоча б одна вкладка будь-якого інструмента CRYPTO HUNTERS. Якщо закрити всі вкладки, сповіщення не прийдуть.", testAll: "Тестове сповіщення", verOk: "Версія сайту {v}. Якщо після оновлення на GitHub тут стара версія, браузер показує сторінку з кешу", verOld: "Сторінка версії {p}, а скрипт версії {v}: браузер узяв частину файлів з кешу. Оновіть сторінку", logClear: "Очистити", logClearQ: "Видалити всі записи журналу?", logCsv: "CSV", logOpen: "Відкрити", logNew: "нове", buy: "зона купівлі", sell: "зона продажу", spike: "Сплеск об’єму ×{r}", candle: "свічка", brkUp: "пробій угору", brkDn: "пробій униз", spot: "спот", futures: "ф’ючерси", chScreen: "На екрані", chBrowser: "Браузер", chTelegram: "Telegram", chSound: "Звук", chLog: "Лише журнал", logHint: "Журнал зберігається в цьому браузері, до 300 останніх записів.", today: "сьогодні", yesterday: "вчора" },
    ru: { heat: ["Heat Index", "Heat"], lab: ["Coin Lab", "Coin Lab"], elliott: ["Волны Эллиотта", "Волны"], whales: ["Китовый сонар", "Киты"], liq: ["Радар ликвидаций", "Ликвидации"], volume: ["Всплески объёмов", "Объёмы"], bot: ["Бот-трейдер", "Бот"],
      an: "Анализ:", open: "Открыть {c} в «{t}» (новая вкладка)", tools: "Инструменты", tg: "Телеграм-канал", cam: "Скриншот", wait: "Готовлю изображение…", save: "Сохранить", share: "Поделиться", copy: "Копировать", copied: "Скопировано", close: "Закрыть", fail: "Не удалось создать изображение: {e}", hint: "На телефоне можно также удержать изображение, чтобы сохранить его.", nfa: "Не финансовый совет", src: "Код", log: "Журнал уведомлений", logAll: "Все", logEmpty: "Пока уведомлений нет. Здесь собираются уведомления всех инструментов: сигналы зон Heat Index (колокольчик на карточке монеты), уведомления Coin Lab и новые всплески объёмов.", notif: "Уведомления", tLog: "Журнал", tRules: "Правила", tSet: "Настройки", alerts: "Ценовые уведомления", alAdd: "Уведомление", alAddT: "Настроить уведомление для {c}", now: "Сейчас", dist: "до цели {d}%", waiting: "Ждёт первой проверки", active: "Активно", off: "Выключено", firedOff: "Сработало", once: "Один раз", every: "Каждый раз, пауза {m} мин", repeatEvery: "Каждый раз, с паузой", lastFired: "Сработало: {t}", edit: "Изменить", del: "Удалить", delQ: "Удалить это уведомление?", rulesEmpty: "Пока нет ни одного уведомления. Создайте первое: например, когда цена достигнет уровня или подойдёт к нему ближе чем на 1%.", rulesHint: "Цены проверяются каждые {s} с, пока открыта хотя бы одна вкладка любого инструмента.", newRule: "Новое уведомление", cancel: "Отмена", save2: "Сохранить", k_reach: "цена достигнет {v}", k_above: "цена выше {v}", k_below: "цена ниже {v}", k_near: "цена ближе чем на {d}% к {v}", k_up24: "рост за 24 ч от {v}", k_dn24: "падение за 24 ч от {v}", k_rsiLo: "RSI {tf} ниже {v}", k_rsiHi: "RSI {tf} выше {v}", o_reach: "Цена достигнет уровня", o_above: "Цена выше уровня", o_below: "Цена ниже уровня", o_near: "Приближение к цене", o_up24: "Рост за 24 ч, %", o_dn24: "Падение за 24 ч, %", o_rsiLo: "RSI ниже уровня (перепроданность)", o_rsiHi: "RSI выше уровня (перекупленность)", h_reach: "Сработает, когда цена дойдёт до уровня с любой стороны: вверх, если уровень выше текущей цены, вниз, если ниже.", h_above: "Сработает, когда цена будет на уровне или выше.", h_below: "Сработает, когда цена будет на уровне или ниже.", h_near: "Сработает, когда цена подойдёт к уровню ближе указанного процента с любой стороны. Удобно, чтобы успеть подготовиться ко входу или выходу.", h_up24: "Сработает, когда изменение цены за 24 часа достигнет указанного роста.", h_dn24: "Сработает, когда цена за 24 часа упадёт на указанный процент или больше.", h_rsiLo: "RSI 14 на выбранном таймфрейме, с текущей свечой. 30 и ниже считается перепроданностью.", h_rsiHi: "RSI 14 на выбранном таймфрейме, с текущей свечой. 70 и выше считается перекупленностью.", fCoin: "Монета", fQuote: "Котировка", fEx: "Биржа", fKind: "Условие", fPrice: "Цена, {q}", fRsi: "Уровень RSI", fPct: "Процент", fNear: "Расстояние, %", fTf: "Таймфрейм", fRepeat: "Повтор", fCd: "Пауза, мин", fNote: "Заметка (необязательно)", fNoteP: "напр. план входа", fCoinNeed: "Введите тикер монеты, напр. BTC", fValNeed: "Укажите значение больше нуля", fRsiNeed: "RSI должен быть от 1 до 99", loading: "Загружаю цену…", noPair: "Пара {p} не найдена на {e}", errData: "Нет данных", onoff: "Включить или выключить", sSound: "Звуковой сигнал", sBrowser: "Уведомления браузера", perm_default: "Браузер ещё не дал разрешения на уведомления.", perm_granted: "Разрешение браузера есть.", perm_denied: "Браузер запретил уведомления для этого сайта. Разрешите их в настройках сайта в браузере.", perm_unsupported: "Здесь уведомления браузера недоступны (например, внутри Telegram), но на экране, звуком и в Telegram-бот всё работает.", allow: "Разрешить", sTg: "Отправлять в Telegram через своего бота", sToken: "Токен бота", sChat: "Chat ID или @канал", sTgHint: "Создайте бота в @BotFather, добавьте его в чат или канал и укажите его ID.", test: "Проверить", tgTestMsg: "тестовое уведомление", tgOk: "Отправлено", tgFail: "Ошибка: {e}", sEvery: "Как часто проверять", sec: "каждые {s} с", sNote: "Проверка идёт прямо в браузере, пока открыта хотя бы одна вкладка любого инструмента CRYPTO HUNTERS. Если закрыть все вкладки, уведомления не придут.", testAll: "Тестовое уведомление", verOk: "Версия сайта {v}. Если после обновления на GitHub здесь старая версия, браузер показывает страницу из кэша", verOld: "Страница версии {p}, а скрипт версии {v}: браузер взял часть файлов из кэша. Обновите страницу", logClear: "Очистить", logClearQ: "Удалить все записи журнала?", logCsv: "CSV", logOpen: "Открыть", logNew: "новое", buy: "зона покупки", sell: "зона продажи", spike: "Всплеск объёма ×{r}", candle: "свеча", brkUp: "пробой вверх", brkDn: "пробой вниз", spot: "спот", futures: "фьючерсы", chScreen: "На экране", chBrowser: "Браузер", chTelegram: "Telegram", chSound: "Звук", chLog: "Только журнал", logHint: "Журнал хранится в этом браузере, до 300 последних записей.", today: "сегодня", yesterday: "вчера" },
    en: { heat: ["Heat Index", "Heat"], lab: ["Coin Lab", "Coin Lab"], elliott: ["Elliott Waves", "Elliott"], whales: ["Whale Sonar", "Whales"], liq: ["Liquidation Radar", "Liquidations"], volume: ["Volume Spikes", "Volume"], bot: ["Paper Bot", "Bot"],
      an: "Analyze:", open: "Open {c} in {t} (new tab)", tools: "Tools", tg: "Telegram channel", cam: "Screenshot", wait: "Preparing the image…", save: "Save", share: "Share", copy: "Copy", copied: "Copied", close: "Close", fail: "Could not create the image: {e}", hint: "On a phone you can also long-press the image to save it.", nfa: "Not financial advice", src: "Code", log: "Notification log", logAll: "All", logEmpty: "No notifications yet. Notifications from every tool are collected here: Heat Index zone signals (the bell on a coin card), Coin Lab alerts and new volume spikes.", notif: "Notifications", tLog: "Log", tRules: "Rules", tSet: "Settings", alerts: "Price alerts", alAdd: "Alert", alAddT: "Set an alert for {c}", now: "Now", dist: "{d}% to target", waiting: "Waiting for the first check", active: "Active", off: "Off", firedOff: "Fired", once: "Once", every: "Every time, {m} min pause", repeatEvery: "Every time, with a pause", lastFired: "Fired: {t}", edit: "Edit", del: "Delete", delQ: "Delete this alert?", rulesEmpty: "No alerts yet. Create the first one: for example, when the price reaches a level or comes within 1% of it.", rulesHint: "Prices are checked every {s} s while at least one tab of any tool is open.", newRule: "New alert", cancel: "Cancel", save2: "Save", k_reach: "price reaches {v}", k_above: "price above {v}", k_below: "price below {v}", k_near: "price within {d}% of {v}", k_up24: "24h rise of {v} or more", k_dn24: "24h drop of {v} or more", k_rsiLo: "RSI {tf} below {v}", k_rsiHi: "RSI {tf} above {v}", o_reach: "Price reaches a level", o_above: "Price above a level", o_below: "Price below a level", o_near: "Price comes close to a level", o_up24: "24h rise, %", o_dn24: "24h drop, %", o_rsiLo: "RSI below a level (oversold)", o_rsiHi: "RSI above a level (overbought)", h_reach: "Fires when the price gets to the level from either side: up if the level is above the current price, down if it is below.", h_above: "Fires when the price is at or above the level.", h_below: "Fires when the price is at or below the level.", h_near: "Fires when the price comes closer to the level than the given percent, from either side. Handy to get ready for an entry or exit.", h_up24: "Fires when the 24h price change reaches the given rise.", h_dn24: "Fires when the price has dropped by the given percent or more over 24 hours.", h_rsiLo: "RSI 14 on the chosen timeframe, current candle included. 30 and below is usually read as oversold.", h_rsiHi: "RSI 14 on the chosen timeframe, current candle included. 70 and above is usually read as overbought.", fCoin: "Coin", fQuote: "Quote", fEx: "Exchange", fKind: "Condition", fPrice: "Price, {q}", fRsi: "RSI level", fPct: "Percent", fNear: "Distance, %", fTf: "Timeframe", fRepeat: "Repeat", fCd: "Pause, min", fNote: "Note (optional)", fNoteP: "e.g. entry plan", fCoinNeed: "Enter a coin ticker, e.g. BTC", fValNeed: "Enter a value above zero", fRsiNeed: "RSI must be between 1 and 99", loading: "Loading the price…", noPair: "{p} was not found on {e}", errData: "No data", onoff: "Turn on or off", sSound: "Sound", sBrowser: "Browser notifications", perm_default: "The browser has not been asked for permission yet.", perm_granted: "The browser allows notifications.", perm_denied: "The browser blocked notifications for this site. Allow them in the site settings of your browser.", perm_unsupported: "Browser notifications are not available here (for example inside Telegram), but on-screen, sound and Telegram bot alerts work.", allow: "Allow", sTg: "Send to Telegram through my bot", sToken: "Bot token", sChat: "Chat ID or @channel", sTgHint: "Create a bot in @BotFather, add it to a chat or channel and enter its ID.", test: "Test", tgTestMsg: "test notification", tgOk: "Sent", tgFail: "Error: {e}", sEvery: "How often to check", sec: "every {s} s", sNote: "Checks run right in the browser while at least one tab of any CRYPTO HUNTERS tool is open. If every tab is closed, no alerts arrive.", testAll: "Test notification", verOk: "Site version {v}. If an old version shows here after a GitHub update, the browser is using its cache", verOld: "The page is version {p} but the script is {v}: the browser took some files from its cache. Reload the page", logClear: "Clear", logClearQ: "Delete every entry of the log?", logCsv: "CSV", logOpen: "Open", logNew: "new", buy: "buy zone", sell: "sell zone", spike: "Volume spike ×{r}", candle: "candle", brkUp: "breakout up", brkDn: "breakdown", spot: "spot", futures: "futures", chScreen: "On screen", chBrowser: "Browser", chTelegram: "Telegram", chSound: "Sound", chLog: "Log only", logHint: "The log is kept in this browser, up to the last 300 entries.", today: "today", yesterday: "yesterday" }
  };
  function lang() { var l = (document.documentElement.lang || "en").slice(0, 2).toLowerCase(); return L[l] ? l : "en"; }
  function tr(k, p) { var s = L[lang()][k]; if (s == null) s = L.en[k]; if (Array.isArray(s)) return s; s = String(s); if (p) s = s.replace(/\{(\w+)\}/g, function (_, x) { return p[x] == null ? "" : p[x]; }); return s; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function icon(id) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[id] || "") + "</svg>"; }
  var TG_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 4.2 2.9 11.4c-1.3.5-1.3 1.2-.2 1.6l4.8 1.5 1.8 5.6c.2.6.1.9.8.9.5 0 .7-.2 1-.5l2.3-2.3 4.9 3.6c.9.5 1.5.2 1.8-.8l3.2-15.1c.3-1.3-.5-1.9-1.4-1.5zM8.2 14.2l9.4-5.9c.5-.3.9-.1.5.2l-8 7.2-.3 3.4-1.6-4.9z"/></svg>';

  // ---------- one theme for every tool ----------
  var lastUser = 0;
  ["pointerdown", "keydown"].forEach(function (ev) { addEventListener(ev, function (e) { if (e.isTrusted) lastUser = Date.now(); }, true); });
  function saved() { try { var v = localStorage.getItem(THEME_KEY); return v === "dark" || v === "light" ? v : null; } catch (e) { return null; } }
  var start = saved();
  if (start) document.documentElement.dataset.theme = start;
  // A theme the person picks in any tool is stored under the shared key; a theme set by the page itself (Telegram, system) is not.
  new MutationObserver(function () {
    var th = document.documentElement.dataset.theme;
    if ((th === "dark" || th === "light") && Date.now() - lastUser < 1500) { try { localStorage.setItem(THEME_KEY, th); } catch (e) {} }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  addEventListener("storage", function (e) { if (e.key === THEME_KEY && (e.newValue === "dark" || e.newValue === "light") && document.hidden) document.documentElement.dataset.theme = e.newValue; });

  // ---------- links between the tools ----------
  var EXN = { binance: "Binance", bybit: "Bybit", okx: "OKX" };
  function normEx(ex) { ex = String(ex || "binance").toLowerCase(); return EXN[ex] ? ex : "binance"; }
  function url(id, o) {
    var t = TOOLS.filter(function (x) { return x.id === id; })[0]; if (!t) return ROOT;
    var base = ROOT + t.path; if (!o || !o.coin) return base;
    var coin = String(o.coin).toUpperCase(), q = String(o.q || "USDT").toUpperCase(), ex = normEx(o.ex);
    if (id === "heat") return base + "#/chart/" + EXN[ex] + "/" + encodeURIComponent(coin) + (q === "BTC" ? "" : "/USDT");
    if (id === "liq") return base + "#" + encodeURIComponent(coin) + "USDT";
    if (id === "volume") return base + "?coin=" + encodeURIComponent(coin);
    if (id === "whales" && ex === "okx") ex = "binance";
    return base + "?coin=" + encodeURIComponent(coin) + "&q=" + encodeURIComponent(q) + "&ex=" + ex;
  }
  // The tools a coin can be opened in, in this order (the bot trades by itself, so it is not a target).
  var TARGETS = ["heat", "lab", "elliott", "whales", "liq", "volume"];
  function links(o) {
    if (!o || !o.coin) return "";
    var from = o.from || TOOL, coin = String(o.coin).toUpperCase(), q = String(o.q || "USDT").toUpperCase();
    var list = TARGETS.filter(function (id) { return id !== from && !(id === "liq" && q !== "USDT"); });
    return '<div class="ch-links" translate="no" data-ch><em>' + esc(tr("an")) + "</em>" + list.map(function (id) {
      var nm = tr(id)[1];
      return '<a href="' + esc(url(id, o)) + '" target="ch_' + id + '" data-ch-href title="' + esc(tr("open", { c: coin, t: tr(id)[0] })) + '">' + icon(id) + "<span>" + esc(nm) + "</span></a>";
    }).join("") + '<button type="button" class="ch-al" data-ch-alert data-coin="' + esc(coin) + '" data-q="' + esc(q) + '" data-ex="' + esc(normEx(o.ex)) + '" title="' + esc(tr("alAddT", { c: coin })) + '">' + BELL + "<span>" + esc(tr("alAdd")) + "</span></button></div>";
  }
  function linksInto(el, o) { if (!el) return; var h = links(o); if (el.__ch !== h) { el.innerHTML = h; el.__ch = h; } }

  // A card that re-renders often can swap the link between press and release; open on release so the tap is never lost.
  var press = null, eat = 0;
  function tg() { var w = window.Telegram && window.Telegram.WebApp; return w && w.platform && w.platform !== "unknown" ? w : null; }
  function go(a) {
    var href = a.getAttribute("href"), T = tg();
    if (T) { try { if (/^https:\/\/t\.me\//.test(href)) T.openTelegramLink(href); else T.openLink(new URL(href, location.href).href); return; } catch (e) {} }
    var w = window.open(href, a.getAttribute("target") || "_blank"); if (w) { try { w.focus(); } catch (e) {} } else location.href = href;
  }
  addEventListener("pointerdown", function (e) { var a = e.target.closest && e.target.closest("[data-ch] a[href], a[data-ch-href]"); press = a && e.button === 0 ? { href: a.getAttribute("href"), x: e.clientX, y: e.clientY } : null; }, true);
  addEventListener("pointerup", function (e) {
    var p = press; press = null; if (!p) return; var a = e.target.closest && e.target.closest("[data-ch] a[href], a[data-ch-href]");
    if (!a || a.getAttribute("href") !== p.href || Math.abs(e.clientX - p.x) > 12 || Math.abs(e.clientY - p.y) > 12) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;   // let the browser handle new-tab gestures itself
    eat = Date.now(); go(a);
  }, true);
  addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-ch] a[href], a[data-ch-href]"); if (!a) return;
    e.stopPropagation(); if (e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault(); if (Date.now() - eat < 800) return; go(a);   // keyboard Enter comes here
  }, true);

  // ---------- deep links: ?coin=SOL&q=USDT&ex=binance&tf=1h ----------
  function param() {
    var s = new URLSearchParams(location.search), c = (s.get("coin") || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    return { coin: c || null, q: (s.get("q") || "").toUpperCase().replace(/[^A-Z0-9]/g, "") || null, ex: s.get("ex") ? normEx(s.get("ex")) : null, tf: s.get("tf") || null };
  }

  // ---------- watermark and screenshots ----------
  function palette() {
    var cs = getComputedStyle(document.documentElement), g = function (n, d) { return (cs.getPropertyValue(n) || "").trim() || d; };
    return { bg: g("--ch-bg", "#16181d"), tx: g("--ch-tx", "#e8eaed"), mu: g("--ch-t2", "#a0a4ab"), line: g("--ch-bd", "#2c3038"), ac: g("--ch-brand", "#f5a524") };
  }
  // The same mark as in Heat Index: a strip with the channel under the picture and a faint pattern across all of it, so cropping does not remove it.
  function mark(cv) {
    var P = palette(), dark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    var W = cv.width, H = cv.height, k = W / 1080, strip = Math.round(64 * k), out = document.createElement("canvas");
    out.width = W; out.height = H + strip; var g = out.getContext("2d"); g.drawImage(cv, 0, 0);
    g.fillStyle = P.bg; g.fillRect(0, H, W, strip); g.fillStyle = P.line; g.fillRect(Math.round(64 * k), H, W - 2 * Math.round(64 * k), Math.max(1, Math.round(2 * k)));
    g.save(); g.globalAlpha = dark ? .07 : .06; g.fillStyle = P.tx; g.font = "700 " + Math.round(34 * k) + "px system-ui,sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    g.translate(W / 2, (H + strip) / 2); g.rotate(-Math.PI / 9);
    var stepY = Math.round(230 * k), stepX = Math.round(430 * k), span = Math.ceil(Math.hypot(W, H + strip) / 2 / stepY) + 1;
    for (var r = -span; r <= span; r++) for (var q = -4; q <= 4; q++) g.fillText(WATERMARK, q * stepX + (r % 2 ? stepX / 2 : 0), r * stepY);
    g.restore();
    g.fillStyle = P.ac; g.font = "700 " + Math.round(30 * k) + "px system-ui,sans-serif"; g.textAlign = "center"; g.textBaseline = "alphabetic"; g.fillText(WATERMARK, W / 2, H + Math.round(strip * .68));
    return out;
  }
  // A header with the brand, the tool and the time above a captured block.
  function frame(src, title) {
    var P = palette(), W = src.width, k = W / 1080, head = Math.round(96 * k), out = document.createElement("canvas");
    out.width = W; out.height = src.height + head; var g = out.getContext("2d");
    g.fillStyle = P.bg; g.fillRect(0, 0, W, out.height); g.drawImage(src, 0, head);
    var M = Math.round(40 * k);
    g.textBaseline = "alphabetic"; g.fillStyle = P.ac; g.font = "700 " + Math.round(30 * k) + "px system-ui,sans-serif"; g.textAlign = "left"; g.fillText(BRAND, M, Math.round(52 * k));
    g.fillStyle = P.mu; g.font = "500 " + Math.round(24 * k) + "px system-ui,sans-serif"; g.fillText(title || tr(TOOL)[0], M, Math.round(82 * k));
    g.textAlign = "right"; g.fillText(new Date().toLocaleString(document.documentElement.lang || undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }), W - M, Math.round(52 * k));
    g.fillText(tr("nfa"), W - M, Math.round(82 * k));
    g.fillStyle = P.line; g.fillRect(M, head - Math.max(1, Math.round(2 * k)), W - 2 * M, Math.max(1, Math.round(2 * k)));
    return out;
  }
  var h2c = null;
  function loadH2C() {
    if (window.html2canvas) return Promise.resolve();
    if (!h2c) h2c = new Promise(function (res, rej) { var s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"; s.onload = res; s.onerror = function () { h2c = null; rej(new Error("html2canvas")); }; document.head.appendChild(s); });
    return h2c;
  }
  var SH = { blob: null, url: null, name: "" };
  function modal() {
    var m = document.getElementById("chShot"); if (m) return m;
    m = document.createElement("div"); m.id = "chShot"; m.className = "ch-shot"; m.hidden = true; m.setAttribute("translate", "no"); m.setAttribute("data-html2canvas-ignore", "true");
    m.innerHTML = '<div class="ch-pn" role="dialog" aria-modal="true"><div class="ch-wait"></div><img alt=""><div class="ch-acts"><a class="on" data-a="save" download></a><button data-a="share" hidden></button><button data-a="copy" hidden></button><button data-a="close"></button></div><p></p></div>';
    m.addEventListener("click", async function (e) {
      var a = e.target.closest("[data-a]"), k = a && a.dataset.a;
      if (e.target === m || k === "close") { m.hidden = true; return; }
      if (k === "share" && SH.blob) { try { await navigator.share({ files: [new File([SH.blob], SH.name, { type: "image/png" })], text: CHANNEL_URL }); } catch (er) {} }
      if (k === "copy" && SH.blob) { try { await navigator.clipboard.write([new ClipboardItem({ "image/png": SH.blob })]); a.textContent = tr("copied"); } catch (er) {} }
    });
    addEventListener("keydown", function (e) { if (e.key === "Escape" && !m.hidden) m.hidden = true; });
    document.body.appendChild(m); return m;
  }
  function stamp() { var d = new Date(), z = function (n) { return String(n).padStart(2, "0"); }; return d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + "-" + z(d.getHours()) + z(d.getMinutes()); }
  async function showCanvas(cv, name) {
    var m = modal(), img = m.querySelector("img");
    SH.blob = await new Promise(function (r) { cv.toBlob(r, "image/png"); }); if (!SH.blob) throw new Error("toBlob");
    if (SH.url) URL.revokeObjectURL(SH.url); SH.url = URL.createObjectURL(SH.blob); SH.name = (name || "crypto-hunters") + "-" + stamp() + ".png";
    img.src = SH.url; img.style.display = "block"; m.querySelector(".ch-wait").style.display = "none";
    var sv = m.querySelector('[data-a="save"]'); sv.href = SH.url; sv.download = SH.name;
    m.querySelector('[data-a="share"]').hidden = !(navigator.canShare && navigator.canShare({ files: [new File([SH.blob], SH.name, { type: "image/png" })] }));
    m.querySelector('[data-a="copy"]').hidden = !(navigator.clipboard && window.ClipboardItem);
  }
  function openWait() {
    var m = modal(); m.querySelector(".ch-wait").textContent = tr("wait"); m.querySelector(".ch-wait").style.display = "block"; m.querySelector("img").style.display = "none";
    m.querySelector('[data-a="save"]').textContent = tr("save"); m.querySelector('[data-a="share"]').textContent = tr("share"); m.querySelector('[data-a="copy"]').textContent = tr("copy"); m.querySelector('[data-a="close"]').textContent = tr("close");
    m.querySelector("p").textContent = tr("hint"); m.querySelector('[data-a="save"]').removeAttribute("href"); m.hidden = false; return m;
  }
  // Screenshot of a block of the page: header with the brand, the block, then the watermark.
  async function shot(el, o) {
    o = o || {}; if (!el) return; var m = openWait();
    try {
      await loadH2C();
      var bg = getComputedStyle(document.body).backgroundColor;
      var src = await window.html2canvas(el, { backgroundColor: bg, scale: Math.max(2, Math.min(3, 1080 / Math.max(320, el.offsetWidth))), useCORS: true, logging: false,
        ignoreElements: function (n) { return n.classList && (n.classList.contains("ch-cam") || n.classList.contains("ch-links")); } });
      await showCanvas(mark(frame(src, o.title)), o.name || TOOL);
    } catch (e) { m.querySelector(".ch-wait").textContent = tr("fail", { e: (e && e.message) || e }); }
  }
  // A camera button; host gets it as the last child (float: true puts it in the top-right corner of host).
  function cam(host, getEl, o) {
    o = o || {}; if (!host || host.querySelector(":scope > .ch-cam")) return;
    var b = document.createElement("button"); b.type = "button"; b.className = "ch-cam" + (o.float ? " ch-float" : ""); b.setAttribute("data-html2canvas-ignore", "true"); b.setAttribute("translate", "no");
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l1.6-2h6.8L17 8h3v11H4z"/><circle cx="12" cy="13.2" r="3.4"/></svg><span></span>';
    var lab = function () { b.querySelector("span").textContent = (o.label === false) ? "" : tr("cam"); b.setAttribute("aria-label", tr("cam")); b.title = tr("cam"); };
    lab(); new MutationObserver(lab).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    if (o.float && getComputedStyle(host).position === "static") host.style.position = "relative";
    b.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); shot(typeof getEl === "function" ? getEl() : getEl, typeof o.opts === "function" ? o.opts() : o.opts); });
    host.appendChild(b);
  }


  // ---------- notifications: one log, alert rules and settings for every tool ----------
  // Every tool that notifies calls CH.log(entry). Alert rules (price, distance to a price, 24h change, RSI) are checked here,
  // in whichever tool tab is open; one tab at a time does the checking, so a signal is never sent twice.
  // Everything lives in localStorage of this site, so all tools and tabs share it.
  var LOG_KEY = "ch.log", SEEN_KEY = "ch.logSeen", LOG_MAX = 300, RULES_KEY = "ch.rules", SET_KEY = "ch.alertSet", ENG_KEY = "ch.eng";
  var logFilter = "all", tab = "log", editing = null;
  function jget(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } }
  function jset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function logRead() { var a = jget(LOG_KEY, []); return Array.isArray(a) ? a : []; }
  function logWrite(a) { if (!jset(LOG_KEY, a.slice(-LOG_MAX))) jset(LOG_KEY, a.slice(-100)); }
  function seenAt() { try { return +localStorage.getItem(SEEN_KEY) || 0; } catch (e) { return 0; } }
  function log(e) {
    if (!e) return; var a = logRead();
    e = Object.assign({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), at: Date.now(), tool: TOOL }, e);
    if (e.coin) e.coin = String(e.coin).toUpperCase();
    a.push(e); logWrite(a); badge(); if (panelOpen() && tab === "log") renderPanel();
    return e;
  }
  function unread() { var s = seenAt(); return logRead().filter(function (e) { return e.at > s; }).length; }
  function badge() { document.querySelectorAll(".ch-bell b").forEach(function (b) { var n = unread(); b.textContent = n > 99 ? "99+" : n; b.hidden = !n; }); }
  addEventListener("storage", function (e) {
    if (e.key === LOG_KEY || e.key === SEEN_KEY) { badge(); if (panelOpen() && tab === "log") renderPanel(); }
    if (e.key === RULES_KEY && panelOpen() && tab === "rules" && !editing) renderPanel();
  });
  function when(at) {
    var d = new Date(at), now = new Date(), y = new Date(now); y.setDate(now.getDate() - 1);
    var hm = d.toLocaleTimeString(document.documentElement.lang || undefined, { hour: "2-digit", minute: "2-digit" });
    if (d.toDateString() === now.toDateString()) return tr("today") + ", " + hm;
    if (d.toDateString() === y.toDateString()) return tr("yesterday") + ", " + hm;
    return d.toLocaleDateString(document.documentElement.lang || undefined, { day: "2-digit", month: "short" }) + ", " + hm;
  }
  function pct(v) { v = +v; return (v > 0 ? "+" : "") + (Math.abs(v) < 10 ? v.toFixed(2) : v.toFixed(1)) + "%"; }
  function fp(p) {
    p = +p; if (!isFinite(p)) return "—"; var a = Math.abs(p);
    var d = a >= 1000 ? 2 : a >= 100 ? 2 : a >= 1 ? 4 : a >= 0.01 ? 5 : a >= 0.0001 ? 7 : 9;
    return p.toLocaleString("en-US", { minimumFractionDigits: Math.min(d, 2), maximumFractionDigits: d }).replace(/,/g, " ");
  }

  // ---- settings shared by every rule ----
  var DEF_SET = { every: 30, sound: true, browser: true, tg: false, tgToken: "", tgChat: "" };
  function settings() { return Object.assign({}, DEF_SET, jget(SET_KEY, {})); }

  // ---- rules ----
  // kinds: reach (price reaches v; direction set at creation), above, below, near (within d % of v), up24 / dn24 (24h change), rsiLo / rsiHi (RSI 14 on tf)
  var KINDS = ["reach", "above", "below", "near", "up24", "dn24", "rsiLo", "rsiHi"];
  function rules() { var a = jget(RULES_KEY, []); return Array.isArray(a) ? a : []; }
  function saveRules(a) { jset(RULES_KEY, a); }
  function ruleText(r, short) {
    var v = r.kind === "rsiLo" || r.kind === "rsiHi" ? String(+r.v) : r.kind === "up24" || r.kind === "dn24" ? Math.abs(+r.v) + "%" : fp(r.v) + " " + (r.q || "");
    var s = tr("k_" + r.kind, { v: v, d: r.d, tf: r.tf || "1h" });
    return short ? s : (r.coin + "/" + r.q + " · " + (EXN[r.ex] || r.ex) + " — " + s);
  }
  function cond(r, d) {
    var p = d.p, v = +r.v;
    switch (r.kind) {
      case "reach": return r.dir === "up" ? p >= v : p <= v;
      case "above": return p >= v;
      case "below": return p <= v;
      case "near": return v > 0 && Math.abs(p - v) / v * 100 <= (+r.d || 1);
      case "up24": return d.chg != null && d.chg >= Math.abs(v);
      case "dn24": return d.chg != null && d.chg <= -Math.abs(v);
      case "rsiLo": return d.rsi != null && d.rsi <= v;
      case "rsiHi": return d.rsi != null && d.rsi >= v;
    }
    return false;
  }

  // ---- market data (public exchange APIs, no keys) ----
  async function getJ(u) { var r = await fetch(u, { cache: "no-store" }); if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }
  async function ticker(ex, coin, q) {
    if (ex === "bybit") { var j = await getJ("https://api.bybit.com/v5/market/tickers?category=spot&symbol=" + coin + q), t = j.result && j.result.list && j.result.list[0]; if (!t) throw new Error("no pair"); return { p: +t.lastPrice, chg: +t.price24hPcnt * 100 }; }
    if (ex === "okx") { var o = await getJ("https://www.okx.com/api/v5/market/ticker?instId=" + coin + "-" + q), x = o.data && o.data[0]; if (!x) throw new Error("no pair"); return { p: +x.last, chg: +x.open24h ? (x.last / x.open24h - 1) * 100 : null }; }
    var b = await getJ("https://api.binance.com/api/v3/ticker/24hr?symbol=" + coin + q); return { p: +b.lastPrice, chg: +b.priceChangePercent };
  }
  var TFM = { "15m": ["15m", "15", "15m"], "1h": ["1h", "60", "1H"], "4h": ["4h", "240", "4H"], "1d": ["1d", "D", "1Dutc"] };
  async function closes(ex, coin, q, tf) {
    var m = TFM[tf] || TFM["1h"];
    if (ex === "bybit") { var j = await getJ("https://api.bybit.com/v5/market/kline?category=spot&symbol=" + coin + q + "&interval=" + m[1] + "&limit=200"); return (j.result.list || []).map(function (k) { return +k[4]; }).reverse(); }
    if (ex === "okx") { var o = await getJ("https://www.okx.com/api/v5/market/candles?instId=" + coin + "-" + q + "&bar=" + m[2] + "&limit=200"); return (o.data || []).map(function (k) { return +k[4]; }).reverse(); }
    var b = await getJ("https://api.binance.com/api/v3/klines?symbol=" + coin + q + "&interval=" + m[0] + "&limit=200"); return b.map(function (k) { return +k[4]; });
  }
  function rsi(c, n) {   // Wilder RSI on closes, the last (still forming) candle included, as exchanges show it
    n = n || 14; if (c.length <= n) return null; var g = 0, l = 0, i;
    for (i = 1; i <= n; i++) { var d = c[i] - c[i - 1]; if (d > 0) g += d; else l -= d; }
    g /= n; l /= n;
    for (i = n + 1; i < c.length; i++) { var e = c[i] - c[i - 1]; g = (g * (n - 1) + Math.max(e, 0)) / n; l = (l * (n - 1) + Math.max(-e, 0)) / n; }
    return l === 0 ? 100 : 100 - 100 / (1 + g / l);
  }
  var RSIC = {};
  async function rsiOf(ex, coin, q, tf) {
    var k = ex + coin + q + tf, c = RSIC[k]; if (c && Date.now() - c.at < 60e3) return c.v;
    var v = rsi(await closes(ex, coin, q, tf)); RSIC[k] = { at: Date.now(), v: v }; return v;
  }

  // ---- delivering a fired rule ----
  var actx = null;
  function beep() {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var t = actx.currentTime;
      [880, 1175].forEach(function (f, i) { var o = actx.createOscillator(), g = actx.createGain(); o.type = "sine"; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t + i * .18); g.gain.exponentialRampToValueAtTime(.25, t + i * .18 + .02); g.gain.exponentialRampToValueAtTime(.0001, t + i * .18 + .16); o.connect(g); g.connect(actx.destination); o.start(t + i * .18); o.stop(t + i * .18 + .17); });
    } catch (e) {}
  }
  function toast(title, body, href) {
    var w = document.getElementById("chToasts"); if (!w) { w = document.createElement("div"); w.id = "chToasts"; w.className = "ch-toasts"; w.setAttribute("translate", "no"); w.setAttribute("aria-live", "polite"); w.setAttribute("data-html2canvas-ignore", "true"); document.body.appendChild(w); }
    var t = document.createElement("div"); t.className = "ch-toast"; t.setAttribute("data-ch", "");
    t.innerHTML = '<b>' + esc(title) + "</b>" + (body ? "<p>" + esc(body) + "</p>" : "") + (href ? '<a href="' + esc(href) + '" target="ch_lab" data-ch-href>' + esc(tr("logOpen")) + " ↗</a>" : "") + '<button type="button" aria-label="' + esc(tr("close")) + '">✕</button>';
    t.querySelector("button").onclick = function () { t.remove(); };
    w.appendChild(t); setTimeout(function () { t.remove(); }, 12000);
  }
  async function tgSend(text, S) {
    var r = await fetch("https://api.telegram.org/bot" + S.tgToken + "/sendMessage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: S.tgChat, text: text, disable_web_page_preview: true }) });
    var j = await r.json().catch(function () { return { ok: false, description: "HTTP " + r.status }; }); if (!j.ok) throw new Error(j.description || "error"); return j;
  }
  async function deliver(r, d) {
    var S = settings(), ch = ["screen"], pair = r.coin + "/" + r.q, title = pair + ": " + ruleText(r, true);
    var line = tr("now") + " " + fp(d.p) + (d.chg != null ? " · 24h " + pct(d.chg) : "") + (d.rsi != null ? " · RSI " + d.rsi.toFixed(1) : "");
    var href = url("lab", { coin: r.coin, q: r.q, ex: r.ex });
    toast(title, line + (r.note ? "\n" + r.note : ""), href);
    if (S.sound) { beep(); ch.push("sound"); }
    if (S.browser) { try { if ("Notification" in window && Notification.permission === "granted") { new Notification(BRAND + " · " + title, { body: line + (r.note ? "\n" + r.note : ""), tag: "ch-" + r.id }); ch.push("browser"); } } catch (e) {} }
    if (S.tg && S.tgToken && S.tgChat) { try { await tgSend("🔔 " + title + "\n" + (EXN[r.ex] || r.ex) + " · " + line + (r.note ? "\n📝 " + r.note : "") + "\n\n" + href + "\n" + CHANNEL_URL, S); ch.push("telegram"); } catch (e) {} }
    log({ tool: "alerts", kind: "rule", coin: r.coin, q: r.q, ex: r.ex, rk: r.kind, v: r.v, d: r.d, tf: r.tf, dir: r.dir, p: d.p, chg: d.chg, rsi: d.rsi, note: r.note || "", ch: ch });
  }

  // ---- the checking loop: one leader tab ----
  var ME = Math.random().toString(36).slice(2), busy = false, timer = null;
  function lead() {
    var l = jget(ENG_KEY, null), now = Date.now(), every = settings().every * 1000;
    if (!l || l.id === ME || now - l.t > Math.max(3 * every, 90e3)) { jset(ENG_KEY, { id: ME, t: now }); return true; }
    return false;
  }
  addEventListener("pagehide", function () { var l = jget(ENG_KEY, null); if (l && l.id === ME) try { localStorage.removeItem(ENG_KEY); } catch (e) {} });
  async function tick(force) {
    if (busy) return; var list = rules().filter(function (r) { return r.on; }); if (!list.length) return;
    if (!force && !lead()) return; busy = true;
    try {
      var groups = {}; list.forEach(function (r) { var k = r.ex + "|" + r.coin + "|" + r.q; (groups[k] = groups[k] || []).push(r); });
      var data = {}, now = Date.now();
      await Promise.all(Object.keys(groups).map(async function (k) {
        var g = groups[k], r0 = g[0];
        try {
          var d = await ticker(r0.ex, r0.coin, r0.q);
          var tfs = {}; g.forEach(function (r) { if (r.kind === "rsiLo" || r.kind === "rsiHi") tfs[r.tf || "1h"] = 1; });
          d.rsiTf = {}; for (var tf in tfs) { try { d.rsiTf[tf] = await rsiOf(r0.ex, r0.coin, r0.q, tf); } catch (e) { d.rsiTf[tf] = null; } }
          data[k] = d;
        } catch (e) { data[k] = { err: e.message || String(e) }; }
      }));
      var fire = [], cur = rules();   // re-read: a rule may have been edited meanwhile
      cur.forEach(function (r) {
        if (!r.on) return; var d0 = data[r.ex + "|" + r.coin + "|" + r.q]; if (!d0) return;
        if (d0.err) { r.err = d0.err; return; }
        var d = { p: d0.p, chg: d0.chg, rsi: r.kind === "rsiLo" || r.kind === "rsiHi" ? d0.rsiTf[r.tf || "1h"] : null };
        r.err = null; r.last = { p: d.p, chg: d.chg, rsi: d.rsi, at: now };
        var c = cond(r, d), cd = (+r.cd || 0) * 60e3;
        if (c && !r.state && (!r.fired || now - r.fired >= cd)) { r.state = true; r.fired = now; r.count = (r.count || 0) + 1; if (r.repeat === "once") r.on = false; fire.push([r, d]); }
        else if (!c) r.state = false;
      });
      saveRules(cur);
      for (var i = 0; i < fire.length; i++) await deliver(fire[i][0], fire[i][1]);
      if (panelOpen() && tab === "rules" && !editing) renderPanel();
    } finally { busy = false; }
  }
  function schedule() { clearInterval(timer); timer = setInterval(tick, Math.max(10, settings().every) * 1000); }
  setTimeout(function () { tick(); schedule(); }, 3000);

  // ---- the panel: log, rules, settings ----
  function panelOpen() { var p = document.getElementById("chLog"); return p && !p.hidden; }
  function panel() {
    var p = document.getElementById("chLog"); if (p) return p;
    p = document.createElement("div"); p.id = "chLog"; p.className = "ch-log"; p.hidden = true; p.setAttribute("translate", "no"); p.setAttribute("data-html2canvas-ignore", "true");
    p.innerHTML = '<section class="ch-lp" role="dialog" aria-modal="true" aria-labelledby="chLogT"><header><h2 id="chLogT"></h2><button type="button" class="ch-x" data-l="close"></button></header><div class="ch-tabs" role="tablist"></div><div class="ch-lf" role="group"></div><div class="ch-ll"></div><footer></footer></section>';
    p.addEventListener("click", onPanelClick);
    p.addEventListener("change", onPanelChange);
    p.addEventListener("input", onPanelInput);
    addEventListener("keydown", function (e) { if (e.key === "Escape" && panelOpen()) closePanel(); });
    document.body.appendChild(p); return p;
  }
  var CHN = { screen: "chScreen", browser: "chBrowser", telegram: "chTelegram", sound: "chSound" };
  function entryText(e) {
    var pair = e.coin ? e.coin + (e.q ? "/" + e.q : "") : "";
    if (e.kind === "zone") return { title: pair + ": " + tr(e.z === "buy" ? "buy" : "sell"), lines: ["Heat " + (e.hn || "") + " = " + e.v] };
    if (e.kind === "spike") {
      var l = [(EXN[e.ex] || e.ex || "") + " " + tr(e.mk === "futures" ? "futures" : "spot") + " " + (e.tf || "") + " · " + tr("candle") + " " + pct(e.c)];
      if (e.b) l.push(tr(e.b > 0 ? "brkUp" : "brkDn"));
      return { title: pair + ": " + tr("spike", { r: (+e.r).toFixed(1) }), lines: l };
    }
    if (e.kind === "rule") {
      var t = ruleText({ kind: e.rk, v: e.v, d: e.d, tf: e.tf, q: e.q }, true), ln = [(EXN[e.ex] || e.ex) + " · " + tr("now") + " " + fp(e.p) + (e.chg != null ? " · 24h " + pct(e.chg) : "") + (e.rsi != null ? " · RSI " + (+e.rsi).toFixed(1) : "")];
      if (e.note) ln.push(e.note);
      return { title: pair + ": " + t, lines: ln };
    }
    if (e.lines && e.lines.length) return { title: pair || e.title || "", lines: e.lines };
    return { title: e.title || pair, lines: e.body ? [e.body] : [] };
  }
  function toolName(id) { return id === "alerts" ? [tr("alerts"), tr("alerts")] : (tr(id) || [id, id]); }
  function toolIcon(id) { return id === "alerts" ? BELL : icon(id); }
  function renderPanel() {
    var p = panel(); p.querySelector("h2").textContent = tr("notif");
    var x = p.querySelector(".ch-x"); x.textContent = "✕"; x.setAttribute("aria-label", tr("close"));
    var nR = rules().filter(function (r) { return r.on; }).length;
    p.querySelector(".ch-tabs").innerHTML = [["log", tr("tLog")], ["rules", tr("tRules") + (nR ? " · " + nR : "")], ["set", tr("tSet")]].map(function (t) {
      return '<button type="button" role="tab" data-l="tab" data-v="' + t[0] + '" aria-selected="' + (tab === t[0]) + '">' + esc(t[1]) + "</button>";
    }).join("");
    var f = p.querySelector(".ch-lf"), L = p.querySelector(".ch-ll"), F = p.querySelector("footer");
    if (tab === "log") renderLogTab(p, f, L, F); else if (tab === "rules") renderRulesTab(f, L, F); else renderSetTab(f, L, F);
  }
  function renderLogTab(p, f, L, F) {
    var all = logRead().slice().reverse(), seen = +p.dataset.seen || 0;
    var ids = TOOLS.map(function (t) { return t.id; }).concat(["alerts"]).filter(function (id) { return all.some(function (e) { return e.tool === id; }); });
    if (logFilter !== "all" && ids.indexOf(logFilter) < 0) logFilter = "all";
    f.innerHTML = ids.length > 1 ? ['<button type="button" data-l="f" data-v="all" aria-pressed="' + (logFilter === "all") + '">' + esc(tr("logAll")) + " · " + all.length + "</button>"].concat(ids.map(function (id) {
      var n = all.filter(function (e) { return e.tool === id; }).length;
      return '<button type="button" data-l="f" data-v="' + id + '" aria-pressed="' + (logFilter === id) + '">' + toolIcon(id) + esc(toolName(id)[1]) + " · " + n + "</button>";
    })).join("") : "";
    var list = all.filter(function (e) { return logFilter === "all" || e.tool === logFilter; });
    L.innerHTML = list.length ? list.map(function (e) {
      var x = entryText(e), chs = (e.ch || []).filter(function (c) { return CHN[c]; }), tgt = e.tool === "alerts" ? "lab" : e.tool;
      var open = e.coin ? '<a href="' + esc(url(tgt, { coin: e.coin, q: e.q, ex: e.ex })) + '" target="ch_' + esc(tgt) + '" data-ch-href>' + esc(tr("logOpen")) + " ↗</a>" : "";
      return '<article class="ch-le' + (e.at > seen ? " ch-new" : "") + '"><div class="ch-lm">' + toolIcon(e.tool) + "<span>" + esc(toolName(e.tool)[0]) + "</span>" + (e.at > seen ? "<em>" + esc(tr("logNew")) + "</em>" : "") + "<time>" + esc(when(e.at)) + "</time></div>" +
        "<b>" + esc(x.title) + "</b>" + x.lines.map(function (l) { return "<p>" + esc(l) + "</p>"; }).join("") +
        '<div class="ch-lc">' + (chs.length ? chs : ["log"]).map(function (c) { return "<span>" + esc(tr(c === "log" ? "chLog" : CHN[c])) + "</span>"; }).join("") + open + "</div></article>";
    }).join("") : '<p class="ch-l0">' + esc(tr("logEmpty")) + "</p>";
    F.innerHTML = '<span class="ch-lh">' + esc(tr("logHint")) + '</span><button type="button" data-l="csv">' + esc(tr("logCsv")) + '</button><button type="button" data-l="clear">' + esc(tr("logClear")) + "</button>";
  }
  function opt(v, label, cur) { return '<option value="' + esc(v) + '"' + (String(v) === String(cur) ? " selected" : "") + ">" + esc(label) + "</option>"; }
  function renderRulesTab(f, L, F) {
    f.innerHTML = "";
    if (editing) { L.innerHTML = formHTML(editing); F.innerHTML = '<span class="ch-lh"></span><button type="button" data-l="cancel">' + esc(tr("cancel")) + '</button><button type="button" class="on" data-l="save">' + esc(tr("save2")) + "</button>"; livePrice(); return; }
    var list = rules();
    L.innerHTML = '<button type="button" class="ch-add" data-l="new">＋ ' + esc(tr("newRule")) + "</button>" + (list.length ? list.slice().reverse().map(function (r) {
      var st = r.err ? '<span class="ch-err">' + esc(tr("errData")) + "</span>" : r.on ? '<span class="ch-ok">' + esc(tr("active")) + "</span>" : '<span>' + esc(r.count ? tr("firedOff") : tr("off")) + "</span>";
      var lp = r.last ? tr("now") + " " + fp(r.last.p) + (r.kind === "rsiLo" || r.kind === "rsiHi" ? (r.last.rsi != null ? " · RSI " + r.last.rsi.toFixed(1) : "") : r.kind === "up24" || r.kind === "dn24" ? (r.last.chg != null ? " · 24h " + pct(r.last.chg) : "") : (+r.v ? " · " + tr("dist", { d: (Math.abs(r.last.p - r.v) / r.v * 100).toFixed(2) }) : "")) : tr("waiting");
      return '<article class="ch-rule' + (r.on ? "" : " ch-offr") + '"><div class="ch-rt"><b>' + esc(r.coin + "/" + r.q) + "</b><span>" + esc(EXN[r.ex] || r.ex) + "</span>" +
        '<label class="ch-sw" title="' + esc(tr("onoff")) + '"><input type="checkbox" data-l="toggle" data-id="' + esc(r.id) + '"' + (r.on ? " checked" : "") + '><i></i></label></div>' +
        "<p>" + esc(ruleText(r, true)) + "</p>" + (r.note ? '<p class="ch-note">' + esc(r.note) + "</p>" : "") +
        '<div class="ch-lc">' + st + "<span>" + esc(r.repeat === "once" ? tr("once") : tr("every", { m: r.cd || 0 })) + "</span>" + (r.fired ? "<span>" + esc(tr("lastFired", { t: when(r.fired) })) + "</span>" : "") + "</div>" +
        '<div class="ch-rm"><small>' + esc(lp) + '</small><button type="button" data-l="edit" data-id="' + esc(r.id) + '">' + esc(tr("edit")) + '</button><button type="button" data-l="del" data-id="' + esc(r.id) + '">' + esc(tr("del")) + "</button></div></article>";
    }).join("") : '<p class="ch-l0">' + esc(tr("rulesEmpty")) + "</p>");
    var S = settings();
    F.innerHTML = '<span class="ch-lh">' + esc(tr("rulesHint", { s: S.every })) + "</span>";
  }
  function formHTML(r) {
    var k = r.kind, isP = ["reach", "above", "below", "near"].indexOf(k) >= 0, isR = k === "rsiLo" || k === "rsiHi";
    var vl = isP ? tr("fPrice", { q: r.q }) : isR ? tr("fRsi") : tr("fPct");
    return '<form class="ch-form" onsubmit="return false">' +
      '<div class="ch-f3"><label>' + esc(tr("fCoin")) + '<input name="coin" value="' + esc(r.coin || "") + '" placeholder="BTC" autocomplete="off" autocapitalize="characters" spellcheck="false"></label>' +
      "<label>" + esc(tr("fQuote")) + '<select name="q">' + ["USDT", "USDC", "BTC"].map(function (q) { return opt(q, q, r.q); }).join("") + "</select></label>" +
      "<label>" + esc(tr("fEx")) + '<select name="ex">' + ["binance", "bybit", "okx"].map(function (e) { return opt(e, EXN[e], r.ex); }).join("") + "</select></label></div>" +
      '<div class="ch-now" id="chNow">' + esc(tr("loading")) + "</div>" +
      "<label>" + esc(tr("fKind")) + '<select name="kind">' + KINDS.map(function (x) { return opt(x, tr("o_" + x), k); }).join("") + "</select></label>" +
      '<div class="ch-f2"><label>' + esc(vl) + '<input name="v" type="number" inputmode="decimal" step="any" value="' + esc(r.v == null ? "" : r.v) + '"></label>' +
      (k === "near" ? "<label>" + esc(tr("fNear")) + '<input name="d" type="number" inputmode="decimal" step="any" min="0.05" value="' + esc(r.d || 1) + '"></label>' : "") +
      (isR ? "<label>" + esc(tr("fTf")) + '<select name="tf">' + ["15m", "1h", "4h", "1d"].map(function (t) { return opt(t, t, r.tf || "1h"); }).join("") + "</select></label>" : "") + "</div>" +
      (isP ? '<div class="ch-quick">' + [-10, -5, -2, -1, 1, 2, 5, 10].map(function (d) { return '<button type="button" data-l="qp" data-v="' + d + '">' + (d > 0 ? "+" : "") + d + "%</button>"; }).join("") + "</div>" : "") +
      '<p class="ch-fh">' + esc(tr("h_" + k)) + "</p>" +
      '<div class="ch-f2"><label>' + esc(tr("fRepeat")) + '<select name="repeat">' + opt("once", tr("once"), r.repeat) + opt("every", tr("repeatEvery"), r.repeat) + "</select></label>" +
      (r.repeat === "every" ? "<label>" + esc(tr("fCd")) + '<input name="cd" type="number" inputmode="numeric" min="1" step="1" value="' + esc(r.cd || 60) + '"></label>' : "") + "</div>" +
      "<label>" + esc(tr("fNote")) + '<input name="note" maxlength="140" value="' + esc(r.note || "") + '" placeholder="' + esc(tr("fNoteP")) + '"></label>' +
      '<p class="ch-ferr" id="chFErr" hidden></p></form>';
  }
  var nowT = null, nowP = null;
  function livePrice() {
    clearTimeout(nowT); nowT = setTimeout(async function () {
      var el = document.getElementById("chNow"); if (!el || !editing) return; var r = editing;
      if (!/^[A-Z0-9]{2,15}$/.test(r.coin || "")) { el.textContent = tr("fCoinNeed"); nowP = null; return; }
      el.textContent = tr("loading");
      try { var d = await ticker(r.ex, r.coin, r.q); nowP = d.p; var x = document.getElementById("chNow"); if (x && editing === r) x.textContent = tr("now") + " " + fp(d.p) + " " + r.q + " · 24h " + pct(d.chg); }
      catch (e) { nowP = null; var y = document.getElementById("chNow"); if (y) y.textContent = tr("noPair", { p: r.coin + "/" + r.q, e: EXN[r.ex] }); }
    }, 350);
  }
  function readForm() {
    var fm = document.querySelector("#chLog .ch-form"); if (!fm || !editing) return;
    var g = function (n) { var el = fm.elements[n]; return el ? el.value : undefined; };
    var coin = (g("coin") || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    var ch = coin !== editing.coin || g("q") !== editing.q || g("ex") !== editing.ex;
    editing.coin = coin; editing.q = g("q"); editing.ex = g("ex"); editing.kind = g("kind");
    editing.v = g("v") === "" ? null : +g("v");
    if (g("d") !== undefined) editing.d = +g("d"); if (g("tf") !== undefined) editing.tf = g("tf");
    editing.repeat = g("repeat"); if (g("cd") !== undefined) editing.cd = Math.max(1, Math.round(+g("cd") || 60));
    editing.note = (g("note") || "").trim();
    return ch;
  }
  function onPanelInput(e) { if (e.target.closest(".ch-form")) { if (readForm()) livePrice(); } }
  function onPanelChange(e) {
    var t = e.target;
    if (t.dataset.l === "toggle") { var a = rules(), r = a.filter(function (x) { return x.id === t.dataset.id; })[0]; if (r) { r.on = t.checked; r.state = false; r.err = null; saveRules(a); renderPanel(); if (r.on) tick(true); } return; }
    if (t.closest(".ch-form") && !t.closest(".ch-set")) {
      var prev = editing.kind, ch = readForm(), PK = ["reach", "above", "below", "near"];
      if (t.name === "kind") {
        var k = editing.kind;
        if (k === "rsiLo" || k === "rsiHi") editing.v = k === "rsiLo" ? 30 : 70;
        else if (k === "up24" || k === "dn24") editing.v = 5;
        else if (PK.indexOf(prev) < 0) editing.v = nowP != null ? +nowP.toPrecision(6) : null;
        renderPanel();
      } else if (t.name === "repeat") renderPanel();
      else if (ch) livePrice();
      return;
    }
    if (t.closest(".ch-set")) {
      var S = settings(), fm = t.closest(".ch-set");
      S.sound = fm.elements.sound.checked; S.browser = fm.elements.browser.checked; S.tg = fm.elements.tg.checked;
      S.tgToken = fm.elements.tgToken.value.trim(); S.tgChat = fm.elements.tgChat.value.trim(); S.every = +fm.elements.every.value || 30;
      jset(SET_KEY, S); schedule();
      if (t.name === "browser" && S.browser) askBrowser();
      if (t.name === "sound" && S.sound) beep();
      if (t.name === "tg") renderPanel();
    }
  }
  function askBrowser() { try { if ("Notification" in window && Notification.permission === "default") Notification.requestPermission().then(function () { if (panelOpen()) renderPanel(); }); } catch (e) {} }
  function validate(r) {
    if (!/^[A-Z0-9]{2,15}$/.test(r.coin || "")) return tr("fCoinNeed");
    if (r.v == null || !isFinite(r.v)) return tr("fValNeed");
    if ((r.kind === "rsiLo" || r.kind === "rsiHi") && (r.v <= 0 || r.v >= 100)) return tr("fRsiNeed");
    if (["reach", "above", "below", "near"].indexOf(r.kind) >= 0 && r.v <= 0) return tr("fValNeed");
    if (r.kind === "near" && !(r.d > 0)) return tr("fValNeed");
    return null;
  }
  async function saveForm() {
    readForm(); var r = editing, err = validate(r), box = document.getElementById("chFErr");
    if (err) { box.textContent = err; box.hidden = false; return; }
    if (r.kind === "reach") {
      var p = nowP; if (p == null) { try { p = (await ticker(r.ex, r.coin, r.q)).p; } catch (e) { box.textContent = tr("noPair", { p: r.coin + "/" + r.q, e: EXN[r.ex] }); box.hidden = false; return; } }
      r.dir = r.v >= p ? "up" : "down";
    }
    var a = rules(), i = a.findIndex(function (x) { return x.id === r.id; });
    var clean = { id: r.id, coin: r.coin, q: r.q, ex: r.ex, kind: r.kind, v: r.v, d: r.kind === "near" ? r.d : undefined, tf: r.kind === "rsiLo" || r.kind === "rsiHi" ? r.tf || "1h" : undefined, dir: r.dir, repeat: r.repeat, cd: r.repeat === "every" ? r.cd || 60 : undefined, note: r.note, on: true, state: false, created: r.created || Date.now(), count: r.count || 0, fired: r.fired };
    if (i >= 0) a[i] = clean; else a.push(clean);
    saveRules(a); editing = null; renderPanel(); askBrowser(); tick(true);
  }
  function renderSetTab(f, L, F) {
    f.innerHTML = ""; var S = settings(), perm = "Notification" in window ? Notification.permission : "unsupported";
    L.innerHTML = '<form class="ch-set ch-form" onsubmit="return false">' +
      '<label class="ch-chk"><input type="checkbox" name="sound"' + (S.sound ? " checked" : "") + "><span>" + esc(tr("sSound")) + "</span></label>" +
      '<label class="ch-chk"><input type="checkbox" name="browser"' + (S.browser ? " checked" : "") + "><span>" + esc(tr("sBrowser")) + "</span></label>" +
      '<p class="ch-fh">' + esc(tr("perm_" + perm)) + (perm === "default" ? ' <button type="button" data-l="perm">' + esc(tr("allow")) + "</button>" : "") + "</p>" +
      '<label class="ch-chk"><input type="checkbox" name="tg"' + (S.tg ? " checked" : "") + "><span>" + esc(tr("sTg")) + "</span></label>" +
      (S.tg ? '<div class="ch-f2"><label>' + esc(tr("sToken")) + '<input name="tgToken" value="' + esc(S.tgToken) + '" autocomplete="off" spellcheck="false" placeholder="123456:ABC…"></label><label>' + esc(tr("sChat")) + '<input name="tgChat" value="' + esc(S.tgChat) + '" autocomplete="off" spellcheck="false" placeholder="@channel / -100…"></label></div><p class="ch-fh">' + esc(tr("sTgHint")) + ' <button type="button" data-l="tgtest">' + esc(tr("test")) + '</button> <span id="chTgSt"></span></p>' : '<input type="hidden" name="tgToken" value="' + esc(S.tgToken) + '"><input type="hidden" name="tgChat" value="' + esc(S.tgChat) + '">') +
      "<label>" + esc(tr("sEvery")) + '<select name="every">' + [15, 30, 60, 120].map(function (s) { return opt(s, tr("sec", { s: s }), S.every); }).join("") + "</select></label>" +
      '<p class="ch-fh">' + esc(tr("sNote")) + "</p></form>";
    F.innerHTML = '<span class="ch-lh"></span><button type="button" data-l="testall">' + esc(tr("testAll")) + "</button>";
  }
  async function onPanelClick(e) {
    var p = document.getElementById("chLog"), b = e.target.closest("[data-l]"), k = b && b.dataset.l;
    if (e.target === p || k === "close") return closePanel();
    if (!k) return;
    if (k === "tab") { tab = b.dataset.v; editing = null; if (tab === "log") { p.dataset.seen = seenAt(); try { localStorage.setItem(SEEN_KEY, String(Date.now())); } catch (er) {} badge(); } renderPanel(); }
    if (k === "f") { logFilter = b.dataset.v; renderPanel(); }
    if (k === "clear" && confirm(tr("logClearQ"))) { logWrite([]); try { localStorage.setItem(SEEN_KEY, String(Date.now())); } catch (er) {} renderPanel(); badge(); }
    if (k === "csv") csv();
    if (k === "new") { startForm({}); }
    if (k === "edit") { var r = rules().filter(function (x) { return x.id === b.dataset.id; })[0]; if (r) { editing = Object.assign({}, r); nowP = r.last ? r.last.p : null; renderPanel(); } }
    if (k === "del" && confirm(tr("delQ"))) { saveRules(rules().filter(function (x) { return x.id !== b.dataset.id; })); renderPanel(); }
    if (k === "cancel") { editing = null; renderPanel(); }
    if (k === "save") saveForm();
    if (k === "qp") { if (nowP == null) return; var d = +b.dataset.v, v = nowP * (1 + d / 100); var fm = p.querySelector(".ch-form"); fm.elements.v.value = +v.toPrecision(6); readForm(); }
    if (k === "perm") askBrowser();
    if (k === "tgtest") { var S = settings(), st = document.getElementById("chTgSt"); st.textContent = "…"; try { await tgSend("✅ " + BRAND + ": " + tr("tgTestMsg") + "\n" + CHANNEL_URL, S); st.textContent = tr("tgOk"); } catch (er) { st.textContent = tr("tgFail", { e: er.message }); } }
    if (k === "testall") { var S2 = settings(); toast(BRAND, tr("tgTestMsg")); if (S2.sound) beep(); try { if (S2.browser && "Notification" in window && Notification.permission === "granted") new Notification(BRAND, { body: tr("tgTestMsg") }); } catch (er) {} if (S2.tg && S2.tgToken && S2.tgChat) { try { await tgSend("✅ " + BRAND + ": " + tr("tgTestMsg"), S2); } catch (er) { toast("Telegram", tr("tgFail", { e: er.message })); } } }
  }
  function startForm(o) {
    tab = "rules"; nowP = o.p || null;
    editing = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), coin: (o.coin || "").toUpperCase(), q: (o.q || "USDT").toUpperCase(), ex: normEx(o.ex), kind: o.kind || "reach", v: o.v != null ? o.v : null, d: 1, tf: "1h", repeat: "once", cd: 60, note: "" };
    if (["USDT", "USDC", "BTC"].indexOf(editing.q) < 0) editing.q = "USDT";
    renderPanel();
    if (editing.coin && editing.v == null) { ticker(editing.ex, editing.coin, editing.q).then(function (d) { if (editing && editing.v == null) { nowP = d.p; editing.v = +d.p.toPrecision(6); renderPanel(); } }).catch(function () {}); }
  }
  var retFocus = null;
  function openPanel(t, o) {
    var p = panel(); retFocus = document.activeElement; tab = t || "log"; editing = null;
    p.dataset.seen = seenAt(); p.hidden = false; document.documentElement.classList.add("ch-lock");
    if (tab === "log") { try { localStorage.setItem(SEEN_KEY, String(Date.now())); } catch (e) {} badge(); }
    if (o) startForm(o); else renderPanel();
    var x = p.querySelector(".ch-x"); if (x) x.focus();
  }
  function closePanel() { var p = document.getElementById("chLog"); if (!p) return; p.hidden = true; editing = null; document.documentElement.classList.remove("ch-lock"); if (retFocus && retFocus.focus) retFocus.focus(); }
  function csv() {
    var rows = [["time", "tool", "coin", "quote", "exchange", "title", "details", "channels"]].concat(logRead().map(function (e) { var x = entryText(e); return [new Date(e.at).toISOString(), e.tool, e.coin || "", e.q || "", e.ex || "", x.title, x.lines.join(" | "), (e.ch || []).join(" ")]; }));
    var text = "\ufeff" + rows.map(function (r) { return r.map(function (v) { v = String(v == null ? "" : v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(","); }).join("\n");
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" })); a.download = "crypto-hunters-notifications-" + stamp() + ".csv"; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  // the bell opens the log; a bell on a coin card opens a new rule for that coin
  addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-ch-log]"); if (b) { e.preventDefault(); openPanel("log"); return; }
    var a = e.target.closest && e.target.closest("[data-ch-alert]");
    if (a) { e.preventDefault(); e.stopPropagation(); openPanel("rules", { coin: a.dataset.coin, q: a.dataset.q, ex: a.dataset.ex }); }
  }, true);
  var BELL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"/></svg>';


  // ---------- hover hints for every tool ----------
  // Sources, first found wins: an entry of assets/tips.js matching the element (or one of its parents), its title,
  // the aria-label of an icon-only control, the full text of a cut-off label. Mouse hover and keyboard focus only;
  // on touch screens the tools keep their own tap hints.
  var TIPS = null, tipEl = null, tipFor = null, tipT = null, tipOff = false;
  function loadTips() { if (window.CH_TIPS) { TIPS = window.CH_TIPS; return; } var s = document.createElement("script"); s.src = ROOT + "assets/tips.js?v=" + VERSION; s.onload = function () { TIPS = window.CH_TIPS || null; }; document.head.appendChild(s); }
  function tipLang(e) { var l = lang(), i = l === "uk" ? 1 : l === "ru" ? 2 : 3; return e[i] || e[3] || e[1]; }
  function fromDict(el) {
    if (!TIPS) return null; var lists = [TIPS[TOOL] || [], TIPS.common || []];
    for (var d = 0, n = el; n && n !== document.body && d < 5; d++, n = n.parentElement) {
      for (var a = 0; a < lists.length; a++) for (var i = 0; i < lists[a].length; i++) { try { if (n.matches(lists[a][i][0])) return { el: n, text: tipLang(lists[a][i]) }; } catch (e) {} }
    }
    return null;
  }
  // Heat Index cards and Coin Lab info buttons show their own tap hints from title / data-tip; leave those alone.
  function ownTips(el) { return (TOOL === "heat" && el.closest("#list .card, #v-table")) || (TOOL === "lab" && el.closest(".ib")); }
  function tipSource(t) {
    if (!t || !t.closest || t.closest(".ch-tip, #chShot")) return null;
    var d = fromDict(t); if (d && !ownTips(d.el)) return d;
    var ti = t.closest("[title], [data-ch-title]");
    if (ti && !ownTips(ti)) { var tt = ti.getAttribute("title") || ti.getAttribute("data-ch-title"); if (tt && tt.trim()) return { el: ti, text: tt, title: true }; }
    var c = t.closest("button, a, [role=button], summary, input, select");
    if (c) { var al = c.getAttribute("aria-label"), vis = (c.innerText || "").trim(); if (al && (vis.length <= 2 || al.length > vis.length + 6)) return { el: c, text: al }; }
    var x = t.closest("span, b, td, th, a, button, div, p, h3");
    if (x && x.children.length === 0 && x.scrollWidth > x.clientWidth + 1 && getComputedStyle(x).textOverflow === "ellipsis") return { el: x, text: x.textContent.trim() };
    return null;
  }
  function placeTip(target) {
    var r = target.getBoundingClientRect(), b = tipEl.getBoundingClientRect(), vw = document.documentElement.clientWidth, m = 8;
    var top = r.top - b.height - m, below = top < 6; if (below) top = r.bottom + m;
    var left = Math.min(Math.max(6, r.left + r.width / 2 - b.width / 2), vw - b.width - 6);
    tipEl.style.top = Math.round(top) + "px"; tipEl.style.left = Math.round(left) + "px"; tipEl.dataset.side = below ? "b" : "t";
  }
  function showTip(src) {
    if (!tipEl) { tipEl = document.createElement("div"); tipEl.className = "ch-tip"; tipEl.id = "chTip"; tipEl.setAttribute("role", "tooltip"); tipEl.setAttribute("translate", "no"); tipEl.setAttribute("data-html2canvas-ignore", "true"); document.body.appendChild(tipEl); }
    if (src.title && src.el.hasAttribute("title")) { src.el.setAttribute("data-ch-title", src.el.getAttribute("title")); src.el.removeAttribute("title"); }   // no second, native tooltip
    tipFor = src.el; tipEl.textContent = src.text; tipEl.hidden = false; tipEl.style.top = "-999px"; tipEl.style.left = "0px";
    src.el.setAttribute("aria-describedby", "chTip"); placeTip(src.el);
  }
  function hideTip() {
    clearTimeout(tipT); if (!tipFor) return;
    if (tipFor.hasAttribute("data-ch-title")) { tipFor.setAttribute("title", tipFor.getAttribute("data-ch-title")); tipFor.removeAttribute("data-ch-title"); }
    if (tipFor.getAttribute("aria-describedby") === "chTip") tipFor.removeAttribute("aria-describedby");
    tipFor = null; if (tipEl) tipEl.hidden = true;
  }
  addEventListener("pointerover", function (e) {
    if (e.pointerType !== "mouse" || tipOff) return;
    var src = tipSource(e.target);
    if (!src) { if (tipFor && !tipFor.contains(e.target)) hideTip(); return; }
    if (src.el === tipFor) return;
    hideTip(); tipT = setTimeout(function () { if (src.el.isConnected && src.el.matches(":hover")) showTip(src); }, 350);
  }, true);
  addEventListener("pointerout", function (e) { if (tipFor && (!e.relatedTarget || !tipFor.contains(e.relatedTarget))) hideTip(); else if (!tipFor) clearTimeout(tipT); }, true);
  addEventListener("pointerdown", hideTip, true);
  addEventListener("scroll", hideTip, true);
  addEventListener("keydown", function (e) { if (e.key === "Escape") hideTip(); }, true);
  addEventListener("focusin", function (e) { var t = e.target; if (!t.matches || !t.matches(":focus-visible")) return; var src = tipSource(t); if (src && src.el === t) { hideTip(); showTip(src); } });
  addEventListener("focusout", hideTip);
  // An element under the pointer that is replaced by a re-render takes its hint with it.
  setInterval(function () { if (tipFor && !tipFor.isConnected) hideTip(); }, 500);

  // ---------- bar and footer ----------
  function barHTML() {
    var home = TOOL === "heat";
    var nav = TOOLS.map(function (t) {
      var nm = tr(t.id)[0];
      return t.id === TOOL ? "<span aria-current=\"page\">" + icon(t.id) + esc(nm) + "</span>" : '<a href="' + esc(ROOT + t.path) + '" target="ch_' + t.id + '">' + icon(t.id) + esc(nm) + "</a>";
    }).join("");
    return '<div class="ch-in"><div class="ch-row"><a class="ch-brand" href="' + esc(ROOT) + '"' + (home ? "" : ' target="ch_heat"') + '><span class="ch-logo">' + LOGO + '</span><span>CRYPTO <b>HUNTERS</b></span></a>' + verHTML() + '<span class="ch-sp"></span>' +
      '<button type="button" class="ch-bell" data-ch-log aria-label="' + esc(tr("notif")) + '" title="' + esc(tr("notif")) + '">' + BELL + '<b hidden></b></button>' +
      '<a class="ch-tg" href="' + CHANNEL_URL + '" target="_blank" rel="noopener" title="' + esc(tr("tg")) + '">' + TG_ICON + "<span>@" + CHANNEL + "</span></a></div>" +
      '<nav class="ch-nav" aria-label="' + esc(tr("tools")) + '">' + nav + "</nav></div>";
  }
  function verHTML() {
    var ok = PAGE_VER === VERSION;
    return '<span class="ch-ver' + (ok ? "" : " ch-old") + '" title="' + esc(ok ? tr("verOk", { v: VERSION }) : tr("verOld", { p: PAGE_VER, v: VERSION })) + '">v' + esc(VERSION) + (ok ? "" : " ≠ " + esc(PAGE_VER)) + "</span>";
  }
  function footHTML() {
    return '<div class="ch-in"><b>' + BRAND + '</b><span>v' + esc(VERSION) + '</span><a href="' + CHANNEL_URL + '" target="_blank" rel="noopener">@' + CHANNEL + '</a><a href="' + REPO + '" target="_blank" rel="noopener">GitHub</a><span>' + esc(tr("nfa")) + "</span></div>";
  }
  function favicon() {
    try {
      var l = document.querySelector('link[rel="icon"]') || document.createElement("link"); l.rel = "icon"; l.type = "image/svg+xml";
      l.href = "data:image/svg+xml," + encodeURIComponent(LOGO.replace(' aria-hidden="true" focusable="false"', ''));
      if (!l.parentNode) document.head.appendChild(l);
    } catch (e) {}
  }
  function mount() {
    favicon();
    if (TOOL !== "heat") document.body.classList.add("ch-skin");
    try { if (!window.name) window.name = "ch_" + TOOL; } catch (e) {}   // so a link to this tool from another one reuses this tab
    var bar = document.createElement("header"); bar.className = "ch-top"; bar.setAttribute("translate", "no"); bar.setAttribute("data-ch", ""); bar.setAttribute("data-html2canvas-ignore", "true");
    var foot = document.createElement("footer"); foot.className = "ch-foot"; foot.setAttribute("translate", "no"); foot.setAttribute("data-ch", ""); foot.setAttribute("data-html2canvas-ignore", "true");
    var draw = function () { bar.innerHTML = barHTML(); foot.innerHTML = footHTML(); badge(); if (panelOpen()) renderPanel(); var on = bar.querySelector(".ch-nav span"); if (on && on.scrollIntoView) { var n = bar.querySelector(".ch-nav"); n.scrollLeft = on.offsetLeft - 40; } };
    draw(); document.body.insertBefore(bar, document.body.firstChild); badge();
    var host = document.querySelector("[data-ch-foot]") || document.body; host.appendChild(foot);
    new MutationObserver(function () { draw(); document.querySelectorAll(".ch-links").forEach(function (el) { el.__ch = null; }); if (panelOpen()) renderPanel(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", loadTips); else loadTips();

  window.CH = {
    tool: TOOL, root: ROOT, logo: LOGO, version: VERSION, channel: CHANNEL_URL, watermark: WATERMARK,
    theme: function (fallback) { return saved() || fallback || null; },
    url: url, links: links, linksInto: linksInto, param: param,
    mark: mark, frame: frame, shot: shot, cam: cam, showCanvas: showCanvas, t: tr,
    log: log, openLog: function () { openPanel("log"); }, openAlerts: function (o) { openPanel("rules", o || null); }, logEntries: logRead, rules: rules
  };
})();
