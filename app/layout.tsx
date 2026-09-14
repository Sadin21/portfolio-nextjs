import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Portfolio Assistant | Fullstack Software Engineer',
  description:
    'Interactive AI-powered portfolio assistant showcasing technical background, logistics projects, and skills with RAG.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased min-h-screen bg-[#090d16] text-slate-100 selection:bg-cyan-500 selection:text-white"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
