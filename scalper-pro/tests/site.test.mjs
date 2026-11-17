import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const html = read("index.html");
const css = read("styles.css");
const app = read("app.mjs");
const config = JSON.parse(read("vercel.json"));

test("satu halaman semantik dengan satu stylesheet dan satu entry module", () => {
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /lang="id"/);
  assert.match(html, /<main\b[^>]*id="konten"/);
  assert.match(html, /<link rel="stylesheet" href="\.\/styles\.css">/);
  assert.match(html, /<script type="module" src="\.\/app\.mjs"><\/script>/);
  assert.doesNotMatch(html, /<style\b|<script>(?![\s\S]*type)/);
  assert.doesNotMatch(html, /liquid-glass\.css|liquid-glass\.js/);
});

test("pembelian tidak mengandung login, checkout, atau langganan berkala", () => {
  assert.match(html, /id="orderDialog"/);
  assert.match(html, /id="orderForm"/);
  assert.match(html, /id="orderPreview"/);
  assert.match(html, /data-order/g);
  assert.match(html, /Harga via Threads/);
  assert.match(html, /Tanpa akun website/);
  assert.match(html, /https:\/\/www\.threads\.com\/messages\/t\/1143880444843814/);
  assert.doesNotMatch(html, /type="password"|<\/?iframe\b|wa\.me\/|stripe\.com\/checkout/i);
  assert.match(app, /navigator\.clipboard\.writeText/);
  assert.match(app, /window\.location\.assign\(THREADS_DM_URL\)/);
});

test("grafik interaktif tetap dinyatakan sebagai visual simulasi", () => {
  assert.match(html, /id="heroChart"/);
  assert.match(html, /id="previewChart"/);
  for (const timeframe of ["M15", "M30", "H1"]) {
    assert.match(html, new RegExp('data-timeframe="' + timeframe + '"'));
  }
  assert.match(html, /bukan data live atau hasil backtest/i);
  assert.doesNotMatch(html, /100% akurat|profit dijamin|win rate \d+%/i);
});

test("CSP membatasi script, koneksi, serta form eksternal", () => {
  const headers = config.headers[0].headers;
  const csp = headers.find(item => item.key === "Content-Security-Policy")?.value;
  assert.ok(csp);
  assert.match(csp, /script-src 'self'/);
  assert.match(csp, /connect-src 'none'/);
  assert.match(csp, /form-action 'none'/);
  assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});
