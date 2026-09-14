## Project: Monitoring Utility Armada & Driver

### Konteks & Masalah Bisnis
Tim operasional armada membutuhkan visibilitas yang jelas untuk menyusun jadwal kerja beberapa hari ke depan sekaligus memantau riwayat aktivitas armada dan driver. Sebelumnya, proses ini dicatat secara manual di file Excel terpisah, sehingga tim operasional harus bekerja dua kali dan data sering kali tidak cocok dengan sistem ERP (*human error*). Untuk mengatasi inefisiensi ini, kami mengembangkan fitur **Monitoring Utility** berupa spreadsheet matriks interaktif yang terhubung langsung ke database ERP. Sistem ini memetakan aktivitas harian secara real-time—mulai dari status penugasan armada, progres Surat Jalan (DO), sinkronisasi status dua arah Armada-Driver, hingga kalkulasi otomatis metrik keuangan (omset, sangu, dan margin) yang bisa diekspor langsung ke Excel.

### Solusi Arsitektur & Tech Stack
Membangun spreadsheet matriks interaktif dua arah yang terhubung langsung ke database ERP:
- Backend: Laravel (PHP).
- Database & Query: MySQL, menggunakan pendekatan *hybrid query* (kombinasi query database dan pemrosesan data di memori server) agar data transaksi pengiriman dapat diubah menjadi struktur kalender matriks 31 hari dengan cepat.
- Frontend & Antarmuka: DataTables dengan generator antarmuka dinamis untuk menghasilkan susunan header dan footer tabel bertingkat, jQuery untuk interaksi edit sel langsung di tabel (*inline editing*), Bootstrap, dan styling CSS kustom.
- Ekspor Laporan di Browser: Menggunakan integrasi DataTables dan SheetJS untuk mencetak laporan Excel siap pakai (lengkap dengan format pemisah ribuan, garis tabel, dan rumus kalkulasi total) langsung dari browser pengguna tanpa membebani server.

### Peran & Kontribusi Utama
Sebagai Full Stack Developer, saya bertanggung jawab penuh atas perancangan arsitektur dan pembuatan fitur Monitoring Utility secara end-to-end. Di sisi backend, saya merancang API Laravel untuk mengolah log aktivitas harian, status utilisasi, dan perhitungan metrik keuangan. Di sisi frontend, saya mengembangkan antarmuka spreadsheet interaktif menggunakan DataTables dan jQuery yang mendukung edit data langsung di tabel (*inline editing*), 4 mode tampilan, serta ekspor file Excel instan.

### Tantangan Teknis: Transformasi Data Transaksional ke Matriks 2D (Slot Kosong)
- Problem: Data pengiriman di database tersimpan per riwayat kejadian transaksi, sedangkan antarmuka membutuhkan tampilan kalender horizontal utuh selama 31 hari penuh, termasuk harus menampilkan tanggal-tanggal yang tidak ada aktivitas sama sekali.
- Solusi: Saya menyusun ulang struktur data di memori server menggunakan pemetaan berbasis indeks agar pencarian data berlangsung instan tanpa proses perulangan yang membebani kinerja server. Tanggal yang tidak memiliki jadwal aktivitas otomatis diisi dengan sel kosong agar susunan kalender tetap rapi dan berurutan.

### Tantangan Teknis: Spreadsheet Matriks Dinamis pada DataTables
- Problem: Komponen tabel bawaan umumnya dirancang untuk susunan kolom yang statis, sehingga kerap rusak saat harus menampilkan struktur header bertingkat dengan sel gabungan yang jumlah kolom per tanggalnya berubah drastis sesuai template yang dipilih pengguna.
- Solusi: Saya membangun fungsi pembuat struktur tabel dinamis yang merender ulang baris header dan ringkasan footer secara otomatis dari data JavaScript, lalu menerapkan alur reset dan pemasangan ulang tabel secara terprogram setiap kali pengguna berpindah mode tampilan.

### Tantangan Teknis: Sinkronisasi Status Asimetris (Armada ↔ Driver)
- Problem: Satu unit truk dapat berganti pengemudi di hari yang berbeda, sedangkan seorang pengemudi hanya dapat terikat pada satu truk dalam satu waktu. Perubahan status pada salah satu pihak rentan menimbulkan ketidaksesuaian catatan operasional jika tidak diselaraskan.
- Solusi: Saya menerapkan pemetaan relasi dua arah dengan pembaruan berantai otomatis (*cascading update*), sehingga ketika armada disetel ke status pasif (seperti sedang parkir, servis, atau libur), status pengemudi yang bertugas otomatis ikut tersinkronisasi tanpa perlu diedit manual satu per satu.

### Tantangan Teknis: Tampilan Menu Aksi Terpotong pada Tabel Lebar
- Problem: Penggunaan kolom terkunci (*fixed column*) dan area geser horizontal membuat menu pilihan status terpotong (*clipped*) oleh batas bingkai tabel yang membatasi tampilan visual elemen di dalamnya.
- Solusi: Saya merekayasa mekanisme pembukaan menu dengan memindahkan elemen dropdown ke lapisan terluar halaman web saat diklik, lalu menghitung koordinat titik layar sel yang dipilih secara presisi agar menu tetap melayang pas di atas sel tanpa terpotong batas tabel.

### Hasil & Dampak (Impact)
- 31 Hari Visibilitas Kalender: Memungkinkan tim operasional memantau status utilitas dan jadwal armada hingga 31 hari berturut-turut dalam satu layar tanpa perlu berpindah halaman.
- 100% Sinkronisasi Armada & Driver: Menyatukan perspektif armada dan driver dalam satu sistem terpadu dengan pembaruan status otomatis.
- 4 Mode Template Tampilan: Menyediakan 4 pilihan tampilan (Lengkap, Status, Aktivitas, dan Ringkasan Finansial) yang memangkas waktu analisis data dari hitungan jam menjadi hitungan menit.
- Tracking Otomatis 3 Metrik Finansial: Menghitung omset, sangu, dan margin bersih harian secara otomatis per armada dan pengemudi secara real-time.
- Ekspor Excel Instan di Sisi Klien: Menghasilkan laporan Excel siap pakai dengan format lengkap (pemisah ribuan, border tabel, dan rumus footer) langsung dari browser pengguna tanpa membebani server backend.
[CARD:project-monitoring-utility]
