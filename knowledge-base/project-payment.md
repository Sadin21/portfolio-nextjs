## Project: Integrasi Payment Virtual Account Multi-Bank (SNAP BI)

### Konteks & Masalah Bisnis
- Latar Belakang: Platform logistik B2B AGROS memproses volume transaksi harian tinggi (uang muka/DP, CBD, pelunasan surat jalan, dan top-up saldo operasional mitra).
- Masalah: Penggunaan payment gateway agregator (Midtrans) membebankan biaya per transaksi yang besar dan proses *settlement* dana tertunda.
- Solusi: Migrasi ke koneksi langsung (*direct connection*) Virtual Account ke 5 bank nasional (BCA, BNI, BRI, Mandiri, DBS) berbasis standar SNAP BI Bank Indonesia guna memangkas biaya perantara dan mempercepat pencairan dana.

### Solusi Arsitektur & Tech Stack
- Backend: Laravel (PHP) dengan arsitektur *Service Layer Pattern*.
- Database & Idempotency: MySQL dengan transaksi ACID dan validasi kunci unik (`X-EXTERNAL-ID` dan `paymentRequestId`) untuk mencegah transaksi ganda (*zero double-pay*).
- Kriptografi & Keamanan SNAP BI:
  - Asymmetric Signature: SHA256withRSA (OpenSSL) menggunakan pasangan RSA Key (.pem) untuk otentikasi token akses B2B OAuth 2.0.
  - Symmetric Signature: HMAC-SHA512 untuk validasi integritas callback data transaksi (*Inquiry* & *Payment*).
  - PGP Encryption: Enkripsi berkas dan payload khusus integrasi Bank DBS via GnuPG.
  - Manajemen Token: Scheduler otomatis untuk refresh dan pembersihan token OAuth kedaluwarsa (siklus 15 menit).
  - Replay Attack Prevention: Validasi timestamp header `X-TIMESTAMP` (toleransi 5–10 menit).
  - Keamanan Akses: Pembatasan IP resmi (*IP whitelisting*) dan rate limiting perbankan.
  - Audit Trail: Logging terpisah per bank untuk header, request body, dan signature guna rekonsiliasi keuangan.

### Peran & Kontribusi Utama
- Merancang dan membangun modul backend direct connection Virtual Account multi-bank berbasis SNAP BI.
- Berkolaborasi intensif dengan tim teknis perbankan (termasuk BRI dan DBS) dalam penyelarasan spesifikasi API, pengujian sandbox, hingga kelulusan sertifikasi UAT ke production.
- Menerapkan strategi branch Git terisolasi untuk jadwal rilis mandiri tiap bank.

### Tantangan: Adaptasi Pertama Kali di Sistem Fintech & Alur Transaksi
- Problem: Pengalaman pertama di ranah fintech dengan aturan perbankan ketat dan alur multi-tahap (OAuth token, Create VA, Inquiry, Callback).
- Solusi: Mempelajari spesifikasi teknis SNAP BI secara mendalam, uji coba intensif di lingkungan sandbox, dan komunikasi aktif dengan tim teknis bank mitra.

### Tantangan Teknis: Standardisasi SNAP BI & Service Layer Pattern
- Problem: Format payload dan alur verifikasi tiap bank tetap memiliki variasi spesifik meskipun berpatokan pada standar SNAP BI.
- Solusi: Mengabstraksi integrasi menggunakan *Service Layer Pattern*, memisahkan logika inti bisnis pembayaran dari spesifikasi teknis masing-masing bank sehingga integrasi bank baru dapat ditambahkan modular tanpa mengubah kode utama.

### Tantangan Teknis: Strategi Branching & Rilis Multi-Bank
- Problem: Jadwal UAT dan sertifikasi kelima bank berbeda; menggabungkan kode dalam satu branch berisiko menunda bank yang sudah siap rilis.
- Solusi: Menerapkan branch rilis bertahap (`main_v1.x`) dan sandbox terpisah per bank sehingga peluncuran production dapat dilakukan mandiri tanpa saling tunggu.

### Hasil & Dampak (Impact)
- 100% Go-Live 5 Bank: Sukses merilis integrasi Virtual Account BCA, BNI, BRI, Mandiri, dan DBS ke production.
- 0% Double Payment: Mekanisme idempotency menjamin nol transaksi ganda pada seluruh mutasi pembayaran.
- Zero-Downtime Rollout: Strategi isolasi branch berhasil mengeliminasi dependensi antar-bank dan menghasilkan 0 rollback.
- Efisiensi Biaya & Settlement Instan: Beralih ke direct connection mengeliminasi fee agregator dan mempercepat settlement dana langsung ke rekening perusahaan secara real-time.
[CARD:project-payment]
