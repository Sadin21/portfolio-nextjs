# Roadmap & Step-by-Step AI Chat Portfolio Development

This document outlines a step-by-step implementation guide to build a portfolio from scratch to production-ready, covering Next.js, Supabase, pgvector/RAG, and Docker[cite: 1, 2].

---

## Phase 1: Docker & Database Setup (Supabase / PostgreSQL)
Objective: Set up the local environment and vector database without touching the UI[cite: 1].

- **Step 1: Setup Local Database with Docker Compose**
  - Create a `docker-compose.yml` file running a PostgreSQL service with the `pgvector` extension enabled[cite: 1].
  - Start the container via terminal (`docker compose up -d`).
- **Step 2: Execute Schema & Database Functions (SQL)**
  - Execute table creation scripts for `knowledge_chunks`, `chat_sessions`, `chat_messages`, and `rate_limits`[cite: 1].
  - Create an `ivfflat` index on the embedding column[cite: 1].
  - Create the RPC function `match_knowledge_chunks` for cosine similarity search[cite: 1].
  - Create the SQL RPC function `check_rate_limit(client_ip)` to enforce request limits (e.g., max 15 requests/10 minutes) directly within PostgreSQL[cite: 1, 2].

---

## Phase 2: Data Pipeline & RAG Concepts (Indexing Script)
Objective: Understand vector embeddings, text chunking, and database idempotency[cite: 1, 2].

- **Step 3: Write Knowledge Base Files**
  - Create at least 3 files in the `knowledge-base/` directory: `profile.md`, `project-logistics.md`, and `skills.md`[cite: 1, 2].
  - Use level-2 (`##`) and level-3 (`###`) headings consistently as section demarcations[cite: 1, 2].
- **Step 4: Build the Indexing Script (`scripts/index-knowledge.ts`)**
  - Parse markdown files per section using heading regular expressions[cite: 1, 2].
  - Call the Gemini Embedding API (`gemini-embedding-001`, 768 dimensions) in batches with throttling delays[cite: 1, 2].
  - Implement idempotent logic: delete old records matching `source_file` before inserting new chunks[cite: 1, 2].
  - Execute the indexing pipeline via terminal (`npm run index-knowledge`) to populate/update vector chunks in the database.

---

## Phase 3: Backend API & AI Integration in Next.js (API-First)
Objective: Master Next.js App Router, Vercel AI SDK integration, and the retrieval flow via Postman/cURL[cite: 1, 2].

- **Step 5: Initialize the Next.js Project**
  - Scaffold the project: `npx create-next-app@latest` with TypeScript, Tailwind CSS, and App Router.
  - Install dependencies: `@supabase/supabase-js`, `ai`, and `@ai-sdk/google`[cite: 1].
  - Configure `.env.local` server-side variables (Gemini API key, Supabase service role key)[cite: 1].
- **Step 6: Streaming Route Handler (`app/api/chat/route.ts`)**
  - Validate rate limits via the `check_rate_limit` RPC using the client IP[cite: 1, 2].
  - Embed the user query into a 768-dimension vector[cite: 1].
  - Call the `match_knowledge_chunks` RPC (similarity threshold ~0.70)[cite: 1].
  - Assemble the system prompt (role guidelines, retrieved context, chat history)[cite: 1].
  - Stream the response using `streamText` from the Vercel AI SDK[cite: 1].
  - Persist message logs to `chat_messages` asynchronously[cite: 1].
  - Validate the endpoint thoroughly via Postman/cURL[cite: 2].

---

## Phase 4: RAG Quality Testing & Golden Dataset (API Evaluation)
Objective: Verify retrieval accuracy and calibrate the model before building the UI[cite: 1, 2].

- **Step 7: Assemble the Golden Dataset**
  - Compile a list of 10–15 test queries categorized into 3 sets[cite: 2]:
    - *Factual In-Scope:* Specific logistics project details, tech stack, and career background[cite: 1, 2].
    - *Out-of-Scope:* Non-portfolio topics to test graceful fallback responses[cite: 1].
    - *Adversarial / Injection:* Attempts to bypass system prompt instructions[cite: 1].
- **Step 8: Calibrate Thresholds & Refine Prompts**
  - Benchmark the API endpoint against the golden dataset[cite: 2].
  - Inspect the accuracy of retrieved context in `retrieved_chunks`[cite: 1].
  - Fine-tune the similarity threshold (adjust to 0.75 or 0.65 as needed) and supply few-shot examples inside the system prompt[cite: 1].

---

## Phase 5: Frontend UI & State Management
Objective: Develop a responsive, modern, and informative chat UI as an API consumer[cite: 1, 2].

- **Step 9: Chat Interface Components**
  - Build `ChatContainer`, `ChatMessage`, and `ChatInput` utilizing the `useChat` hook from the Vercel AI SDK[cite: 2].
  - Implement auto-scrolling, distinct message bubble styling, and loading/typing indicators[cite: 2].
- **Step 10: Suggested Prompts & Rich Components**
  - Provide interactive starter prompts at the beginning of the conversation[cite: 1, 2].
  - Implement a markdown parser to transform `[CARD:slug]` tags into interactive project summary cards[cite: 1, 2].
  - Place a concise privacy notice underneath the chat input[cite: 2].

---

## Phase 6: Containerization (Docker) & Deployment
Objective: Package the Next.js application into an isolated container image and deploy[cite: 2].

- **Step 11: Multi-Stage Dockerfile**
  - Set `output: 'standalone'` in `next.config.js`.
  - Write a multi-stage `Dockerfile` (`deps` -> `builder` -> `runner`) to minimize image footprint.
- **Step 12: Container Verification & Production Release**
  - Verify the local Docker build.
  - Migrate database schemas and embeddings to Supabase Cloud (free tier)[cite: 1].
  - Deploy Next.js to your hosting platform (Vercel or Cloud VPS via Docker)[cite: 1, 2].