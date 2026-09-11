import React, { useState } from 'react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (text: string) => void;
  onStop?: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

const MAX_CHARS = 800;

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSubmit,
  onStop,
  isStreaming,
  disabled = false,
}) => {
  const [isComposing, setIsComposing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || isStreaming) return;
    const trimmed = input.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const remainingChars = MAX_CHARS - input.length;
  const isTooLong = remainingChars < 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      <form
        onSubmit={handleSubmit}
        className="relative rounded-2xl border border-slate-700/70 bg-slate-900/80 shadow-2xl backdrop-blur-xl focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/30 transition-all"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          disabled={disabled}
          placeholder="Tanyakan apa saja seputar pengalaman, proyek, atau keahlian Daffa..."
          rows={2}
          className="w-full resize-none bg-transparent px-4 pt-3.5 pb-12 text-sm text-slate-100 placeholder-slate-500 focus:outline-none disabled:opacity-50"
        />

        {/* Action bar inside input */}
        <div className="absolute bottom-2.5 left-4 right-3 flex items-center justify-between pointer-events-none">
          {/* Character counter */}
          <span
            className={`text-[10px] font-mono transition-colors pointer-events-auto ${
              isTooLong ? 'text-red-400 font-bold' : remainingChars <= 100 ? 'text-amber-400' : 'text-slate-500'
            }`}
          >
            {input.length}/{MAX_CHARS}
          </span>

          {/* Buttons */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold tracking-wide transition-all active:scale-95 shadow-sm"
              >
                <span className="w-2 h-2 rounded-sm bg-red-400 animate-pulse" />
                Hentikan
              </button>
            ) : (
              <button
                type="submit"
                disabled={disabled || !input.trim() || isTooLong}
                className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-900/30 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-30 disabled:hover:from-cyan-500 disabled:hover:to-blue-600 disabled:cursor-not-allowed transition-all active:scale-95"
                aria-label="Kirim Pertanyaan"
              >
                <svg
                  className="w-4 h-4 translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.2}
                    d="M5 12h14M12 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Privacy & verification notice */}
      <p className="text-center text-[11px] text-slate-500 mt-2.5 flex items-center justify-center gap-1.5">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
        AI Portfolio Assistant dapat membuat kekeliruan. Seluruh jawaban dirujuk dari basis pengetahuan profil terverifikasi.
      </p>
    </div>
  );
};
