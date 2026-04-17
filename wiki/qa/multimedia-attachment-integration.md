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

## Decisiones clave

| ID | Decisión |
|----|----------|
| D-01 | Nodo ADF `inlineCard` — renderiza como card clickeable nativa |
| D-02 | Variables en `.env` + `dotenv` en `JiraApiClient` — token centralizado |
| D-03 | `FormData` y `Blob` nativos Node 18 — sin package `form-data` |
| D-08 | Si upload falla → comentario se postea igual con aviso de texto |
| D-10 | Upload activado siempre que haya `screenshots[]` en output |

## Variables de entorno requeridas

```bash
JIRA_BASE_URL=https://bluestack-cms.atlassian.net
JIRA_USER_EMAIL=jtcaldera@bluestack.la
JIRA_API_TOKEN=<token>
JIRA_ATTACHMENT_MAX_MB=10   # opcional, default 10
```

---
_Especificación técnica completa (TypeScript, checklist de implementación, decisiones D-01 a D-10): `docs/architecture/qa-pipeline/11-multimedia-attachments.md` — historial de diseño._
