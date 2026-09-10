# Topic Backlog: Postponed (Post-MVP)

This document tracks items deliberately deprioritized to keep development focused, fast, and free from over-engineering or analysis paralysis[cite: 2].

---

### 1. UI-Based Admin Panel
- **Status:** Deferred to post-release[cite: 2].
- **Rationale:** This is a single-admin personal portfolio[cite: 1, 2]. Updating the knowledge base through local markdown files and running `npm run index-knowledge` is faster, simpler, and less error-prone than maintaining an authenticated CMS dashboard[cite: 1, 2].
- **Revisit Trigger:** If frequent content edits are required directly from a mobile device or browser without terminal access[cite: 2].

---

### 2. Advanced Observability & Analytics Dashboard
- **Status:** Deferred[cite: 2].
- **Rationale:** The database schema already records interaction history in `chat_messages` alongside retrieved chunk IDs[cite: 1, 2]. During early stages, querying Supabase Studio SQL editor directly is sufficient without needing external platforms like PostHog or LangSmith[cite: 2].
- **Revisit Trigger:** When regular visitor traffic warrants automated aggregation of popular queries and drop-off trends[cite: 2].

---

### 3. Model Migration Plan / Paid Tier LLM Upgrades
- **Status:** Deferred[cite: 2].
- **Rationale:** Gemini Flash's free tier and `gemini-embedding-001` provide ample headroom for personal traffic[cite: 1]. The LLM client abstraction layer in `lib/` allows swapping to commercial providers (Claude API, OpenAI) whenever necessary without major architectural rewrites[cite: 1, 2].
- **Revisit Trigger:** When rate limits are consistently exceeded due to sustained traffic spikes[cite: 1, 2].

---

### 4. Formal Legal Documents, Extended Privacy Policy, & Retention Rules
- **Status:** Simplified (formal documentation not required)[cite: 2].
- **Rationale:** The application processes no sensitive information, financial transactions, or visitor identities[cite: 1].
- **MVP Solution:** Include a simple single-line disclaimer below the chat input: *"Note: Conversations are recorded anonymously for AI assistant evaluation."*[cite: 2]
- **Revisit Trigger:** If the system begins collecting identifiable personal user information (e.g., contact forms with names and phone numbers).