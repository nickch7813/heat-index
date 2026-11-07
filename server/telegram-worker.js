// CRYPTO HUNTERS · Telegram bot on Cloudflare Workers
// Inline mode: typing "@your_bot" in any chat shows a button that opens the app, and "@your_bot SOL" shows a card of
// the coin (price, 24h change, Heat and RSI on 1h / 4h / 1d, trend) with buttons to the full analysis.
// Other updates (commands, messages) are forwarded to your existing bot server if FORWARD_URL is set;
// otherwise /start is answered with a button that opens the app.
//
// Settings (Cloudflare → Worker → Settings → Variables and Secrets):
//   BOT_TOKEN       secret, the token from @BotFather
//   WEBHOOK_SECRET  secret, any long random text (protects the webhook and the /setup link)
//   BOT_USERNAME    the bot's username without @
//   APP_URL         optional, default https://nickch7813.github.io/heat-index/
//   FORWARD_URL     optional, the webhook address of your existing bot server (everything except inline goes there)
// After saving the code and the variables open once:  https://<worker>.workers.dev/setup?secret=<WEBHOOK_SECRET>

const DEF_APP = "https://nickch7813.github.io/heat-index/";
const CHANNEL = "https://t.me/Cr_hunters";
const DEFAULT_COINS = ["BTC", "ETH", "SOL", "BNB", "XRP"];
// Binance market data from its public mirror first (not blocked by region), then the main API, then Bybit
const BINANCE = ["https://data-api.binance.vision/api/v3", "https://api.binance.com/api/v3"];

const L = {
  uk: { open: "🚀 Відкрити CRYPTO HUNTERS", full: "📊 Повний аналіз", app: "🚀 Відкрити в Telegram", price: "Ціна", d24: "за 24 год", heat: "Heat", rsi: "RSI", trend: "Тренд 1d",
    up: "висхідний", down: "низхідний", side: "боковик", over: "перегрів", under: "перепроданість", neutral: "нейтрально", nfa: "не фінансова порада",
    desc: "{p} · {ch} · Heat {h}",
    start: "👋 CRYPTO HUNTERS — сканер крипторинку: Heat Index, хвилі Елліотта, кити, ліквідації, новини.\n\nНатисніть кнопку, щоб відкрити застосунок. У будь-якому чаті напишіть @{bot} і тікер монети, напр. @{bot} SOL, щоб надіслати її картку." },
  ru: { open: "🚀 Открыть CRYPTO HUNTERS", full: "📊 Полный анализ", app: "🚀 Открыть в Telegram", price: "Цена", d24: "за 24 ч", heat: "Heat", rsi: "RSI", trend: "Тренд 1d",
    up: "восходящий", down: "нисходящий", side: "боковик", over: "перегрев", under: "перепроданность", neutral: "нейтрально", nfa: "не финансовый совет",
    desc: "{p} · {ch} · Heat {h}",
    start: "👋 CRYPTO HUNTERS — сканер крипторынка: Heat Index, волны Эллиотта, киты, ликвидации, новости.\n\nНажмите кнопку, чтобы открыть приложение. В любом чате напишите @{bot} и тикер монеты, напр. @{bot} SOL, чтобы отправить её карточку." },
  en: { open: "🚀 Open CRYPTO HUNTERS", full: "📊 Full analysis", app: "🚀 Open in Telegram", price: "Price", d24: "in 24h", heat: "Heat", rsi: "RSI", trend: "Trend 1d",
    up: "up", down: "down", side: "sideways", over: "overheated", under: "oversold", neutral: "neutral", nfa: "not financial advice",
    desc: "{p} · {ch} · Heat {h}",
    start: "👋 CRYPTO HUNTERS: a crypto market scanner with Heat Index, Elliott waves, whales, liquidations and news.\n\nTap the button to open the app. In any chat type @{bot} and a ticker, e.g. @{bot} SOL, to send its card." }
};
const langOf = code => { const c = String(code || "").slice(0, 2); return L[c] ? c : c === "be" ? "ru" : "en"; };
const tr = (lg, k, v) => String(L[lg][k] ?? L.en[k]).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ""));
const esc = s => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
const fmtP = p => { p = +p; const a = Math.abs(p); return a >= 1000 ? p.toFixed(2) : a >= 1 ? p.toFixed(4) : a >= 0.01 ? p.toFixed(5) : p.toPrecision(4); };
const pct = x => (x > 0 ? "+" : "") + x.toFixed(2) + "%";

async function getJ(url) { const r = await fetch(url, { headers: { accept: "application/json" }, cf: { cacheTtl: 30 } }); if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }
async function binance(path) { let e; for (const b of BINANCE) { try { return await getJ(b + path); } catch (x) { e = x; } } throw e; }

// ---- indicators (the same ideas as on the site) ----
function rsiArr(c, n = 14) {
  const o = Array(c.length).fill(null); if (c.length <= n) return o; let g = 0, l = 0;
  for (let i = 1; i <= n; i++) { const d = c[i] - c[i - 1]; if (d > 0) g += d; else l -= d; } g /= n; l /= n; o[n] = l === 0 ? 100 : 100 - 100 / (1 + g / l);
  for (let i = n + 1; i < c.length; i++) { const d = c[i] - c[i - 1]; g = (g * (n - 1) + Math.max(d, 0)) / n; l = (l * (n - 1) + Math.max(-d, 0)) / n; o[i] = l === 0 ? 100 : 100 - 100 / (1 + g / l); }
  return o;
}
const ema = (a, n) => { if (a.length < n) return null; let e = a.slice(0, n).reduce((s, v) => s + v, 0) / n; const k = 2 / (n + 1); for (let i = n; i < a.length; i++) e = a[i] * k + e * (1 - k); return e; };
// Heat: stochastic position on 14, 50 and 150 candles mixed with RSI (0 = deeply oversold, 100 = overheated)
function heat(K) {
  const h = K.map(k => k[2]), l = K.map(k => k[3]), c = K.map(k => k[4]), m = c.length - 1;
  const st = n => { let a = -Infinity, z = Infinity; for (let q = Math.max(0, m - n + 1); q <= m; q++) { a = Math.max(a, h[q]); z = Math.min(z, l[q]); } return a > z ? (c[m] - z) / (a - z) * 100 : 50; };
  const r = rsiArr(c)[m];
  return { heat: Math.round(0.6 * (0.4 * st(14) + 0.35 * st(50) + 0.25 * st(150)) + 0.4 * (r == null ? 50 : r)), rsi: r == null ? null : Math.round(r) };
}

// ---- market data ----
const BYIV = { "1h": "60", "4h": "240", "1d": "D" };
async function coinData(coin) {
  const sym = coin + "USDT";
  try {
    const [t, k1, k4, kd] = await Promise.all([binance(`/ticker/24hr?symbol=${sym}`), binance(`/klines?symbol=${sym}&interval=1h&limit=200`), binance(`/klines?symbol=${sym}&interval=4h&limit=200`), binance(`/klines?symbol=${sym}&interval=1d&limit=200`)]);
    const K = a => a.map(x => [+x[0], +x[1], +x[2], +x[3], +x[4]]);
    return { ex: "Binance", exk: "binance", coin, price: +t.lastPrice, ch: +t.priceChangePercent, K: { "1h": K(k1), "4h": K(k4), "1d": K(kd) } };
  } catch (e) {}
  try {   // Bybit if the coin is not on Binance
    const t = await getJ(`https://api.bybit.com/v5/market/tickers?category=spot&symbol=${sym}`), x = t.result && t.result.list && t.result.list[0]; if (!x) return null;
    const kl = async tf => ((await getJ(`https://api.bybit.com/v5/market/kline?category=spot&symbol=${sym}&interval=${BYIV[tf]}&limit=200`)).result.list || []).map(k => [+k[0], +k[1], +k[2], +k[3], +k[4]]).reverse();
    const [a, b, c] = await Promise.all([kl("1h"), kl("4h"), kl("1d")]);
    return { ex: "Bybit", exk: "bybit", coin, price: +x.lastPrice, ch: +x.price24hPcnt * 100, K: { "1h": a, "4h": b, "1d": c } };
  } catch (e) { return null; }
}
function study(d) {
  const S = {}; for (const tf of ["1h", "4h", "1d"]) S[tf] = d.K[tf].length >= 60 ? heat(d.K[tf]) : { heat: null, rsi: null };
  const cd = d.K["1d"].map(k => k[4]), e50 = ema(cd, 50), px = d.price;
  const trend = e50 == null ? 0 : px > e50 * 1.01 ? 1 : px < e50 * 0.99 ? -1 : 0;
  const hv = ["1h", "4h", "1d"].map(tf => S[tf].heat).filter(v => v != null), avg = hv.length ? Math.round(hv.reduce((a, v) => a + v, 0) / hv.length) : null;
  return { S, trend, heat: avg };
}

// ---- the card ----
function card(d, st, lg, env) {
  const app = env.APP_URL || DEF_APP, bot = env.BOT_USERNAME || "";
  const zone = st.heat == null ? "neutral" : st.heat <= 25 ? "under" : st.heat >= 75 ? "over" : "neutral";
  const icon = zone === "under" ? "🟢" : zone === "over" ? "🔴" : "⚪";
  const text = [
    `${icon} <b>${esc(d.coin)}/USDT</b> · ${d.ex}`,
    `${tr(lg, "price")}: <b>${fmtP(d.price)}</b> USDT (${pct(d.ch)} ${tr(lg, "d24")})`,
    `${tr(lg, "heat")}: <b>${st.heat ?? "—"}</b> — ${tr(lg, zone)} (1h ${st.S["1h"].heat ?? "—"} · 4h ${st.S["4h"].heat ?? "—"} · 1d ${st.S["1d"].heat ?? "—"})`,
    `${tr(lg, "rsi")}: 1h ${st.S["1h"].rsi ?? "—"} · 4h ${st.S["4h"].rsi ?? "—"} · 1d ${st.S["1d"].rsi ?? "—"}`,
    `${tr(lg, "trend")}: ${tr(lg, st.trend > 0 ? "up" : st.trend < 0 ? "down" : "side")}`,
    ``,
    `<a href="${CHANNEL}">CRYPTO HUNTERS</a> · ${tr(lg, "nfa")}`
  ].join("\n");
  const kb = [[{ text: tr(lg, "full"), url: `${app}coin-lab/?coin=${encodeURIComponent(d.coin)}&ex=${d.exk}` }]];
  if (bot) kb.push([{ text: tr(lg, "app"), url: `https://t.me/${bot}?startapp=${encodeURIComponent(d.coin)}` }]);
  return {
    type: "article", id: (d.coin + "-" + Date.now()).slice(0, 60),
    title: `${d.coin}/USDT · ${fmtP(d.price)}`,
    description: tr(lg, "desc", { p: d.ex, ch: pct(d.ch), h: st.heat ?? "—" }) + ` · ${tr(lg, zone)}`,
    input_message_content: { message_text: text, parse_mode: "HTML", link_preview_options: { is_disabled: true } },
    reply_markup: { inline_keyboard: kb }
  };
}

async function tg(env, method, body) {
  const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
}

async function onInline(q, env) {
  const lg = langOf(q.from && q.from.language_code), app = env.APP_URL || DEF_APP;
  const words = String(q.query || "").toUpperCase().replace(/[^A-Z0-9 ,]/g, " ").split(/[ ,]+/).filter(Boolean).map(w => w.replace(/(USDT|USDC|USD)$/, "")).filter(w => w.length >= 2 && w.length <= 12);
  const coins = (words.length ? words : DEFAULT_COINS).slice(0, 5);
  const datas = await Promise.all(coins.map(c => coinData(c).catch(() => null)));
  const results = [];
  datas.forEach((d, i) => { if (d) results.push(card(d, study(d), lg, env)); });
  const body = {
    inline_query_id: q.id, results, cache_time: 60, is_personal: false,
    // the button above the results opens the app right away
    button: { text: tr(lg, "open"), web_app: { url: app } }
  };
  return tg(env, "answerInlineQuery", body);
}

async function onStart(m, env) {
  const lg = langOf(m.from && m.from.language_code), app = env.APP_URL || DEF_APP, bot = env.BOT_USERNAME || "bot";
  const arg = (String(m.text || "").split(/\s+/)[1] || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (arg) { const d = await coinData(arg).catch(() => null); if (d) { const c = card(d, study(d), lg, env);
    return tg(env, "sendMessage", { chat_id: m.chat.id, text: c.input_message_content.message_text, parse_mode: "HTML", link_preview_options: { is_disabled: true }, reply_markup: { inline_keyboard: [[{ text: tr(lg, "open"), web_app: { url: app } }], ...c.reply_markup.inline_keyboard.slice(0, 1)] } }); } }
  return tg(env, "sendMessage", { chat_id: m.chat.id, text: tr(lg, "start", { bot }), reply_markup: { inline_keyboard: [[{ text: tr(lg, "open"), web_app: { url: app } }]] } });
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (!env.BOT_TOKEN) return new Response("Set BOT_TOKEN in the worker settings", { status: 500 });
    // one-time setup: point the bot's webhook at this worker
    if (url.pathname === "/setup") {
      if (!env.WEBHOOK_SECRET || url.searchParams.get("secret") !== env.WEBHOOK_SECRET) return new Response("Wrong secret", { status: 403 });
      const hook = `${url.origin}/hook`;
      const r = await tg(env, "setWebhook", { url: hook, secret_token: env.WEBHOOK_SECRET, allowed_updates: ["message", "edited_message", "callback_query", "inline_query", "chosen_inline_result", "my_chat_member", "channel_post"], drop_pending_updates: false });
      const info = await tg(env, "getWebhookInfo", {});
      return new Response(JSON.stringify({ setWebhook: r, info: info.result }, null, 2), { headers: { "content-type": "application/json; charset=utf-8" } });
    }
    if (url.pathname === "/status") {
      if (url.searchParams.get("secret") !== env.WEBHOOK_SECRET) return new Response("Wrong secret", { status: 403 });
      return new Response(JSON.stringify((await tg(env, "getWebhookInfo", {})).result, null, 2), { headers: { "content-type": "application/json; charset=utf-8" } });
    }
    if (url.pathname !== "/hook" || req.method !== "POST") return new Response("CRYPTO HUNTERS bot worker is running", { status: 200 });
    if (req.headers.get("x-telegram-bot-api-secret-token") !== env.WEBHOOK_SECRET) return new Response("forbidden", { status: 403 });
    const raw = await req.text(); let u; try { u = JSON.parse(raw); } catch (e) { return new Response("bad json", { status: 400 }); }
    if (u.inline_query) { ctx.waitUntil(onInline(u.inline_query, env).catch(() => {})); return new Response("ok"); }
    if (u.chosen_inline_result) return new Response("ok");
    // everything else goes to the existing bot server, unchanged
    if (env.FORWARD_URL) {
      ctx.waitUntil(fetch(env.FORWARD_URL, { method: "POST", headers: { "content-type": "application/json", ...(env.FORWARD_SECRET ? { "x-telegram-bot-api-secret-token": env.FORWARD_SECRET } : {}) }, body: raw }).catch(() => {}));
      return new Response("ok");
    }
    const m = u.message; if (m && /^\/start\b/.test(m.text || "")) ctx.waitUntil(onStart(m, env).catch(() => {}));
    return new Response("ok");
  }
};
