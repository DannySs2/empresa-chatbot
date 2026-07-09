import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RagModule } from './rag/rag.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'empresa',
      password: process.env.DB_PASSWORD || 'empresa_pass',
      database: process.env.DB_NAME || 'empresa_chatbot',
      // No usamos entities de TypeORM para document_chunks porque
      // el tipo `vector` de pgvector se maneja mejor con SQL crudo (ver rag.service.ts)
      entities: [],
      synchronize: false, // la tabla se crea vía docker/init.sql
    }),
    RagModule,
  ],
})
export class AppModule {}
