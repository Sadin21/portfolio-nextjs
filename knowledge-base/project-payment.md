## Project: Integrasi Payment Virtual Account Multi-Bank (SNAP BI)

### Konteks & Masalah Bisnis
AGROS merupakan platform logistik B2B yang menghubungkan shipper dan transporter, dengan volume transaksi bertahap bernilai tinggi mencakup pembayaran penuh (CBD), uang muka (DP), pelunasan (Unloading/EOM), hingga top-up wallet operasional. Sebelumnya, pemrosesan pembayaran Virtual Account masih mengandalkan payment gateway pihak ketiga (Midtrans). Namun, penggunaan agregator memunculkan tantangan tingginya beban biaya transaksi (fee per transaction) untuk perputaran dana B2B, ketergantungan pada perantara, serta keterbatasan fleksibilitas dalam rekonsiliasi dan settlement dana. Oleh karena itu, inisiatif integrasi langsung (direct connection) Virtual Account ke 5 bank utama (BCA, BNI, BRI, Mandiri, DBS) berbasis standar SNAP BI dibangun guna memangkas biaya perantara, mempercepat settlement ke rekening perusahaan, dan memberikan kendali penuh atas ekosistem pembayaran mandiri.

### Peran & Kontribusi Utama
Sebagai Backend / Payment Engineer, saya bertanggung jawab merancang dan mengimplementasikan modul integrasi Virtual Account (VA) multi-bank berbasis standar SNAP BI untuk transaksi operasional perusahaan. Saya berperan aktif menjalin komunikasi teknis intensif dengan tim integrasi dari 5 mitra perbankan guna menyelaraskan kebutuhan spesifikasi API, menyelesaikan kendala pengujian, serta mengawal sertifikasi UAT hingga rilis bertahap ke production. Selain itu, saya mengorkestrasikan strategi branching dan lingkungan sandbox terisolasi untuk memastikan rilis tiap bank dapat berjalan mandiri tanpa saling mengganggu.

### Tantangan Teknis: Standardisasi SNAP BI & Service Layer Pattern
- Problem: Sebagai pengalaman pertama di ranah fintech, saya menghadapi kerumitan tata urutan API (OAuth token, Create VA, Inquiry, Payment Callback, hingga Inquiry Status) dengan spesifikasi teknis dan kepatuhan SNAP BI yang ketat pada 5 bank berbeda (BCA, BNI, BRI, Mandiri, DBS).
- Solusi: Saya merancang arsitektur terpusat dengan service layer pattern yang memisahkan logika inti bisnis pembayaran dari spesifikasi payload masing-masing bank, sehingga tata kelola alur transaksi menjadi seragam dan mudah dimodifikasi.

### Tantangan Teknis: Strategi Branching & Deployment Multi-Bank
- Problem: Progres UAT dan jadwal go-live dari kelima bank tidak bersamaan, sehingga penggabungan fitur dalam satu branch utama berisiko tinggi memicu merge conflict parah dan menahan rilis bank yang sudah lolos sertifikasi.
- Solusi: Saya menerapkan versioned release branching (main_v1.x) dan sandbox branch terisolasi per bank, memungkinkan rilis produksi bertahap (staggered release) secara independen tanpa ketergantungan pada bank yang masih dalam tahap pengujian.

### Tantangan Teknis: Payment Simulator & Pengujian UAT Mandiri
- Problem: Siklus komunikasi dan SLA respons dari tim teknis perbankan memakan waktu cukup lama, menghambat proses debugging cepat untuk skenario edge case maupun verifikasi error handling.
- Solusi: Saya menginisiasi pembuatan internal payment simulator/mock engine yang meniru perilaku, payload, dan callback perbankan, memungkinkan tim menguji skenario positif maupun negatif secara mandiri sebelum sesi UAT resmi dengan bank.

### Tantangan Teknis: Keamanan Transaksi & Pencegahan Duplikasi (Idempotency)
- Problem: Masing-masing bank menerapkan standar keamanan berbeda (PGP encryption, RSA-SHA256 signature, IP whitelisting) serta adanya risiko double-processing saldo akibat retry callback jaringan.
- Solusi: Saya membangun middleware validasi autentikasi/signature terstandarisasi, scheduler rotasi kredensial kedaluwarsa, serta mekanisme idempotency key berbasis data transaksi unik untuk menjamin seluruh mutasi pembayaran aman dan bebas duplikasi.

### Hasil & Dampak (Impact)
- 5 Bank Terintegrasi Penuh (100% Go-Live): Berhasil merilis modul Virtual Account untuk BCA, BNI, BRI, Mandiri, dan DBS ke production dengan kepatuhan penuh terhadap standar nasional SNAP BI.
- 0% Kasus Double Payment: Mekanisme idempotency dan validasi callback menjamin 0 insiden mutasi ganda pada ribuan transaksi tagihan (CBD, Down Payment, hingga Pelunasan).
- Efisiensi Waktu Pengujian ~50% - 60%: Penggunaan internal payment simulator memangkas waktu tunggu dependensi teknis bank selama fase pengembangan awal dan validasi edge cases.
- Zero-Downtime pada 5 Siklus Rilis Bertahap: Isolasi branching strategy berhasil mengeliminasi blocker antar bank, menghasilkan 0 rollback akibat keterlambatan sertifikasi pihak ketiga.
- Direct Settlement & Eliminasi Fee Pihak Ketiga: Berhasil memindahkan alur pembayaran dari agregator pihak ketiga (Midtrans) ke koneksi langsung perbankan, memangkas beban biaya perantara transaksi secara signifikan serta menyajikan pencatatan mutasi otomatis real-time ke sistem ERP dan notifikasi pengguna.
[CARD:project-payment]
