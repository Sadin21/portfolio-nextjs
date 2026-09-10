# Technical Documentation — AI Portfolio Next.js

This document provides a comprehensive technical overview of the AI Portfolio Next.js application, including CLI commands, directory structure, and API documentation.

---

## 1. Commands Reference

### 1.1 Development & Build Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server (default: `http://localhost:3000`). |
| `npm run build` | Builds the Next.js application for production. |
| `npm run start` | Runs the compiled Next.js production server. |
| `npm run index-knowledge` | Runs the embedding pipeline script (`scripts/index-knowledge.ts`) to chunk, embed via Gemini `text-embedding-004` (768-dim), and upsert markdown docs into the Supabase `knowledge_chunks` table. |

### 1.2 Local Database (Docker Compose - Optional Fallback)

| Command | Description |
| :--- | :--- |
| `docker compose up -d` | Spins up a local PostgreSQL instance with the `pgvector` extension enabled (`ankane/pgvector:v0.8.0`) on port `5432`. |
| `docker compose down` | Stops and tears down the local PostgreSQL container. |

### 1.3 API Verification Commands (cURL)

**Test Chat API (JSON message format):**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionToken": "test-session-123", "message": "Siapa itu Daffa?"}'
```

**Test Chat API (Vercel AI SDK message array format):**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionToken": "test-session-123", "messages": [{"role": "user", "content": "Apa saja tech stack yang dikuasai Daffa?"}]}'
```

---

## 2. Directory Tree Structure & Functions

```text
ai-portfolio-nextjs/
├── Doc/                                  # Project documentation and specifications
│   ├── development-step.md               # Step-by-step roadmap and phase checklist
│   ├── postponed-topic.md                # Deferred discussion points & architectural notes
│   ├── rangkuman-konsep-dan-desain-teknis-portofolio.md # Full architecture & technical design concept
│   ├── topik-belum-dibahas-portofolio.md # Unresolved discussion topics
│   └── technical-documentation.md        # Technical guide (commands, tree, API docs)
├── app/                                  # Next.js App Router root
│   ├── api/                              # Backend serverless API routes
│   │   └── chat/                         # Chat endpoint for RAG & AI streaming
│   │       └── route.ts                  # POST handler for AI chat with rate-limiting & retrieval
│   ├── globals.css                       # Global Tailwind CSS styles
│   ├── layout.tsx                        # Root HTML structure and font setup
│   └── page.tsx                          # Portfolio landing page (temporary status / UI host)
├── knowledge-base/                       # Raw markdown source documents for RAG
│   ├── profile.md                        # Biography, experience overview, and contact channels
│   ├── project-logistics.md              # In-depth enterprise case study (Fleet & TMS)
│   └── skills.md                         # Technical skills, proficiencies, tools, and practices
├── lib/                                  # Reusable backend and client utility modules
│   ├── llm-provider.ts                   # Gemini LLM model & text-embedding helper functions
│   ├── supabase-client.ts                # Supabase browser client (public anonymous access)
│   └── supabase-server.ts                # Supabase server client (using SERVICE_ROLE_KEY)
├── scripts/                              # Maintenance and automation scripts
│   └── index-knowledge.ts                # CLI script to parse markdown, generate embeddings & store in DB
├── .env.local                            # Local environment variables (API keys, DB connection strings)
├── .gitignore                            # Git ignore file
├── AGENTS.md                             # AI Agent instructions & Next.js compatibility guidelines
├── docker-compose.yml                    # Local pgvector PostgreSQL container configuration
├── next.config.mjs                       # Next.js configuration
├── package.json                          # NPM dependencies and scripts
├── postcss.config.mjs                    # PostCSS / Tailwind CSS configuration
└── tsconfig.json                         # TypeScript configuration
```

### Detailed Component Functions

* **`app/api/chat/route.ts`**:
  Handles the core conversational engine: extracts client IP, validates request payloads, enforces sliding-window rate limiting via Supabase RPC, queries vector database for contextual knowledge chunks (RAG), aggregates the last 3 conversation turns from `chat_messages`, constructs the AI system prompt, and streams the response back via Vercel AI SDK Data Stream protocol.
* **`lib/llm-provider.ts`**:
  Centralizes AI SDK configurations. Uses `@google/generative-ai` for Matryoshka-reduced 768-dimension embeddings (`text-embedding-004`) and `@ai-sdk/google` for generative streaming inference using `gemini-1.5-flash`.
* **`lib/supabase-server.ts`**:
  Initializes a high-privilege server-side Supabase client using `SUPABASE_SERVICE_ROLE_KEY` to bypass Row Level Security (RLS) for server routes, rate limiting, and vector lookups.
* **`lib/supabase-client.ts`**:
  Initializes a browser-safe Supabase client using `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client-side interactions.
* **`scripts/index-knowledge.ts`**:
  Ingestion script that reads `.md` files from `knowledge-base/`, extracts H2 sections as semantic chunks, computes embeddings, and performs an idempotent upsert into `knowledge_chunks`.
* **`knowledge-base/*.md`**:
  The ground-truth knowledge source describing Daffa's profile, skills, and projects, ensuring the AI model does not hallucinate answers.

---

## 3. API Documentation

### 3.1 Chat Completion API

* **Endpoint**: `/api/chat`
* **Method**: `POST`
* **Content-Type**: `application/json`
* **Max Duration**: 30 seconds

#### Headers
| Header Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Content-Type` | `string` | Yes | Must be `application/json`. |
| `x-forwarded-for` | `string` | Optional | Used by reverse proxies to identify client IP for rate limiting. |

#### Request Formats

The endpoint supports **two** request payload formats:

##### Format A: Direct / Custom Client Format (cURL & Postman)
```json
{
  "sessionToken": "string (optional, default: anonymous-session)",
  "message": "string (required, max 800 chars)",
  "stream": "boolean (optional, default: true; set false for clean JSON response)"
}
```

##### Format B: Vercel AI SDK `useChat` Compatible Format
```json
{
  "sessionToken": "string (optional, default: anonymous-session)",
  "messages": [
    {
      "role": "user",
      "content": "string (required, max 800 chars)"
    }
  ],
  "stream": "boolean (optional, default: true)"
}
```

#### Request Validation Rules
1. `message` (or last element of `messages`) must not be empty.
2. Character length must be **<= 800 characters**.
3. If length exceeds 800 chars, returns `400 Bad Request`.

---

### 3.2 Security & Rate Limiting

* **Limiter Implementation**: Stored Procedure in PostgreSQL (`check_rate_limit`).
* **Rule**: Maximum **15 requests per 10-minute sliding window** per IP address.
* **Response on Exceeded**:
  * Status: `429 Too Many Requests`
  * Body: `"Too Many Requests. Please try again later."`

---

### 3.3 Semantic Retrieval (RAG Workflow)

1. **Embedding Generation**: User's query is converted to a 768-dimensional vector via Google's `text-embedding-004`.
2. **Similarity Matching**: PostgreSQL vector cosine distance function (`match_knowledge_chunks`):
   * Match Threshold: `0.65` cosine similarity.
   * Match Limit: Top `5` most relevant chunks.
3. **Context Injection**: Relevant sections are concatenated and injected into the AI Persona system prompt.
4. **Fallback Persona**: If no chunks exceed threshold, the persona instructs the AI to politely clarify that information is unavailable and refer to Daffa's contact channels.

---

### 3.4 Conversation History & Persistence

* Sessions are identified by `sessionToken` in the `chat_sessions` table.
* The API loads the **last 3 conversation turns (up to 6 messages)** from `chat_messages` to maintain contextual continuity.
* Upon generation completion (`onFinish`), both the user question (with retrieved chunk IDs) and the generated assistant response are persisted into `chat_messages`.

---

### 3.5 Responses & Status Codes

#### `200 OK` (Stream Response)
Returns a streaming text response (`text/plain; charset=utf-8`) generated via `result.toTextStreamResponse()`. Each text chunk is streamed to the client as it is generated by Gemini.

**Response Headers:**
* `X-Session-Token`: The active session token identifier.
* `X-Retrieved-Chunks-Count`: Number of knowledge chunks retrieved for this prompt.
* `Cache-Control`: `no-cache, no-transform`

**Stream Sample (plain text tokens):**
```text
Daffa adalah seorang Fullstack Software Engineer dengan pengalaman 2 tahun...
```

#### `200 OK` (Static JSON Response when `stream: false`)
When `"stream": false` is passed in the request body, the API returns a structured JSON payload:

```json
{
  "success": true,
  "data": {
    "sessionToken": "test-session-123",
    "role": "assistant",
    "message": "Daffa adalah seorang Fullstack Software Engineer...",
    "retrievedChunksCount": 3
  }
}
```

#### Error Responses (Standardized JSON)
All error responses return structured JSON with a machine-readable `code` and user-friendly `message`:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-friendly explanation message."
  }
}
```

| Status Code | Error Code | Example Message |
| :--- | :--- | :--- |
| `400 Bad Request` | `EMPTY_MESSAGE` | `"Pesan tidak boleh kosong. Harap kirimkan pesan melalui property 'message' atau array 'messages'."` |
| `400 Bad Request` | `MESSAGE_TOO_LONG` | `"Pesan terlalu panjang (maksimal 800 karakter). Silakan persingkat pertanyaanmu."` |
| `400 Bad Request` | `INVALID_JSON` | `"Format JSON request tidak valid."` |
| `429 Too Many Requests` | `RATE_LIMIT_EXCEEDED` | `"Batas request tercapai (maksimal 15 pertanyaan per 10 menit). Silakan tunggu beberapa menit sebelum bertanya lagi."` |
| `500 Internal Server Error` | `RATE_LIMIT_CHECK_FAILED` | `"Terjadi gangguan saat memverifikasi kuota request."` |
| `500 Internal Server Error` | `INTERNAL_SERVER_ERROR` | `"Terjadi kesalahan internal pada server AI. Silakan coba beberapa saat lagi."` |

---

## 4. Database Schema Summary (Supabase / PostgreSQL)

* **`knowledge_chunks`**: Stores sectioned knowledge base documents with `vector(768)` embeddings and metadata.
* **`chat_sessions`**: Stores visitor conversation sessions mapped by `session_token`.
* **`chat_messages`**: Stores message history (`role`, `content`, `retrieved_chunk_ids`, `created_at`).
* **`rate_limits`**: Tracks request timestamps per client IP.
* **RPC `check_rate_limit(client_ip, max_requests, window_minutes)`**: Atomic rate-limiting function.
* **RPC `match_knowledge_chunks(query_embedding, match_threshold, match_count)`**: Cosine distance similarity search.
