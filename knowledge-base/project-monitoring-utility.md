## Project: Monitoring Utility Armada & Driver
 
### Konteks & Masalah Bisnis
- Latar Belakang: Kebutuhan tim operasional untuk memantau histori aktivitas dan merencanakan jadwal kerja armada dan driver hingga 31 hari ke depan.
- Masalah: Pencatatan manual di file Excel terpisah memicu kerja ganda (*double-entry*), ketidaksesuaian data dengan database ERP (*human error*), dan lambatnya rekap metrik finansial.
- Solusi: Spreadsheet matriks kalender interaktif terintegrasi langsung ke database ERP, mendukung pemantauan real-time status armada/driver dan kalkulasi otomatis metrik finansial.

### Solusi Arsitektur & Tech Stack
- Backend: Laravel (PHP).
- Database & Query: MySQL dengan pendekatan *hybrid query* (kombinasi query terindeks dan pemrosesan array di memori) untuk transformasi cepat data event transaksi ke matriks kalender 31 hari.
- Frontend & UI: DataTables dengan dynamic header/footer generator, jQuery untuk *inline editing*, Bootstrap, dan CSS responsif.
- Ekspor Laporan: SheetJS di sisi klien untuk unduh file Excel terformat (formula total, pemisah ribuan, border) langsung dari browser tanpa membebani server backend.

### Peran & Kontribusi Utama
- Merancang dan membangun fitur Monitoring Utility end-to-end: API pengolahan log aktivitas Laravel, agregasi metrik finansial, dan UI spreadsheet matriks dinamis.
- Mengimplementasikan 4 mode template tampilan, *inline cell editing*, dan kalkulasi performa armada/driver secara instan.

### Tantangan Teknis: Transformasi Data Transaksional ke Matriks 2D (Slot Kosong)
- Problem: Data database tersimpan per event transaksi, sedangkan tampilan UI memerlukan grid horizontal 31 hari utuh termasuk tanggal-tanggal tanpa aktivitas logistik.
- Solusi: Penyusunan ulang struktur data berbasis indeks di memori server dan pengisian sel kosong otomatis untuk memangkas iterasi pencarian data di frontend.

### Tantangan Teknis: Spreadsheet Matriks Dinamis pada DataTables
- Problem: Header bertingkat dan sel gabungan DataTables rentan rusak ketika susunan kolom berubah dinamis saat pengguna berpindah template tampilan.
- Solusi: Generator struktur tabel berbasis JavaScript yang merender ulang elemen header/footer dan menginisialisasi ulang DataTables secara terprogram pada setiap pergantian template.

### Tantangan Teknis: Sinkronisasi Status Asimetris (Armada ↔ Driver)
- Problem: Truk dapat berganti pengemudi harian, namun satu driver hanya terikat pada satu truk pada satu waktu; rentan terjadi konflik status operasional.
- Solusi: Relasi dua arah dengan pembaruan berantai (*cascading update*)—status driver otomatis tersinkronisasi saat status armada diubah menjadi pasif (servis, parkir, libur).

### Tantangan Teknis: Tampilan Menu Aksi Terpotong pada Tabel Lebar
- Problem: Fitur *fixed column* dan horizontal scrolling menyebabkan dropdown aksi sel terpotong batas container (`overflow: hidden`).
- Solusi: Memindahkan elemen dropdown ke root DOM saat dibuka dan mengalkulasi koordinat posisi layar sel secara presisi agar menu melayang rapi di atas tabel.

### Hasil & Dampak (Impact)
- 31 Hari Visibilitas Kalender: Memantau jadwal dan utilitas armada sebulan penuh dalam satu layar tanpa reload.
- 100% Sinkronisasi Armada-Driver: Menghilangkan inkonsistensi jadwal kerja antara kendaraan dan pengemudi.
- 4 Mode Template: Pilihan tampilan fleksibel (Lengkap, Status, Aktivitas, Finansial) memangkas waktu analisis dari jam ke menit.
- Tracking Otomatis 3 Metrik Finansial: Perhitungan otomatis omset, sangu, dan margin bersih harian per unit armada.
- Zero Server Load Export: Ekspor Excel terformat lengkap diproses langsung di browser klien via SheetJS.
[CARD:project-monitoring-utility]
