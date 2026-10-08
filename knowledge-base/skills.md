## Skills: Technical Stack & Capabilities

### Backend & Database Engineering
- Framework & Runtime: NestJS (TypeScript), Laravel (PHP), Node.js.
- Database: MySQL, PostgreSQL, Supabase.
- Teknik Database & Konkurensi: Transaksi atomik (ACID), penguncian baris data (*pessimistic locking*) untuk mencegah *race condition*, penanganan sinkronisasi data memori, dan pendekatan *hybrid query* untuk pengolahan data performa tinggi.
- Arsitektur & Desain API: Service Layer Pattern, RESTful API, arsitektur *state machine* untuk alur pesanan kompleks, dan sistem pembersihan data bersih (*clean multi-entity teardown*).

### Fintech, Security, & Integrasi Sistem
- Standar Perbankan: Integrasi koneksi langsung (*direct connection*) berbasis standar nasional SNAP BI dari Bank Indonesia untuk 5 bank mitra (BCA, BNI, BRI, Mandiri, DBS).
- Mekanisme Idempotency: Pencegahan transaksi ganda (*zero double-pay*) pada mutasi pembayaran menggunakan validasi kunci transaksi unik di database.
- Kriptografi & Keamanan API: Tanda tangan digital asimetris (SHA256withRSA), tanda tangan simetris (HMAC-SHA512), enkripsi data PGP (GnuPG), serta validasi timestamp pencegah serangan *replay attack*.
- Autentikasi & Otorisasi: Manajemen siklus token OAuth 2.0 B2B dengan scheduler otomatis, pembatasan akses IP resmi (*IP whitelisting*), dan pencatatan audit log transaksi.

### Frontend & Antarmuka Interaktif
- Styling & Desain: Tailwind CSS, Bootstrap, CSS responsif.
- Spreadsheet & Matriks Dinamis: Pembuatan tabel matriks kalender interaktif dengan DataTables, pembuat struktur tabel dinamis, edit data langsung di tabel (*inline cell editing* dengan jQuery), dan kalkulasi posisi menu melayang.
- Ekspor Laporan Sisi Klien: Pembuatan laporan Excel terformat otomatis (pemisah ribuan, border tabel, dan formula total) langsung di browser menggunakan SheetJS tanpa membebani server backend.

### Tools, Workflow & Kolaborasi
- Version Control & Branching: Git, strategi rilis bertahap (*versioned release branching*) dan isolasi *sandbox* untuk pengujian integrasi multi-pihak secara independen.
- Kolaborasi & Pengujian: Komunikasi dan penyelarasan teknis lintas tim (developer internal, tim operasional, hingga tim teknis perbankan) serta pengawalan uji sertifikasi UAT ke production.