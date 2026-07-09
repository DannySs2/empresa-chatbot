# Chatbot RAG - Horbath Technologies

Chatbot con RAG (Retrieval-Augmented Generation) que responde preguntas sobre la documentación interna de Horbath Technologies usando IA local via Ollama + PostgreSQL/pgvector.

## Stack

| Componente | Tecnología |
|---|---|
| Backend | NestJS + TypeScript |
| Base de datos | PostgreSQL + pgvector |
| Embeddings | nomic-embed-text (Ollama) |
| LLM | Llama 3.2 3B (Ollama) |

## Requisitos

- Docker + Docker Compose
- Node.js 18+
- ~4GB RAM libres
- (Opcional) NVIDIA GPU con 4GB+ VRAM

## Instalación

### 1. Clonar e instalar dependencias

```bash
npm install
cp .env.example .env
```

### 2. Levantar infraestructura (Postgres + Ollama)

```bash
docker compose up -d
```

Esto levanta:
- **Postgres** con pgvector en `localhost:5432`
- **Ollama** en `http://localhost:11434`

### 3. Descargar modelos en Ollama

```bash
docker exec empresa_ollama ollama pull llama3.2:3b
docker exec empresa_ollama ollama pull nomic-embed-text
```

### 4. Iniciar el backend

```bash
npm run start:dev
```

### 6. Indexar los documentos

```bash
curl -X POST http://localhost:3000/chat/ingest
```

### 7. Probar

```bash
curl -X POST http://localhost:3000/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "¿Qué servicios ofrece Horbath?"}'
```

## API

### POST /chat/ask

```json
{
  "question": "¿Cuál es la dirección?",
  "history": []
}
```

Con historial:

```json
{
  "question": "¿y cuál es el teléfono?",
  "history": [
    {"role": "user", "content": "¿Cuál es la dirección?"},
    {"role": "assistant", "content": "Calle 77B #57-103, Barranquilla."}
  ]
}
```

### POST /chat/ingest

Reindexa todos los documentos de `docs-empresa/`.

### POST /chat/ingest/clear

Borra todo el índice.

## Documentos

Los archivos `.md` están en `docs-empresa/`:

| Archivo | Contenido |
|---|---|
| `empresa.md` | Quiénes somos, misión, propósito |
| `servicios.md` | Desarrollo, IA, RPA, SAP, BI, etc. |
| `tecnologias.md` | Stack tecnológico y perfiles TI |
| `contacto.md` | Dirección, teléfono, email |
| `carreras.md` | Beneficios y cultura laboral |
| `politicas-desarrollo-seguro.md` | Políticas de desarrollo seguro |

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/chat/ask` | Preguntar al chatbot |
| POST | `/chat/ingest` | Indexar documentos |
| POST | `/chat/ingest/clear` | Limpiar índice |
