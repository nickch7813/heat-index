// Smoke tests of Heat Index. No packages: node tests/smoke.js (Node 18 or newer).
// They check that the page script parses, that the pure core of the app gives sane and exact answers on small cases,
// that the push server still sees the same Heat as the web app (the two keep separate copies of the analysis), and that no secret got into the repository.
"use strict";
const fs = require("fs"), path = require("path"), { spawnSync } = require("child_process");
const root = path.join(__dirname, ".."), read = f => fs.readFileSync(path.join(root, f), "utf8");
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log("ok   " + name); } else { fail++; console.log("FAIL " + name + (extra !== undefined ? "  " + JSON.stringify(extra).slice(0, 300) : "")); } };
const near = (a, b, e = 1e-9) => a != null && b != null && Math.abs(a - b) <= e;

// ---- the page
const html = read("index.html"), js = (html.split('<script>\n"use strict";')[1] || "").split("</script>")[0];
ok("index.html holds the script", js.length > 100000);
let parsed = true; try { new Function('"use strict";' + js); } catch (e) { parsed = false; console.log(e.message); }
ok("the script parses", parsed);
ok("the page has a title and a language", /<title>[^<]+<\/title>/.test(html) && /<html[^>]*lang=/.test(html));
const a = js.indexOf("// ============================ Indicators"), b = js.indexOf("// ============================ State");
ok("the pure core is found in the script", a > 0 && b > a);
const core = js.slice(a, b);
const App = new Function(core + ";return {analyze,IP,TPRESETS,cleanIP,rotationScore,corrCompute,bkCheck,bkMerge,parseFng,walkBook,bookDepth,btSimulate,gradeStats,btVerdict,setZ:(x,y)=>{ZB=x;ZS=y},setTP:p=>{TP=TPRESETS[p]}}")();

// ---- the indicators
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function series(seed, N = 320) { const r = rng(seed); let v = 100; const K = []; for (let i = 0; i < N; i++) { const o = v; v *= 1 + Math.sin(i / 9) * .012 + (r() - .5) * .02; K.push({ t: 1.7e12 + i * 36e5, o, h: Math.max(o, v) * (1 + r() * .005), l: Math.min(o, v) * (1 - r() * .005), c: v, v: 1000 + r() * 500 }); } return K; }
const K1 = series(3), A1 = App.analyze(K1);
ok("analysis keeps one value per candle", A1.he.length === K1.length && A1.trend.length === K1.length && A1.turn.length === K1.length);
ok("Heat stays between 0 and 100", A1.he.every(x => x == null || (x >= 0 && x <= 100)));
ok("trend is -1, 0 or 1 and signals are null, b or s", A1.trend.every(x => [-1, 0, 1].includes(x)) && A1.sig.every(x => x == null || x === "b" || x === "s"));
ok("too few candles give no analysis", App.analyze(K1.slice(0, 10)) === null);

// ---- Bitcoin and the altcoins: an alt that moves exactly 2x Bitcoin in dollars must show beta 2 and correlation 1
const D = 864e5, t0 = 1.7e12, mk = (rets, start = 100) => { const K = [{ t: t0, c: start }]; let c = start, t = t0; rets.forEach(r => { t += D; c *= 1 + r; K.push({ t, c }); }); return K; };
const r0 = rng(11), btcR = Array.from({ length: 200 }, () => (r0() - .5) * .08), cc = App.corrCompute(mk(btcR), [{ coin: "X", K: mk(btcR.map(b => (1 + 2 * b) / (1 + b) - 1), 1) }]);
ok("beta of an alt that moves 2x Bitcoin is 2 and the correlation is 1", cc && near(cc.alts[0].beta, 2, 1e-9) && near(cc.alts[0].corr, 1, 1e-9), cc && cc.alts);
const base = { t1: 1, s1: 80, t4: 1, heat1: 55, risk1: 20, safety: "Favourable", warn: [], fng: 55, domDir: 0, alt: { med: 2, breadth: 60 } };
ok("zone: strong calm uptrend with alts holding is the alt zone, weak alts give Bitcoin, a falling dangerous market gives USDT",
  App.rotationScore(base).zone === "alts" && App.rotationScore({ ...base, alt: { med: -4, breadth: 30 } }).zone === "btc" && App.rotationScore({ t1: -1, s1: 80, t4: -1, safety: "Danger" }).zone === "usdt");

// ---- backup files, order books, fear and greed
const good = { app: "heat-index", format: 1, data: { "heat.v1": JSON.stringify({ pins: [] }) } };
ok("a backup file is checked: a good one passes, another program's file, a newer format and an unknown key are refused",
  App.bkCheck(good).ok && !App.bkCheck({ ...good, app: "other" }).ok && !App.bkCheck({ ...good, format: 2 }).ok && !App.bkCheck({ ...good, data: { "heat.evil": "1", "heat.v1": "{}" } }).ok);
const w = App.walkBook([[100, 1], [101, 2], [102, 5]], 150), avg = 150 / (1 + 50 / 101);
ok("slippage of a market order through an order book", w && near(w.avg, avg) && near(w.slip, (avg / 100 - 1) * 100));
const now = Math.floor(Date.now() / 1000), f = App.parseFng({ data: [{ value: "40", timestamp: String(now) }, { value: "55", timestamp: String(now - 86400) }] });
ok("the fear and greed index is read (current 40, yesterday 55)", f.cur === 40 && f.d1 === 55);
const flat = Array.from({ length: 30 }, () => ({ h: 105, l: 105, c: 105, o: 105, t: 0 })); flat[1] = { ...flat[1], l: 90 };
ok("a long trade whose low touches the stop on the first candle loses 1R and the fee", near(App.btSimulate(flat, 0, 1, 100, 10).r, -1 - .002 * 100 / 10));

// ---- the push server keeps its own copy of the analysis: it must give the same Heat, turn and trend as the web app
const srvPath = path.join(root, "server", "heat-server.js");
ok("the server file passes a syntax check", spawnSync(process.execPath, ["--check", srvPath]).status === 0);
const marker = "// ===== server =====", srcAll = fs.readFileSync(srvPath, "utf8");
ok("the server file has its marker", srcAll.includes(marker));
const Srv = new Function("require", srcAll.split(marker)[0].replace(/^#!.*\n/, "") + ";return {analyze,cleanIP,TPRESETS}")(require);
let cmp = 0, bad = 0;
for (const seed of [1, 2, 3, 4]) for (const cfg of [{}, { rsi: 7, stoch: 9, stochS: 2 }, { emaF: 10, emaS: 30, bbN: 30, bbK: 2.5, atr: 10 }, { macdF: 8, macdS: 21, macdG: 5, rsi: 21 }])
  for (const [zb, zs] of [[25, 75], [20, 80]]) for (const prm of ["fast", "balanced", "strict"]) {
    const K = series(seed * 7), ip = App.cleanIP(cfg); Object.assign(App.IP, ip); App.setZ(zb, zs); App.setTP(prm);
    const x = App.analyze(K), y = Srv.analyze(K, Srv.cleanIP(cfg), zb, zs, Srv.TPRESETS[prm]);
    for (const k of ["he", "turn", "turnAge", "trend", "tscore", "sig"]) { cmp++; if (!x[k].every((v, i) => v === y[k][i] || (v == null && y[k][i] == null) || near(v, y[k][i], 1e-9 * Math.max(1, Math.abs(v))))) bad++; }
  }
ok(`the server and the web app agree on ${cmp} arrays`, bad === 0, { bad });

// ---- no secret in the repository
const files = []; (function walk(d) { for (const n of fs.readdirSync(d)) { if (n === ".git" || n === "node_modules") continue; const p = path.join(d, n), s = fs.statSync(p); s.isDirectory() ? walk(p) : /\.(js|html|md|json|yml|txt)$/.test(n) && files.push(p); } })(root);
const secret = /\b\d{8,10}:[A-Za-z0-9_-]{35}\b|ghp_[A-Za-z0-9]{36}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----/;
ok(`no token or key in ${files.length} files`, files.every(p => !secret.test(fs.readFileSync(p, "utf8"))), files.filter(p => secret.test(fs.readFileSync(p, "utf8"))));
if (/LEGAL_CONTACT = ""/.test(js)) console.log("note LEGAL_CONTACT is empty: put your contact address into it before you publish the app");
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
