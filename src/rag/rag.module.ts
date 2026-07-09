import { Module } from '@nestjs/common';
import { ChatController } from './controllers/chat.controller';
import { OpenAICompatController } from './controllers/openai-compat.controller';
import { RagService } from './services/rag.service';
import { IngestionService } from './services/ingestion.service';
import { EmbeddingsService } from './services/embeddings.service';
import { ChunkingService } from './services/chunking.service';

@Module({
  controllers: [ChatController, OpenAICompatController],
  providers: [RagService, IngestionService, EmbeddingsService, ChunkingService],
})
export class RagModule {}
