# Rangkuman Lengkap: Konsep & Desain Teknis Portofolio Chat AI

## Latar Belakang
Fullstack software engineer dengan pengalaman 2 tahun, bekerja di perusahaan digital logistik, ingin membangun portofolio berbentuk chat interface (mirip AI assistant) di mana pengunjung bisa bertanya dan sistem menjawab berdasarkan knowledge base yang sudah disiapkan.

---

## BAGIAN 1 — KONSEP UTAMA

### Persona Chat
Tiga opsi dipertimbangkan:

| Opsi | Deskripsi | Catatan |
|---|---|---|
| A — Digital Twin | AI menjawab sebagai "aku" | Personal, tapi risiko reputasi tinggi jika halusinasi |
| **B — AI Assistant** | AI berperan sebagai asisten pihak ketiga yang mempresentasikan data pemilik | **Dipilih** — risiko rendah, showcase RAG kuat |
| C — Hybrid | Kombinasi A & B dengan switching konteks | Paling fleksibel, tapi paling kompleks |

**Keputusan: Opsi B** — chat berperan sebagai asisten yang merepresentasikan pemilik portofolio, bukan menyamar jadi pemilik itu sendiri.

### Elemen Knowledge Base
- Profil & career story
- Pengalaman kerja detail (project, tech stack, impact)
- Skill matrix
- Studi kasus project
- FAQ seputar diri
- Fun facts/hobi
- Link ke resource lain (GitHub, LinkedIn, CV)

### Elemen UX
- Chat langsung di landing page
- Suggested prompts sebagai starter
- Rich response (card project, tombol CTA)
- Fallback graceful untuk pertanyaan di luar knowledge base
- Opsional: mode "recruiter vs engineer", citation sumber jawaban, dashboard analytics

---

## BAGIAN 2 — ARSITEKTUR & TECH STACK

### Pendekatan: RAG Standar
Dipilih dari tiga opsi (context stuffing, RAG standar, RAG + function calling) sebagai sweet spot antara effort development dan value showcase untuk skala portofolio personal.

**Alur:**
1. **Indexing (offline):** knowledge base ditulis per-topik → di-chunk per section → diubah jadi vector (embedding) → disimpan ke vector database
2. **Query (real-time):** pertanyaan user di-embed → semantic search ambil chunk relevan → digabung jadi prompt (system prompt + context + history + query) → dikirim ke LLM → response di-stream ke user

### Tech Stack Final
| Layer | Pilihan | Alasan |
|---|---|---|
| Frontend | Next.js | Familiar, SSR-friendly |
| Backend | Next.js API routes (full-stack) | Satu deployment, simpel untuk solo dev |
| Vector DB | Supabase (pgvector) | Sekalian dapat Postgres untuk data terstruktur |
| LLM | Gemini API (free tier — Flash) | Claude API tidak punya free tier permanen; Gemini gratis tanpa kartu kredit/expiry |
| Hosting | Vercel | Deploy mudah untuk Next.js |

### Catatan Trade-off yang Disadari
- Gemini Flash kualitasnya di bawah model kelas atas (Claude/GPT-4) — dikompensasi dengan prompt engineering lebih matang (few-shot examples)
- Rate limit Gemini free tier cukup untuk skala personal, tapi perlu rencana migrasi jika traffic naik signifikan
- Data di knowledge base dipakai untuk training Google di free tier — hindari info sensitif/internal perusahaan
- Pemanggilan LLM diabstraksi ke satu module (`lib/llm-provider.ts`) agar mudah swap provider nanti (misal upgrade ke Claude API)

---

## BAGIAN 3 — DESAIN TEKNIS RINCI

### 1. Database Schema (Supabase)

**`knowledge_chunks`** — menyimpan potongan knowledge base + vector-nya
```sql
create table knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(768),
  source_file text not null,
  section_title text,
  content_type text not null,         -- 'profile' | 'experience' | 'project' | 'skill' | 'faq'
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index on knowledge_chunks using ivfflat (embedding vector_cosine_ops);
create index on knowledge_chunks (content_type);
```

**`chat_sessions`** — satu sesi per pengunjung
```sql
create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  session_token text unique not null,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '4 hours'),
  metadata jsonb default '{}'
);
```

**`chat_messages`** — log percakapan (history + observability)
```sql
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references chat_sessions(id) on delete cascade,
  role text not null,                 -- 'user' | 'assistant'
  content text not null,
  retrieved_chunk_ids uuid[],
  created_at timestamptz default now()
);

create index on chat_messages (session_id, created_at);
```

**`rate_limits`** — kontrol abuse per-IP
```sql
create table rate_limits (
  ip_address text primary key,
  request_count int default 1,
  window_start timestamptz default now()
);
```

**Alasan desain:**
- `knowledge_chunks` terpisah dari file sumber agar update sebagian tidak perlu re-index semua
- `content_type` sebagai kolom terpisah untuk mempermudah filtering saat retrieval
- `retrieved_chunk_ids` di `chat_messages` untuk audit kualitas retrieval dari data real

---

### 2. Strategi Chunking

Pendekatan **semi-manual per-section**, bukan auto-chunking library, karena skala knowledge base personal relatif kecil.

**Aturan:**
- 1 chunk = 1 section/subsection dengan makna utuh
- Target 150–400 token per chunk
- Setiap chunk wajib punya judul section eksplisit di awal teks

**Contoh struktur file sumber** (`project-logistics-dashboard.md`):
```markdown
## Project: Logistics Dashboard Real-time Tracking

### Konteks & Masalah
[chunk 1]

### Tech Stack
[chunk 2]

### Peran & Kontribusi
[chunk 3]

### Hasil & Impact
[chunk 4]
```

Setiap heading `###` menjadi 1 chunk terpisah dengan metadata section.

---

### 3. Prompt Engineering — System Prompt

```
Kamu adalah AI Assistant yang merepresentasikan [Nama Kamu], seorang 
Fullstack Software Engineer dengan pengalaman 2 tahun di perusahaan 
digital logistik.

ATURAN UTAMA:
1. Jawab HANYA berdasarkan konteks yang diberikan di bawah. Jangan 
   mengarang informasi yang tidak ada di konteks.
2. Jika informasi tidak tersedia di konteks, katakan dengan jujur: 
   "Aku belum punya info detail soal itu, tapi kamu bisa hubungi 
   [nama] langsung di [email/LinkedIn]."
3. Gunakan kata ganti "dia" atau sebut nama, JANGAN gunakan "aku" 
   seolah-olah kamu adalah [Nama] — kamu adalah asisten yang 
   merepresentasikan dia.
4. Tolak dengan sopan pertanyaan di luar topik profil/karier/project 
   [Nama]. Arahkan kembali ke topik portofolio.
5. Gaya bahasa: profesional tapi hangat, ringkas, tidak bertele-tele.

KONTEKS YANG TERSEDIA:
{retrieved_chunks}

RIWAYAT PERCAKAPAN:
{chat_history}
```

**Catatan untuk Gemini Flash:** tambahkan 1–2 contoh few-shot langsung di system prompt untuk kompensasi gap kualitas instruction-following dibanding model flagship.

---

### 4. Struktur API Request-Response

**Endpoint:** `POST /api/chat`

**Request:**
```json
{
  "sessionToken": "abc123...",
  "message": "Ceritakan project terakhir yang kamu kerjakan"
}
```

**Alur di dalam handler:**
1. Validasi `sessionToken` → cari/buat session di `chat_sessions`
2. Cek rate limit berdasarkan IP
3. Embed `message` user → query vector
4. Query Supabase pgvector (top-k similarity search)
5. Ambil beberapa chat terakhir dari `chat_messages` untuk history
6. Susun prompt lengkap → kirim ke Gemini API (streaming)
7. Simpan pesan user + response assistant ke `chat_messages`
8. Stream response ke client

**Response (streaming, format SSE):**
```
data: {"chunk": "Aku "}
data: {"chunk": "menemukan "}
data: {"chunk": "info soal "}
...
data: {"done": true, "sources": ["project-logistics-dashboard.md"]}
```

Field `sources` di akhir stream dipakai frontend untuk menampilkan citation kecil, menambah kredibilitas jawaban.

---

### 5. Kapan Offline Indexing Dijalankan

Offline indexing **bukan proses otomatis yang jalan terus-menerus** — ini dijalankan manual/triggered, hanya saat konten knowledge base berubah:
- Setup awal (sekali di awal development)
- Setiap kali ada update konten (project baru, ganti role, tambah FAQ, dst)

**Trigger-nya adalah "konten berubah", bukan jadwal waktu tertentu.**

**Opsi cara menjalankan:**

| Opsi | Deskripsi | Cocok untuk |
|---|---|---|
| **A — Script manual** | `npm run index-knowledge` dari terminal | **Direkomendasikan untuk tahap awal** — simpel, kontrol penuh |
| B — API route admin | Endpoint `POST /api/admin/reindex`, dipanggil via Postman/tombol admin | Kalau sering update dari browser tanpa buka terminal |
| C — Trigger via Git (CI/CD) | GitHub Action otomatis saat commit ke folder `knowledge-base/` | Update sering & workflow "push and it updates" |

**Catatan penting:** script indexing harus **idempotent** — kalau dijalankan ulang untuk file yang sama, harus update/replace chunk lama (bukan duplikat). Caranya: sebelum insert chunk baru dari suatu file, hapus dulu semua chunk lama dengan `source_file` yang sama.

---

## BAGIAN 4 — KLARIFIKASI TEKNIS LANJUTAN

### 1. Model Embedding & LLM (Final)

- **Embedding:** `gemini-embedding-001` (versi stabil, bukan Gemini Embedding 2 yang multimodal — fitur multimodalnya tidak terpakai untuk kebutuhan teks). Mendukung 100+ bahasa, input hingga 2.048 token.
- **Dimensi vector:** **768** (bukan default 3072) — menggunakan teknik Matryoshka Representation Learning (MRL) yang memungkinkan pengecilan dimensi untuk efisiensi storage/compute tanpa banyak kehilangan kualitas. Schema `embedding vector(768)` sudah sesuai.
- **LLM:** tetap Gemini Flash.
- **Catatan:** jangan mulai dari Gemini Embedding 2 meski lebih baru — fitur multimodalnya tidak dibutuhkan, dan ruang vektornya tidak kompatibel dengan `gemini-embedding-001` (kalau migrasi nanti harus re-index total).

### 2. Autentikasi untuk Re-index

Karena ini fitur single-admin (cuma kamu yang pakai), tidak perlu sistem login lengkap. Cukup **API Secret Key sederhana yang diterapkan dengan benar**:

1. Generate string acak panjang (32 karakter) sebagai `ADMIN_SECRET_KEY`, simpan di environment variable
2. Endpoint `/api/admin/reindex` cek header `Authorization: Bearer <secret>`
3. Tidak cocok → return 401 Unauthorized

Auth yang lebih formal (NextAuth, Supabase Auth dengan halaman login) baru dibutuhkan kalau nanti dibuat admin panel dengan UI, bukan untuk sekarang.

### 3. Rentang Threshold Similarity

| Nilai (cosine similarity) | Efek |
|---|---|
| 0.5 – 0.6 | Terlalu longgar, chunk kurang relevan ikut masuk |
| **0.7 – 0.75** | **Titik awal direkomendasikan** |
| 0.8 – 0.9 | Ketat, cocok untuk knowledge base besar |
| > 0.9 | Biasanya terlalu ketat untuk RAG teks |

**Cara tuning:** mulai dari 0.7, uji dengan pertanyaan manual setelah knowledge base terisi, turunkan/naikkan sesuai hasil retrieval yang diamati.

### 4. Chat History

Chat history = riwayat pesan-pesan sebelumnya dalam satu sesi percakapan yang sama, dikirim kembali ke AI supaya dia "ingat" konteks obrolan (misal pertanyaan follow-up seperti "tech stack apa yang dipakai di situ?" butuh tahu "situ" merujuk ke proyek yang disebut sebelumnya).

**Praktiknya:** ambil **6 pesan terakhir** (3 pasang tanya-jawab) dari `chat_messages` di sesi yang sama, sisipkan ke prompt sebelum dikirim ke Gemini.

### 5. Fallback saat Gemini Free Tier Limit Habis

Untuk tahap awal, cukup pakai **alert message graceful**, belum perlu circuit breaker canggih:

```typescript
try {
  const response = await callGeminiAPI(prompt);
} catch (error) {
  if (error.status === 429) {
    return { 
      error: true, 
      message: "Maaf, layanan sedang sibuk. Coba lagi beberapa saat lagi, atau hubungi aku langsung di [email/LinkedIn]." 
    };
  }
}
```

### 6. Batas Panjang Pesan & Sanitasi Prompt Injection

**Batas panjang pesan:**
- Maksimal **500–800 karakter** per pesan user
- Validasi di frontend (UX) **dan** backend (keamanan, karena validasi frontend bisa dilewati)

**Sanitasi prompt injection (berlapis):**
1. Pisahkan jelas instruksi sistem vs input user dengan delimiter eksplisit dalam prompt (`"""user message"""`), jangan sambung string mentah user langsung ke instruksi
2. Deteksi kata kunci mencurigakan sederhana (misal "ignore previous instructions", "abaikan aturan") sebagai lapis tambahan
3. Guardrail di system prompt ("tolak topik di luar konteks portofolio") jadi lapis pertahanan terakhir

### 7. Peletakan Environment Variables di Next.js

Dua "dunia" di Next.js:
- **Tanpa prefix `NEXT_PUBLIC_`** → hanya bisa diakses server-side (API routes). **Aman untuk secret/API key.**
- **Dengan prefix `NEXT_PUBLIC_`** → di-bundle ke browser, bisa dilihat siapa saja lewat DevTools. **Jangan taruh secret di sini.**

**File `.env.local` (di root project, otomatis di-ignore Git):**
```bash
# SERVER-SIDE ONLY — aman, tidak exposed ke browser
LLM_API_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
ADMIN_SECRET_KEY=xxxxx

# CLIENT-SIDE (boleh terekspos, memang didesain publik)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
```

**Aturan simpel:** karena hampir semua logic (embedding, panggil Gemini, query Supabase pakai service role) berjalan di API routes (server-side), mayoritas variable **tidak perlu** prefix `NEXT_PUBLIC_`.

Saat deploy ke Vercel, masukkan variable yang sama ke **Vercel Dashboard → Settings → Environment Variables** (bukan commit file `.env.local` ke Git).
