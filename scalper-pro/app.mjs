import { buildOrderMessage, THREADS_DM_URL } from "./order.mjs";

const byId = id => document.getElementById(id);
const all = selector => [...document.querySelectorAll(selector)];

function initMenu(openOrder) {
  const dialog = byId("menuDialog");
  const trigger = byId("menuTrigger");
  trigger.addEventListener("click", () => dialog.showModal());
  dialog.querySelector("[data-close-menu]").addEventListener("click", () => dialog.close());
  dialog.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", () => dialog.close());
  });
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.querySelector("[data-menu-order]").addEventListener("click", () => {
    dialog.close();
    openOrder();
  });
}

function initOrder() {
  const dialog = byId("orderDialog");
  const form = byId("orderForm");
  const preview = byId("orderPreview");
  const output = byId("orderMessage");
  const status = byId("orderStatus");
  const copyAndOpen = byId("copyAndOpen");
  const copyOnly = byId("copyOnly");

  function openOrder() {
    form.reset();
    form.hidden = false;
    preview.hidden = true;
    status.textContent = "";
    dialog.showModal();
    byId("buyerName").focus();
  }

  all("[data-order]").forEach(button => button.addEventListener("click", openOrder));
  dialog.querySelector("[data-close-order]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const fields = new FormData(form);
    try {
      output.value = buildOrderMessage({
        name: fields.get("name"),
        tradingViewUsername: fields.get("tradingViewUsername"),
        threadsUsername: fields.get("threadsUsername"),
        note: fields.get("note"),
      });
      status.textContent = "";
      form.hidden = true;
      preview.hidden = false;
      copyAndOpen.focus();
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : "Periksa data pesanan.";
    }
  });

  byId("editOrder").addEventListener("click", () => {
    preview.hidden = true;
    form.hidden = false;
    status.textContent = "";
    byId("buyerName").focus();
  });

  async function copyMessage() {
    try {
      if (!window.isSecureContext || !navigator.clipboard?.writeText) {
        throw new Error("Clipboard tidak tersedia");
      }
      await navigator.clipboard.writeText(output.value);
      status.textContent = "Pesan disalin. Tempel di chat Threads, lalu tekan Kirim.";
      return true;
    } catch {
      output.focus();
      output.select();
      status.textContent = "Browser memblokir clipboard. Salin teks yang dipilih secara manual, lalu buka Threads.";
      return false;
    }
  }

  copyOnly.addEventListener("click", async () => { await copyMessage(); });
  copyAndOpen.addEventListener("click", async () => {
    if (!await copyMessage()) return;
    window.location.assign(THREADS_DM_URL);
  });

  return openOrder;
}

const SVG = "http://www.w3.org/2000/svg";
const COLORS = Object.freeze({
  buy: "#a2efe0",
  sell: "#e2a1a4",
  risk: "#b1caff",
  soft: "#7dcdd9",
  grid: "#597d8a",
});

function svgElement(tag, attributes = {}, text) {
  const node = document.createElementNS(SVG, tag);
  for (const [key, value] of Object.entries(attributes)) {
    node.setAttribute(key, String(value));
  }
  if (text !== undefined) node.textContent = text;
  return node;
}

function append(parent, tag, attributes, text) {
  const node = svgElement(tag, attributes, text);
  parent.append(node);
  return node;
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function createCandles(seed, count) {
  const random = seededRandom(seed);
  const candles = [];
  let last = 52;
  for (let i = 0; i < count; i++) {
    const drift = i < count * .28 ? .35 : i < count * .55 ? -.16 : .44;
    const close = last + drift + (random() - .5) * 5.6;
    candles.push({
      open: last,
      close,
      high: Math.max(close, last) + .8 + random() * 2,
      low: Math.min(close, last) - .8 - random() * 2,
    });
    last = close;
  }
  return candles;
}

function drawGrid(svg, width, height, left, right, top, bottom) {
  for (let i = 0; i <= 5; i++) {
    const y = top + (bottom - top) * i / 5;
    append(svg, "line", {
      x1: left, x2: right, y1: y, y2: y,
      stroke: COLORS.grid, "stroke-opacity": .21, "stroke-width": 1,
      "stroke-dasharray": i === 5 ? "0" : "3 8",
    });
  }
  for (let i = 0; i <= 6; i++) {
    const x = left + (right - left) * i / 6;
    append(svg, "line", {
      x1: x, x2: x, y1: top, y2: bottom,
      stroke: COLORS.grid, "stroke-opacity": .085, "stroke-width": 1,
    });
  }
}

function drawLevel(svg, label, y, width, right, color) {
  const start = width * .56;
  append(svg, "line", {
    x1: start, y1: y, x2: right + 5, y2: y,
    stroke: color, "stroke-width": 1, "stroke-opacity": .8,
    "stroke-dasharray": "5 5",
  });
  append(svg, "rect", {
    x: right + 8, y: y - 10, width: 58, height: 20,
    rx: 5, fill: "#1a3844", stroke: color, "stroke-opacity": .55,
  });
  append(svg, "text", {
    x: right + 37, y: y + 3.5, "text-anchor": "middle",
    fill: color, "font-size": 10.5, "font-weight": 700,
    "font-family": "Arial, sans-serif",
  }, label);
}

function drawCandles(svg, candles, left, right, toY) {
  const step = (right - left) / candles.length;
  const movingAverage = [];
  candles.forEach((bar, index) => {
    const x = left + (index + .5) * step;
    const rise = bar.close >= bar.open;
    const fill = rise ? COLORS.buy : COLORS.sell;
    const high = toY(bar.high);
    const low = toY(bar.low);
    const bodyTop = toY(Math.max(bar.open, bar.close));
    const bodyBottom = toY(Math.min(bar.open, bar.close));
    append(svg, "line", {
      x1: x, x2: x, y1: high, y2: low,
      stroke: fill, "stroke-width": 1.4, "stroke-opacity": .94,
    });
    append(svg, "rect", {
      x: x - step * .26, y: bodyTop,
      width: Math.max(3, step * .52),
      height: Math.max(1.4, bodyBottom - bodyTop),
      rx: 1, fill,
    });
    const samples = candles.slice(Math.max(0, index - 7), index + 1);
    const average = samples.reduce((sum, item) => sum + item.close, 0) / samples.length;
    movingAverage.push([x, toY(average)]);
  });
  append(svg, "polyline", {
    points: movingAverage.map(pair => pair.join(",")).join(" "),
    fill: "none", stroke: COLORS.soft, "stroke-width": 2,
    "stroke-opacity": .67, "stroke-linecap": "round", "stroke-linejoin": "round",
  });
}

function drawSignal(svg, width, top, bottom, label) {
  const x = width * .64;
  const y = bottom - (bottom - top) * .24;
  const isBuy = label === "BUY";
  const color = isBuy ? COLORS.buy : COLORS.sell;
  append(svg, "rect", { x: x - 23, y: y - 19, width: 46, height: 20, rx: 6, fill: color });
  append(svg, "text", {
    x, y: y - 5, "text-anchor": "middle",
    fill: "#112e35", "font-size": 11, "font-weight": 800,
    "font-family": "Arial, sans-serif",
  }, label);
  append(svg, "path", {
    d: isBuy ? "M" + (x - 6) + " " + (y + 11) + " L" + x + " " + (y + 2) + " L" + (x + 6) + " " + (y + 11) + " Z"
      : "M" + (x - 6) + " " + (y + 2) + " L" + x + " " + (y + 11) + " L" + (x + 6) + " " + (y + 2) + " Z",
    fill: color,
  });
}

function renderChart(svg, timeframe, seed) {
  const { width, height } = svg.viewBox.baseVal;
  const left = 26, right = width - 86, top = 25, bottom = height - 43;
  const count = width > 900 ? 58 : 39;
  const candles = createCandles(seed, count);
  const values = candles.flatMap(item => [item.high, item.low]);
  const min = Math.min(...values) - 5;
  const max = Math.max(...values) + 7;
  const toY = price => bottom - (price - min) / (max - min) * (bottom - top);

  svg.replaceChildren();
  drawGrid(svg, width, height, left, right, top, bottom);
  append(svg, "rect", {
    x: width * .31, y: top + (bottom - top) * .3,
    width: width * .29, height: (bottom - top) * .13,
    rx: 6, fill: "#b1a8ea", "fill-opacity": .11,
    stroke: "#b1a8ea", "stroke-opacity": .36,
    "stroke-dasharray": "4 6",
  });
  append(svg, "text", {
    x: width * .32, y: top + (bottom - top) * .3 - 7,
    fill: "#bfc4f1", "font-size": 11, "font-weight": 600,
    "font-family": "Arial, sans-serif",
  }, "FVG / ZONA");
  drawCandles(svg, candles, left, right - 17, toY);
  const span = bottom - top;
  [
    ["TP3", top + span * .12, COLORS.buy],
    ["TP2", top + span * .22, COLORS.buy],
    ["TP1", top + span * .33, COLORS.buy],
    ["ENTRY", top + span * .51, COLORS.risk],
    ["SL", top + span * .7, COLORS.sell],
  ].forEach(([label, y, color]) => drawLevel(svg, label, y, width, right - 6, color));
  drawSignal(svg, width, top, bottom, timeframe === "M30" ? "SELL" : "BUY");
  svg.setAttribute("aria-label", "Simulasi chart " + timeframe + " dengan candlestick, zona, sinyal dan level TP, Entry, SL.");
}

function initCharts() {
  renderChart(byId("heroChart"), "M15", 241);
  const preview = byId("previewChart");
  const seeds = Object.freeze({ M15: 241, M30: 692, H1: 1114 });
  renderChart(preview, "M15", seeds.M15);
  all("[data-timeframe]").forEach(button => {
    button.addEventListener("click", () => {
      const timeframe = button.dataset.timeframe;
      if (!Object.hasOwn(seeds, timeframe)) return;
      all("[data-timeframe]").forEach(item => {
        item.setAttribute("aria-pressed", String(item === button));
      });
      renderChart(preview, timeframe, seeds[timeframe]);
    });
  });
}

function initHeader() {
  const header = document.querySelector(".nav-glass");
  if (!window.matchMedia("(pointer: fine)").matches) return;
  header.addEventListener("pointermove", event => {
    const bounds = header.getBoundingClientRect();
    const position = (event.clientX - bounds.left) / bounds.width;
    header.style.setProperty("--glow-x", (position * 100).toFixed(1) + "%");
  }, { passive: true });
}

byId("year").textContent = new Date().getFullYear();
const openOrder = initOrder();
initMenu(openOrder);
initHeader();
initCharts();
