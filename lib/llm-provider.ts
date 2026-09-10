import { GoogleGenerativeAI } from '@google/generative-ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set');
}

const google = createGoogleGenerativeAI({
  apiKey: GEMINI_API_KEY,
});

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

export async function generateQueryEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent({
    content: { role: 'user', parts: [{ text }] },
    outputDimensionality: 768,
  } as any);

  if (!result.embedding || !result.embedding.values) {
    throw new Error('No embedding values returned from Gemini API');
  }

  return result.embedding.values;
}

export function getChatModel() {
  return google('gemini-3.6-flash');
}
