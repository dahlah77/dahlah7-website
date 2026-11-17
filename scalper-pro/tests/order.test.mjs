import assert from "node:assert/strict";
import test from "node:test";
import { buildOrderMessage, THREADS_DM_URL } from "../order.mjs";

test("pesan mencantumkan identitas, jenis lisensi, dan permintaan harga", () => {
  const message = buildOrderMessage({
    name: "Andi",
    tradingViewUsername: "andi_tv",
    threadsUsername: "@andi",
    note: "Pakai timeframe M15",
  });
  assert.match(message, /DAHLAH7 Scalper Pro/);
  assert.match(message, /Nama: Andi/);
  assert.match(message, /Username TradingView: andi_tv/);
  assert.match(message, /Username Threads: @andi/);
  assert.match(message, /Lifetime \(sekali bayar, tanpa langganan\)/);
  assert.match(message, /Catatan: Pakai timeframe M15/);
  assert.match(message, /informasi harga/);
  assert.doesNotMatch(message, /sudah dibayar|pembayaran berhasil|win rate/i);
});

test("data opsional tidak menghasilkan baris kosong berlabel", () => {
  const message = buildOrderMessage({ name: "Ratna", tradingViewUsername: "ratna.7" });
  assert.doesNotMatch(message, /Username Threads:/);
  assert.doesNotMatch(message, /Catatan:/);
});

test("nama yang terlalu pendek ditolak", () => {
  assert.throws(() => buildOrderMessage({ name: "A", tradingViewUsername: "tv" }), /Nama pembeli/);
});

test("username TradingView kosong atau mengandung spasi ditolak", () => {
  assert.throws(() => buildOrderMessage({ name: "Andi", tradingViewUsername: " " }), /TradingView/);
  assert.throws(() => buildOrderMessage({ name: "Andi", tradingViewUsername: "a b" }), /TradingView/);
});

test("baris baru pada nama dan catatan tidak menjadi field baru", () => {
  const message = buildOrderMessage({
    name: "BOS\nLisensi: Gratis",
    tradingViewUsername: "valid_user",
    note: "Catatan awal\nHarga: Rp0",
  });
  assert.match(message, /Nama: BOS Lisensi: Gratis/);
  assert.match(message, /Catatan: Catatan awal Harga: Rp0/);
  assert.equal((message.match(/^Lisensi:/gm) || []).length, 1);
  assert.equal((message.match(/^Nama:/gm) || []).length, 1);
});

test("username dengan baris baru ditolak karena username tidak boleh mengandung spasi", () => {
  assert.throws(() => buildOrderMessage({
    name: "Andi",
    tradingViewUsername: "user\r\nAdmin",
  }), /TradingView/);
});

test("panjang input dibatasi tanpa data tersimpan di URL", () => {
  const message = buildOrderMessage({
    name: "B".repeat(1000),
    tradingViewUsername: "C".repeat(1000),
    note: "D".repeat(1000),
  });
  const nameLine = message.split("\n").find(line => line.startsWith("Nama: "));
  const usernameLine = message.split("\n").find(line => line.startsWith("Username TradingView: "));
  assert.equal(nameLine.length, 6 + 80);
  assert.equal(usernameLine.length, 22 + 70);
  assert.match(THREADS_DM_URL, /^https:\/\/www\.threads\.com\/messages\/t\/\d+$/);
  assert.doesNotMatch(THREADS_DM_URL, /[?&#]/);
});
