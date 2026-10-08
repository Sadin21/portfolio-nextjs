## Project: Blasting & Unblasting PO/DO (Order Allocation & Automated Refund)

### Konteks & Masalah Bisnis
- Fungsi Utama: Mesin alokasi muatan (Blasting) untuk mendistribusikan pesanan (skala PO/DO) ke mitra Transporter & Driver, serta pembatalan alokasi (Unblasting) saat terjadi kendala armada atau penyesuaian kuota.
- Masalah: Pembatalan pesanan memerlukan pengembalian saldo sangu jalan bertingkat, penarikan armada, dan pembatalan penawaran tanpa mengganggu pengiriman lain yang sedang berjalan.

### Solusi Arsitektur & Tech Stack
- Backend: Laravel (PHP), NestJS (TypeScript).
- Database & Transaksi: MySQL.
- Kontrol Konkurensi: Penerapan *pessimistic locking* pada tabel dompet mitra untuk mencegah tabrakan data (*race condition*) saat mutasi saldo konkuren.
- Sinkronisasi Data Memori: Refresh data model di memori server langsung dari database sebelum mutasi saldo lanjutan dijalankan guna mencegah penimpaan saldo dengan data lama (*stale data overwrite*).
- State Machine & Guard Safety: Validasi hierarki status pesanan (tingkat PO/DO) dan tahapan operasional driver (ditunjuk, muat barang, atau jalan).
- Clean Multi-Entity Teardown: Rollback otomatis keterkaitan data pada 5 modul logistik (Driver, Truk, Biaya Jalan, Pelacakan Rute, dan Muatan Campur) dalam satu transaksi database terpadu.
- Notifikasi Multi-Tenant: Pembaruan status notifikasi selektif berbasis pengecualian ID mitra aktif.

### Peran & Kontribusi Utama
- Merancang dan membangun alur status distribusi muatan (Blasting) dan pembatalan alokasi (Unblasting) pada sistem AGROS ERP.
- Mengimplementasikan transaksi database atomik, *pessimistic locking*, guard safety, dan sinkronisasi memori untuk menjamin keakuratan saldo dompet mitra.

### Tantangan Teknis: Penimpaan Saldo Akibat Data Lama di Memori (Stale Data Overwrite)
- Problem: Pembatalan armada menjalankan dua refund berurutan (pengembalian potongan sangu dan pengembalian sisa penahanan). Model dompet di memori server tidak ter-refresh setelah operasi pertama, sehingga operasi kedua memakai data saldo lama dan menimpa database (mengakibatkan saldo penahanan minus).
- Solusi: Menerapkan *pessimistic locking* di transaksi database dan menyinkronkan ulang (*fresh reload*) data model di memori server dari database sebelum kalkulasi refund kedua dieksekusi.

### Tantangan Teknis: Validasi Status Bertingkat (Guard Safety)
- Problem: Pembatalan muatan berisiko mengacaukan operasional jika pengemudi sudah menyetujui tugas atau sedang bongkar-muat di gudang.
- Solusi: Membangun guard bertingkat di service layer yang menolak pembatalan jika muatan sudah aktif bergerak, serta memisahkan alur pembatalan skala proyek (PO) vs pembatalan satuan armada (DO).

### Tantangan Teknis: Pembersihan Data Terkait Secara Tuntas (Clean Teardown)
- Problem: Pesanan terikat pada jadwal truk, penugasan driver, histori rute, muatan campur, dan uang jalan.
- Solusi: Alur pembersihan data terpadu dalam satu transaksi: batalkan uang jalan, kosongkan penugasan armada/driver, reset item muatan, hapus histori rute, dan kembalikan status pesanan menjadi terbuka.

### Tantangan Teknis: Sinkronisasi Status Notifikasi Multi-Tenant
- Problem: Penawaran muatan disebar massal ke banyak mitra. Pembatalan sebagian armada tidak boleh mencabut notifikasi mitra lain yang masih siap jalan.
- Solusi: Update notifikasi selektif dengan klausul pengecualian mitra aktif, sehingga hanya mencabut notifikasi milik mitra yang muatannya ditarik.

### Hasil & Dampak (Impact)
- 100% Saldo Akurat: Menghilangkan 100% insiden saldo minus dan kesalahan rekonsiliasi uang jalan mitra melalui *pessimistic locking* dan sinkronisasi memori.
- Kontrol Alokasi 2 Tingkat: Memungkinkan pembatalan fleksibel pada level proyek (PO) maupun per unit armada (DO) tanpa efek samping pada muatan aktif.
- 0 Residu Data: Rollback otomatis dan bersih pada 5 modul logistik dalam satu transaksi database atomik.
- Proteksi Operasional: Mengeliminasi risiko pembatalan tidak sengaja pada muatan yang sudah diproses di lapangan.
[CARD:project-blast-unblast]
