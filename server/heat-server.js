#!/usr/bin/env node
/*
  Heat Index push server
  ----------------------
  Watches your alerts 24/7 and sends a push to your phone through ntfy (https://ntfy.sh)
  when a coin enters its buy or sell zone. No dependencies: Node.js 18 or newer.

  Run:    NTFY_TOPIC=my-long-random-topic node heat-server.js        (phone push through ntfy)
          TELEGRAM_BOT_TOKEN=123456:ABC... TELEGRAM_CHAT_ID=123456789 node heat-server.js        (messages in Telegram)
          Both can be on at the same time; at least one is needed.
  Phone:  install the ntfy app (Android / iOS) and subscribe to the same topic.
  Web:    in the web app open "Push when the page is closed", enter http://<this-computer>:8787

  Environment variables
    NTFY_TOPIC    the ntfy channel. Use a long random name: anyone who knows it can read your pushes.
    TELEGRAM_BOT_TOKEN   the token that @BotFather gave you for your bot (keep it secret: it controls the bot)
    TELEGRAM_CHAT_ID     where to write: your own chat id (a number), a group id (starts with -) or @channelname.
                         Not known yet? Start the server with the token only, write any message to your bot in Telegram, and the server prints the chats it can see.
    NTFY_SERVER   default https://ntfy.sh (point it at your own ntfy server if you host one)
    PORT          default 8787
    INTERVAL      seconds between checks, default 60
    TOKEN         optional. If set, the web app must send it as a Bearer token.
    TREND         fast | balanced | strict (trend sensitivity, default balanced; match the web app)
    STATE_FILE    default ./heat-state.json (alerts, last known zones and alert timing survive restarts)

  Alert timing (cooldown per coin, quiet hours, "only when the three horizons agree") is set in the web app and sent here with your alerts.
  The web app also sends what it needs to see the same Heat as you do: the periods of the indicators, the trend mode (TREND is only the default for an old
  app), "closed candles only" and "only after the turn is confirmed" (Heat has started to leave the zone). A push says whether the signal is Confirmed or
  Strong (the three horizons are in the same zone) and how many candles ago the turn began.
*/
"use strict";
const fs = require("fs"), http = require("http"), path = require("path");

// ===== shared with the web app: exchange adapters and indicators =====
// ============================ Config ============================
const EXS = ["Binance", "Bybit", "OKX"];
const QUOTES = ["BTC", "USDT"];
// Stablecoins and fiat currencies are not "coins" to scan: skip them when the quote is USDT.
const NOT_COINS = new Set(["USDC", "FDUSD", "TUSD", "USDP", "DAI", "BUSD", "USDD", "PYUSD", "USD1", "USDE", "EUR", "EURI", "AEUR", "GBP", "AUD", "TRY", "BRL", "RUB", "UAH", "NGN", "ARS", "COP", "PLN", "RON", "CZK", "JPY", "MXN", "ZAR", "IDR", "CHF", "SEK", "KZT"]);
const TFS = ["15m", "1h", "4h", "1d", "1w"];
const HZ = [[["15m", .4], ["1h", .6]], [["4h", .4], ["1d", .6]], [["1d", .4], ["1w", .6]]];
const HN = ["Short", "Mid", "Long"];
const HTF = ["1h", "1d", "1w"];                 // the higher timeframe of each horizon decides its trend
const TFMS = { "15m": 9e5, "1h": 36e5, "4h": 144e5, "1d": 864e5, "1w": 6048e5 };
const closedOnly = (K, ms, now = Date.now()) => K.filter(k => k.t + ms <= now);     // the last candle is dropped while it is still forming
const IP_DEFAULT = { rsi: 14, stoch: 14, stochS: 3, macdF: 12, macdS: 26, macdG: 9, emaF: 20, emaS: 50, bbN: 20, bbK: 2, atr: 14 };
function cleanIP(o) {
  const n = (v, lo, hi, d) => { v = +v; return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d; }, r = { ...IP_DEFAULT }, q = o || {};
  r.rsi = Math.round(n(q.rsi, 2, 50, 14)); r.stoch = Math.round(n(q.stoch, 2, 50, 14)); r.stochS = Math.round(n(q.stochS, 1, 10, 3));
  r.macdF = Math.round(n(q.macdF, 2, 50, 12)); r.macdS = Math.round(n(q.macdS, r.macdF + 1, 100, 26)); r.macdG = Math.round(n(q.macdG, 2, 30, 9));
  r.emaF = Math.round(n(q.emaF, 2, 100, 20)); r.emaS = Math.round(n(q.emaS, r.emaF + 1, 300, 50)); r.bbN = Math.round(n(q.bbN, 5, 100, 20)); r.bbK = +n(q.bbK, .5, 4, 2).toFixed(2); r.atr = Math.round(n(q.atr, 2, 50, 14));
  return r;
}
const TURN_MIN = 4;   // Heat must have moved this many points away from the zone before a turn counts as confirmed
const TTL = { "15m": 60e3, "1h": 120e3, "4h": 300e3, "1d": 900e3, "1w": 1800e3 };
const LIMIT = { Binance: 8, Bybit: 8, OKX: 2 };      // parallel candle requests per exchange
const GAP = { Binance: 0, Bybit: 0, OKX: 120 };       // min ms between request starts (OKX rate limit)
const BYB = { "15m": "15", "1h": "60", "4h": "240", "1d": "D", "1w": "W" };
const OKXB = { "15m": "15m", "1h": "1H", "4h": "4H", "1d": "1D", "1w": "1W" };

// ============================ Exchange adapters ============================
async function jget(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(r.status + " " + (r.statusText || "request failed"));
  return r.json();
}
// Binance: fall back to its public market-data mirror if the main host is unreachable or blocked.
async function bnb(path) {
  try { return await jget("https://api.binance.com" + path); }
  catch (e) { return await jget("https://data-api.binance.vision" + path); }
}
const ADAPT = {
  Binance: {
    sym: (c, q = "BTC") => c + q,
    async tickers(q = "BTC") {
      const a = await bnb("/api/v3/ticker/24hr");
      return a.filter(t => t.symbol.endsWith(q) && t.symbol.length > q.length && +t.quoteVolume > 0 && !NOT_COINS.has(t.symbol.slice(0, -q.length)))
        .map(t => ({ sym: t.symbol, coin: t.symbol.slice(0, -q.length), chg: +t.priceChangePercent, vol: +t.quoteVolume, last: +t.lastPrice }));
    },
    async candles(sym, tf, n = 300) {
      const k = await bnb(`/api/v3/klines?symbol=${sym}&interval=${tf}&limit=${n}`);
      return k.map(x => ({ t: +x[0], o: +x[1], h: +x[2], l: +x[3], c: +x[4] }));
    },
    url: (c, q = "BTC") => `https://www.binance.com/en/trade/${c}_${q}?_from=markets`
  },
  Bybit: {
    sym: (c, q = "BTC") => c + q,
    async tickers(q = "BTC") {
      const j = await jget("https://api.bybit.com/v5/market/tickers?category=spot");
      if (j.retCode !== 0) throw new Error(j.retMsg || "Bybit error");
      return j.result.list.filter(t => t.symbol.endsWith(q) && t.symbol.length > q.length && +t.turnover24h > 0 && !NOT_COINS.has(t.symbol.slice(0, -q.length)))
        .map(t => ({ sym: t.symbol, coin: t.symbol.slice(0, -q.length), chg: +t.price24hPcnt * 100, vol: +t.turnover24h, last: +t.lastPrice }));
    },
    async candles(sym, tf, n = 300) {
      const j = await jget(`https://api.bybit.com/v5/market/kline?category=spot&symbol=${sym}&interval=${BYB[tf]}&limit=${n}`);
      if (j.retCode !== 0) throw new Error(j.retMsg || "Bybit error");
      return j.result.list.slice().reverse().map(x => ({ t: +x[0], o: +x[1], h: +x[2], l: +x[3], c: +x[4] }));
    },
    url: (c, q = "BTC") => `https://www.bybit.com/en/trade/spot/${c}/${q}`
  },
  OKX: {
    sym: (c, q = "BTC") => c + "-" + q,
    async tickers(q = "BTC") {
      const j = await jget("https://www.okx.com/api/v5/market/tickers?instType=SPOT");
      if (j.code !== "0") throw new Error(j.msg || "OKX error");
      return j.data.filter(t => t.instId.endsWith("-" + q) && +t.volCcy24h > 0 && !NOT_COINS.has(t.instId.split("-")[0])).map(t => {
        const last = +t.last, o = +t.open24h;
        return { sym: t.instId, coin: t.instId.split("-")[0], chg: o > 0 ? (last / o - 1) * 100 : 0, vol: +t.volCcy24h, last };
      });
    },
    async candles(sym, tf, n = 300) {
      const j = await jget(`https://www.okx.com/api/v5/market/candles?instId=${sym}&bar=${OKXB[tf]}&limit=${n}`);
      if (j.code !== "0") throw new Error(j.msg || "OKX error");
      return j.data.slice().reverse().map(x => ({ t: +x[0], o: +x[1], h: +x[2], l: +x[3], c: +x[4] }));
    },
    url: (c, q = "BTC") => `https://www.okx.com/trade-spot/${c.toLowerCase()}-${q.toLowerCase()}`
  }
};

// ============================ Indicators ============================
const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const ema = (a, p) => { const k = 2 / (p + 1), o = [a[0]]; for (let i = 1; i < a.length; i++) o.push(a[i] * k + o[i - 1] * (1 - k)); return o; };
const sq = z => 50 + 50 * Math.tanh(z);
const cl = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
// ---- Trend indicator. Direction comes from five SLOW votes: EMA20 vs EMA50, EMA50 vs EMA100, price vs EMA100 (with an ATR buffer),
// the slope of EMA50 and Supertrend. The vote is scaled by ADX strength, smoothed, and turned into a confirmed state (up, down,
// sideways) with a gap between entering and leaving a trend. Fast oscillators are deliberately NOT used for direction: they move
// together on every short swing and would only create false flips. Everything uses closed candles only, so nothing is repainted.
const TPRESETS = {
  fast:     { sm: 3,  adx0: 15, enter: 30, exit: 10, confirm: 1 },
  balanced: { sm: 5,  adx0: 15, enter: 40, exit: 15, confirm: 2 },
  strict:   { sm: 10, adx0: 18, enter: 40, exit: 10, confirm: 3 }
};
let TP = TPRESETS.balanced;
function trendCalc(ti, prm) {
  const { C, e20, e50, e100, at, adx, stdir } = ti, N = C.length, raw = Array(N).fill(0);
  for (let i = 60; i < N; i++) {
    if (adx[i] == null || !(at[i] > 0)) continue;
    const buf = .5 * at[i], sl = (e50[i] - e50[i - 10]) / at[i];
    const vote = ((e20[i] > e50[i] ? 1 : -1) + (e50[i] > e100[i] ? 1 : -1) + (C[i] > e100[i] + buf ? 1 : C[i] < e100[i] - buf ? -1 : 0) +
      (Math.abs(sl) >= .6 ? Math.sign(sl) : 0) + stdir[i]) / 5;
    raw[i] = 100 * vote * cl((adx[i] - prm.adx0) / 20, 0, 1);
  }
  const score = ema(raw, prm.sm), state = Array(N).fill(0); let s = 0, up = 0, dn = 0, off = 0;
  for (let i = 60; i < N; i++) {
    const x = score[i];
    if (s === 0) {
      up = x >= prm.enter ? up + 1 : 0; dn = x <= -prm.enter ? dn + 1 : 0;
      if (up >= prm.confirm) { s = 1; up = dn = off = 0; } else if (dn >= prm.confirm) { s = -1; up = dn = off = 0; }
    } else if (s === 1) {
      off = x < prm.exit ? off + 1 : 0; dn = x <= -prm.enter ? dn + 1 : 0;
      if (dn >= prm.confirm) { s = -1; up = dn = off = 0; } else if (off >= prm.confirm) { s = 0; up = dn = off = 0; }
    } else {
      off = x > -prm.exit ? off + 1 : 0; up = x >= prm.enter ? up + 1 : 0;
      if (up >= prm.confirm) { s = 1; up = dn = off = 0; } else if (off >= prm.confirm) { s = 0; up = dn = off = 0; }
    }
    state[i] = s;
  }
  return { score, state };
}
// K: [{t,o,h,l,c}] oldest first. Returns every series needed by the list and the charts.
function analyze(K, ip = IP_DEFAULT, zb = 25, zs = 75, tp = TP) {
  const N = K.length; if (N < 20) return null;
  const C = K.map(k => k.c), e20 = ema(C, 20), e50 = ema(C, 50), ef = ip.emaF === 20 ? e20 : ema(C, ip.emaF), es = ip.emaS === 50 ? e50 : ema(C, ip.emaS), e12 = ema(C, ip.macdF), e26 = ema(C, ip.macdS);
  const macd = e12.map((x, i) => x - e26[i]), sg = ema(macd, ip.macdG), hist = macd.map((x, i) => x - sg[i]);
  const tr = K.map((k, i) => i ? Math.max(k.h - k.l, Math.abs(k.h - K[i - 1].c), Math.abs(k.l - K[i - 1].c)) : k.h - k.l);
  const at = []; let a = 0; tr.forEach((x, i) => { a = i < ip.atr ? (a * i + x) / (i + 1) : (a * (ip.atr - 1) + x) / ip.atr; at.push(a); });
  const raw = C.map((_, i) => { const w = K.slice(Math.max(0, i - ip.stoch + 1), i + 1), hh = Math.max(...w.map(k => k.h)), ll = Math.min(...w.map(k => k.l)); return hh === ll ? 50 : (C[i] - ll) / (hh - ll) * 100; });
  const st = raw.map((_, i) => mean(raw.slice(Math.max(0, i - ip.stochS + 1), i + 1)));
  const sd = st.map((_, i) => mean(st.slice(Math.max(0, i - 2), i + 1)));
  const rs = Array(N).fill(null);
  const RP = ip.rsi;
  if (N > RP) {
    let g = 0, l = 0;
    for (let i = 1; i <= RP; i++) { const d = C[i] - C[i - 1]; d >= 0 ? g += d : l -= d; }
    g /= RP; l /= RP; rs[RP] = l === 0 ? 100 : 100 - 100 / (1 + g / l);
    for (let i = RP + 1; i < N; i++) {
      const d = C[i] - C[i - 1];
      g = (g * (RP - 1) + Math.max(d, 0)) / RP; l = (l * (RP - 1) + Math.max(-d, 0)) / RP;
      rs[i] = l === 0 ? 100 : 100 - 100 / (1 + g / l);
    }
  }
  // ADX(14), +DI, -DI (Wilder). Strong trend = ADX >= 25 with price on the matching side of EMA50.
  const pdi = Array(N).fill(null), mdi = Array(N).fill(null), adx = Array(N).fill(null);
  if (N >= 30) {
    let sTR = 0, sP = 0, sM = 0; const dx = Array(N).fill(null);
    for (let i = 1; i < N; i++) {
      const up = K[i].h - K[i - 1].h, dn = K[i - 1].l - K[i].l, pm = up > dn && up > 0 ? up : 0, mm = dn > up && dn > 0 ? dn : 0;
      if (i <= 14) { sTR += tr[i]; sP += pm; sM += mm; } else { sTR = sTR - sTR / 14 + tr[i]; sP = sP - sP / 14 + pm; sM = sM - sM / 14 + mm; }
      if (i >= 14) { pdi[i] = sTR > 0 ? 100 * sP / sTR : 0; mdi[i] = sTR > 0 ? 100 * sM / sTR : 0; const sm = pdi[i] + mdi[i]; dx[i] = sm > 0 ? 100 * Math.abs(pdi[i] - mdi[i]) / sm : 0; }
    }
    let ax = 0; for (let i = 14; i <= 27; i++) ax += dx[i]; ax /= 14; adx[27] = ax;
    for (let i = 28; i < N; i++) { ax = (ax * 13 + dx[i]) / 14; adx[i] = ax; }
  }
  const e100 = ema(C, 100);
  const at10 = []; let a10 = 0; tr.forEach((x, i) => { a10 = i < 10 ? (a10 * i + x) / (i + 1) : (a10 * 9 + x) / 10; at10.push(a10); });
  const stdir = Array(N).fill(1), stl = Array(N).fill(null); let fu = 0, fl = 0, sdir = 1;   // Supertrend (ATR 10, x3)
  for (let i = 0; i < N; i++) {
    const mid = (K[i].h + K[i].l) / 2, bu = mid + 3 * at10[i], bl = mid - 3 * at10[i];
    if (i === 0) { fu = bu; fl = bl; }
    else {
      const pfu = fu, pfl = fl;
      fu = (bu < pfu || C[i - 1] > pfu) ? bu : pfu; fl = (bl > pfl || C[i - 1] < pfl) ? bl : pfl;
      if (sdir === -1 && C[i] > pfu) sdir = 1; else if (sdir === 1 && C[i] < pfl) sdir = -1;
    }
    stdir[i] = sdir; stl[i] = sdir === 1 ? fl : fu;
  }
  const roll = (arr, p, fn) => arr.map((_, i) => fn(...arr.slice(Math.max(0, i - p + 1), i + 1)));
  const hi34 = roll(K.map(k => k.h), 34, Math.max), lo34 = roll(K.map(k => k.l), 34, Math.min);
  const ti = { C, e20, e50, e100, at, adx, stdir };
  const tcalc = trendCalc(ti, tp), trend = tcalc.state, tscore = tcalc.score, tsm = ema(tscore, 3);
  // The trend line: ONE stochastic over 34 candles, smoothed twice (EMA 5 then EMA 5). Its colour comes from tsm.
  const tl = ema(ema(C.map((_, i) => hi34[i] === lo34[i] ? 50 : (C[i] - lo34[i]) / (hi34[i] - lo34[i]) * 100), 5), 5);
  const bbU = [], bbL = [], bb = [];
  C.forEach((_, i) => {
    const w = C.slice(Math.max(0, i - ip.bbN + 1), i + 1), m = mean(w), s = Math.sqrt(mean(w.map(x => (x - m) ** 2)));
    bbU.push(m + ip.bbK * s); bbL.push(m - ip.bbK * s); bb.push(s === 0 ? 50 : cl((C[i] - (m - ip.bbK * s)) / (2 * ip.bbK * s) * 100));
  });
  const z = (x, d) => d > 0 ? x / d : 0;
  const he = C.map((_, i) => i < 59 || rs[i] == null ? null :
    .25 * st[i] + .20 * rs[i] + .20 * sq(2 * z(hist[i], at[i])) + .20 * sq(z(ef[i] - es[i], 2 * at[i])) + .15 * bb[i]);
  const sig = he.map((x, i) => x == null || he[i - 1] == null ? null : x <= zb && he[i - 1] > zb ? "b" : x >= zs && he[i - 1] < zs ? "s" : null);
  // Turn confirmation, as in the web app: Heat was in a zone during the last 6 candles and has started to leave it (at least TURN_MIN points, still moving that way).
  const turn = he.map((x, i) => {
    if (x == null || i < 6 || he[i - 1] == null) return 0; let mn = 101, mx = -1;
    for (let j = i - 5; j <= i; j++) if (he[j] != null) { mn = Math.min(mn, he[j]); mx = Math.max(mx, he[j]); }
    if (mn <= zb && x - mn >= TURN_MIN && x > he[i - 1] && x <= zb + 15) return 1;
    if (mx >= zs && mx - x >= TURN_MIN && x < he[i - 1] && x >= zs - 15) return -1;
    return 0;
  });
  const turnAge = Array(N).fill(0); { let dir = 0, start = 0, last = -9; for (let i = 0; i < N; i++) if (turn[i]) { if (turn[i] !== dir || i - last > 2) start = i; dir = turn[i]; last = i; turnAge[i] = i - start + 1; } }
  return { K, e20, e50, turn, turnAge, bbU, bbL, st, sd, macd, sg, hist, rs, he, sig, adx, pdi, mdi, trend, tscore, tsm, tl, stl, stdir, ti, e100 };
}


if (process.env.TREND && TPRESETS[process.env.TREND]) TP = TPRESETS[process.env.TREND];   // fast | balanced | strict
// ===== server =====
const PORT = +process.env.PORT || 8787;
const EVERY = (+process.env.INTERVAL || 60) * 1000;
const TOPIC = process.env.NTFY_TOPIC || "", TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "", TG_CHAT = process.env.TELEGRAM_CHAT_ID || "";
const NTFY = (process.env.NTFY_SERVER || "https://ntfy.sh").replace(/\/$/, "");
const TOKEN = process.env.TOKEN || "";
const FILE = process.env.STATE_FILE || path.join(__dirname, "heat-state.json");
const redact = x => TG_TOKEN ? String(x).split(TG_TOKEN).join("***") : String(x);        // the token must never reach the log or an answer
if (TG_TOKEN && !/^\d{5,}:[A-Za-z0-9_-]{20,}$/.test(TG_TOKEN)) { console.error("TELEGRAM_BOT_TOKEN does not look like a bot token (it should be like 123456:ABC-DEF...). Copy it again from @BotFather."); process.exit(1); }
if (TG_CHAT && !/^(-?\d{4,}|@[A-Za-z][A-Za-z0-9_]{4,})$/.test(TG_CHAT)) { console.error("TELEGRAM_CHAT_ID should be a number (for a group it starts with -) or @channelname."); process.exit(1); }
const TGON = !!(TG_TOKEN && TG_CHAT);
// Without a chat id the server only helps to find it: it prints the chats that have written to the bot, and stops.
async function tgDiscover() {
  const r = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/getUpdates`), j = await r.json().catch(() => ({}));
  if (!r.ok || !j.ok) { console.error("Telegram did not accept the token: " + redact((j && j.description) || r.status)); process.exit(1); }
  const seen = new Map(); for (const u of j.result || []) { const c = (u.message || u.channel_post || u.my_chat_member || u.edited_message || {}).chat; if (c && c.id != null) seen.set(c.id, c); }
  if (!seen.size) console.error("The bot has no chats yet. Open your bot in Telegram, press Start (or add it to the group or channel and write a message), then run this again.");
  else { console.error("Chats that can reach your bot:"); for (const c of seen.values()) console.error(`  TELEGRAM_CHAT_ID=${c.id}   (${c.type}${c.title ? ", " + c.title : c.username ? ", @" + c.username : c.first_name ? ", " + c.first_name : ""})`); console.error("Start the server again with one of these."); }
  process.exit(1);
}
const DISCOVER = !TOPIC && !TGON && !!TG_TOKEN;      // only looking for the chat id: nothing else starts
if (!TOPIC && !TGON) {
  if (TG_TOKEN) { tgDiscover(); }
  else { console.error("Set a channel for the alerts. For ntfy:\n  NTFY_TOPIC=heat-7f3k2q9x node heat-server.js\nFor Telegram:\n  TELEGRAM_BOT_TOKEN=123456:ABC... TELEGRAM_CHAT_ID=123456789 node heat-server.js"); process.exit(1); }
}

const DEFAULT_TP = process.env.TREND && TPRESETS[process.env.TREND] ? process.env.TREND : "balanced";
let state = { alerts: {}, last: {}, sent: {}, settings: { cooldownH: 4, quietOn: false, from: "23:00", to: "07:00", onlyConf: false, onlyTurn: false, closeOnly: true, tprm: DEFAULT_TP, ip: { ...IP_DEFAULT }, tz: 0 } };
try { state = Object.assign(state, JSON.parse(fs.readFileSync(FILE, "utf8"))); } catch (e) {}
const save = () => { try { fs.writeFileSync(FILE, JSON.stringify(state, null, 1)); } catch (e) { log("could not save state:", e.message); } };
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const sleep = ms => new Promise(r => setTimeout(r, ms));
// Alert timing (same rules as the web app): one alert per coin per cooldown, quiet hours in the time of the phone, optional horizon confluence.
const minutesOf = hhmm => { const [h, m] = String(hhmm).split(":").map(Number); return (h || 0) * 60 + (m || 0); };
const inQuiet = (nowMin, from, to) => { const a = minutesOf(from), b = minutesOf(to); return a === b ? false : a < b ? nowMin >= a && nowMin < b : nowMin >= a || nowMin < b; };
const cooldownOk = (last, now, hours) => !last || now - last >= hours * 36e5;
const confluence = (hs, zb, zs) => hs.length < 3 || hs.some(v => v == null) ? null : hs.every(v => v <= zb) ? "buy" : hs.every(v => v >= zs) ? "sell" : null;
const ascii = t => String(t).replace(/[^\x20-\x7e]/g, "?");

const EMOJI = { green_circle: "\u{1F7E2}", red_circle: "\u{1F534}", white_check_mark: "\u2705" };
async function pushNtfy(title, message, priority, tags) {
  const r = await fetch(`${NTFY}/${encodeURIComponent(TOPIC)}`, { method: "POST", headers: { Title: ascii(title), Priority: priority, Tags: tags }, body: message });
  if (!r.ok) throw new Error("ntfy answered " + r.status);
}
async function pushTelegram(title, message, tags) {
  const r = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ chat_id: TG_CHAT, text: `${EMOJI[tags] || "\u{1F4C8}"} ${title}\n${message}`, disable_web_page_preview: true }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.ok) throw new Error("Telegram answered " + r.status + (j && j.description ? ": " + j.description : ""));
}
// Every channel that is set gets the message. It counts as sent when at least one channel took it; a failed channel is only logged (the token never is).
async function push(title, message, priority = "high", tags = "chart_with_upwards_trend") {
  const jobs = []; if (TOPIC) jobs.push(["ntfy", pushNtfy(title, message, priority, tags)]); if (TGON) jobs.push(["Telegram", pushTelegram(title, message, tags)]);
  const res = await Promise.allSettled(jobs.map(j => j[1])), out = {}; let any = false, errs = [];
  res.forEach((r, i) => { out[jobs[i][0]] = r.status === "fulfilled"; if (r.status === "fulfilled") any = true; else { const m = redact((r.reason && r.reason.message) || r.reason); errs.push(`${jobs[i][0]}: ${m}`); log(jobs[i][0] + " failed:", m); } });
  if (!any) throw new Error(errs.join("; ") || "no channel is set");
  return out;
}

// Heat of one horizon (weights as in the web app) plus the trend of its higher timeframe.
async function heatFor(ex, coin, hz, quote, zb = 25, zs = 75) {
  const sym = ADAPT[ex].sym(coin, quote), st = state.settings, ip = cleanIP(st.ip), tp = TPRESETS[st.tprm] || TPRESETS[DEFAULT_TP]; let num = 0, den = 0, trend = 0, turn = 0, turnAge = 0;
  for (const [k, [tf, w]] of HZ[hz].entries()) {
    let K = await ADAPT[ex].candles(sym, tf, 300); if (st.closeOnly !== false) K = closedOnly(K, TFMS[tf]);
    const a = analyze(K, ip, zb, zs, tp);
    await sleep(GAP[ex] || 0);
    if (!a) continue; const n = a.he.length - 1, h = a.he[n]; if (h == null) continue;
    num += h * w; den += w; if (tf === HTF[hz]) trend = a.trend[n];
    if (k === 0) { turn = a.turn[n]; turnAge = a.turnAge[n]; }          // the turn is read on the faster timeframe of the horizon, like in the web app
  }
  return den ? { heat: num / den, trend, turn, turnAge } : null;
}

// What an alert says about the signal: "Confirmed" when Heat has started to leave the zone, "Strong" when the three horizons are in the same zone too.
function tierText(z, r, conf) {
  const want = z === "buy" ? 1 : -1;
  if (r.turn !== want) return "turn not confirmed yet";
  const n = r.turnAge || 1;
  return `${conf === z ? "Strong" : "Confirmed"} ${z} · ${n} candle${n === 1 ? "" : "s"} ago`;
}

let running = false;
async function cycle() {
  if (running) return; running = true;
  try {
    for (const key of Object.keys(state.last)) if (!state.alerts[key]) delete state.last[key];
    for (const [key, al] of Object.entries(state.alerts)) {
      const [ex, coin, quote = "BTC"] = key.split(":");     // keys: "Binance:ETH" (BTC pair) or "Binance:ETH:USDT"
      if (!ADAPT[ex] || !coin || !QUOTES.includes(quote)) continue;
      try {
        const buy = al.buy ?? 25, sell = al.sell ?? 75, r = await heatFor(ex, coin, al.hz ?? 1, quote, buy, sell); if (!r) continue;
        let z = r.heat <= buy ? "buy" : r.heat >= sell ? "sell" : null;
        const against = (z === "buy" && r.trend < 0) || (z === "sell" && r.trend > 0);
        if (z && al.filter !== false && against) z = null;
        if (z && state.settings.onlyTurn && r.turn !== (z === "buy" ? 1 : -1)) z = null;       // only after Heat has started to leave the zone
        if (z && z !== state.last[key]) {
          const st = state.settings, now = Date.now(), local = new Date(now + (st.tz || 0) * 6e4); let why = "";
          if (st.quietOn && inQuiet(local.getUTCHours() * 60 + local.getUTCMinutes(), st.from, st.to)) why = "quiet hours";
          else if (!cooldownOk(state.sent[key], now, st.cooldownH)) why = "cooldown";
          else if (st.onlyConf) { const hs = []; for (const h of [0, 1, 2]) { const rr = h === (al.hz ?? 1) ? r : await heatFor(ex, coin, h, quote, buy, sell); hs.push(rr ? rr.heat : null); } if (confluence(hs, buy, sell) !== z) why = "no confluence of the three horizons"; }
          if (why) log("alert skipped", key, z, why);
          else {
            let conf = null; try { const hs = []; for (const h of [0, 1, 2]) { const rr = h === (al.hz ?? 1) ? r : await heatFor(ex, coin, h, quote, buy, sell); hs.push(rr ? rr.heat : null); } conf = confluence(hs, buy, sell); } catch (e) {}
            log("ALERT", key, z, r.heat.toFixed(1), tierText(z, r, conf));
            await push(`${ex} ${coin}/${quote}: ${z} zone`, `Heat ${HN[al.hz ?? 1]} = ${Math.round(r.heat)} · ${tierText(z, r, conf)}${against ? " (against the trend)" : ""}`, "high", z === "buy" ? "green_circle" : "red_circle");
            state.sent[key] = now;
          }
        }
        state.last[key] = z;
      } catch (e) { log("check failed", key, e.message || e); }
    }
    save();
  } finally { running = false; }
}

const server = http.createServer(async (req, res) => {
  const send = (code, obj) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(obj)); };
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-headers", "content-type, authorization");
  res.setHeader("access-control-allow-methods", "GET, PUT, POST, OPTIONS");
  res.setHeader("access-control-allow-private-network", "true");
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
  const url = req.url.split("?")[0];
  if (url === "/health") return send(200, { ok: true, alerts: Object.keys(state.alerts).length, channels: [TOPIC ? "ntfy" : null, TGON ? "telegram" : null].filter(Boolean) });
  if (TOKEN && req.headers.authorization !== "Bearer " + TOKEN) return send(401, { error: "unauthorized" });
  try {
    if (url === "/alerts" && req.method === "GET") return send(200, { alerts: state.alerts, last: state.last, settings: state.settings });
    if (url === "/alerts" && req.method === "PUT") {
      let body = ""; for await (const ch of req) { body += ch; if (body.length > 1e5) return send(413, { error: "too large" }); }
      const j = JSON.parse(body || "{}"), next = {};
      for (const [k, v] of Object.entries(j.alerts || {})) {
        const [ex, coin, quote = "BTC"] = k.split(":");
        if (ADAPT[ex] && /^[A-Z0-9]{1,20}$/.test(coin || "") && QUOTES.includes(quote)) next[k] = { hz: [0, 1, 2].includes(v.hz) ? v.hz : 1, buy: +v.buy || 25, sell: +v.sell || 75, filter: v.filter !== false };
      }
      if (j.settings && typeof j.settings === "object") {
        const q = j.settings, hhmm = (v, d) => /^\d{1,2}:\d{2}$/.test(v) ? v : d;
        state.settings = { cooldownH: Math.max(0, Math.min(72, +q.cooldownH || 0)), quietOn: !!q.quietOn, from: hhmm(q.from, "23:00"), to: hhmm(q.to, "07:00"), onlyConf: !!q.onlyConf, onlyTurn: !!q.onlyTurn, closeOnly: q.closeOnly !== false, tprm: TPRESETS[q.tprm] ? q.tprm : DEFAULT_TP, ip: cleanIP(q.ip), tz: Math.max(-840, Math.min(840, Math.round(+q.tz || 0))) };
      }
      state.alerts = next; save(); log("alerts synced:", Object.keys(next).length);
      cycle(); return send(200, { ok: true, count: Object.keys(next).length });
    }
    if (url === "/test" && req.method === "POST") { const ch = await push("Heat Index test", "Push notifications are working.", "default", "white_check_mark"); return send(200, { ok: true, channels: ch }); }
    send(404, { error: "not found" });
  } catch (e) { log("request failed:", e.message || e); send(500, { error: String(e.message || e) }); }
});
if (!DISCOVER) {
server.listen(PORT, () => log(`Heat Index server on port ${PORT}; ${[TOPIC ? `ntfy topic "${TOPIC}" at ${NTFY}` : "", TGON ? "Telegram chat " + TG_CHAT : ""].filter(Boolean).join(" and ")}; checking every ${EVERY / 1000}s; ${Object.keys(state.alerts).length} alert(s) loaded`));
setInterval(cycle, EVERY);
setTimeout(cycle, 2000);
}
