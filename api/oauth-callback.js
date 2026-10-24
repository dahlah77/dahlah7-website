module.exports = function oauthCallback(req, res) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  res.setHeader("CDN-Cache-Control", "no-store");
  res.setHeader("Vercel-CDN-Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; connect-src 'none'");
  res.setHeader("X-Frame-Options", "DENY");

  const query = req.query || {};
  const hasCode = typeof query.code === "string" && query.code.length > 0;
  const hasState = typeof query.state === "string" && query.state.length > 0;
  const hasError = typeof query.error === "string" && query.error.length > 0;

  let title = "Callback siap";
  let message = "Belum ada respons otorisasi pada URL ini. Mulai proses dari helper lokal setelah redirect URI didaftarkan.";
  if (hasError) {
    title = "Otorisasi tidak selesai";
    message = "Platform mengembalikan respons error. Periksa diagnostik aman pada terminal Hermes.";
  } else if (hasCode && hasState) {
    title = "Respons otorisasi diterima";
    message = "Biarkan tab ini terbuka sementara helper Hermes lokal memvalidasi state dan menukar authorization code. Halaman ini tidak mengirim respons ke layanan lain.";
  }

  res.statusCode = 200;
  res.end('<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><meta name="robots" content="noindex,nofollow,noarchive"><title>DAHLAH7 · OAuth callback</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f5f7fa;color:#101828;font:16px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}main{box-sizing:border-box;width:min(92vw,560px);padding:32px;background:white;border:1px solid #e4e7ec;border-radius:16px}h1{font-size:1.35rem}p{line-height:1.6;color:#475467}.note{margin-top:24px;padding-top:16px;border-top:1px solid #eaecf0;font-size:.9rem}</style></head><body><main><h1>DAHLAH7 account authorization</h1><p><strong>' + title.replace(/[&<>"]/g, "") + '</strong></p><p>' + message.replace(/[&<>"]/g, "") + '</p><p class="note">Do not copy or share this page URL because it may contain temporary authorization parameters. Close this tab after Hermes reports the result.</p></main></body></html>');
};
