# Backlog Topik: Belum Dibahas dalam Desain Portofolio Chat AI

Dokumen ini mencatat topik-topik yang sudah teridentifikasi tapi belum dibahas secara rinci dalam perencanaan konsep & desain teknis portofolio. Gunakan sebagai daftar acuan untuk sesi diskusi/development selanjutnya.

---

## 1. Kode Implementasi Nyata

Belum dibahas: struktur kode aktual, bukan cuma alur konseptual.

- Route handler `/api/chat` di Next.js (App Router) — kode lengkap dari terima request sampai streaming response
- Fungsi query Supabase pgvector (similarity search dengan threshold)
- Fungsi pemanggilan Gemini API (generation + streaming)
- Fungsi pemanggilan Gemini Embedding API
- Struktur folder project Next.js secara keseluruhan (`app/`, `lib/`, `components/`, `scripts/`)
- Contoh kode `lib/llm-provider.ts` sebagai abstraksi LLM (supaya mudah swap provider nanti)

## 2. Script Indexing Knowledge Base

Sudah dibahas *kapan* dijalankan, belum dibahas *bagaimana* dibangun:

- Struktur kode `scripts/index-knowledge.ts`
- Cara membaca file markdown dari folder `knowledge-base/`
- Logika parsing heading (`##`, `###`) menjadi chunk terpisah
- Implementasi idempotency (hapus chunk lama berdasarkan `source_file` sebelum insert baru)
- Cara menjalankan embedding secara batch (menghindari rate limit saat indexing banyak chunk sekaligus)
- Logging/output saat proses indexing berjalan (supaya tahu chunk mana yang berhasil/gagal)

## 3. Admin Panel Sederhana

Baru sebatas ide di percakapan, belum ada desain konkret:

- Perlu UI sama sekali, atau cukup lewat API call manual (Postman/curl)?
- Kalau perlu UI: halaman apa saja (list knowledge base, form tambah/edit, tombol re-index)
- Autentikasi untuk akses panel (mengacu ke keputusan API secret key yang sudah dibahas)
- Apakah admin panel juga dipakai untuk melihat log chat/pertanyaan yang masuk dari pengunjung

## 4. Rate Limiting & Guardrail Anti-Abuse (Detail Lanjutan)

Sudah dibahas konsep dasarnya, tapi implementasi konkretnya belum:

- Algoritma rate limiting yang dipakai (fixed window, sliding window, token bucket)
- Berapa batas request per-IP per-menit/jam yang masuk akal untuk chat portofolio
- Cara membedakan traffic wajar vs bot/scraper
- Apakah perlu CAPTCHA atau proteksi tambahan kalau abuse terdeteksi
- Penyimpanan state rate limit — pakai tabel `rate_limits` di Supabase (sudah ada di schema) atau in-memory/Redis untuk performa lebih baik

## 5. Frontend — Detail UI/UX Chat Interface

Baru dibahas di level konsep (suggested prompts, rich response, dsb), belum ada desain rinci:

- Wireframe/layout halaman utama
- Desain komponen chat bubble (user vs AI)
- Komponen rich card untuk menampilkan project (gambar, tech badge, link)
- Loading state saat AI sedang generate jawaban (typing indicator, dsb)
- Desain responsif untuk mobile
- Dark mode / light mode (opsional)

## 6. Observability & Analytics

Disebut sepintas (log query + retrieved chunks), belum dirancang lebih jauh:

- Dashboard sederhana untuk melihat pertanyaan yang sering muncul
- Metrik apa saja yang ingin dipantau (jumlah chat per hari, rata-rata panjang percakapan, dsb)
- Apakah perlu tool eksternal (misal Vercel Analytics, PostHog) atau cukup query manual ke Supabase

## 7. Testing & Evaluasi Kualitas RAG

Belum dibahas sama sekali:

- Cara menguji apakah retrieval sudah akurat (membuat set pertanyaan uji + jawaban yang diharapkan)
- Cara mengevaluasi kualitas jawaban Gemini Flash secara sistematis (bukan cuma trial manual)
- Strategi testing sebelum deploy ke publik

## 8. Rencana Migrasi/Upgrade ke Depan

Disinggung sebagai catatan, belum ada rencana konkret:

- Kondisi/trigger seperti apa yang membuat perlu upgrade dari Gemini Flash ke Claude API (atau model lain)
- Perkiraan biaya kalau nanti pindah ke tier berbayar
- Rencana migrasi data embedding kalau ganti model embedding (karena dimensi vector berbeda perlu re-index total)

## 9. Deployment & CI/CD

Baru dibahas environment variables, belum dibahas alur deployment itu sendiri:

- Alur deploy ke Vercel (manual vs otomatis via Git push)
- Strategi branch (misal `main` untuk production, `dev` untuk staging)
- Apakah perlu staging environment terpisah sebelum ke production
- Domain custom (kalau ingin pakai domain sendiri, bukan subdomain Vercel)

## 10. Legal & Privasi

Belum dibahas sama sekali:

- Perlu halaman privacy policy sederhana? (mengingat chat menyimpan riwayat percakapan pengunjung)
- Pemberitahuan ke pengunjung bahwa percakapan mereka disimpan/dicatat
- Kebijakan retensi data chat log (berapa lama disimpan sebelum dihapus)

---

## Cara Menggunakan Dokumen Ini

Saat siap melanjutkan pembahasan, pilih satu topik dari daftar di atas untuk dibahas lebih rinci. Setelah dibahas, pindahkan ringkasannya ke file utama (`rangkuman-konsep-dan-desain-teknis-portofolio.md`) dan hapus/tandai selesai dari daftar ini.
