## Project: R&D & Modul PO/DO Multi-Item (Pack/Koli Furnitur)

### Konteks & Masalah Bisnis
- Fungsi Utama: Penyesuaian modul PO/DO untuk mendukung muatan heterogen (multi-item/multi-SKU dalam bentuk pack/koli) pada satu pengiriman truk untuk klien manufaktur furnitur.
- Masalah: Sistem eksisting hanya mendukung komoditas tunggal (*single-commodity*). Pencatatan manual multi-item memicu kerja ganda, risiko selisih fisik barang di gudang, dan lambatnya penerbitan surat jalan.

### Solusi Arsitektur & Tech Stack
- Backend: Laravel (PHP).
- Database: MySQL dengan relasi hierarkis bertingkat (*parent-child sub-items*).
- Frontend & UI: DataTables, jQuery untuk input dinamis form koli, Bootstrap.
- Validasi Lapangan: Antarmuka web responsif untuk verifikasi muatan di gudang asal (muat) dan tujuan (bongkar).
- Desain Bounded Scope: Penambahan layer rincian koli terisolasi yang mengagregasi total muatan ke DO utama tanpa merusak modul hilir eksisting (*zero breaking changes*).

### Peran & Kontribusi Utama
- Riset kebutuhan operasional lintas 5 divisi (marketing, PPIC/produksi, logistik, gudang, dan validator muatan).
- Merancang arsitektur data multi-item pack/koli yang adaptif dan compatible dengan sistem eksisting.
- Membangun fitur checklist digital untuk validator muatan lapangan (loading & unloading).
- Melakukan pelatihan pengguna/user training dan pendampingan operasional saat go-live.

### Tantangan Teknis: Adaptasi Multi-Item Tanpa Perombakan Masif (Scope Bounding)
- Problem: Mengubah inti sistem dari single-item ke multi-item berisiko merusak modul hilir (alokasi armada, uang jalan, pelacakan, dan invoice).
- Solusi: Membatasi ruang lingkup pengembangan dengan membuat tabel rincian koli terisolasi yang mengekspos data agregat ke level DO, menjaga alur sistem eksisting tetap berjalan normal.

### Tantangan Teknis: Sinkronisasi Status Lintas 5 Divisi
- Problem: Alur pesanan melibatkan 5 peran berurutan yang rawan konflik perubahan data jika dikerjakan bersamaan.
- Solusi: Menerapkan state machine bertingkat dengan validasi hak akses ketat (RBAC); setiap divisi mengunci status sebelum pesanan diteruskan ke tahapan berikutnya.

### Tantangan Teknis: Validasi & Rekonsiliasi Fisik Lapangan (Muat vs Bongkar)
- Problem: Sering terjadi selisih jumlah koli atau kerusakan kemasan antara gudang muat dan gudang bongkar yang memicu sengketa pengiriman.
- Solusi: Membangun checklist validasi digital 2 tahap yang mencocokkan fisik barang dengan manifest secara *real-time* dan mencatat deviasi muatan secara transparan.

### Hasil & Dampak (Impact)
- 100% Digital: Mengeliminasi pencatatan manual berbasis kertas/spreadsheet dari pembuatan pesanan hingga bongkar muat.
- 0 Sengketa Muatan: Rekonsiliasi fisik 2 tahap mengeliminasi sengketa selisih koli antara shipper, gudang, dan transporter.
- 0 Breaking Changes: Fitur multi-item sukses beroperasi tanpa mengganggu alur single-commodity klien eksisting.
- Adopsi Penuh: 5 divisi mitra aktif menggunakan modul dalam operasional harian.

[CARD:project-po-pack-koli]
