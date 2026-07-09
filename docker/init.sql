-- Habilita la extensión de vectores
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabla que guarda cada "chunk" (pedazo) de documento + su embedding
CREATE TABLE IF NOT EXISTS document_chunks (
    id SERIAL PRIMARY KEY,
    source_file TEXT NOT NULL,          -- ej: "manual-ventas.md"
    chunk_index INT NOT NULL,           -- orden del chunk dentro del archivo
    content TEXT NOT NULL,              -- el texto real del chunk
    embedding VECTOR(768),              -- dimensión del modelo nomic-embed-text
    created_at TIMESTAMP DEFAULT NOW()
);

-- NOTA: Para datasets pequeños (<1000 chunks) NO crear índice IVFFlat.
-- El índice es contraproducente con pocos datos porque el número de listas
-- (lists) no se puede ajustar bien y el probe por defecto es 1, lo que hace
-- que el índice devuelva 0 resultados.
--
-- Cuando tengas >10.000 chunks, crea el índice con:
--   lists = sqrt(num_chunks)  → ej: 100 listas para 10.000 chunks
--   SET ivfflat.probes = sqrt(num_lists) → ej: 10
--
-- CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
--     ON document_chunks
--     USING ivfflat (embedding vector_cosine_ops)
--     WITH (lists = 100);

-- Evita duplicar el mismo chunk del mismo archivo al re-indexar
CREATE UNIQUE INDEX IF NOT EXISTS document_chunks_unique_idx
    ON document_chunks (source_file, chunk_index);
