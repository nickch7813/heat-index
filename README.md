# CRYPTO HUNTERS · crypto market analysis tools

Telegram channel: [@Cr_hunters](https://t.me/Cr_hunters)

Version: **1.09**

A set of free browser tools for scanning the crypto market and analysing single coins on Binance, Bybit and OKX. Every tool works in the browser and as a Telegram Mini App, shares one look and one light/dark theme, and links to the others: from any coin card you can open the same coin in another tool, each in its own tab.

| Folder | Tool |
|---|---|
| `/` (index.html) | **Heat Index**: the main market scanner with Heat, trend, reversal risk, setups and a simulator |
| `coin-lab/` | **Coin Lab**: a detailed analysis and forecast for one coin |
| `elliott/` | **Elliott Waves**: automatic wave count with trade ideas |
| `whales/` | **Whale Sonar**: large orders in the order book and how the price reacts |
| `liquidations/` | **Liquidation Radar**: estimated liquidation zones on Binance USDT futures |
| `volume/` | **Volume Spikes**: coins whose volume suddenly jumps far above normal |
| `paper-bot/` | **Paper Bot**: a trading bot on a virtual account |
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

## News

Every coin card has a news badge: how many headlines mention the coin in the last 24 hours, red when one of them is important negative news (hack, exploit, delisting, lawsuit, halted withdrawals), amber when negative headlines dominate, green when positive ones do. A tap opens the list with links. The Paper Bot uses the same feed as a filter (it can be switched off): no long on a coin with important negative news in the last 12 hours, a long is closed when such news comes after the entry, and a short gets extra weight only if the price is already falling.

By default the news comes from the free Free Crypto News API (no key). `server/news-proxy.js` is an optional small server (Node 18+, no packages) that gathers CryptoPanic (with your API key), Binance listing and delisting announcements and the RSS feeds of CoinDesk, Cointelegraph, Decrypt and The Block into one feed; put its address into Notifications → Settings → News. Headlines are matched to coins and scored by keywords, so a headline can now and then be misread: the list shows the headline itself.

## Hover hints

Every button, switch, filter, field and column header has a hint that appears on mouse hover or keyboard focus, in Ukrainian, Russian or English to match the page. The hints live in `assets/tips.js` (CSS selector plus three languages per line), so a new hint is one added line.

## Screenshots

Every tool can save a screenshot of a card or a section. Each image carries the `t.me/Cr_hunters` watermark.

---

This is an analysis tool, not financial advice. Trading can lose all your money.
