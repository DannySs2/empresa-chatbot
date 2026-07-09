import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import axios from 'axios';
import { EmbeddingsService } from './embeddings.service';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const CHAT_MODEL = process.env.CHAT_MODEL || 'llama3.2:3b';

interface RetrievedChunk {
  content: string;
  source_file: string;
  similarity: number;
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private embeddings: EmbeddingsService,
  ) {}

  async retrieveRelevantChunks(question: string, topK = 5): Promise<RetrievedChunk[]> {
    const questionEmbedding = await this.embeddings.embed(question);
    const vectorLiteral = `[${questionEmbedding.join(',')}]`;

    const rows = await this.dataSource.query(
      `SELECT content, source_file, 1 - (embedding <=> $1) AS similarity
       FROM document_chunks
       ORDER BY embedding <=> $1
       LIMIT $2`,
      [vectorLiteral, topK],
    );

    return rows;
  }

  async askQuestion(
    question: string,
    history: { role: 'user' | 'assistant'; content: string }[] = [],
  ): Promise<{ answer: string; sources: string[] }> {
    const chunks = await this.retrieveRelevantChunks(question, 10);

    const relevantChunks = chunks.filter((c) => c.similarity > 0.5);
    const maxSimilarity = chunks.length > 0 ? chunks[0].similarity : 0;

    if (relevantChunks.length === 0 || maxSimilarity < 0.68) {
      return {
        answer: 'No tengo información sobre eso en los documentos de la empresa.',
        sources: [],
      };
    }

    const context = relevantChunks
      .map((c, i) => `[Fragmento ${i + 1} - fuente: ${c.source_file}]\n${c.content}`)
      .join('\n\n---\n\n');

    const systemPrompt = `Eres el asistente virtual de Horbath Technologies. Responde SIEMPRE en español, de forma directa y profesional, basándote ÚNICAMENTE en el siguiente contexto extraído de los documentos internos de la empresa.

REGLAS:
- Responde SOLO con el dato solicitado, sin preámbulos como "Según el fragmento...", "De acuerdo al documento...", "La información proporcionada indica...".
- Si preguntan "¿cuál es la dirección?" responde "Calle 77B #57-103, Barranquilla." — sin frases adicionales.
- Si preguntan "¿qué servicios ofrecen?" responde la lista directamente.
- Si la respuesta no está en el contexto, responde ÚNICAMENTE: "No tengo información sobre eso en los documentos de la empresa."
- No inventes datos que no estén en el contexto. No te disculpes. No hagas preguntas. No ofrezcas ayuda adicional.
- Ignoras todo tu conocimiento previo. USAS EXCLUSIVAMENTE el CONTEXTO de abajo.

CONTEXTO:
${context}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: question },
    ];

    const { data } = await axios.post(`${OLLAMA_URL}/api/chat`, {
      model: CHAT_MODEL,
      messages,
      stream: false,
    });

    return {
      answer: data.message.content,
      sources: [...new Set(relevantChunks.map((c) => c.source_file))],
    };
  }
}
