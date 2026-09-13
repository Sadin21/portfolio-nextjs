import { GoogleGenerativeAI } from '@google/generative-ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

// 1. Embedding Model Setup (Always Google Gemini 768-dim for Supabase Vector Search)
const EMBEDDING_API_KEY =
  process.env.EMBEDDING_API_KEY ||
  process.env.GEMINI_API_KEY ||
  (process.env.LLM_PROVIDER === 'gemini' ? process.env.LLM_API_KEY : '');

export async function generateQueryEmbedding(text: string): Promise<number[]> {
  if (!EMBEDDING_API_KEY) {
    throw new Error('EMBEDDING_API_KEY (or GEMINI_API_KEY) is required for 768-dimension vector search');
  }

  const genAI = new GoogleGenerativeAI(EMBEDDING_API_KEY);
  const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

  const result = await embeddingModel.embedContent({
    content: { role: 'user', parts: [{ text }] },
    outputDimensionality: 768,
  } as any);

  if (!result.embedding || !result.embedding.values) {
    throw new Error('No embedding values returned from Gemini API');
  }

  return result.embedding.values;
}

// 2. Chat Model Setup (Switchable between OpenRouter & Gemini)
export function getChatModel() {
  const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase().trim();
  const modelName = process.env.LLM_MODEL;

  if (provider === 'openrouter') {
    const apiKey = process.env.LLM_API_KEY;
    if (!apiKey) {
      throw new Error('LLM_API_KEY is required when LLM_PROVIDER is "openrouter"');
    }

    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey,
    });

    return openrouter.chat(modelName || 'nvidia/nemotron-3.5-lightning:free');
  } else if (provider === 'gemini') {
    const apiKey = process.env.LLM_API_KEY || process.env.EMBEDDING_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('LLM_API_KEY or EMBEDDING_API_KEY is required for Gemini chat');
    }

    const google = createGoogleGenerativeAI({
      apiKey,
    });

    return google(modelName || 'gemini-3.6-flash');
  } else {
    throw new Error(`Unsupported LLM_PROVIDER: "${provider}". Supported values are "gemini" or "openrouter".`);
  }
}
