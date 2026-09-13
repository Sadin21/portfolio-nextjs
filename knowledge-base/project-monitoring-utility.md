## Project: Monitoring Utility Armada & Driver

### Konteks & Masalah Bisnis
Pengurus armada membutuhkan visibilitas penuh untuk menyusun jadwal operasional beberapa hari ke depan sekaligus memantau riwayat aktivitas armada dan driver. Sebelumnya, proses ini dilakukan secara manual menggunakan Excel terpisah sehingga tim operasional harus bekerja dua kali dan rentan terjadi ketidakcocokan data (human error). Untuk mengatasi inefisiensi tersebut, fitur ini dikembangkan sebagai spreadsheet matrix interaktif yang terintegrasi langsung dengan database ERP. Sistem ini memetakan utilisasi harian secara real-time—mencakup status penugasan, progres Surat Jalan (DO), sinkronisasi dua arah Armada-Driver, hingga kalkulasi metrik finansial (omset, sangu, dan margin) yang dapat diekspor ke Excel.

### Peran & Kontribusi Utama
Sebagai Full Stack Developer, saya bertanggung jawab penuh atas perancangan arsitektur dan implementasi fitur Monitoring Utility secara end-to-end untuk armada dan pengemudi. Saya membangun API backend menggunakan Laravel untuk mengolah agregasi log aktivitas, status utilitas, dan kalkulasi metrik finansial harian. Selain itu, saya mengembangkan antarmuka interaktif berbasis DataTables dan jQuery yang mendukung inline editing dua arah, multi-template tampilan, serta export laporan Excel.

### Tantangan Teknis: Transformasi Data Matriks 2D & Slot Kosong
- Problem: Data delivery dan status operasional tersimpan secara transaksional per event, sedangkan antarmuka membutuhkan tampilan matriks horizontal padat untuk seluruh rentang tanggal (hingga 31 hari) meskipun tidak ada aktivitas sama sekali.
- Solusi: Saya menyusun ulang data di memori backend menggunakan pemetaan key-value agar pencarian data berjalan instan tanpa perulangan berat. Hari-hari yang tidak memiliki aktivitas kemudian diisi otomatis dengan slot kosong agar tabel kalender tetap tampil utuh dan urut.

### Tantangan Teknis: Spreadsheet Matriks Dinamis pada DataTables
- Problem: DataTables dirancang untuk baris flat standar, sehingga gagal merender header multi-level dinamis (colspan/rowspan) yang jumlah kolom per tanggalnya berubah drastis sesuai pilihan template (Lengkap, Status, Aktivitas, Summary).
- Solusi: Saya mengimplementasikan generator HTML dinamis untuk thead dan tfoot serta mekanisme penghancuran dan re-inisialisasi tabel secara terprogram sebelum DataTables dipasang kembali.

### Tantangan Teknis: Sinkronisasi Status Asimetris Dua Arah (Armada ↔ Driver)
- Problem: Satu armada dapat memiliki beberapa pengemudi bergantian sementara pengemudi terikat pada satu armada, sehingga pembaruan status salah satu entitas rentan menimbulkan inkonsistensi data log operasional harian.
- Solusi: Saya menerapkan pemetaan dua arah berbasis dictionary dan database transaction dengan propagasi otomatis (cascading update) untuk status pasif seperti libur dan parkir.

### Tantangan Teknis: Dropdown Menu Terpotong pada Fixed Columns
- Problem: Fitur fixedColumns dan scroll horizontal pada tabel menyebabkan menu dropdown status terpotong (clipped) oleh kontainer tabel yang memiliki atribut CSS overflow: hidden.
- Solusi: Saya memindahkan elemen dropdown ke luar tabel langsung ke document.body saat dipicu, kemudian menghitung posisi relatifnya terhadap sel sumber secara presisi menggunakan getBoundingClientRect().

### Hasil & Dampak (Impact)
- 31 Hari Visibilitas Kalender Utilitas: Memungkinkan tim operasional memantau status utilitas dan produktivitas harian hingga 31 hari berturut-turut dalam satu layar tanpa reload.
- 100% Konsolidasi Perspektif Ganda: Mengintegrasikan 2 sudut pandang operasional (perspektif Armada dan Driver) dengan sinkronisasi status otomatis dalam 1 sistem terpadu.
- 4 Mode Template Tampilan: Menyediakan 4 fleksibilitas visual (Lengkap, Status, Aktivitas, Ringkasan Finansial) yang memangkas waktu analisis data armada harian dari hitungan jam menjadi hitungan menit.
- Tracking 3 Indikator Finansial Otomatis: Mengotomatisasi kalkulasi agregasi Omset, Sangu, dan Margin Bersih harian secara real-time per armada dan pengemudi.
- 0 Ketergantungan Ekspor Manual: Menghasilkan laporan Excel instan berformat lengkap dengan custom cell formatting (ribuan, border, dan formula footer) langsung dari sisi klien.
[CARD:project-monitoring-utility]
