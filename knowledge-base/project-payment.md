## Project: Integrasi Payment Virtual Account Multi-Bank (SNAP BI)

### Konteks & Masalah Bisnis
AGROS adalah platform logistik B2B dengan perputaran transaksi harian yang tinggi, mulai dari uang muka (DP), pembayaran penuh (CBD), pelunasan surat jalan, hingga top-up saldo operasional mitra. Awalnya, pembayaran Virtual Account (VA) masih menggunakan payment gateway pihak ketiga (Midtrans). Skema ini menimbulkan beban biaya per transaksi yang cukup besar dan proses pencairan dana (*settlement*) menjadi lebih lambat karena harus melalui perantara. Untuk memangkas biaya transaksi dan mempercepat perputaran dana langsung ke rekening perusahaan, kami membangun integrasi langsung (*direct connection*) Virtual Account ke 5 bank nasional utama (BCA, BNI, BRI, Mandiri, dan DBS) berbasis standar nasional SNAP BI dari Bank Indonesia.

### Solusi Arsitektur & Tech Stack
Membangun modul backend direct connection berbasis *service layer pattern* untuk menyatukan alur pembayaran multi-bank:
- Backend: Laravel (PHP).
- Database & Idempotency: MySQL dengan transaksi ACID dan pengecekan kunci unik (`X-EXTERNAL-ID` dan `paymentRequestId`) agar tidak ada tagihan yang terbayar ganda, tanpa perlu dependensi cache eksternal.
- Protokol Keamanan & Kepatuhan Standar SNAP BI:
  - Asymmetric Signature (SHA256withRSA / OpenSSL): Mengamankan pertukaran token akses OAuth 2.0 B2B menggunakan pasangan RSA Private & Public Key (.pem).
  - Symmetric Signature (HMAC-SHA512): Memvalidasi keaslian data callback transaksi (*Inquiry* & *Payment*) agar tidak bisa dimanipulasi.
  - PGP Encryption (GnuPG): Enkripsi payload dan berkas khusus untuk integrasi Bank DBS.
  - Manajemen Token (OAuth 2.0): Scheduler otomatis yang membersihkan token kedaluwarsa tiap 15 menit.
  - Pencegahan Replay Attack: Validasi header `X-TIMESTAMP` (toleransi 5–10 menit) untuk menolak pengiriman ulang request yang sudah kedaluwarsa.
  - IP Whitelisting & Rate Limiting: Hanya menerima callback dari alamat IP resmi perbankan serta membatasi frekuensi request.
  - Audit Trail & Logging: Pencatatan log lengkap (header, body, signature) yang terpisah per bank untuk rekonsiliasi keuangan dan kebutuhan audit regulasi.

### Peran & Kontribusi Utama
Sebagai Backend / Payment Engineer, saya bertanggung jawab penuh merancang dan membangun modul integrasi Virtual Account multi-bank berstandar SNAP BI. Saya bekerja langsung dengan tim teknis dari 5 bank mitra untuk menyelaraskan spesifikasi API, mengatasi kendala teknis saat pengujian, hingga mengawal proses sertifikasi UAT sampai sukses rilis ke production. Selain itu, saya merancang strategi branch Git terpisah untuk tiap bank agar jadwal rilis fitur antar-bank tidak saling tunggu atau menimbulkan konflik kode.

### Tantangan: Adaptasi Pertama Kali di Sistem Fintech & Alur Transaksi
- Problem: Ini merupakan pengalaman pertama saya mengerjakan proyek di bidang fintech, sehingga cukup sulit pada awalnya untuk memahami alur (*flow*) sistem perbankan yang memiliki banyak tahapan dan aturan ketat (seperti alur token OAuth, Create VA, Inquiry, hingga validasi Payment Callback).
- Solusi: Saya mengatasinya dengan aktif berdiskusi bersama tim internal dan pihak teknis perbankan, mempelajari dokumentasi teknis SNAP BI secara lebih mendalam dan detail, serta konsisten melakukan uji coba di environment sandbox. Seiring berjalannya proses pengembangan, pemahaman saya terhadap alur sistem perbankan menjadi matang hingga berhasil menyelesaikan integrasi dengan lancar.

### Tantangan Teknis: Standardisasi SNAP BI & Service Layer Pattern
- Problem: Meskipun mengacu pada standar SNAP BI yang sama, masing-masing bank (BCA, BNI, BRI, Mandiri, DBS) memiliki detail format payload dan alur API (OAuth token, Create VA, Inquiry, Callback) yang berbeda-beda.
- Solusi: Saya menerapkan *service layer pattern* yang memisahkan logika utama bisnis pembayaran dari format data spesifik masing-masing bank. Hasilnya, alur transaksi di internal sistem tetap seragam dan penyesuaian untuk bank baru bisa dilakukan dengan mudah tanpa membongkar kode utama.

### Tantangan Teknis: Strategi Branching & Rilis Multi-Bank
- Problem: Jadwal pengujian (UAT) dan tanggal go-live kelima bank tidak bersamaan. Menggabungkan kode semua bank dalam satu branch berisiko menahan bank yang sudah siap rilis akibat menunggu bank lain yang masih dalam proses sertifikasi.
- Solusi: Saya menerapkan strategi branch rilis bertahap (`main_v1.x`) dan sandbox terpisah untuk tiap bank. Pendekatan ini memungkinkan bank yang sudah lolos uji langsung diluncurkan ke production secara mandiri tanpa terhambat oleh bank lain.

### Hasil & Dampak (Impact)
- 5 Bank Terintegrasi Penuh (100% Go-Live): Sukses merilis modul Virtual Account untuk BCA, BNI, BRI, Mandiri, dan DBS ke production sesuai standar nasional SNAP BI.
- 0% Kasus Double Payment: Mekanisme idempotency dan validasi callback berhasil mencegah 100% insiden mutasi ganda pada ribuan transaksi pembayaran (DP, pelunasan, dan top-up).
- Zero-Downtime & Rilis Tanpa Hambatan: Strategi isolasi branch berhasil mengeliminasi dependensi antar-bank, menghasilkan 0 kasus rollback selama proses rilis bertahap.
- Hemat Biaya & Settlement Langsung: Berhasil beralih dari payment gateway perantara (Midtrans) ke koneksi langsung perbankan, memangkas biaya fee per transaksi secara signifikan dan mempercepat settlement dana ke rekening perusahaan secara real-time.
[CARD:project-payment]
