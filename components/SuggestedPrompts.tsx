import React from 'react';

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

const STARTER_PROMPTS = [
  {
    icon: '💼',
    title: 'Pengalaman & Latar Belakang',
    description: 'Ceritakan perjalanan karier dan peran Daffa di digital logistik.',
    query: 'Ceritakan latar belakang karier dan pengalaman profesional Daffa.',
  },
  {
    icon: '🚚',
    title: 'Project Real-Time Tracking',
    description: 'Bagaimana arsitektur platform pelacakan armada truk yang dibangun?',
    query: 'Jelaskan proyek Real-Time Fleet & Logistics Tracking Platform yang dikerjakan Daffa beserta hasilnya.',
  },
  {
    icon: '⚡',
    title: 'Tech Stack & Keahlian',
    description: 'Teknologi apa saja yang dikuasai untuk frontend, backend, dan AI?',
    query: 'Apa saja keahlian teknis (tech stack) utama yang dikuasai Daffa?',
  },
  {
    icon: '📬',
    title: 'Kontak & Kolaborasi',
    description: 'Bagaimana cara menghubungi Daffa untuk diskusi atau interview?',
    query: 'Bagaimana cara menghubungi Daffa untuk tawaran kerja atau diskusi kolaborasi?',
  },
];

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({
  onSelectPrompt,
  disabled = false,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto my-6 px-2 animate-fadeIn">
      <div className="text-center mb-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-1">
          Topik Pertanyaan yang Disarankan
        </h3>
        <p className="text-xs text-slate-500">
          Klik salah satu kartu di bawah untuk memulai percakapan secara instan:
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STARTER_PROMPTS.map((item, index) => (
          <button
            key={index}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPrompt(item.query)}
            className="group flex flex-col text-left p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-cyan-500/40 transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-cyan-950/20"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">{item.icon}</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                {item.title}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
