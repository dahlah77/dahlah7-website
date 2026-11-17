export const THREADS_DM_URL = "https://www.threads.com/messages/t/1143880444843814";
export const PRODUCT_NAME = "DAHLAH7 Scalper Pro";

function normalizeField(value, maxLength) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength)
    .trim();
}

export function buildOrderMessage({
  name,
  tradingViewUsername,
  threadsUsername = "",
  note = "",
} = {}) {
  const buyer = normalizeField(name, 80);
  const tradingView = normalizeField(tradingViewUsername, 70);
  const threads = normalizeField(threadsUsername, 70);
  const detail = normalizeField(note, 280);

  if (buyer.length < 2) {
    throw new Error("Nama pembeli minimal 2 karakter.");
  }
  if (tradingView.length < 2 || /\s/.test(tradingView)) {
    throw new Error("Masukkan username TradingView yang valid.");
  }

  const lines = [
    "Halo, saya ingin memesan " + PRODUCT_NAME + ".",
    "",
    "Nama: " + buyer,
    "Username TradingView: " + tradingView,
  ];
  if (threads) lines.push("Username Threads: " + threads);
  lines.push("Lisensi: Lifetime (sekali bayar, tanpa langganan)");
  if (detail) lines.push("Catatan: " + detail);
  lines.push(
    "",
    "Mohon informasi harga, metode pembayaran, serta cara aktivasi.",
    "Terima kasih."
  );
  return lines.join("\n");
}
