# Plan de Demo — Chatbot RAG Horbath Technologies

> Asistente virtual con Retrieval-Augmented Generation (RAG) usando Llama 3.2 + PostgreSQL/pgvector + Ollama, con interfaz Open WebUI.
>
> **Propósito:** Este proyecto es un **chatbot de consulta exclusivo** para información institucional de **Horbath Technologies**. No es un LLM de propósito general ni un asistente conversacional abierto. Solo responde preguntas basadas en los documentos internos de la empresa (servicios, contacto, políticas, carreras, tecnologías). Si la información no está en los documentos, el chatbot no la responde. No entrena, no aprende de interacciones, no guarda historial persistente — cada consulta es independiente y acotada al corpus documental de Horbath.

---

## 1. Autenticación con Azure Active Directory (Microsoft Entra ID)

> **⚠️ No implementado actualmente.** Esta sección describe la integración futura.

### Objetivo
Integrar Azure AD (Microsoft Entra ID) como proveedor de identidad para que solo usuarios autorizados de Horbath accedan al chatbot, usando OAuth 2.0 / OpenID Connect.

### Implementación propuesta

**Backend (NestJS):**
- Usar `@nestjs/passport` + `passport-azure-ad` (estrategia `BearerStrategy`) para validar tokens JWT emitidos por Azure AD.
- Middleware `AzureADAuthGuard` protege las rutas del RAG (`/chat/ask`, `/chat/ingest`, etc.).
- El token JWT de Azure AD contiene: `name`, `preferred_username`, `roles` (grupos), `oid` (object ID).

**Flujo:**
```
Usuario → Login vía Azure AD (Microsoft Login) → Azure emite JWT →
  Cliente envía JWT en header Authorization →
  Backend valida JWT contra Azure AD (firma + audiencia + issuer) →
  Accede al RAG
```

**Configuración (`.env`):**
```env
AZURE_AD_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_AD_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_AD_CLIENT_SECRET=****
AZURE_AD_AUDIENCE=api://xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Integración con Open WebUI
Open WebUI soporta autenticación OIDC. Configurar:
```env
ENABLE_OIDC=true
OIDC_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
OIDC_CLIENT_SECRET=****
OIDC_PROVIDER_URL=https://login.microsoftonline.com/{TENANT_ID}/v2.0
OIDC_SCOPE=openid email profile
OIDC_CLAIM_EMAIL=preferred_username
```

---

## 2. Personalización

### Frontend (Open WebUI)
- **Logo y favicon:** Dockerfile.webui inyecta `logo.png`, `favicon.png`, `apple-touch-icon.png`.
- **CSS personalizado:** Se inyecta `custom.css` con colores y tipografía de la marca Horbath.
- **Nombre:** `WEBUI_NAME=Horbath AI`.
- **Modelo por defecto:** `WEBUI_DEFAULT_MODEL=Horbath IA`.

### System Prompt del RAG
El asistente se comporta según el `systemPrompt` definido en `rag.service.ts:60-68`:
- Responde en español, claro, directo, profesional.
- Solo responde con información del contexto recuperado.
- No inventa datos, no se disculpa, no hace preguntas.
- Máxima brevedad y concisión.

### Personalización futura propuesta
- **Tono configurable** por tenant/cliente (formal, casual, técnico).
- **Fuentes de conocimiento** configurables por carpeta de documentos.
- **Branding dinámico** (logos, colores) por cliente en la misma instancia.

---

## 3. Retrieval-Augmented Generation (RAG)

### Arquitectura

```
docs-empresa/*.md
       │
       ▼
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  ChunkingService │────▶│ EmbeddingsService │────▶│  PostgreSQL      │
│  (divide en      │     │ (nomic-embed-text │     │  + pgvector      │
│   fragmentos)    │     │  vía Ollama)      │     │  (almacena       │
│                  │     │                   │     │   embeddings)    │
└─────────────────┘     └──────────────────┘     └──────────────────┘
                                                          │
                    ┌─────────────────────────────────────┤
                    │                                     │
                    ▼                                     ▼
           ┌──────────────────┐                  ┌──────────────────┐
           │ Pregunta usuario  │                  │  Similarity      │
           │ (embedding query) │                  │  cosine search   │
           └──────────────────┘                  │  (top-K = 10)    │
                    │                            └──────────────────┘
                    ▼                                       │
           ┌──────────────────┐                              │
           │  RagService      │◀─────────────────────────────┘
           │  (arma prompt    │
           │   con contexto)  │
           └───────┬──────────┘
                   │
                   ▼
           ┌──────────────────┐
           │ Llama 3.2 3B     │
           │ (Ollama)         │
           │ → respuesta      │
           └──────────────────┘
```

### Componentes

| Servicio | Archivo | Función |
|---|---|---|
| `ChunkingService` | `src/rag/services/chunking.service.ts` | Divide archivos `.md` en fragmentos de ~1500 chars con solapamiento de 200 |
| `EmbeddingsService` | `src/rag/services/embeddings.service.ts` | Genera vectores de 768 dimensiones vía `nomic-embed-text` en Ollama |
| `IngestionService` | `src/rag/services/ingestion.service.ts` | Indexa documentos: chunk → embedding → guarda en PostgreSQL |
| `RagService` | `src/rag/services/rag.service.ts` | Recibe pregunta → embedding → `cosine similarity` → recupera top-K → arma prompt → Llama responde |

### Pipeline de indexación

1. **POST /chat/ingest** lee todos los `.md` de `docs-empresa/`.
2. `chunking.service.ts` divide cada archivo en fragmentos (tamaño 1500, overlap 200).
3. `embeddings.service.ts` genera embedding de 768d por fragmento usando `nomic-embed-text`.
4. `ingestion.service.ts` inserta en tabla `document_chunks` con `ON CONFLICT` (idempotente).

### Pipeline de consulta

1. **POST /chat/ask** recibe `{ question, history }`.
2. Se genera embedding de la pregunta.
3. `SELECT ... ORDER BY embedding <=> $1 LIMIT 10` (distancia coseno).
4. Filtra chunks con `similarity > 0.3` y valida que el máximo sea `>= 0.55`.
5. Arma `systemPrompt` con los fragmentos como contexto.
6. Envía a Ollama (`/api/chat`) con modelo `llama3.2:3b`.
7. Devuelve `{ answer, sources }`.

### Esquema PostgreSQL (`docker/init.sql`)

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS document_chunks (
    id SERIAL PRIMARY KEY,
    source_file TEXT NOT NULL,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(768),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS document_chunks_unique_idx
    ON document_chunks (source_file, chunk_index);
```

> **Nota:** Para datasets pequeños (<1000 chunks) NO se crea índice IVFFlat porque es contraproducente. Para >10,000 chunks habilitar con `lists = sqrt(num_chunks)`.

### Documentos fuente (`docs-empresa/`)

| Archivo | Contenido |
|---|---|
| `empresa.md` | Quiénes somos, misión, propósito |
| `servicios.md` | Desarrollo, IA, RPA, SAP, BI, etc. |
| `tecnologias.md` | Stack tecnológico y perfiles TI |
| `contacto.md` | Dirección, teléfono, email |
| `carreras.md` | Beneficios y cultura laboral |
| `politicas-desarrollo-seguro.md` | Políticas de desarrollo seguro |

### Compatibilidad API OpenAI

El endpoint `POST /v1/chat/completions` (`openai-compat.controller.ts`) permite que Open WebUI (o cualquier cliente OpenAI-compatible) consuma el RAG. Esto permite:
- Usar el backend como "modelo personalizado" en Open WebUI.
- Intercambiar el modelo sin cambiar el frontend.

---

## 4. Pruebas de Concurrencia

### Escenario esperado
Múltiples usuarios consultando el chatbot simultáneamente, todos compartiendo el mismo backend NestJS, PostgreSQL y Ollama.

### Riesgos identificados
1. **Ollama** — modelo cargado en GPU/CPU atiende peticiones secuencialmente si no se configura concurrencia.
2. **PostgreSQL** — lecturas concurrentes no son problema; escrituras concurrentes (ingest) deben serializarse.
3. **NestJS** — por defecto maneja peticiones concurrentes sin problema (single-threaded async).

### Plan de pruebas

#### Prueba 1: Consultas simultáneas (10 usuarios)
```
k6 run --vus 10 --duration 30s \
  -e URL=http://localhost:3000/chat/ask \
  concurrencia-ask.js
```
Métrica esperada: P95 < 5s, 0 errores.

#### Prueba 2: Ingest concurrente
```
k6 run --vus 3 --duration 10s concurrencia-ingest.js
```
Debe ser seguro por el `ON CONFLICT` y la transacción atómica.

#### Prueba 3: Mezcla (7 consultas + 1 ingest)
Validar que el ingest no degrade las consultas en curso.

### Configuración Ollama para concurrencia
```env
OLLAMA_NUM_PARALLEL=4   # hasta 4 peticiones simultáneas
OLLAMA_KEEP_ALIVE=-1    # mantener modelo cargado
```

### Herramientas sugeridas
- **k6** — pruebas de carga.
- **autocannon** — pruebas HTTP simples.
- **Docker stats** / `nvidia-smi` — monitoreo de recursos.

---

## 5. Pruebas de Uso y Respuesta

### Pruebas funcionales (calidad de respuesta)

| # | Pregunta | Respuesta esperada |
|---|---|---|
| 1 | ¿Qué servicios ofrece Horbath? | Listar servicios del documento `servicios.md` |
| 2 | ¿Cuál es la dirección? | Calle 77B #57-103, Barranquilla |
| 3 | ¿Cuál es el teléfono? | (605) 327 7371 |
| 4 | ¿Qué perfiles de TI ofrecen? | QA, PM, UX/UI, Developer, Security, Data |
| 5 | ¿Cuántos años de trayectoria tienen? | Más de 16 años |
| 6 | ¿Cuál es el propósito de la empresa? | Cerrar la brecha digital de las empresas |
| 7 | ¿Cuál es la política de desarrollo seguro? | Resumir políticas del manual |
| 8 | ¿Ofrecen servicios de RPA? | Sí, automatización robótica de procesos |
| 9 | ¿Cómo aplico para un trabajo? | Enviar hoja de vida a info@horbath.com |
| 10 | ¿Qué es Horbath Technologies? | Respuesta basada en `empresa.md` |

### Pruebas de límites

| # | Caso | Comportamiento esperado |
|---|---|---|
| 1 | Pregunta fuera de contexto | "No tengo información sobre eso en los documentos de la empresa." |
| 2 | Pregunta vacía | Validación 400 (class-validator) |
| 3 | Historia larga (20+ mensajes) | No degradar calidad de respuesta |
| 4 | Documento muy grande (>10k chars) | Chunking correcto sin perder contexto |
| 5 | Caracteres especiales / tildes | Embeddings deben manejarlos correctamente |

### Pruebas de integración

#### API directa
```bash
# Indexar documentos
curl -X POST http://localhost:3000/chat/ingest

# Preguntar
curl -X POST http://localhost:3000/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "¿Qué servicios ofrece Horbath?"}'

# Con historial
curl -X POST http://localhost:3000/chat/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "¿y cuál es el teléfono?",
    "history": [
      {"role": "user", "content": "¿Cuál es la dirección?"},
      {"role": "assistant", "content": "Calle 77B #57-103, Barranquilla."}
    ]
  }'

# Limpiar índice
curl -X POST http://localhost:3000/chat/ingest/clear
```

#### Open WebUI (interfaz gráfica)
- Abrir `http://localhost:3001`
- Seleccionar modelo "Horbath IA"
- Chatear normalmente — las preguntas se resuelven con RAG automáticamente

### Verificación de fuentes
Cada respuesta debe incluir `sources[]` con el nombre del archivo del cual se extrajo la información. Verificar que:
- Las fuentes correspondan al contenido real.
- No haya alucinaciones (información fuera de los documentos).
- El corte por similitud (`threshold 0.55`) no descarte respuestas válidas ni deje pasar falsos positivos.

---

## Arquitectura del despliegue

```
                    ┌──────────────────────┐
                    │    Open WebUI         │
                    │  (interfaz gráfica)   │
                    │  localhost:3001       │
                    └──────────┬───────────┘
                               │ HTTP (API compatible OpenAI)
                               ▼
                    ┌──────────────────────┐
                    │   NestJS Backend      │
                    │   localhost:3000      │
                    │   /chat/ask           │
                    │   /chat/ingest        │
                    │   /v1/chat/completions│
                    │   /auth/login         │ ← Azure AD OIDC
                    └──────┬────────┬──────┘
                           │        │
                           ▼        ▼
              ┌────────────────┐  ┌────────────────┐
              │   PostgreSQL   │  │    Ollama       │
              │   + pgvector   │  │   llama3.2:3b   │
              │   :5432        │  │   nomic-embed   │
              └────────────────┘  │   :11434        │
                                 └────────────────┘
```

### Infraestructura (Docker Compose)

```yaml
Servicios:
  - postgres: pgvector/pgvector:pg16
  - ollama: ollama/ollama:latest
  - open-webui: horbath-webui (custom con branding)
  - backend: NestJS (fuera de Docker en dev)
```

Volúmenes persistentes: `pgdata`, `ollama_data`, `openwebui_data`.

---

## 6. Infraestructura Requerida

### Local (desarrollo / demo)

| Recurso | Especificación mínima | Justificación |
|---|---|---|
| CPU | 4 cores (x86_64) | NestJS + Ollama (inferencia) |
| RAM | 8 GB libres | ~4 GB para Ollama (Llama 3.2 3B), ~2 GB para Postgres, ~1 GB para NestJS |
| Disco | 20 GB SSD | Modelos Ollama (~2.5 GB c/u), imágenes Docker, datos PostgreSQL |
| GPU | Opcional (NVIDIA 4GB+ VRAM) | Acelera inferencia 3-5x vs CPU |
| SO | Linux (Ubuntu 22.04+), Windows (WSL2) o macOS | Docker requerido |
| Docker | 24+ | Contenedores Postgres + Ollama + Open WebUI |
| Node.js | 18+ | Backend NestJS |

### Producción (AWS)

| Servicio | SKU/Plan propuesto | Propósito |
|---|---|---|
| **EC2** (o ECS Fargate) | `t3a.xlarge` (4 vCPU, 16 GB RAM) — o `g4dn.xlarge` si se usa GPU | Backend NestJS + Ollama |
| **RDS PostgreSQL** | `db.t3.medium` (2 vCPU, 8 GB RAM, 100 GB gp3) | Base de datos + pgvector |
| **AWS Directory Service** (o Cognito) | Microsoft AD Managed o Cognito User Pools | Autenticación OAuth2 / OIDC |
| **ECR** (Elastic Container Registry) | Almacenar imágenes Docker customizadas | |
| **Secrets Manager** | $0.40/secret/mes | Secretos, claves JWT, credenciales |
| **CloudWatch** | Pay-as-you-go | Logs, métricas, alertas |
| **Application Load Balancer** | 1 ALB + target group | Balanceo HTTPS hacia el backend |
| **Route 53** | Hosted Zone pública | DNS del chatbot |

> **Alternativa serverless:** Sustituir EC2 por **ECS Fargate** o **App Runner** para el backend NestJS, y usar **Amazon Bedrock** (Llama 3 via AWS) en vez de Ollama para eliminar la GPU.

### Red

```
Internet
    │
    ▼
┌─────────────────────────────────────────┐
│  AWS VPC                                 │
│                                          │
│  ┌─────────────┐  ┌──────────────────┐  │
│  │  ALB (HTTPS) │──│  Target Group    │  │
│  │  :443 → :3000│  │  Backend NestJS  │  │
│  └─────────────┘  └───────┬──────────┘  │
│                          │               │
│          ┌───────────────┼───────┐       │
│          ▼               ▼       │       │
│  ┌────────────┐  ┌────────────┐  │       │
│  │ RDS        │  │  EC2       │  │       │
│  │ PostgreSQL │  │  Ollama    │  │       │
│  │ :5432      │  │  :11434    │  │       │
│  │ (privada)  │  │  (privada) │  │       │
│  └────────────┘  └────────────┘  │       │
│                                   │       │
│  ┌────────────────────────────────┘       │
│  │  Secrets Manager / Parameter Store     │
│  └─────────────────────────────────────── │
│                                           │
└───────────────────────────────────────────┘
    │
    ▼
┌──────────────┐
│  Route 53    │
│  chatbot.    │
│  horbath.com │
└──────────────┘
```

### Seguridad de red (security groups)

| Grupo | Reglas |
|---|---|
| **ALB** | Entrante: 443 (HTTPS) desde 0.0.0.0/0 |
| **Backend EC2/ECS** | Entrante: 3000 solo desde ALB |
| **Ollama EC2** | Entrante: 11434 solo desde backend |
| **RDS PostgreSQL** | Entrante: 5432 solo desde backend |
| **Open WebUI** | Entrante: 443 desde 0.0.0.0/0 (o CloudFront) |

### Componentes Docker

| Servicio | Imagen | Puerto | Persistencia |
|---|---|---|---|
| PostgreSQL | `pgvector/pgvector:pg16` | 5432 | Volumen `pgdata` |
| Ollama | `ollama/ollama:latest` | 11434 | Volumen `ollama_data` |
| Open WebUI | `horbath-webui:latest` (custom) | 3001 → 8080 | Volumen `openwebui_data` |
| Backend NestJS | `empresa-backend` (build local) | 3000 | — |

### Volúmenes persistentes

```yaml
volumes:
  pgdata:          # ~200 MB datos + embeddings
  ollama_data:     # ~5 GB modelos (llama3.2 + nomic-embed)
  openwebui_data:  # ~100 MB configuraciones de usuarios
```

### Variables de entorno clave

```env
# Postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=empresa
DB_PASSWORD=empresa_pass
DB_NAME=empresa_chatbot

# Ollama
OLLAMA_URL=http://localhost:11434
EMBEDDING_MODEL=nomic-embed-text
CHAT_MODEL=llama3.2:3b

# Concurrencia Ollama
OLLAMA_NUM_PARALLEL=4
OLLAMA_KEEP_ALIVE=-1

# AWS Cognito / Directory Service (futuro)
COGNITO_USER_POOL_ID=
COGNITO_CLIENT_ID=
COGNITO_REGION=us-east-1

# JWT (futuro, para Cognito)
JWT_SECRET=
```

---

## Stack Tecnológico

| Componente | Tecnología | Versión |
|---|---|---|
| Backend | NestJS + TypeScript | 10.x |
| Base de datos | PostgreSQL + pgvector | PG16 |
| Embeddings | nomic-embed-text (Ollama) | Última |
| LLM | Llama 3.2 3B (Ollama) | 3.2 |
| Frontend | Open WebUI (custom) | main |
| Autenticación | Azure AD (Microsoft Entra ID) OIDC | Pendiente |
| Contenedores | Docker Compose | 3.x |

---

## Próximos pasos (roadmap)

- [ ] **Fase 1 — Base actual:** RAG funcional con documentos `.md`, Llama 3.2, pgvector.
- [ ] **Fase 2 — Autenticación:** Integrar Azure AD (OIDC) + JWT, proteger endpoints.
- [ ] **Fase 3 — Monitoreo:** Agregar logs estructurados, métricas de latencia, dashboard.
- [ ] **Fase 4 — Escalabilidad:** Evaluar índice IVFFlat para >10k chunks, caché de embeddings frecuentes, cola de mensajes para ingest pesado.
- [ ] **Fase 5 — Multi-tenant:** Carpetas de documentos por cliente, aislamiento de contexto.
