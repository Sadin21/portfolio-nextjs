import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables from .env.local first, then fallback to .env
dotenv.config({ path: '.env.local' });
dotenv.config();

interface ChunkData {
  content: string;
  source_file: string;
  section_title: string;
  content_type: string;
  metadata: Record<string, any>;
}

// Ensure required environment variables are set
const EMBEDDING_KEY = process.env.EMBEDDING_API_KEY || process.env.LLM_API_KEY || process.env.GEMINI_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!EMBEDDING_KEY) {
  console.error('❌ Error: EMBEDDING_API_KEY (or LLM_API_KEY/GEMINI_API_KEY) is not defined in .env.local');
  process.exit(1);
}

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL is not defined in .env.local');
  process.exit(1);
}

// Initialize Gemini SDK & Postgres Pool
const genAI = new GoogleGenerativeAI(EMBEDDING_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
const pool = new Pool({ connectionString: DATABASE_URL });

const KNOWLEDGE_BASE_DIR = path.resolve(process.cwd(), 'knowledge-base');
const THROTTLE_DELAY_MS = 500; // Delay between embedding calls to prevent rate limit issues

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Infer content_type based on filename and section title
 */
function inferContentType(fileName: string, sectionTitle: string): string {
  const lowerTitle = sectionTitle.toLowerCase();
  const lowerFile = fileName.toLowerCase();

  if (lowerTitle.includes('faq')) {
    return 'faq';
  }
  if (lowerFile.includes('project')) {
    return 'project';
  }
  if (lowerFile.includes('skill')) {
    return 'skill';
  }
  if (lowerFile.includes('profile')) {
    return 'profile';
  }
  if (lowerFile.includes('experience')) {
    return 'experience';
  }
  return 'general';
}

/**
 * Parse a markdown file into semantic chunks using ## and ### headings
 */
function parseMarkdownToChunks(filePath: string): ChunkData[] {
  const fileName = path.basename(filePath);
  const rawContent = fs.readFileSync(filePath, 'utf-8');

  // Extract top-level document heading (## Heading)
  const docTitleMatch = rawContent.match(/^##\s+([^\n]+)/m);
  const docTitle = docTitleMatch ? docTitleMatch[1].trim() : fileName.replace('.md', '');

  // Regex to match level-3 sections (### Title \n Content...)
  const sectionRegex = /(?:^|\n)###\s+([^\n]+)\n([\s\S]*?)(?=(?:\n###\s+|$))/g;
  const chunks: ChunkData[] = [];

  let match: RegExpExecArray | null;
  while ((match = sectionRegex.exec(rawContent)) !== null) {
    const sectionTitle = match[1].trim();
    let sectionBody = match[2].trim();

    if (!sectionBody) continue;

    // Check for special tags like [CARD:slug]
    const cardMatch = sectionBody.match(/\[CARD:([a-zA-Z0-9_-]+)\]/);
    const cardSlug = cardMatch ? cardMatch[1] : null;

    const metadata: Record<string, any> = {
      source_file: fileName,
      section_title: sectionTitle,
      doc_title: docTitle,
    };

    if (cardSlug) {
      metadata.card_slug = cardSlug;
    }

    const contentType = inferContentType(fileName, sectionTitle);

    // Prefix content with document context so embedding captures semantic meaning
    const enrichedContent = `[${docTitle}] ### ${sectionTitle}\n\n${sectionBody}`;

    chunks.push({
      content: enrichedContent,
      source_file: fileName,
      section_title: sectionTitle,
      content_type: contentType,
      metadata,
    });
  }

  return chunks;
}

/**
 * Generate 768-dimensional vector embedding for a given text
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent({
    content: { role: 'user', parts: [{ text }] },
    outputDimensionality: 768,
  } as any);

  if (!result.embedding || !result.embedding.values) {
    throw new Error('No embedding values returned from Gemini API');
  }

  return result.embedding.values;
}

/**
 * Main Indexing Workflow
 */
async function main() {
  console.log('🚀 Starting Knowledge Base Indexing Script...\n');
  console.log(`📁 Knowledge base directory: ${KNOWLEDGE_BASE_DIR}`);

  if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) {
    console.error(`❌ Directory not found: ${KNOWLEDGE_BASE_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(KNOWLEDGE_BASE_DIR).filter((f) => f.endsWith('.md'));
  if (files.length === 0) {
    console.log('⚠️ No markdown files found in knowledge-base/');
    process.exit(0);
  }

  console.log(`📄 Found ${files.length} markdown file(s): ${files.join(', ')}\n`);

  const client = await pool.connect();
  let totalIndexed = 0;

  try {
    for (const file of files) {
      const filePath = path.join(KNOWLEDGE_BASE_DIR, file);
      const chunks = parseMarkdownToChunks(filePath);

      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📖 Processing: ${file} (${chunks.length} sections found)`);

      if (chunks.length === 0) {
        console.log(`⚠️ No ### sections found in ${file}, skipping.`);
        continue;
      }

      // Begin idempotent transaction per file
      await client.query('BEGIN');

      // Step 1: Idempotent deletion of existing chunks for this source_file
      const deleteRes = await client.query(
        'DELETE FROM knowledge_chunks WHERE source_file = $1',
        [file]
      );
      if (deleteRes.rowCount && deleteRes.rowCount > 0) {
        console.log(`   🗑️  Deleted ${deleteRes.rowCount} previous chunk(s) for ${file}`);
      }

      // Step 2: Generate embedding & insert each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`   ⏳ [${i + 1}/${chunks.length}] Embedding "${chunk.section_title}"...`);

        const embeddingValues = await generateEmbedding(chunk.content);
        const vectorString = `[${embeddingValues.join(',')}]`;

        await client.query(
          `INSERT INTO knowledge_chunks 
           (content, embedding, source_file, section_title, content_type, metadata)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            chunk.content,
            vectorString,
            chunk.source_file,
            chunk.section_title,
            chunk.content_type,
            JSON.stringify(chunk.metadata),
          ]
        );

        totalIndexed++;

        // Throttle to respect Gemini rate limits
        if (i < chunks.length - 1) {
          await sleep(THROTTLE_DELAY_MS);
        }
      }

      // Commit transaction for this file
      await client.query('COMMIT');
      console.log(`   ✅ Successfully indexed ${chunks.length} chunk(s) from ${file}\n`);
    }

    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🎉 Indexing completed successfully! Total chunks indexed: ${totalIndexed}\n`);

    // Verify current counts in PostgreSQL
    const countRes = await client.query(`
      SELECT source_file, content_type, count(*) as chunk_count 
      FROM knowledge_chunks 
      GROUP BY source_file, content_type
      ORDER BY source_file;
    `);

    console.log('📊 Current Database Summary:');
    console.table(countRes.rows);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error during indexing process:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
