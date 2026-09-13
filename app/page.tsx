import { ChatContainer } from '@/components/ChatContainer';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0b141a] bg-[url('/wa-doodle-dark.svg')] bg-repeat bg-[size:380px_380px] text-[#e9edef] selection:bg-[#00a884]/30 selection:text-[#00a884]">
      <ChatContainer />
    </main>
  );
}
