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
    <div className="flex flex-col h-[100dvh] max-w-4xl mx-auto">
      {/* Top Navigation / Header */}
      <header className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 font-bold text-white text-sm shadow-md shadow-cyan-950/50">
            DA
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-950" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Muhammad Daffa Asaddin
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                AI Portfolio Agent
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Fullstack Software Engineer (2 YOE • Digital Logistics & RAG)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white text-xs font-medium transition-colors"
              title="Mulai percakapan baru"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Reset Chat</span>
            </button>
          )}

          {/* Social Links Quick Access */}
          <a
            href="https://www.linkedin.com/in/muhammad-daffa-asaddin/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-slate-700 transition-colors"
            title="Profil LinkedIn"
          >
            <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </a>
          <a
            href="https://github.com/Sadin21"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            title="Profil GitHub"
          >
            <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fadeIn">
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Sistem RAG Portofolio Siap
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight max-w-lg leading-snug">
              Ada yang ingin kamu ketahui tentang{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Muhammad Daffa Asaddin?
              </span>
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-md">
              Tanyakan pengalaman kerja di logistik digital, arsitektur pelacakan armada, stack React & Node.js, atau cara menghubunginya.
            </p>

            {/* Starter Prompts */}
            <SuggestedPrompts
              onSelectPrompt={handleSend}
              disabled={isStreaming}
            />
          </div>
        ) : (
          messages.map((message, idx) => {
            // Extract text from parts or text property
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

        {/* Loading placeholder when submitted but no tokens yet */}
        {status === 'submitted' && (
          <div className="flex items-center gap-3 py-2 text-slate-400 text-xs sm:text-sm animate-pulse">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold text-xs">
              DA
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Mencari rujukan di knowledge base portofolio...</span>
            </div>
          </div>
        )}

        {/* Error Notification Banner */}
        {error && (
          <div className="my-3 p-3.5 rounded-xl border border-red-500/40 bg-red-950/30 text-red-300 text-xs sm:text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>{error.message || 'Terjadi kesalahan saat menghubungkan ke server AI.'}</span>
            </div>
            <button
              onClick={() => handleSend(input || 'Halo')}
              className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input Form Bar */}
      <footer className="shrink-0 z-10">
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
