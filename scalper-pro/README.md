# DAHLAH7 Scalper Pro — Glass Edition

Website statis mandiri dengan HTML/CSS/JS, menggunakan desain glassmorphism dark–cyan. Source ada di `scalper-pro/` pada repo ini. Folder lain dalam repo tidak diubah.

## Alur pemesanan
1. Pembeli membuka formulir, memasukkan nama dan username TradingView, serta opsional username Threads/catatan.
2. Website membentuk template pesan secara lokal di browser.
3. Tombol **Salin Pesan & Buka Chat Threads** menyalin pesan ke clipboard dan membuka https://www.threads.com/messages/t/1143880444843814.
4. Pembeli menempelkan teks ke DM Threads dan menekan Kirim. Penentuan harga, pembayaran, dan aktivasi dilakukan melalui percakapan Threads.

**Keterbatasan teknis:** Threads menyediakan composer prefill untuk *post*, bukan untuk DM. Tidak tersedia URL prefill DM resmi yang telah terverifikasi; tidak ada sistem yang mengirim pesan atau mengisi kolom DM secara otomatis. Bila Clipboard API gagal, pembeli dapat menyalin manual dan menggunakan tautan pembuka chat.

## Deployment
Project Vercel baru ditautkan ke GitHub repository `dahlah77/dahlah7-website`, dengan **Root Directory** `scalper-pro`, terpisah dari website utama. Website statis tanpa build/dependency/database/backend. Clipboard API membutuhkan origin HTTPS.

## Catatan produk
- Harga ditampilkan *Harga via Threads* sampai nominal resmi ditentukan.
- Visual chart menggunakan data simulasi; bukan live market, hasil backtest, atau bukti profit.
- Sinyal, indikator, dan lifetime license tidak menjamin profit atau ketersediaan platform tanpa batas.
- Website tidak menerima pembayaran, membuat akun, atau menyimpan data pemesanan di server.
- Tanpa Lovable atau layanan checkout.
