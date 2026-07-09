import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { ChunkingService } from './chunking.service';
import { EmbeddingsService } from './embeddings.service';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private chunking: ChunkingService,
    private embeddings: EmbeddingsService,
  ) {}

  async ingestFolder(folderPath: string): Promise<{ files: number; chunks: number }> {
    const files = fs
      .readdirSync(folderPath)
      .filter((f) => f.endsWith('.md') || f.endsWith('.txt'));

    let totalChunks = 0;

    for (const file of files) {
      const fullPath = path.join(folderPath, file);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const chunks = this.chunking.chunkText(content);

      this.logger.log(`Indexando "${file}" (${chunks.length} chunks)`);

      for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i];
        const embedding = await this.embeddings.embed(chunkText);

        const vectorLiteral = `[${embedding.join(',')}]`;

        await this.dataSource.query(
          `INSERT INTO document_chunks (source_file, chunk_index, content, embedding)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (source_file, chunk_index)
           DO UPDATE SET content = EXCLUDED.content, embedding = EXCLUDED.embedding`,
          [file, i, chunkText, vectorLiteral],
        );

        totalChunks++;
      }
    }

    return { files: files.length, chunks: totalChunks };
  }

  async clearAll(): Promise<void> {
    await this.dataSource.query('TRUNCATE TABLE document_chunks RESTART IDENTITY');
  }
}
