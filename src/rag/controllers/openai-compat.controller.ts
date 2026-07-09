import { Body, Controller, Get, Post } from '@nestjs/common';
import { RagService } from '../services/rag.service';

const MODEL_ID = process.env.CHAT_MODEL || 'Horbath IA';

@Controller('v1')
export class OpenAICompatController {
  constructor(private ragService: RagService) {}

  @Get('models')
  listModels() {
    return {
      object: 'list',
      data: [
        {
          id: MODEL_ID,
          object: 'model',
          created: Math.floor(Date.now() / 1000),
          owned_by: 'empresa',
        },
      ],
    };
  }

  @Post('chat/completions')
  async chatCompletions(@Body() body: any) {
    const messages = body.messages || [];

    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    const question = lastUserMessage?.content || '';

    const history = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(0, -1)
      .map((m) => ({ role: m.role, content: m.content }));

    const result = await this.ragService.askQuestion(question, history);

    return {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: MODEL_ID,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: result.answer,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    };
  }
}
