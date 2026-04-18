---
last-updated: 2026-04-17
---

# Integración Multimedia — Attachments en el Pipeline QA

> Fuente canónica de la integración de upload multimedia. Consumida por agentes en runtime.

## Qué resuelve

El pipeline captura screenshots de fallos Jest y los sube como attachments a Jira mediante la REST API directa. El MCP Atlassian (`@sooperset/mcp-atlassian`) **no soporta upload de attachments** en este entorno — la solución es un módulo TypeScript en `src/core/jira/`.

## Módulo TypeScript

```
src/core/jira/
├── JiraApiClient.ts        ← cliente HTTP con auth Basic + header X-Atlassian-Token
├── JiraAttachmentUploader.ts ← upload() y uploadMany() con FormData nativo (Node 18+)
└── index.ts                ← re-exports
```

Tipos soportados: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.mp4`. Cap configurable vía `JIRA_ATTACHMENT_MAX_MB` (default 10MB).

## Flujo de integración (Fase F2.5)

```
test-engine → screenshots[] en test_engine_output
       ↓
test-reporter → attachments[] en payload para jira-writer
       ↓
jira-writer FASE F2.5:
  1. uploadMany(ticket_key, payload.attachments)
  2. Recibe attachment_results[] con contentUrl por cada archivo
  3. Agrega nodo ADF inlineCard por cada upload exitoso
  4. Postea comentario normalmente (fallo de upload no bloquea)
```

## Schema v3.1

Ver contrato completo en `wiki/qa/pipeline-integration-schema.md` § Campos de multimedia (v3.1).

Campos nuevos en el payload test-reporter → jira-writer:
- `attachments[]`: `{ path, label, linkedTestName }`
- `attachment_results[]` (output jira-writer): `{ label, attachmentId, filename, contentUrl, status }`

Nodo ADF para attachments subidos:
```json
{ "type": "inlineCard", "attrs": { "url": "<contentUrl>" } }
```

## Módulo TypeScript — API pública

### `JiraApiClient`

```typescript
class JiraApiClient {
  constructor(config: { baseUrl: string; email: string; apiToken: string })
  
  // Sube un único archivo como attachment a un ticket Jira
  async uploadAttachment(ticketKey: string, filePath: string, filename: string): Promise<AttachmentResult>
}
```

### `JiraAttachmentUploader`

```typescript
class JiraAttachmentUploader {
  constructor(client: JiraApiClient)
  
  // Sube múltiples attachments y devuelve resultados individuales
  async uploadMany(ticketKey: string, attachments: AttachmentInput[]): Promise<AttachmentResult[]>
}

interface AttachmentInput {
  path: string        // path relativo desde raíz del proyecto
  label: string       // ej: "Screenshot_shouldUploadVideo"
  linkedTestName: string
}

interface AttachmentResult {
  label: string
  attachmentId: string
  filename: string
  contentUrl: string
  status: "uploaded" | "failed"
  error?: string      // solo si failed
}
```

### Autenticación

`JiraApiClient` usa Basic Auth con header `X-Atlassian-Token: no-check` (requerido por Atlassian para upload de attachments).

## Decisiones clave

| ID | Decisión |
|----|----------|
| D-01 | Nodo ADF `inlineCard` — renderiza como card clickeable nativa |
| D-02 | Variables en `.env` + `dotenv` en `JiraApiClient` — token centralizado |
| D-03 | `FormData` y `Blob` nativos Node 18 — sin package `form-data` |
| D-04 | Auth: Basic Auth (email:token en base64) + `X-Atlassian-Token: no-check` — requerido por Atlassian REST API v3 para multipart |
| D-05 | Timeout configurable por archivo — default 30s para evitar cuelgues en uploads grandes |
| D-06 | Validar tipo MIME antes de upload: solo `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.mp4` |
| D-07 | Validar tamaño antes de upload contra `JIRA_ATTACHMENT_MAX_MB` — rechazar si excede |
| D-08 | Si upload falla → comentario se postea igual con aviso de texto (no bloquear el reporte) |
| D-09 | Un fallo parcial (algunos uploads OK, otros no) → postear con los uploads exitosos |
| D-10 | Upload activado siempre que haya `screenshots[]` en output |

## Capturas en criterios visual_check (TE-6.1)

Cuando `ticket_analyst_output` tiene criterios con `criterion_type: "visual_check"` o `requires_screenshot: true`, el test-engine aplica reglas especiales antes y después de la ejecución.

**Regla central:** un test que completa sin error pero sin screenshot **no valida un visual_check**. Reportarlo como "pasado" es un falso positivo.

**Flujo de captura (TE-6.1):**
1. Si hay `test_data_hints[]` en `ticket_analyst_output.classification` → pasarlos al test como datos concretos (no usar factory random).
2. Después de ejecutar, listar archivos nuevos en `allure-results/attachments/*.png` con timestamp dentro del rango de la ejecución.
3. Registrar los paths encontrados en `test_engine_output.screenshots[]`.
4. Si la session existente **no puede capturar screenshot** (el POM no expone el elemento o la session no tiene el paso) → setear `sessions_found: false` con nota `"visual_check requiere screenshot — session existente no la captura"` y continuar a test-generator para generar un test que sí la incluya.

**Comando para listar screenshots post-ejecución:**
```bash
find allure-results/attachments/ -name "*.png" -newer pipeline-logs/results-{ticket}-{execution_id}.json
```

> Esta lógica complementa el flujo de upload documentado en §Flujo de integración (Fase F2.5). Las capturas registradas en `screenshots[]` son las que llegan a `attachments[]` del payload test-reporter → jira-writer.

---

## Variables de entorno requeridas

```bash
JIRA_BASE_URL=https://bluestack-cms.atlassian.net
JIRA_USER_EMAIL=jtcaldera@bluestack.la
JIRA_API_TOKEN=<token>
JIRA_ATTACHMENT_MAX_MB=10   # opcional, default 10
```

---
_Especificación técnica completa (TypeScript, checklist de implementación, decisiones D-01 a D-10): `docs/architecture/qa-pipeline/11-multimedia-attachments.md` — historial de diseño._
