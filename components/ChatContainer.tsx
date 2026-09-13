'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SuggestedPrompts } from './SuggestedPrompts';

export const ChatContainer: React.FC = () => {
  const [input, setInput] = useState('');
  const [sessionToken, setSessionToken] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or retrieve persistent sessionToken on client
  useEffect(() => {
    let token = localStorage.getItem('ai_portfolio_session_token');
    if (!token) {
      token = `session_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
      localStorage.setItem('ai_portfolio_session_token', token);
    }
    setSessionToken(token);
  }, []);

  // Configure Vercel AI SDK useChat hook with TextStreamChatTransport
  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        api: '/api/chat',
        body: sessionToken ? { sessionToken } : undefined,
      }),
    [sessionToken]
  );

  const { messages, sendMessage, status, stop, setMessages, error } = useChat({
    transport,
  });

  const isStreaming = status === 'streaming' || status === 'submitted';

  // Auto scroll on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Handler for sending messages
  const handleSend = (text: string) => {
    if (!text.trim() || isStreaming) return;
    sendMessage(
      { text },
      {
        body: { sessionToken },
      }
    );
    setInput('');
  };

  // Reset/clear chat conversation
  const handleReset = () => {
    setMessages([]);
    const newToken = `session_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
    localStorage.setItem('ai_portfolio_session_token', newToken);
    setSessionToken(newToken);
  };

  return (
    <div className="flex flex-col h-[100dvh] max-w-5xl mx-auto border-x border-[#222d34]/60 bg-[#0b141a]/95 backdrop-blur-xs relative">
      {/* WhatsApp Web Top Header */}
      <header className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-[#202c33] border-b border-[#222d34] z-20">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#00a884] text-white font-bold text-sm shadow-xs">
            DA
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#25d366] border-2 border-[#202c33]" />
          </div>

          {/* Contact Information */}
          <div>
            <h1 className="text-sm font-semibold text-[#e9edef] leading-tight">
              Muhammad Daffa Asaddin
            </h1>
            <p className="text-[11px] text-[#8696a0] flex items-center gap-1.5">
              <span className="text-[#25d366]">online</span>
              <span>•</span>
              <span>Fullstack Engineer (2 YOE)</span>
            </p>
          </div>
        </div>

        {/* Right Header Action Controls */}
        <div className="flex items-center gap-3 text-[#aebac1]">
          {/* New Chat / Reset */}
          <button
            onClick={handleReset}
            className="p-2 rounded-full hover:bg-[#374248] hover:text-[#e9edef] transition-colors"
            title="Reset Chat / New Chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* External Social / Menu Toggle */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full hover:bg-[#374248] hover:text-[#e9edef] transition-colors"
              title="Menu & Kontak"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 7a2 2 0 100-4 2 2 0 000 4zm0 7a2 2 0 100-4 2 2 0 000 4zm0 7a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </button>

            {/* Menu Popover */}
            {menuOpen && (
              <div className="absolute right-0 top-11 w-60 rounded-xl border border-[#222d34] bg-[#233138] p-3 shadow-2xl z-50 animate-fadeIn text-[#e9edef] text-xs">
                <div className="pb-2 mb-2 border-b border-[#374248]">
                  <p className="font-semibold text-sm text-[#e9edef]">Daffa Asaddin</p>
                  <p className="text-[11px] text-[#8696a0]">Fullstack Engineer (Digital Logistics)</p>
                </div>

                <div className="space-y-1">
                  <a
                    href="https://www.linkedin.com/in/muhammad-daffa-asaddin/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#182229] hover:text-[#00a884] transition-colors"
                  >
                    <span>💼</span> LinkedIn Profile
                  </a>
                  <a
                    href="https://github.com/Sadin21"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#182229] hover:text-[#00a884] transition-colors"
                  >
                    <span>🐙</span> GitHub Repositories
                  </a>
                  <a
                    href="mailto:emdeasaddin21@gmail.com"
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#182229] hover:text-[#00a884] transition-colors"
                  >
                    <span>✉️</span> emdeasaddin21@gmail.com
                  </a>
                </div>

                <div className="pt-2 mt-2 border-t border-[#374248] text-[10px] text-[#8696a0]">
                  Grounded with Supabase pgvector RAG
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Chat Scroll Area */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-8 py-3 flex flex-col space-y-3">
        {/* WhatsApp Date Header Pill */}
        <div className="my-1.5 mx-auto">
          <span className="px-3 py-1 rounded-md bg-[#182229] text-[#8696a0] text-[11px] font-medium tracking-wide uppercase shadow-xs">
            Today
          </span>
        </div>

        {/* WhatsApp Security Notice Box */}
        <div className="mx-auto max-w-lg p-2.5 rounded-lg bg-[#182229]/90 text-[#ffd279] text-xs text-center border border-[#222d34]/60 shadow-xs flex items-center justify-center gap-2">
          <span>🔒</span>
          <span className="text-[11px] leading-tight text-[#ffd279]">
            Pesan dalam obrolan ini dijawab oleh AI Assistant berdasarkan dokumen portofolio terverifikasi Daffa Asaddin.
          </span>
        </div>

        {/* Welcome Starter / Messages Feed */}
        {messages.length === 0 ? (
          <div className="my-auto w-full max-w-xl mx-auto">
            {/* System Introduction Bubble */}
            <div className="rounded-lg bg-[#202c33] border border-[#222d34] p-4 text-[#e9edef] text-xs sm:text-sm shadow-xs mb-4">
              <p className="font-semibold text-sm text-[#00a884] mb-1">
                Halo! Saya AI Assistant Muhammad Daffa Asaddin.
              </p>
              <p className="text-[#8696a0] text-xs leading-relaxed">
                Daffa adalah Fullstack Software Engineer dengan 2 tahun pengalaman di sektor digital logistik (ERP, Tracking Armada, & Direct Payment SNAP BI). Silakan pilih topik di bawah atau ketik pertanyaan langsung di kolom pesan:
              </p>
            </div>

            {/* Suggested Starter Topics */}
            <SuggestedPrompts
              onSelectPrompt={handleSend}
              disabled={isStreaming}
            />
          </div>
        ) : (
          messages.map((message, idx) => {
            let contentText = '';
            if (message.parts && Array.isArray(message.parts)) {
              contentText = message.parts
                .filter((p) => p.type === 'text')
                .map((p) => (p as any).text)
                .join('');
            } else if ((message as any).content) {
              contentText = (message as any).content;
            }

            const isLastMessage = idx === messages.length - 1;
            const messageIsStreaming = isLastMessage && message.role === 'assistant' && isStreaming;

            return (
              <ChatMessage
                key={message.id || idx}
                role={message.role as 'user' | 'assistant'}
                content={contentText}
                isStreaming={messageIsStreaming}
              />
            );
          })
        )}

        {/* WhatsApp Typing / Generating Indicator */}
        {status === 'submitted' && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#202c33] text-[#8696a0] text-xs w-fit max-w-[200px] border border-[#222d34]">
            <span className="w-2 h-2 rounded-full bg-[#00a884] animate-ping" />
            <span>mengetik...</span>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="my-2 p-3 rounded-lg bg-[#382023] border border-[#4a262a] text-[#f15c6d] text-xs flex items-center justify-between gap-3">
            <span>⚠️ {error.message || 'Gagal menghubungi server AI.'}</span>
            <button
              onClick={() => handleSend(input || 'Halo')}
              className="px-2.5 py-1 rounded bg-[#4a262a] hover:bg-[#5e3136] text-white text-xs font-medium transition-colors"
            >
              Coba lagi
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* WhatsApp Web Bottom Input Bar */}
      <footer className="shrink-0 z-10 bg-[#202c33] border-t border-[#222d34] px-4 py-2.5">
        <ChatInput
          input={input}
          setInput={setInput}
          onSubmit={handleSend}
          onStop={stop}
          isStreaming={isStreaming}
        />
      </footer>
    </div>
  );
};
