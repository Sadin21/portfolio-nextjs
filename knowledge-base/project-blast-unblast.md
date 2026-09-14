## Project: Blasting & Unblasting PO/DO (Order Allocation & Automated Refund)

### Konteks & Masalah Bisnis
Di platform logistik B2B AGROS, alur pengiriman muatan melibatkan distribusi pesanan dari Shipper kepada jaringan mitra Transporter dan Driver. Fitur **Blasting** berfungsi sebagai mesin alokasi untuk menyebarkan pesanan muatan (skala proyek PO maupun satuan armada DO) ke banyak mitra sekaligus. Namun di lapangan, alokasi pesanan kerap harus dibatalkan (**Unblasting**) akibat kendala armada, pergantian driver, atau penyesuaian kuota dari shipper. Pembatalan ini cukup rumit karena sistem harus mengembalikan penahanan saldo uang jalan (sangu) mitra secara berurutan, membatalkan penugasan armada, dan menarik notifikasi penawaran tanpa mengganggu pesanan lain yang sedang berjalan lancar.

### Solusi Arsitektur & Tech Stack
Membangun mesin refund otomatis dan manajemen status alokasi muatan yang konsisten:
- Backend: Laravel (PHP) dan NestJS (TypeScript).
- Database: MySQL, menggunakan transaksi database atomik untuk memastikan seluruh perubahan data berhasil disimpan bersamaan atau dibatalkan total jika terjadi kendala.
- Kontrol Konkurensi: Penerapan *pessimistic locking* pada tabel dompet mitra untuk mengunci baris data saat transaksi berlangsung, mencegah benturan data (*race condition*) ketika saldo jalan diproses bersamaan.
- Sinkronisasi Data Memori: Pembaruan data model di memori server langsung dari database sebelum mutasi kedua dijalankan, mencegah penimpaan saldo dengan kalkulasi data lama (*stale data overwrite*).
- State Machine & Guard Safety: Sistem validasi bertingkat untuk memeriksa status pesanan (tingkat PO maupun DO) serta tahapan operasional pengemudi (apakah baru ditunjuk, sudah menerima muatan, atau sedang proses bongkar-muat).
- Pembersihan Data Bersih (Multi-Entity Teardown): Menghapus keterkaitan data secara otomatis di 5 modul logistik (Driver, Truk, Biaya Jalan, Pelacakan Rute, dan Muatan Campur) dalam satu transaksi database terpadu.
- Pengaturan Notifikasi Multi-Tenant: Mekanisme pembaruan notifikasi selektif berbasis pengecualian agar notifikasi penawaran milik mitra yang muatannya masih aktif tidak ikut terhapus.

### Peran & Kontribusi Utama
Sebagai Full Stack / Backend Developer, saya bertanggung jawab penuh atas perancangan arsitektur dan implementasi alur distribusi muatan (Blasting) serta pembatalan alokasi (Unblasting) pada sistem AGROS ERP. Saya merancang alur status pengiriman antar-pihak (Shipper, Transporter, Driver), membangun sistem validasi bertingkat (*guard safety*), serta merekayasa sistem refund otomatis dan pencatatan saldo dompet mitra menggunakan Laravel, NestJS (TypeScript), dan MySQL agar transaksi keuangan selalu akurat dan terbebas dari *race condition*.

### Tantangan Teknis: Penimpaan Saldo Akibat Data Lama di Memori (Stale Data Overwrite)
- Problem: Saat membatalkan pesanan armada yang sudah dialokasikan ke pengemudi, sistem menjalankan dua operasi pengembalian dana berturut-turut: pengembalian potongan uang sangu jalan dan pengembalian sisa saldo penahanan. Karena data dompet yang tersimpan di memori server tidak diperbarui setelah proses pertama selesai, kalkulasi pada proses kedua masih memakai data saldo lama dan menimpa angka di database, mengakibatkan saldo penahanan menjadi negatif dan saldo riil mitra terpotong keliru.
- Solusi: Saya menerapkan mekanisme *pessimistic locking* di dalam transaksi database untuk mengunci baris data dompet mitra, serta menyinkronkan ulang data dompet di memori server langsung dari database tepat setelah operasi pertama selesai. Dengan begitu, kalkulasi mutasi kedua selalu menggunakan data saldo paling mutakhir.

### Tantangan Teknis: Validasi Status Bertingkat (Guard Safety)
- Problem: Pembatalan muatan berisiko mengacaukan operasional lapangan jika pengemudi ternyata sudah menyetujui tugas atau armada sudah berada dalam proses muat-bongkar barang di gudang. Selain itu, aturan penanganan berbeda antara pesanan yang baru disebar dengan pesanan yang armadanya sudah mulai jalan.
- Solusi: Saya merancang mekanisme validasi bertingkat di lapisan logika aplikasi (*controller* dan *service layer*) untuk memeriksa status pesanan sebelum pembatalan dieksekusi. Sistem otomatis menolak pembatalan jika muatan sudah berjalan, serta membedakan alur pembatalan skala besar (seluruh pesanan PO) dengan pembatalan satuan armada (per DO) agar armada lain tetap bisa melanjutkan pengiriman dengan aman.

### Tantangan Teknis: Pembersihan Data Terkait Secara Tuntas (Clean Teardown)
- Problem: Pesanan yang dibatalkan sudah terlanjur terikat ke banyak entitas data logistik: jadwal armada truk, penugasan pengemudi, riwayat pelacakan rute, rincian muatan campur, hingga pencatatan uang jalan. Jika dibatalkan tanpa pembersihan menyeluruh, sistem akan meninggalkan data gantung (*orphaned data*) yang bisa menimbulkan eror di kemudian hari.
- Solusi: Saya membangun alur pembersihan data otomatis yang membatalkan distribusi uang jalan, mengosongkan penugasan armada dan pengemudi, mereset item muatan, menghapus riwayat rute, serta mengembalikan status pesanan menjadi terbuka kembali dalam satu transaksi database yang utuh.

### Tantangan Teknis: Sinkronisasi Status Notifikasi Multi-Tenant
- Problem: Saat penawaran muatan disebar, notifikasi dikirimkan serentak ke banyak akun mitra transporter. Ketika terjadi pembatalan pesanan padahal sebagian armada mitra lain sudah siap jalan, notifikasi tidak boleh dibatalkan secara massal agar mitra yang aktif tidak bingung.
- Solusi: Saya membuat fungsi pembaruan notifikasi selektif dengan mengecualikan akun mitra yang muatannya masih berjalan, sehingga status notifikasi hanya diubah menjadi dibatalkan khusus untuk mitra yang muatannya ditarik.

### Hasil & Dampak (Impact)
- 100% Saldo Akurat: Berhasil menghilangkan 100% insiden saldo minus dan kesalahan rekonsiliasi uang jalan mitra melalui penguncian baris data (*pessimistic locking*) dan sinkronisasi memori.
- Fleksibilitas Alokasi 2 Tingkat: Memungkinkan tim operasional membatalkan pesanan secara menyeluruh (skala proyek) maupun per unit armada tanpa mengganggu muatan lain yang sedang berjalan.
- 0 Residu Data (Rollback 5 Modul): Mengotomatiskan pembersihan dan pemulihan status pada 5 modul logistik terkait (Driver, Truk, Biaya Jalan, Pelacakan Rute, dan Muatan Campur) dalam satu transaksi database yang rapi.
- Proteksi Operasional Lapangan: Mencegah risiko salah klik atau pembatalan tidak sengaja atas muatan yang sudah mulai dijalankan oleh pengemudi.
- Notifikasi Terarah Real-Time: Memastikan status pemberitahuan penawaran muatan selalu akurat dan sinkron di perangkat operasional mitra.
[CARD:project-blast-unblast]
