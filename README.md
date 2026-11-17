# CRYPTO HUNTERS · crypto market analysis tools

Telegram channel: [@Cr_hunters](https://t.me/Cr_hunters)

Version: **2.21**

## What is new in 2.21

- **Ready post text** under every screenshot: a "Copy text" button gives a caption with the numbers, link and hashtags (all 8 languages).
- **Cycle alerts**: a bell on the Global Cycle page notifies about a phase change and a growing bottom confirmation (sound, browser, Telegram — as set in Alerts).
- **Daily Card** (`daily/`): one square 1080×1080 "market state" picture — BTC, cycle phase, Heat Index, top Scanner matches — plus post text. Cycle, Heat and Scanner publish their summaries; the page collects them.
- PWA (manifest, service worker, install button) was already in place.

## What is new in 2.20

- Minimalist square screenshots. The "Square 1:1" button in every screenshot preview (all tools and Heat Index) now makes a clean 1080×1080 picture: a thin brand line with the title on top, the content centred and scaled to fit, and a quiet footer (t.me/Cr_hunters, date, "Not financial advice"). The dense watermark pattern is not used in this mode. The choice is remembered; Global Cycle builds its content natively for the square.

## What was new in 2.19

- Mobile layout fix: on phones about 400–540 px wide the top bar (with the "@Cr_hunters" label) was wider than the screen, which made the whole page wider and shifted. The compact header now applies up to 540 px.
- Coin Lab: on phones the controls no longer stack in one tall column; the title and icon buttons sit on one row, the coin, quote, exchange, market, timeframe and Analyze controls wrap below.

## What was new in 2.18

- Global Cycle: both charts can be zoomed. Mouse wheel or pinch zooms, dragging pans, double-click (double-tap) resets; the buttons − / + / ⟲ above each chart do the same. The price axis refits to the visible window, month ticks appear when zoomed in, and when zoomed to under about three years the price line switches to daily candles.
- Global Cycle: the screenshot is now drawn directly (header with the phase and price, eight key figures, the main chart exactly as zoomed on screen, legend) instead of capturing the whole page. It is about 1080×1160 instead of several thousand pixels tall, and the charts and the clock no longer come out broken.
- Square screenshots for social networks: every screenshot preview (all tools and Heat Index) has a "Square 1:1" button. It puts the picture on a 1080×1080-style square with the watermark kept; the choice is remembered. In Global Cycle the layout is built natively for the square.

## What was new in 2.17

- Two more languages in every tool: Japanese (日本語) and Korean (한국어). The language menu now has eight languages.
- Same scope as 2.16: short interface texts are translated, long explanations fall back to English; the translations were written by the assistant and are worth a native-speaker check.

## What was new in 2.16

- Three new languages in every tool: Chinese (Mandarin, 中文), Hindi (हिन्दी) and Arabic (العربية, right-to-left layout). The shared bar now has one compact language menu with all six languages.
- Short interface texts (buttons, labels, table headings, statuses, settings) are translated in all nine tools; the long explanatory paragraphs, guides and hints stay in English for now and are used automatically where a translation is missing. Heat Index translates its main interface (about 700 short texts).
- The translations were written by the assistant and are worth a check by native speakers.

## What was new in 2.15

- Removed the logo animations (hover and loading); the logo is static again.

## What was new in 2.14

- The logo pulses and the crosshair spins while a tool is loading data (any `fetch` in flight for more than 0.25 s; at least 0.7 s once shown, at most 12 s). The shared library's own background requests are not counted.

## What was new in 2.13

- The logo in the top bar is animated on hover (mouse) or press (touch): the crosshair spins and the candles hop. Disabled with `prefers-reduced-motion`.

## What was new in 2.12

- Global Cycle now loads BTC history back to 2011 (Bitstamp daily, CryptoCompare as a backup; cached for 30 days): range switch (All / 2013+ / 2017+), the 2013 cycle in the comparison chart, tops and bottoms taken from the data, and scenario multipliers updated for four cycles.

## What was new in 2.11

- One language switch (UA / RU / EN) in the shared top bar, identical in every tool and remembered across all of them (`ch.lang`). Each tool's own language control is hidden and driven by the shared one.

## What was new in 2.1

- New tab **Global Cycle** (`cycle/`): where Bitcoin is in its four-year cycle (halving, top, bear market, bottom), cycle clock, bottom-confirmation ladder, phase chart with 200-week MA and weak/base/strong scenarios, post-top comparison of cycles, table of past cycles and a timeline of what to expect.

## What was new in 2.01

- Heat Index cards: larger tap targets for the pin, screenshot and alert icons, the analysis links and the full-chart link; easier-to-read signal labels; bigger filter checkboxes and volume slider.

## What was new in 2.0

- Every tool now fits a phone screen: the Liquidation Radar table and the Volume Spikes page no longer stretch the page sideways, and the shared top bar and footer are no longer bent by a tool's own header and footer styles.
- Larger tap targets for small controls (favorite stars, info buttons, footer links).
- On a wide screen the top bar shows all eight tools at once.
- Elliott Waves: the settings fold into one line, so the coin list is on the first screen.
- Everything added since 1.0: one look for all tools, cross-links between tools, notification log and price alerts, hover hints, news badges and the news filter, the Confluence Scanner, the strategy tester, shared favorites, the events calendar, correlation with BTC, app install, Bybit everywhere, per-coin zones and weights, deep analysis and the indicator test in Coin Lab, Elliott counts that learn from history, Heat components, faster loading, and the Telegram bot's inline mode.

A set of free browser tools for scanning the crypto market and analysing single coins on Binance, Bybit and OKX (every tool works with Binance and Bybit; Heat Index and Coin Lab also with OKX). Every tool works in the browser and as a Telegram Mini App, shares one look and one light/dark theme, and links to the others: from any coin card you can open the same coin in another tool, each in its own tab.

| Folder | Tool |
|---|---|
| `/` (index.html) | **Heat Index**: the main market scanner with Heat, trend, reversal risk, setups and a simulator |
| `scanner/` | **Confluence Scanner**: coins where heat, trend, Elliott waves, momentum, volume, order book, funding and news agree |
| `coin-lab/` | **Coin Lab**: a detailed analysis and forecast for one coin, with a deep-analysis report on five timeframes, an indicator tester on the coin's history, and forecast weights tuned per coin by that test |
| `elliott/` | **Elliott Waves**: automatic wave count with trade ideas, a reversal confirmation ladder, and counts that learn from each coin's history (own sensitivity, target zones from the coin's wave ratios, real success probabilities) |
| `whales/` | **Whale Sonar**: large orders in the order book and how the price reacts |
| `liquidations/` | **Liquidation Radar**: estimated liquidation zones on Binance or Bybit USDT perpetuals |
| `volume/` | **Volume Spikes**: coins whose volume suddenly jumps far above normal |
| `paper-bot/` | **Paper Bot**: a trading bot on a virtual account, with statistics, an event log and a strategy tester on history |
| `server/` | Optional servers: news (`news-proxy.js`) and the Telegram bot's inline mode on Cloudflare Workers (`telegram-worker.js`, setup in `TELEGRAM-INLINE.md`) |
| `assets/` | Source of the shared style, script, hints and logo. They are built into every page, so the pages work even without this folder |

## Links to a coin

Each tool opens a coin from its address:

- Heat Index: `#/chart/Binance/SOL/USDT`
- Coin Lab, Elliott Waves, Whale Sonar: `?coin=SOL&q=USDT&ex=binance`
- Liquidation Radar: `#SOLUSDT`
- Volume Spikes: `?coin=SOL`

## Notification log

The bell in the top bar of every tool opens one shared notification log. It collects Heat Index zone alerts, Coin Lab alerts and new volume spikes, with the time, the coin, how the notification was sent (on screen, browser, Telegram, sound) and a link to open the coin. The log is stored in the browser (the last 300 entries) and can be exported as CSV.

## Alerts

Open the bell in the top bar, then **Rules**, or tap **Alert** on any coin card. An alert watches one coin on Binance, Bybit or OKX for one of these conditions:

- the price reaches a level (from either side), is above a level or below a level;
- the price comes within a set percent of a level;
- the 24h change rises or drops by a set percent;
- RSI 14 on 15m, 1h, 4h or 1d goes below or above a level.

An alert fires once or every time with a pause, and can carry a note. It is shown on screen and in the log, and can also play a sound, show a browser notification and send a message through your own Telegram bot (Settings tab). Alerts are checked in the browser every 15–120 s while at least one tab of any tool is open; one tab does the checking, so nothing is sent twice.

## Adaptive zones per coin

Overbought and oversold are not the same for every coin: a calm large cap rarely reaches Heat 25, a wild small cap goes there every week. Heat Index, Coin Lab and the Confluence Scanner therefore compute the zones of every coin from its own history (on by default): the buy zone is the lowest 10% of its Heat over the loaded candles, the sell zone the highest 10%, kept between 8–35 and 65–92, and RSI levels the same way. Each coin then reaches its zones about equally often. Heat Index shows the zones in use on the coin's chart; fixed zones are one tap away in Settings.

## Per-coin weights

The indicator families (Heat zones, trend, momentum, volume, Elliott waves) are checked on each coin's own history with fixed exits, and only the last 30% of that history decides. A family that worked there counts more for that coin (up to ×1.6), one that failed counts less (down to ×0.4), separately for rising and falling signals. Coin Lab uses its full 16-indicator test; the Paper Bot and the Confluence Scanner use the same results when Coin Lab has them and otherwise calibrate each coin in the background (results kept for 3 days). The bot's strategy tester runs without these weights so it never sees the future.

## Shared favorites, calendar, correlation, app install

- **Favorites** are one list for every tool: the star under any coin card, or the favorite buttons of Heat Index, Coin Lab, Liquidation Radar and Volume Spikes, all change the same list.
- **Events calendar** (calendar button in the top bar): Fed rate decisions, Binance listings and delistings from the news feed, and CoinMarketCal events through the news server. A coin with an event in the next 7 days gets a badge on its card.
- **Correlation with BTC** (ρ and β over 120 candles) in Coin Lab, the Confluence Scanner and the Paper Bot positions. In strict mode the bot opens at most three same-direction positions that move like Bitcoin, and pauses entries around Fed decisions.
- **Install as an app** (PWA): `manifest.webmanifest` and `sw.js` at the root; the Install button appears in the top bar when the browser offers it.

## News

Every coin card has a news badge: how many headlines mention the coin in the last 24 hours, red when one of them is important negative news (hack, exploit, delisting, lawsuit, halted withdrawals), amber when negative headlines dominate, green when positive ones do. A tap opens the list with links. The Paper Bot uses the same feed as a filter (it can be switched off): no long on a coin with important negative news in the last 12 hours, a long is closed when such news comes after the entry, and a short gets extra weight only if the price is already falling.

By default the news comes from the free Free Crypto News API (no key). `server/news-proxy.js` is an optional small server (Node 18+, no packages) that gathers CryptoPanic (with your API key), Binance listing and delisting announcements and the RSS feeds of CoinDesk, Cointelegraph, Decrypt and The Block into one feed; put its address into Notifications → Settings → News. Headlines are matched to coins and scored by keywords, so a headline can now and then be misread: the list shows the headline itself.

## Hover hints

Every button, switch, filter, field and column header has a hint that appears on mouse hover or keyboard focus, in Ukrainian, Russian or English to match the page. The hints live in `assets/tips.js` (CSS selector plus three languages per line), so a new hint is one added line.

## Screenshots

Every tool can save a screenshot of a card or a section. Each image carries the `t.me/Cr_hunters` watermark.

---

This is an analysis tool, not financial advice. Trading can lose all your money.
