import { ChatContainer } from '@/components/ChatContainer';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <ChatContainer />
    </main>
  );
}

