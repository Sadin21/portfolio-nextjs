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
const SYSTEM_PERSONA = `Kamu adalah AI Assistant yang merepresentasikan Daffa, seorang Fullstack Software Engineer dengan 3 tahun pengalaman kerja di industri digital logistik.

ATURAN UTAMA:
1. Jawab HANYA berdasarkan konteks yang diberikan di bawah. Jangan mengarang informasi yang tidak ada di konteks.
2. Jika informasi tidak tersedia di konteks, katakan dengan jujur: "Aku belum punya info detail soal itu, tapi kamu bisa hubungi Daffa langsung di [masukkan link LinkedIn atau email dari konteks]."
3. Gunakan kata ganti "dia" atau sebut nama Daffa, JANGAN gunakan "aku" seolah-olah kamu adalah Daffa — kamu adalah asisten yang merepresentasikan dia.
4. Tolak dengan sopan pertanyaan di luar topik profil/karier/project Daffa. Arahkan kembali ke topik portofolio.
5. ATURAN WAJIB KARTU PROYEK [CARD:slug]:
   - Setiap kali pengguna menanyakan atau meminta penjelasan tentang proyek spesifik Daffa, kamu WAJIB menyertakan tag kartu proyek berikut:
     * [CARD:project-payment] -> untuk Proyek Integrasi Payment Virtual Account SNAP BI 5 Bank.
     * [CARD:project-blast-unblast] -> untuk Proyek Blasting & Unblasting PO/DO (Automated Refund & Concurrency).
     * [CARD:project-monitoring-utility] -> untuk Proyek Monitoring Utility Armada & Driver (Spreadsheet Matrix 31 Hari).
     * [CARD:project-business-development] -> untuk Inisiatif Technical Business Development, Client Outreach & Onboarding.
     * [CARD:project-po-pack-koli] -> untuk Proyek R&D & Modul PO/DO Multi-Item (Pack/Koli Furnitur).
   - STRUKTUR JAWABAN WAJIB (SANGAT PENTING):
     1. Tulis 1 atau 2 kalimat pengantar singkat yang merangkum proyek tersebut.
     2. Di baris baru tersendiri, WAJIB tuliskan tag kartu proyek: [CARD:slug]
     3. Tulis 1 kalimat penutup yang ramah untuk mengundang pengguna bertanya lebih dalam jika tertarik.
   - PENTING / DILARANG KERAS: JANGAN menuliskan kembali seluruh rincian proyek dalam bentuk poin-poin panjang (seperti masalah bisnis, tech stack, atau tantangan teknis poin 1, 2, 3). Seluruh informasi tersebut SUDAH dimuat di dalam kartu proyek. Cukup tampilkan kartu tersebut!
   - JANGAN tampilkan tag kartu proyek untuk pertanyaan umum (misalnya pertanyaan seputar skill/keahlian, bio, kontak).
   - Jika pengguna bertanya hal teknis mendalam sebagai pertanyaan lanjutan (follow-up), barulah jelaskan secara mendalam menggunakan teks DAN JANGAN sertakan tag kartu lagi.

CONTOH JAWABAN YANG BENAR:
Pengguna: "jelaskan proyek integrasi sistem pembayaran"
Jawaban:
Daffa memimpin integrasi langsung (*direct connection*) Virtual Account ke 5 bank nasional (BCA, BNI, BRI, Mandiri, DBS) berbasis standar SNAP BI guna memangkas biaya transaksi perantara dan memastikan zero double-pay.

[CARD:project-payment]

Apakah ada aspek teknis tertentu yang ingin kamu ketahui lebih lanjut, seperti arsitektur keamanan atau mekanisme idempotency-nya?

6. Gaya bahasa: profesional tapi hangat, ringkas, langsung pada inti.

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

    // 2. Concurrent Pre-LLM Operations (Parallel I/O via Promise.all)
    const startTime = performance.now();

    // Task A: Rate Limiting
    const rateLimitPromise = supabaseServer.rpc('check_rate_limit', {
      client_ip: ip,
      max_requests: 15,
      window_minutes: 10,
    });

    // Task B: Semantic Retrieval (Embedding + pgvector Search)
    const ragPromise = (async () => {
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
          return { contextText: '', retrievedChunkIds: [] as string[] };
        }

        if (chunks && chunks.length > 0) {
          return {
            retrievedChunkIds: chunks.map((c: any) => c.id as string),
            contextText: chunks.map((c: any) => `--- SECTION: ${c.section_title} ---\n${c.content}`).join('\n\n'),
          };
        }
      } catch (e) {
        console.error('Embedding/Retrieval error:', e);
      }
      return { contextText: '', retrievedChunkIds: [] as string[] };
    })();

    // Task C: Session & Chat History Management
    const sessionPromise = (async () => {
      let sessionId: string | null = null;
      let historyMessages: ChatMessage[] = [];

      try {
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
          sessionId = newSession?.id || null;
        }

        if (sessionId) {
          const { data: historyData } = await supabaseServer
            .from('chat_messages')
            .select('role, content')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: false })
            .limit(6); // last 3 turns

          if (historyData) {
            historyMessages = historyData.reverse().map((msg: any) => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
            }));
          }
        }
      } catch (e) {
        console.error('Session/History lookup error:', e);
      }

      return { sessionId, historyMessages };
    })();

    // Await all concurrent tasks simultaneously
    const [rateLimitResult, { contextText, retrievedChunkIds }, { sessionId, historyMessages }] =
      await Promise.all([rateLimitPromise, ragPromise, sessionPromise]);

    const preLlmDuration = (performance.now() - startTime).toFixed(1);
    console.log(`[API Latency] Pre-LLM concurrent operations completed in: ${preLlmDuration}ms`);

    // Verify Rate Limit Result
    const { data: isAllowed, error: rateLimitError } = rateLimitResult;
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
        'Server-Timing': `pre_llm;dur=${preLlmDuration}`,
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);

    const errMsg = (error?.message || '').toLowerCase();
    const isTokenOrQuotaExhausted =
      errMsg.includes('429') ||
      errMsg.includes('quota') ||
      errMsg.includes('resource_exhausted') ||
      errMsg.includes('rate limit') ||
      errMsg.includes('rate_limit') ||
      errMsg.includes('insufficient_quota') ||
      errMsg.includes('credit') ||
      errMsg.includes('token') ||
      error?.status === 429;

    if (isTokenOrQuotaExhausted) {
      return createErrorResponse(
        'Mohon maaf, kuota token AI harian untuk portofolio ini saat ini sedang mencapai batas. Kamu tetap bisa menghubungi Daffa secara langsung melalui LinkedIn atau Email untuk berdiskusi lebih lanjut.',
        'TOKEN_QUOTA_EXHAUSTED',
        429
      );
    }

    return createErrorResponse(
      'Terjadi kesalahan internal pada server AI. Silakan coba beberapa saat lagi.',
      'INTERNAL_SERVER_ERROR',
      500
    );
  }
}
