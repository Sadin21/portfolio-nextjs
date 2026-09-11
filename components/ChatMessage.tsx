import React, { useState } from 'react';
import { ProjectCard } from './ProjectCard';

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  isStreaming?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  isStreaming = false,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = role === 'user';

  const handleCopy = () => {
    // Remove card tags from copied text
    const cleanContent = content.replace(/\[CARD:[^\]]+\]/g, '').trim();
    navigator.clipboard.writeText(cleanContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render markdown-like elements and embedded cards
  const renderFormattedContent = (rawText: string) => {
    // Check for [CARD:slug] tag
    const cardRegex = /\[CARD:([a-zA-Z0-9-_]+)\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = cardRegex.exec(rawText)) !== null) {
      const matchIndex = match.index;
      const slug = match[1];

      // Text before card tag
      if (matchIndex > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {parseMarkdownText(rawText.slice(lastIndex, matchIndex))}
          </span>
        );
      }

      // Embed ProjectCard component
      parts.push(<ProjectCard key={`card-${slug}-${matchIndex}`} slug={slug} />);
      lastIndex = cardRegex.lastIndex;
    }

    // Remaining text after last card tag
    if (lastIndex < rawText.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {parseMarkdownText(rawText.slice(lastIndex))}
        </span>
      );
    }

    return parts.length > 0 ? parts : parseMarkdownText(rawText);
  };

  // Basic inline markdown parsing (bold, links, lists, code)
  const parseMarkdownText = (text: string): React.ReactNode => {
    const lines = text.split('\n');

    return lines.map((line, lineIndex) => {
      // Unordered list item
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const bulletText = line.trim().slice(2);
        return (
          <li key={lineIndex} className="ml-4 list-disc text-slate-200 my-1 leading-relaxed">
            {formatInlineTokens(bulletText)}
          </li>
        );
      }

      // Ordered list item (e.g. "1. ")
      const orderedMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
      if (orderedMatch) {
        return (
          <li key={lineIndex} className="ml-4 list-decimal text-slate-200 my-1 leading-relaxed">
            {formatInlineTokens(orderedMatch[2])}
          </li>
        );
      }

      // Empty line -> paragraph break
      if (!line.trim()) {
        return <div key={lineIndex} className="h-2.5" />;
      }

      return (
        <p key={lineIndex} className="my-1 leading-relaxed">
          {formatInlineTokens(line)}
        </p>
      );
    });
  };

  // Helper to format inline bold, code, links
  const formatInlineTokens = (line: string): React.ReactNode => {
    // Regex matches bold **...**, inline code `...`, or links [text](url)
    const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\[https?:\/\/[^\]]+\])/g;
    const segments = line.split(tokenRegex);

    return segments.map((seg, idx) => {
      if (!seg) return null;

      // Bold text **text**
      if (seg.startsWith('**') && seg.endsWith('**')) {
        return (
          <strong key={idx} className="font-semibold text-white">
            {seg.slice(2, -2)}
          </strong>
        );
      }

      // Inline code `code`
      if (seg.startsWith('`') && seg.endsWith('`')) {
        return (
          <code
            key={idx}
            className="rounded bg-slate-800/90 px-1.5 py-0.5 text-[12px] font-mono text-cyan-300 border border-slate-700/50"
          >
            {seg.slice(1, -1)}
          </code>
        );
      }

      // Markdown Link [text](url)
      const linkMatch = seg.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={idx}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
          >
            {linkMatch[1]}
          </a>
        );
      }

      // Raw bracket link [http...] or [email...]
      const rawBracket = seg.match(/^\[(https?:\/\/[^\]]+|[^@\s]+@[^@\s]+\.[^@\s]+)\]$/);
      if (rawBracket) {
        const target = rawBracket[1];
        const isEmail = target.includes('@') && !target.startsWith('http');
        return (
          <a
            key={idx}
            href={isEmail ? `mailto:${target}` : target}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
          >
            {target}
          </a>
        );
      }

      return seg;
    });
  };

  return (
    <div
      className={`group flex w-full gap-3 py-3 transition-opacity ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-bold text-xs shadow-md shadow-cyan-900/30 border border-cyan-400/30">
          DA
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={`relative max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-xs sm:text-sm shadow-md transition-all ${
          isUser
            ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-blue-950/30 rounded-tr-none'
            : 'border border-slate-800/80 bg-slate-900/70 text-slate-200 shadow-slate-950/40 backdrop-blur-md rounded-tl-none'
        }`}
      >
        {/* Role identifier badge & copy button for assistant */}
        {!isUser && (
          <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-slate-800/60 text-[11px] text-slate-400">
            <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
              <span>Daffa&apos;s AI Assistant</span>
              {isStreaming && (
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  mengetik...
                </span>
              )}
            </span>

            {content && !isStreaming && (
              <button
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-200 flex items-center gap-1 text-[11px]"
                title="Salin jawaban"
              >
                {copied ? (
                  <span className="text-emerald-400 font-medium">Tersalin ✓</span>
                ) : (
                  <span>Salin</span>
                )}
              </button>
            )}
          </div>
        )}

        {/* Message Content */}
        <div className="space-y-1">
          {renderFormattedContent(content)}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-700">
          You
        </div>
      )}
    </div>
  );
};
