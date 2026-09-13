import React from 'react';

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

const STARTER_PROMPTS = [
  {
    prefix: '1.',
    title: 'Pengalaman & Riwayat Karier',
    description: '2 tahun sebagai Fullstack Engineer di perusahaan digital logistik.',
    query: 'Ceritakan latar belakang karier dan pengalaman profesional Daffa.',
  },
  {
    prefix: '2.',
    title: 'Studi Kasus: Payment SNAP BI',
    description: 'Integrasi direct Virtual Account 5 bank utama (BCA, BNI, BRI, Mandiri, DBS).',
    query: 'Jelaskan proyek integrasi Virtual Account multi-bank berbasis SNAP BI yang dikerjakan Daffa.',
  },
  {
    prefix: '3.',
    title: 'Studi Kasus: Monitoring Utility Matrix',
    description: 'Spreadsheet kalender matriks 31 hari armada & driver terintegrasi ERP.',
    query: 'Bagaimana Daffa membangun fitur Monitoring Utility Armada & Driver serta tantangan teknisnya?',
  },
  {
    prefix: '4.',
    title: 'Keahlian Teknis (Tech Stack)',
    description: 'Next.js App Router, Supabase pgvector, Laravel, Docker, & Gemini RAG.',
    query: 'Apa saja keahlian teknis (tech stack) utama yang dikuasai Daffa?',
  },
];

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({
  onSelectPrompt,
  disabled = false,
}) => {
  return (
    <div className="w-full space-y-2">
      <div className="text-[11px] font-semibold text-[#8696a0] uppercase tracking-wider px-1">
        Pilihan Topik Tanya Jawab:
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {STARTER_PROMPTS.map((item, index) => (
          <button
            key={index}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPrompt(item.query)}
            className="group flex items-start gap-2.5 text-left p-3 rounded-lg border border-[#2a3942] bg-[#202c33] hover:bg-[#2a3942] hover:border-[#00a884]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            <span className="text-[#00a884] font-mono text-xs font-bold shrink-0 mt-0.5">
              {item.prefix}
            </span>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#e9edef] group-hover:text-[#00a884] transition-colors">
                {item.title}
              </div>
              <p className="text-[11px] text-[#8696a0] line-clamp-1 mt-0.5">
                {item.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
