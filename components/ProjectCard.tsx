import React from 'react';

interface ProjectMetadata {
  title: string;
  category: string;
  problem: string;
  stack: string[];
  metrics: { label: string; value: string }[];
  linkText?: string;
  linkUrl?: string;
}

const PROJECT_REGISTRY: Record<string, ProjectMetadata> = {
  'project-logistics': {
    title: 'Real-Time Fleet & Logistics Tracking Platform',
    category: 'Digital Logistics & Fleet Visibility',
    problem:
      'Mengatasi latensi pelaporan status kiriman antarkota dari 30 menit menjadi instan dengan visualisasi posisi armada truk secara real-time.',
    stack: ['Next.js', 'React', 'Tailwind CSS', 'PostgreSQL', 'PostGIS', 'Supabase Realtime', 'Leaflet/Mapbox'],
    metrics: [
      { label: 'Pelaporan Latensi', value: '< 3 Detik' },
      { label: 'Penurunan Komplain', value: '42%' },
      { label: 'Armada Terpantau', value: '200+ Truk' },
    ],
    linkText: 'Lihat repositori terkait di GitHub',
    linkUrl: 'https://github.com/Sadin21',
  },
};

interface ProjectCardProps {
  slug: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ slug }) => {
  const project = PROJECT_REGISTRY[slug];

  if (!project) {
    return (
      <div className="my-3 p-3 rounded-xl border border-slate-700 bg-slate-800/50 text-xs text-slate-400">
        📌 Referensi Proyek: <span className="font-mono text-cyan-400">{slug}</span>
      </div>
    );
  }

  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-5 shadow-xl shadow-cyan-950/20 backdrop-blur-md transition-all hover:border-cyan-400/50">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-sm">
            🚚
          </span>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
              {project.category}
            </span>
            <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
              {project.title}
            </h4>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
        {project.problem}
      </p>

      {/* Metrics Badges */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {project.metrics.map((metric, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-2.5 text-center"
          >
            <div className="text-base sm:text-lg font-extrabold text-cyan-300 font-mono tracking-tight">
              {metric.value}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5">
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tech Stack Pills */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-800/60">
        <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 mr-1">
          Stack:
        </span>
        {project.stack.map((tech, idx) => (
          <span
            key={idx}
            className="rounded-md border border-slate-700/60 bg-slate-800/60 px-2 py-0.5 text-[11px] font-medium text-slate-300"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* External Link */}
      {project.linkUrl && (
        <div className="mt-4 pt-2">
          <a
            href={project.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group"
          >
            {project.linkText || 'Buka Link Terkait'}
            <svg
              className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
};
