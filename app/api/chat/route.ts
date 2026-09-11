import { NextRequest, NextResponse } from 'next/server';
import { streamText, generateText } from 'ai';
import { supabaseServer } from '@/lib/supabase-server';
import { generateQueryEmbedding, getChatModel } from '@/lib/llm-provider';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const maxDuration = 30; // Max execution time

// Standardized error helper
function createErrorResponse(message: string, code: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status }
  );
}

// Persona configuration
const SYSTEM_PERSONA = `Kamu adalah AI Assistant yang merepresentasikan Daffa, seorang Fullstack Software Engineer dengan pengalaman 2 tahun di perusahaan digital logistik.

ATURAN UTAMA:
1. Jawab HANYA berdasarkan konteks yang diberikan di bawah. Jangan mengarang informasi yang tidak ada di konteks.
2. Jika informasi tidak tersedia di konteks, katakan dengan jujur: "Aku belum punya info detail soal itu, tapi kamu bisa hubungi Daffa langsung di [masukkan link LinkedIn atau email dari konteks]."
3. Gunakan kata ganti "dia" atau sebut nama, JANGAN gunakan "aku" seolah-olah kamu adalah Daffa — kamu adalah asisten yang merepresentasikan dia.
4. Tolak dengan sopan pertanyaan di luar topik profil/karier/project Daffa. Arahkan kembali ke topik portofolio.
5. Jika kamu menjelaskan atau mereferensikan proyek pelacakan armada/logistik (Real-Time Fleet & Logistics Tracking Platform), sertakan tag [CARD:project-logistics] di akhir penjelasan agar UI dapat menampilkan kartu proyek interaktif.
6. Gaya bahasa: profesional tapi hangat, ringkas, tidak bertele-tele.

KONTEKS YANG TERSEDIA:
{retrieved_chunks}
`;

export async function POST(req: NextRequest) {
  try {
    // 1. Extract request details
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    
    // Parse the request body safely (strips UTF-8 BOM if present)
    let body: any;
    try {
      const rawText = await req.text();
      const cleanText = rawText.charCodeAt(0) === 0xfeff ? rawText.slice(1) : rawText;
      body = JSON.parse(cleanText);
    } catch {
      return createErrorResponse('Format JSON request tidak valid.', 'INVALID_JSON', 400);
    }

    let userMessage = '';
    let messages: ChatMessage[] = [];
    const sessionToken = body?.sessionToken || 'anonymous-session';
    const isStream = body?.stream !== false; // defaults to true for streaming UI, false returns JSON

    if (body?.messages && Array.isArray(body.messages)) {
      const lastMessage = body.messages[body.messages.length - 1];
      if (lastMessage?.content && typeof lastMessage.content === 'string') {
        userMessage = lastMessage.content.trim();
      } else if (lastMessage?.parts && Array.isArray(lastMessage.parts)) {
        userMessage = lastMessage.parts
          .filter((p: any) => p.type === 'text' && p.text)
          .map((p: any) => p.text)
          .join('\n')
          .trim();
      }
      messages = [{ role: 'user', content: userMessage }];
    } else if (body?.message) {
      userMessage = body.message.trim();
      messages = [{ role: 'user', content: userMessage }];
    }

    if (!userMessage) {
      return createErrorResponse(
        'Pesan tidak boleh kosong. Harap kirimkan pesan melalui property "message" atau array "messages".',
        'EMPTY_MESSAGE',
        400
      );
    }

    // Validate length
    if (userMessage.length > 800) {
      return createErrorResponse(
        'Pesan terlalu panjang (maksimal 800 karakter). Silakan persingkat pertanyaanmu.',
        'MESSAGE_TOO_LONG',
        400
      );
    }

    // 2. IP Rate Limiting
    const { data: isAllowed, error: rateLimitError } = await supabaseServer.rpc('check_rate_limit', {
      client_ip: ip,
      max_requests: 15,
      window_minutes: 10,
    });

    if (rateLimitError) {
      console.error('Rate limit error:', rateLimitError);
      return createErrorResponse('Terjadi gangguan saat memverifikasi kuota request.', 'RATE_LIMIT_CHECK_FAILED', 500);
    }

    if (!isAllowed) {
      return createErrorResponse(
        'Batas request tercapai (maksimal 15 pertanyaan per 10 menit). Silakan tunggu beberapa menit sebelum bertanya lagi.',
        'RATE_LIMIT_EXCEEDED',
        429
      );
    }

    // 3. Semantic Retrieval (RAG)
    let contextText = '';
    let retrievedChunkIds: string[] = [];

    try {
      const embedding = await generateQueryEmbedding(userMessage);
      const vectorString = `[${embedding.join(',')}]`;

      const { data: chunks, error: matchError } = await supabaseServer.rpc('match_knowledge_chunks', {
        query_embedding: vectorString,
        match_threshold: 0.55, // Calibrated for gemini-embedding-001 similarity distribution
        match_count: 5,
      });

      if (matchError) {
        console.error('Match chunks error:', matchError);
      } else if (chunks && chunks.length > 0) {
        retrievedChunkIds = chunks.map((c: any) => c.id);
        contextText = chunks.map((c: any) => `--- SECTION: ${c.section_title} ---\n${c.content}`).join('\n\n');
      }
    } catch (e) {
      console.error('Embedding/Retrieval error:', e);
      // We continue without context so the fallback kicks in
    }

    // 4. Session & History Management
    // Find or create session
    let sessionId = null;
    const { data: existingSession } = await supabaseServer
      .from('chat_sessions')
      .select('id')
      .eq('session_token', sessionToken)
      .single();

    if (existingSession) {
      sessionId = existingSession.id;
    } else {
      const { data: newSession } = await supabaseServer
        .from('chat_sessions')
        .insert({ session_token: sessionToken })
        .select('id')
        .single();
      sessionId = newSession?.id;
    }

    // Fetch chat history from DB
    let historyMessages: ChatMessage[] = [];
    if (sessionId) {
      const { data: historyData } = await supabaseServer
        .from('chat_messages')
        .select('role, content')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(6); // last 3 turns
      
      if (historyData) {
        // Reverse to get chronological order
        historyMessages = historyData.reverse().map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));
      }
    }

    // 5. System Prompt Assembly
    const finalSystemPrompt = SYSTEM_PERSONA.replace('{retrieved_chunks}', contextText || 'Tidak ada konteks spesifik yang ditemukan untuk pertanyaan ini.');

    // Prepare full message array for AI SDK
    const fullMessages: ChatMessage[] = [];
    fullMessages.push(...historyMessages);
    fullMessages.push({ role: 'user', content: userMessage });

    // 6. Generation & Persistence
    // If client requests static JSON (stream: false), generate full text and return JSON object
    if (!isStream) {
      const { text } = await generateText({
        model: getChatModel(),
        system: finalSystemPrompt,
        messages: fullMessages,
      });

      if (sessionId) {
        await supabaseServer.from('chat_messages').insert([
          {
            session_id: sessionId,
            role: 'user',
            content: userMessage,
            retrieved_chunk_ids: retrievedChunkIds,
          },
          {
            session_id: sessionId,
            role: 'assistant',
            content: text,
            retrieved_chunk_ids: [],
          },
        ]);
      }

      return NextResponse.json({
        success: true,
        data: {
          sessionToken,
          role: 'assistant',
          message: text,
          retrievedChunksCount: retrievedChunkIds.length,
        },
      });
    }

    // Default: Streaming Generation for real-time frontend UI
    const result = streamText({
      model: getChatModel(),
      system: finalSystemPrompt,
      messages: fullMessages,
      onError: ({ error }) => {
        console.error('streamText onError:', error);
      },
      onFinish: async ({ text }) => {
        // Persist messages asynchronously
        if (sessionId) {
          // Log user message
          await supabaseServer.from('chat_messages').insert({
            session_id: sessionId,
            role: 'user',
            content: userMessage,
            retrieved_chunk_ids: retrievedChunkIds,
          });
          
          // Log assistant response
          await supabaseServer.from('chat_messages').insert({
            session_id: sessionId,
            role: 'assistant',
            content: text,
            retrieved_chunk_ids: [],
          });
        }
      },
    });

    return result.toTextStreamResponse({
      headers: {
        'X-Session-Token': sessionToken,
        'X-Retrieved-Chunks-Count': retrievedChunkIds.length.toString(),
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return createErrorResponse(
      'Terjadi kesalahan internal pada server AI. Silakan coba beberapa saat lagi.',
      'INTERNAL_SERVER_ERROR',
      500
    );
  }
}
