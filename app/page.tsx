export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium tracking-wide">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Phase 3 — Complete
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          AI Portfolio <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Assistant</span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          The Streaming Route Handler is now active at <code className="text-slate-200">/api/chat</code>. Ready for Phase 4 (Evaluation) or Phase 5 (Frontend UI).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <div className="text-cyan-400 text-sm font-semibold mb-1">RAG Knowledge</div>
            <p className="text-xs text-slate-400">Knowledge chunks indexed in Supabase pgvector with 768 dimensions.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <div className="text-blue-400 text-sm font-semibold mb-1">Backend API</div>
            <p className="text-xs text-slate-400">Rate limiting, session logging, and Gemini LLM streaming enabled.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <div className="text-purple-400 text-sm font-semibold mb-1">Next Up: UI</div>
            <p className="text-xs text-slate-400">Implement useChat hook and chat interface components in Phase 5.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
