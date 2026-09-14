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
    const cleanContent = content.replace(/\[CARD:[^\]]+\]/g, '').trim();
    navigator.clipboard.writeText(cleanContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render markdown-like elements and embedded cards
  const renderFormattedContent = (rawText: string) => {
    const cardRegex = /\[CARD:([a-zA-Z0-9-_]+)\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = cardRegex.exec(rawText)) !== null) {
      const matchIndex = match.index;
      const slug = match[1];

      if (matchIndex > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {parseMarkdownText(rawText.slice(lastIndex, matchIndex))}
          </span>
        );
      }

      parts.push(<ProjectCard key={`card-${slug}-${matchIndex}`} slug={slug} />);
      lastIndex = cardRegex.lastIndex;
    }

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
          <li key={lineIndex} className="ml-3 list-disc text-[#e9edef] my-0.5 leading-relaxed">
            {formatInlineTokens(bulletText)}
          </li>
        );
      }

      // Ordered list item (e.g. "1. ")
      const orderedMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
      if (orderedMatch) {
        return (
          <div key={lineIndex} className="my-0.5 leading-relaxed flex items-start gap-1.5 text-[#e9edef]">
            <span className="text-[#8696a0] font-mono text-xs">{orderedMatch[1]}.</span>
            <span className="flex-1">{formatInlineTokens(orderedMatch[2])}</span>
          </div>
        );
      }

      // Empty line -> break
      if (!line.trim()) {
        return <div key={lineIndex} className="h-1.5" />;
      }

      return (
        <p key={lineIndex} className="my-0.5 leading-relaxed">
          {formatInlineTokens(line)}
        </p>
      );
    });
  };

  // Helper to format inline bold, italic, code, links, mentions
  const formatInlineTokens = (line: string): React.ReactNode => {
    // Regex for bold (**text**), italic (*text* or _text_), code, links, mentions (@Name)
    const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|`[^`]+`|\[[^\]]+\]\([^)]+\)|\[https?:\/\/[^\]]+\]|@[a-zA-Z0-9_~-]+)/g;
    const segments = line.split(tokenRegex);

    return segments.map((seg, idx) => {
      if (!seg) return null;

      // Mentions like in WhatsApp (@Name)
      if (seg.startsWith('@')) {
        return (
          <span key={idx} className="font-semibold text-[#53bdeb]">
            {seg}
          </span>
        );
      }

      // Bold text **text**
      if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) {
        return (
          <strong key={idx} className="font-semibold text-white">
            {seg.slice(2, -2)}
          </strong>
        );
      }

      // Italic text *text* or _text_ (for foreign/technical terms)
      if (
        ((seg.startsWith('*') && seg.endsWith('*')) ||
          (seg.startsWith('_') && seg.endsWith('_'))) &&
        seg.length > 2
      ) {
        return (
          <em key={idx} className="italic text-[#e9edef]">
            {seg.slice(1, -1)}
          </em>
        );
      }

      // Inline code `code`
      if (seg.startsWith('`') && seg.endsWith('`')) {
        return (
          <code
            key={idx}
            className={`rounded px-1.5 py-0.5 text-[12px] font-mono ${
              isUser
                ? 'bg-[#004d3e] text-[#a6ffd6]'
                : 'bg-[#111b21] text-[#00a884] border border-[#2a3942]'
            }`}
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
            className="text-[#53bdeb] hover:underline font-medium"
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
            className="text-[#53bdeb] hover:underline font-medium"
          >
            {target}
          </a>
        );
      }

      return seg;
    });
  };

  // Mock timestamp for WhatsApp feel
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className={`group flex w-full py-1 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* WhatsApp Message Bubble */}
      <div
        className={`relative max-w-[85%] sm:max-w-[72%] rounded-lg px-3 py-2 text-xs sm:text-sm shadow-xs ${
          isUser
            ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
            : 'bg-[#202c33] text-[#e9edef] rounded-tl-none border border-[#222d34]/40'
        }`}
      >
        {/* Assistant sender label */}
        {!isUser && (
          <div className="flex items-center justify-between gap-4 mb-1 text-[11px]">
            <span className="font-semibold text-[#00a884]">
              Daffa&apos;s Assistant
            </span>

            {content && !isStreaming && (
              <button
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[#8696a0] hover:text-[#e9edef] text-[10px]"
                title="Salin pesan"
              >
                {copied ? <span className="text-[#25d366]">Tersalin ✓</span> : <span>Salin</span>}
              </button>
            )}
          </div>
        )}

        {/* Message Content */}
        <div className="space-y-1 text-inherit">
          {renderFormattedContent(content)}
        </div>

        {/* Bottom-right Timestamp & Checkmarks */}
        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#8696a0] select-none">
          <span suppressHydrationWarning>{currentTime}</span>
          {isUser && (
            <span className="text-[#53bdeb] text-xs leading-none font-bold" title="Read">
              ✓✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
