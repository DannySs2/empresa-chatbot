import { Body, Controller, Post } from '@nestjs/common';
import { RagService } from '../services/rag.service';
import { IngestionService } from '../services/ingestion.service';
import { AskQuestionDto, IngestFolderDto } from '../dto';
import * as path from 'path';

@Controller('chat')
export class ChatController {
  constructor(
    private ragService: RagService,
    private ingestionService: IngestionService,
  ) {}

  @Post('ask')
  async ask(@Body() dto: AskQuestionDto) {
    const result = await this.ragService.askQuestion(dto.question, dto.history || []);
    return result;
  }

  @Post('ingest')
  async ingest(@Body() dto: IngestFolderDto) {
    const folder = dto.folderPath || path.join(process.cwd(), 'docs-empresa');
    const result = await this.ingestionService.ingestFolder(folder);
    return { message: 'Indexación completa', ...result };
  }

  @Post('ingest/clear')
  async clear() {
    await this.ingestionService.clearAll();
    return { message: 'Índice borrado' };
  }
}
