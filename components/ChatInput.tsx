import React, { useState } from 'react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (text: string) => void;
  onStop?: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isComposing) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-5xl mx-auto w-full">
      {/* Left WhatsApp Icons: Paperclip & Emoji */}
      <div className="flex items-center gap-1 text-[#8696a0] shrink-0">
        {/* Paperclip */}
        <button
          type="button"
          className="p-2 rounded-full hover:text-[#e9edef] hover:bg-[#374248] transition-colors"
          title="Attach"
          onClick={() => setInput(input + '📎 ')}
        >
          <svg className="w-5 h-5 -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        {/* Emoji Smiley */}
        <button
          type="button"
          className="p-2 rounded-full hover:text-[#e9edef] hover:bg-[#374248] transition-colors"
          title="Emoji"
          onClick={() => setInput(input + '✅ ')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* WhatsApp Message Input Field */}
      <div className="flex-1 relative flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          disabled={disabled}
          placeholder="Type a message"
          className="w-full rounded-lg bg-[#2a3942] px-4 py-2.5 text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884] transition-all disabled:opacity-50"
        />
      </div>

      {/* Right WhatsApp Action Button (Mic / Send / Stop) */}
      <div className="shrink-0 flex items-center">
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="p-2 rounded-full text-[#f15c6d] hover:bg-[#374248] transition-colors"
            title="Stop response"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        ) : input.trim().length > 0 ? (
          <button
            type="submit"
            disabled={disabled}
            className="p-2 rounded-full text-[#00a884] hover:text-[#25d366] hover:bg-[#374248] transition-colors"
            title="Send message"
            aria-label="Send"
          >
            <svg className="w-5 h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            className="p-2 rounded-full text-[#8696a0] hover:text-[#e9edef] hover:bg-[#374248] transition-colors"
            title="Voice message"
            onClick={() => setInput('Ceritakan pengalaman kerja Daffa di logistik')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </button>
        )}
      </div>
    </form>
  );
};
