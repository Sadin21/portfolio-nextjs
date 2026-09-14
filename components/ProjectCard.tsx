import React from 'react';

interface ProjectMetadata {
  title: string;
  category: string;
  badge: string;
  callout: string;
  problem: string;
  stack: string[];
  metrics: { label: string; value: string }[];
  primaryBtnText: string;
  primaryBtnUrl: string;
  secondaryBtnText?: string;
  secondaryBtnUrl?: string;
}

const PROJECT_REGISTRY: Record<string, ProjectMetadata> = {
  'project-logistics': {
    title: 'Real-Time Fleet & Logistics Tracking Platform',
    category: 'FLEET VISIBILITY • IOT TELEMETRY',
    badge: 'Production',
    callout: 'Memangkas latensi pelaporan armada dari 30 menit menjadi < 3 detik.',
    problem:
      'Dashboard sentral telemetri pelacakan armada truk secara real-time berbasis Next.js, PostgreSQL/PostGIS, dan WebSocket untuk eliminasi latensi pelaporan status pengiriman antarkota.',
    stack: ['Next.js', 'React', 'Tailwind CSS', 'PostgreSQL', 'PostGIS', 'Supabase Realtime', 'Leaflet/Mapbox'],
    metrics: [
      { label: 'Telemetri Latensi', value: '< 3s' },
      { label: 'Penurunan Komplain', value: '42%' },
      { label: 'Armada Terpantau', value: '200+ Unit' },
    ],
    primaryBtnText: 'Buka Repositori GitHub',
    primaryBtnUrl: 'https://github.com/Sadin21',
    secondaryBtnText: 'Profil LinkedIn',
    secondaryBtnUrl: 'https://www.linkedin.com/in/muhammad-daffa-asaddin/',
  },
  'project-payment': {
    title: 'Integrasi Payment Virtual Account Multi-Bank (SNAP BI)',
    category: 'FINTECH ENGINE • DIRECT CONNECTION',
    badge: '5 Bank Go-Live',
    callout: 'Koneksi langsung ke BCA, BNI, BRI, Mandiri, & DBS dengan 0% double-pay.',
    problem:
      'Migrasi pembayaran dari perantara agregator (Midtrans) ke direct connection 5 bank utama berbasis standar SNAP BI guna memangkas biaya perantara transaksi dan mempercepat rekonsiliasi.',
    stack: ['Laravel', 'PHP', 'MySQL', 'SNAP BI', 'RSA-SHA256', 'HMAC-SHA512', 'GnuPG'],
    metrics: [
      { label: 'Bank Terintegrasi', value: '5 Bank' },
      { label: 'Double Payment', value: '0%' },
      { label: 'Direct Settlement', value: '100%' },
    ],
    primaryBtnText: 'Tanya Detail Arsitektur',
    primaryBtnUrl: 'https://www.linkedin.com/in/muhammad-daffa-asaddin/',
    secondaryBtnText: 'GitHub Profil',
    secondaryBtnUrl: 'https://github.com/Sadin21',
  },
  'project-monitoring-utility': {
    title: 'Monitoring Utility Armada & Driver Matrix',
    category: 'ERP MATRIX • OPERATION VISIBILITY',
    badge: '31 Hari Matrix',
    callout: 'Spreadsheet kalender interaktif dua arah terintegrasi database ERP.',
    problem:
      'Menggantikan proses manual Excel terpisah dengan antarmuka matriks dinamis yang menyinkronkan status asimetris Armada dan Driver serta otomatisasi agregasi metrik omset/margin harian.',
    stack: ['Laravel', 'PHP', 'MySQL', 'DataTables', 'SheetJS', 'Bootstrap', 'jQuery'],
    metrics: [
      { label: 'Visibilitas Kalender', value: '31 Hari' },
      { label: 'Sinkronisasi 2-Arah', value: '100%' },
      { label: 'Template Tampilan', value: '4 Mode' },
    ],
    primaryBtnText: 'Tanya Solusi Teknis',
    primaryBtnUrl: 'https://www.linkedin.com/in/muhammad-daffa-asaddin/',
    secondaryBtnText: 'GitHub Profil',
    secondaryBtnUrl: 'https://github.com/Sadin21',
  },
  'project-blast-unblast': {
    title: 'Blasting & Unblasting PO/DO (Automated Refund Engine)',
    category: 'ORDER ALLOCATION • LEDGER CONSISTENCY',
    badge: 'Zero Stale Overwrite',
    callout: 'Automated refund & pessimistic locking untuk eliminasi race condition saldo.',
    problem:
      'Alur distribusi muatan (Blasting) dan pembatalan alokasi armada (Unblasting) dengan multi-tier guard safety serta pembersihan bersih 5 entitas logistik secara atomik.',
    stack: ['NestJS', 'TypeScript', 'Laravel', 'MySQL', 'Pessimistic Locking', 'State Machine'],
    metrics: [
      { label: 'Integritas Saldo', value: '100%' },
      { label: 'Rollback Entitas', value: '5 Modul' },
      { label: 'Accidental Unblast', value: '0 Error' },
    ],
    primaryBtnText: 'Tanya Detail Solusi',
    primaryBtnUrl: 'https://www.linkedin.com/in/muhammad-daffa-asaddin/',
    secondaryBtnText: 'GitHub Profil',
    secondaryBtnUrl: 'https://github.com/Sadin21',
  },
  'project-business-development': {
    title: 'Technical Business Development & Client Onboarding',
    category: 'CLIENT DISCOVERY • SOLUTIONS ENGINEERING',
    badge: 'Go-Live Success',
    callout: 'Menjembatani sistem ERP logistik dengan kebutuhan alur kerja nyata klien di lapangan.',
    problem:
      'Membangun strategi outreach B2B, memvalidasi kesenjangan alur kerja PO/DO klien, mendemonstrasikan live tracking tanpa GPS fisik, serta mengawal training dan pendampingan onboarding hingga sistem aktif digunakan.',
    stack: ['Client Discovery', 'Live Demo', 'B2B Outreach', 'Onboarding & Training', 'Gap Analysis', 'ERP Workflow'],
    metrics: [
      { label: 'Tahap Prospek', value: 'Negosiasi' },
      { label: 'Adopsi Pengguna', value: '100% Aktif' },
      { label: 'Pendampingan', value: 'End-to-End' },
    ],
    primaryBtnText: 'Tanya Detail Pendekatan',
    primaryBtnUrl: 'https://www.linkedin.com/in/muhammad-daffa-asaddin/',
    secondaryBtnText: 'GitHub Profil',
    secondaryBtnUrl: 'https://github.com/Sadin21',
  },
};

interface ProjectCardProps {
  slug: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ slug }) => {
  const project = PROJECT_REGISTRY[slug];

  if (!project) {
    return (
      <div className="my-2 p-2.5 rounded-lg border border-[#2a3942] bg-[#111b21] text-xs text-[#8696a0]">
        📌 Referensi Proyek: <span className="font-mono text-[#00a884]">{slug}</span>
      </div>
    );
  }

  return (
    <div className="my-2.5 overflow-hidden rounded-lg border-l-4 border-[#00a884] bg-[#111b21] p-3.5 shadow-xs text-[#e9edef]">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-1.5 pb-1.5">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#00a884]">
            {project.category}
          </span>
          <h4 className="text-sm font-semibold text-[#e9edef] mt-0.5">
            {project.title}
          </h4>
        </div>

        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#202c33] text-[#25d366] border border-[#2a3942]">
          {project.badge}
        </span>
      </div>

      {/* WhatsApp Quote Highlight */}
      <div className="my-2 p-2 rounded bg-[#202c33]/80 text-xs text-[#8696a0]">
        <span className="text-[#00a884] mr-1.5">⚡</span>
        <span className="text-[#e9edef]">{project.callout}</span>
      </div>

      {/* Problem */}
      <p className="text-xs text-[#8696a0] leading-relaxed">
        {project.problem}
      </p>

      {/* Metrics Badges */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {project.metrics.map((metric, i) => (
          <div
            key={i}
            className="rounded bg-[#202c33] p-1.5 text-center border border-[#2a3942]/60"
          >
            <div className="text-xs sm:text-sm font-bold text-[#00a884] font-mono">
              {metric.value}
            </div>
            <div className="text-[10px] text-[#8696a0] mt-0.5">
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tech Stack Pills */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1 pt-2 border-t border-[#222d34]">
        <span className="text-[10px] uppercase font-semibold text-[#8696a0] mr-1">
          Stack:
        </span>
        {project.stack.map((tech, idx) => (
          <span
            key={idx}
            className="rounded bg-[#202c33] px-1.5 py-0.5 text-[10px] font-medium text-[#8696a0] border border-[#2a3942]/50"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-3 flex items-center gap-2">
        <a
          href={project.primaryBtnUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded bg-[#00a884] hover:bg-[#008f6f] px-3 py-1.5 text-xs font-semibold text-[#111b21] transition-colors"
        >
          {project.primaryBtnText}
          <span>→</span>
        </a>

        {project.secondaryBtnText && (
          <a
            href={project.secondaryBtnUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#53bdeb] hover:underline px-2 py-1"
          >
            {project.secondaryBtnText}
          </a>
        )}
      </div>
    </div>
  );
};
