import { Injectable } from '@nestjs/common';

@Injectable()
export class ChunkingService {
  chunkText(text: string, chunkSize = 1500, overlap = 200): string[] {
    const normalized = text.replace(/\r\n/g, '\n');

    const sections = normalized
      .split(/\n(?=#{2,3}\s|\*\*[A-Za-z]+\.\s)/)
      .map((s) => s.trim())
      .filter(Boolean);

    const chunks: string[] = [];

    const addChunk = (content: string) => {
      const trimmed = content.trim();
      if (trimmed) chunks.push(trimmed);
    };

    let current = '';

    for (const section of sections) {
      if (!current) {
        current = section;
        continue;
      }

      if (current.length + section.length <= chunkSize) {
        current += '\n\n' + section;
        continue;
      }

      addChunk(current);
      current = current.slice(-overlap) + '\n\n' + section;

      while (current.length > chunkSize * 1.5) {
        addChunk(current.slice(0, chunkSize));
        current = current.slice(chunkSize - overlap);
      }
    }

    if (current) addChunk(current);

    return chunks;
  }
}
