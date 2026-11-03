// CRYPTO HUNTERS news server: gathers crypto news from several sources into one JSON feed for the tools.
// Why a server: a page on GitHub Pages cannot keep an API key secret, and most news sites block requests
// coming straight from a browser (CORS). This script fetches them server-side and answers with CORS allowed.
//
// Run:   node server/news-proxy.js            (Node 18 or newer, no packages needed)
// Env:   PORT=8787
//        CRYPTOPANIC_TOKEN=...  CRYPTOPANIC_PLAN=developer|growth|enterprise   (optional, paid CryptoPanic API)
//        COINMARKETCAL_KEY=...  (optional: coin events for the calendar, GET /events)
// Use:   GET /news  ->  { articles: [{ title, url, source, published, coins, kind, votes }], sources: {...} }
//        then put the server address into Notifications -> Settings -> News on the site.
"use strict";
const http = require("http");

const PORT = +process.env.PORT || 8787;
const CP_TOKEN = process.env.CRYPTOPANIC_TOKEN || "", CP_PLAN = process.env.CRYPTOPANIC_PLAN || "developer";
const TTL = 120e3;   // the feed is cached for two minutes
const UA = "Mozilla/5.0 (compatible; CryptoHuntersNews/1.0)";

const RSS = [
  ["CoinDesk", "https://www.coindesk.com/arc/outboundfeeds/rss/"],
  ["Cointelegraph", "https://cointelegraph.com/rss"],
  ["Decrypt", "https://decrypt.co/feed"],
  ["The Block", "https://www.theblock.co/rss.xml"],
  ["CryptoPanic", "https://cryptopanic.com/news/rss/"]
];
// Binance announcement categories: 48 new listings, 161 delistings
const BINANCE = [[48, "listing"], [161, "delisting"]];

async function get(url, type = "text") {
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 10000);
  try {
    const r = await fetch(url, { signal: ctl.signal, headers: { "user-agent": UA, accept: type === "json" ? "application/json" : "application/rss+xml, application/xml, text/xml, */*" } });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return type === "json" ? r.json() : r.text();
  } finally { clearTimeout(to); }
}
const unxml = s => String(s || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&amp;/g, "&").trim();
function parseRss(xml, source) {
  const out = [], items = String(xml).match(/<item[\s>][\s\S]*?<\/item>/g) || String(xml).match(/<entry[\s>][\s\S]*?<\/entry>/g) || [];
  for (const it of items) {
    const tag = n => { const m = it.match(new RegExp(`<${n}[^>]*>([\\s\\S]*?)<\\/${n}>`)); return m ? unxml(m[1]) : ""; };
    const link = tag("link") || (it.match(/<link[^>]*href="([^"]+)"/) || [])[1] || "";
    const title = tag("title"), date = tag("pubDate") || tag("published") || tag("updated") || tag("dc:date");
    if (title) out.push({ title, url: link, source, published: date ? new Date(date).toISOString() : null, coins: [], kind: "news" });
  }
  return out;
}
const tickersIn = t => [...new Set((String(t).match(/\(([A-Z0-9]{2,10})\)|\b([A-Z][A-Z0-9]{1,9})\b/g) || []).map(x => x.replace(/[()]/g, "")).filter(x => !/^(USDT|USDC|USD|FDUSD|BTC|ETH|BNB|BINANCE|WILL|AND|THE|ON|OF|FOR|SPOT|MARGIN|FUTURES|PAIRS?|TRADING|UTC|NOTICE|LIST|DELIST|ADD|ADDS)$/.test(x)))];

async function fromBinance() {
  const out = [];
  for (const [id, kind] of BINANCE) {
    const j = await get(`https://www.binance.com/bapi/composite/v1/public/cms/article/list/query?type=1&catalogId=${id}&pageNo=1&pageSize=20`, "json");
    const arts = (j && j.data && j.data.catalogs && j.data.catalogs[0] && j.data.catalogs[0].articles) || [];
    arts.forEach(a => out.push({ title: a.title, url: `https://www.binance.com/en/support/announcement/${a.code}`, source: "Binance", published: new Date(a.releaseDate).toISOString(), coins: tickersIn(a.title), kind }));
  }
  return out;
}
async function fromCryptoPanic() {
  if (!CP_TOKEN) return [];
  const j = await get(`https://cryptopanic.com/api/${CP_PLAN}/v2/posts/?auth_token=${encodeURIComponent(CP_TOKEN)}&public=true&kind=news`, "json");
  return (j.results || []).map(p => ({ title: p.title, url: p.original_url || p.url || "", source: (p.source && (p.source.title || p.source.domain)) || "CryptoPanic",
    published: p.published_at, coins: (p.instruments || p.currencies || []).map(c => c.code).filter(Boolean), kind: "news", votes: p.votes || null }));
}

const CMC_KEY = process.env.COINMARKETCAL_KEY || "";
let evCache = { at: 0, body: null };
async function buildEvents() {
  if (!CMC_KEY) return { updated: new Date().toISOString(), events: [], note: "set COINMARKETCAL_KEY" };
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 12000);
  try {
    const r = await fetch("https://developers.coinmarketcal.com/v1/events?max=100&page=1", { signal: ctl.signal, headers: { "x-api-key": CMC_KEY, accept: "application/json", "accept-encoding": "deflate, gzip" } });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json(), list = j.body || j.data || [];
    return { updated: new Date().toISOString(), events: list.map(e => ({ title: (e.title && (e.title.en || e.title)) || "", date: e.date_event || e.date, coins: (e.coins || []).map(c => c.symbol).filter(Boolean),
      category: ((e.categories || [])[0] || {}).name || "event", url: e.source || e.proof || "" })) };
  } finally { clearTimeout(to); }
}
let cache = { at: 0, body: null };
async function build() {
  const jobs = [["binance", fromBinance()], ["cryptopanic", fromCryptoPanic()], ...RSS.map(([n, u]) => [n, get(u).then(x => parseRss(x, n))])];
  const res = await Promise.allSettled(jobs.map(j => j[1])), sources = {}, all = [];
  res.forEach((r, i) => { sources[jobs[i][0]] = r.status === "fulfilled" ? r.value.length : "error: " + (r.reason && r.reason.message); if (r.status === "fulfilled") all.push(...r.value); });
  const seen = new Set(), articles = all.filter(a => a.title && a.published).filter(a => { const k = a.title.toLowerCase().replace(/\W+/g, "").slice(0, 80); if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a, b) => Date.parse(b.published) - Date.parse(a.published)).slice(0, 300);
  return { updated: new Date().toISOString(), sources, articles };
}

http.createServer(async (req, res) => {
  const head = { "access-control-allow-origin": "*", "access-control-allow-methods": "GET, OPTIONS", "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=60" };
  if (req.method === "OPTIONS") { res.writeHead(204, head); return res.end(); }
  const path = new URL(req.url, "http://x").pathname.replace(/\/+$/, "");
  if (path === "/events") {
    try { if (!evCache.body || Date.now() - evCache.at > 30 * 60e3) evCache = { at: Date.now(), body: JSON.stringify(await buildEvents()) }; res.writeHead(200, head); return res.end(evCache.body); }
    catch (e) { res.writeHead(502, head); return res.end(JSON.stringify({ error: String(e && e.message || e), events: [] })); }
  }
  if (path !== "/news" && path !== "") { res.writeHead(404, head); return res.end('{"error":"not found"}'); }
  try {
    if (!cache.body || Date.now() - cache.at > TTL) { cache = { at: Date.now(), body: JSON.stringify(await build()) }; }
    res.writeHead(200, head); res.end(cache.body);
  } catch (e) { res.writeHead(502, head); res.end(JSON.stringify({ error: String(e && e.message || e) })); }
}).listen(PORT, () => console.log(`news server on :${PORT}/news`));

module.exports = { parseRss, tickersIn };
