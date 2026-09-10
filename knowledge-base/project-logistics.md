## Project: Real-Time Fleet & Logistics Tracking Platform

### Konteks & Masalah Bisnis
Perusahaan digital logistik menghadapi kendala visibilitas armada truk saat pengiriman barang antarkota. Pembaruan status paket sebelumnya dilakukan secara manual melalui messaging apps, menyebabkan latensi pelaporan status kiriman hingga 30 menit, komplain pelanggan yang tinggi, dan minimnya estimasi akurat waktu kedatangan (ETA).

### Solusi Arsitektur & Tech Stack
Membangun dashboard sentral pelacakan armada secara real-time berbasis web. 
- Frontend: Next.js (React), Tailwind CSS, Leaflet/Mapbox untuk visualisasi peta interaktif.
- Backend: Next.js API Routes / Node.js service, PostgreSQL (Supabase) dengan ekstensi PostGIS untuk perhitungan geospasial.
- Komunikasi Real-time: WebSocket / Supabase Realtime Channels untuk sinkronisasi telemetri kendaraan tanpa refresh halaman.

### Peran & Kontribusi Utama
- Merancang dan mengimplementasikan ingestion pipeline untuk koordinat GPS armada truk setiap 10 detik.
- Mengembangkan antarmuka peta interaktif yang mampu merender ratusan marker kendaraan secara halus tanpa memory leak.
- Membangun API optimasi rute terpendek dan peringatan otomatis jika pengemudi keluar dari rute (geofencing alert).

### Hasil & Dampak (Impact)
- Memangkas latensi pelaporan posisi armada dari 30 menit menjadi di bawah 3 detik.
- Menurunkan keluhan status pengiriman dari mitra logistik sebesar 42%.
- Digunakan secara harian oleh tim operasional untuk memantau lebih dari 200 armada aktif di berbagai rute.
[CARD:project-logistics]