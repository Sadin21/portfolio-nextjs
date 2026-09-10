export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium tracking-wide">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Phase 3 — Step 5 Complete
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          AI Portfolio <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Assistant</span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          Next.js App Router, Tailwind CSS, Supabase pgvector, and Vercel AI SDK are initialized and ready for Step 6 (Streaming Chat Route Handler).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <div className="text-cyan-400 text-sm font-semibold mb-1">RAG Knowledge</div>
            <p className="text-xs text-slate-400">12 chunks indexed in Supabase Cloud pgvector (768 dimensions via MRL).</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <div className="text-blue-400 text-sm font-semibold mb-1">App Router</div>
            <p className="text-xs text-slate-400">TypeScript, Tailwind CSS, and layout structure configured.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <div className="text-purple-400 text-sm font-semibold mb-1">Next Up: Step 6</div>
            <p className="text-xs text-slate-400">Streaming route handler at <code className="text-slate-200">/api/chat</code> with rate limits and similarity retrieval.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
