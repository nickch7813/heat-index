/* CRYPTO HUNTERS: the glue between the tools.
   Load it in <head> of every tool, before the tool's own scripts:
     <link rel="stylesheet" href="assets/ch.css"><script src="assets/ch.js" data-tool="heat"></script>
   It gives every page the same top bar (brand, Telegram channel, tools), one shared light/dark theme,
   links from a coin to the other tools (each tool opens in its own browser tab), and screenshots with the watermark. */
(function () {
  "use strict";
  var me = document.currentScript, TOOL = (me && me.dataset.tool) || "heat";
  var ROOT = me ? me.src.replace(/assets\/ch\.js(\?.*)?$/, "") : "./";
  var CHANNEL = "Cr_hunters", CHANNEL_URL = "https://t.me/" + CHANNEL, WATERMARK = "t.me/" + CHANNEL, BRAND = "CRYPTO HUNTERS";
  var REPO = "https://github.com/nickch7813/heat-index";
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
      an: "Аналіз:", open: "Відкрити {c} у «{t}» (нова вкладка)", tools: "Інструменти", tg: "Телеграм-канал", cam: "Скріншот", wait: "Готую зображення…", save: "Зберегти", share: "Поділитися", copy: "Копіювати", copied: "Скопійовано", close: "Закрити", fail: "Не вдалося створити зображення: {e}", hint: "На телефоні можна також утримати зображення, щоб зберегти його.", nfa: "Не фінансова порада", src: "Код" },
    ru: { heat: ["Heat Index", "Heat"], lab: ["Coin Lab", "Coin Lab"], elliott: ["Волны Эллиотта", "Волны"], whales: ["Китовый сонар", "Киты"], liq: ["Радар ликвидаций", "Ликвидации"], volume: ["Всплески объёмов", "Объёмы"], bot: ["Бот-трейдер", "Бот"],
      an: "Анализ:", open: "Открыть {c} в «{t}» (новая вкладка)", tools: "Инструменты", tg: "Телеграм-канал", cam: "Скриншот", wait: "Готовлю изображение…", save: "Сохранить", share: "Поделиться", copy: "Копировать", copied: "Скопировано", close: "Закрыть", fail: "Не удалось создать изображение: {e}", hint: "На телефоне можно также удержать изображение, чтобы сохранить его.", nfa: "Не финансовый совет", src: "Код" },
    en: { heat: ["Heat Index", "Heat"], lab: ["Coin Lab", "Coin Lab"], elliott: ["Elliott Waves", "Elliott"], whales: ["Whale Sonar", "Whales"], liq: ["Liquidation Radar", "Liquidations"], volume: ["Volume Spikes", "Volume"], bot: ["Paper Bot", "Bot"],
      an: "Analyze:", open: "Open {c} in {t} (new tab)", tools: "Tools", tg: "Telegram channel", cam: "Screenshot", wait: "Preparing the image…", save: "Save", share: "Share", copy: "Copy", copied: "Copied", close: "Close", fail: "Could not create the image: {e}", hint: "On a phone you can also long-press the image to save it.", nfa: "Not financial advice", src: "Code" }
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
    }).join("") + "</div>";
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

  // ---------- bar and footer ----------
  function barHTML() {
    var home = TOOL === "heat";
    var nav = TOOLS.map(function (t) {
      var nm = tr(t.id)[0];
      return t.id === TOOL ? "<span aria-current=\"page\">" + icon(t.id) + esc(nm) + "</span>" : '<a href="' + esc(ROOT + t.path) + '" target="ch_' + t.id + '">' + icon(t.id) + esc(nm) + "</a>";
    }).join("");
    return '<div class="ch-in"><div class="ch-row"><a class="ch-brand" href="' + esc(ROOT) + '"' + (home ? "" : ' target="ch_heat"') + '><img src="' + esc(ROOT) + 'assets/logo.svg" alt="" width="26" height="26"><span>CRYPTO <b>HUNTERS</b></span></a><span class="ch-sp"></span>' +
      '<a class="ch-tg" href="' + CHANNEL_URL + '" target="_blank" rel="noopener" title="' + esc(tr("tg")) + '">' + TG_ICON + "<span>@" + CHANNEL + "</span></a></div>" +
      '<nav class="ch-nav" aria-label="' + esc(tr("tools")) + '">' + nav + "</nav></div>";
  }
  function footHTML() {
    return '<div class="ch-in"><b>' + BRAND + '</b><a href="' + CHANNEL_URL + '" target="_blank" rel="noopener">@' + CHANNEL + '</a><a href="' + REPO + '" target="_blank" rel="noopener">GitHub</a><span>' + esc(tr("nfa")) + "</span></div>";
  }
  function mount() {
    if (TOOL !== "heat") document.body.classList.add("ch-skin");
    try { if (!window.name) window.name = "ch_" + TOOL; } catch (e) {}   // so a link to this tool from another one reuses this tab
    var bar = document.createElement("header"); bar.className = "ch-top"; bar.setAttribute("translate", "no"); bar.setAttribute("data-ch", ""); bar.setAttribute("data-html2canvas-ignore", "true");
    var foot = document.createElement("footer"); foot.className = "ch-foot"; foot.setAttribute("translate", "no"); foot.setAttribute("data-ch", ""); foot.setAttribute("data-html2canvas-ignore", "true");
    var draw = function () { bar.innerHTML = barHTML(); foot.innerHTML = footHTML(); var on = bar.querySelector(".ch-nav span"); if (on && on.scrollIntoView) { var n = bar.querySelector(".ch-nav"); n.scrollLeft = on.offsetLeft - 40; } };
    draw(); document.body.insertBefore(bar, document.body.firstChild);
    var host = document.querySelector("[data-ch-foot]") || document.body; host.appendChild(foot);
    new MutationObserver(function () { draw(); document.querySelectorAll(".ch-links").forEach(function (el) { el.__ch = null; }); }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();

  window.CH = {
    tool: TOOL, root: ROOT, channel: CHANNEL_URL, watermark: WATERMARK,
    theme: function (fallback) { return saved() || fallback || null; },
    url: url, links: links, linksInto: linksInto, param: param,
    mark: mark, frame: frame, shot: shot, cam: cam, showCanvas: showCanvas, t: tr
  };
})();
