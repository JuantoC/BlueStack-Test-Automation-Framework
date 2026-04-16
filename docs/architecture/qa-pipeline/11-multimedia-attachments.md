# Integración Multimedia en el Pipeline QA → Jira

> **Estado del documento:** APROBADO — todas las decisiones resueltas (2026-04-16)
> **Autor:** Claude + jtcaldera-bluestack
> **Propósito:** Especificación técnica completa para integrar upload de imágenes y videos desde el repositorio local hacia tickets Jira dentro del pipeline QA automatizado.

---

## 0. TL;DR para el agente que retome este documento

Este documento define **cómo agregar capacidad de adjuntar multimedia** (screenshots PNG, videos `.mp4`) a los comentarios y tickets que genera el pipeline QA en Jira.

**El MCP Atlassian (`@sooperset/mcp-atlassian`) NO soporta upload de attachments** para este entorno. La solución es un **módulo TypeScript en `src/core/jira/`** que llama directamente a la Jira REST API usando `axios` (ya presente en `package.json`) con `FormData` nativo de Node 18.

Todas las decisiones de diseño están resueltas en §4. El agente puede implementar directamente siguiendo el checklist de §8.

---

## 1. Diagnóstico del Estado Actual

### 1.1 ¿Qué tiene el pipeline hoy?

| Capacidad | Estado | Dónde |
|-----------|--------|-------|
| Leer attachments de tickets Jira | ✔ Funcional | `ticket-analyst` TA-3B via OP-1-FULL |
| Descargar imágenes (curl) | ✔ Funcional | `update-testids` SKILL.md Fase 1 |
| Usar visión en PNGs descargados | ✔ Funcional | Read tool + visión IA |
| Capturar screenshots en fallos Jest | ✔ Funcional | Allure attachment en test-engine |
| Subir attachments a Jira | ✘ NO EXISTE | Gap — ver §1.2 |
| Adjuntar multimedia en comentarios ADF | ✘ NO EXISTE | Gap — ADF no embebe binarios |
| Procesar `.mp4` adjuntos en dev | ✘ NO EXISTE | GAP abierto en `wiki/log.md:273` |

### 1.2 Por qué el MCP no sirve para upload

El servidor `@sooperset/mcp-atlassian` tiene un parámetro `attachments` en `jira_update_issue`, pero:

1. **Requiere rutas del filesystem del servidor MCP**, no del cliente. En WSL2 local, el proceso MCP corre en el mismo entorno y *podría* funcionar, pero:
2. **Está documentado como roto en entornos containerizados** (issues #618, #920 del repo upstream).
3. **Riesgo de side-effects**: usar `jira_update_issue` para attachments puede eliminar adjuntos existentes insertados por UI (issue #1192).
4. **No está expuesto en `.claude/settings.json`** — `jira_update_issue` no está en la lista de herramientas permitidas.

**Conclusión:** La solución correcta y sostenible es llamar directamente a la Jira REST API via `axios`.

### 1.3 Capacidad real de la API REST de Jira para attachments

```
POST /rest/api/3/issue/{issueIdOrKey}/attachments
Headers:
  Authorization: Basic base64(user:token)
  X-Atlassian-Token: no-check        ← OBLIGATORIO
  Content-Type: multipart/form-data
Body:
  file: <binary>
```

- Acepta múltiples archivos por request
- Devuelve array de objetos `Attachment` con `id`, `filename`, `content` URL
- El `content` URL se referencia en ADF como nodo `inlineCard` (renderiza como card clickeable en Jira)
- Para imágenes realmente inline en ADF se requiere el Atlassian Media API — descartado por complejidad (ver §4 D-01)

---

## 2. Arquitectura de la Solución

### 2.1 Diagrama de integración

```
Pipeline QA (flujo existente)
│
├─ test-engine
│    └─ Al fallo: captura screenshot → allure-results/attachments/<uuid>.png
│         ↓
│    Registra en test_engine_output:
│    "screenshots": [{ "testName": "...", "path": "allure-results/attachments/<uuid>.png" }]
│
├─ test-reporter
│    └─ Al construir payload para jira-writer:
│         Si test_engine_output.screenshots[] tiene items:
│         → Adjunta paths a payload como "attachments": [{ "path": "...", "label": "..." }]
│
└─ jira-writer (MODO F / MODO D)
     └─ NUEVA FASE F2.5 — Procesar attachments ANTES de postear comentario:
          1. Para cada attachment en payload:
             → Llama JiraAttachmentUploader.upload(issueKey, filePath)
             → Recibe { attachmentId, filename, contentUrl }
          2. Si upload exitoso:
             → Guarda contentUrl en attachment_results[]
             → Agrega nodo ADF inlineCard con la URL del attachment
          3. Si upload falla:
             → Log de error + agrega aviso en comentario ADF
             → Continúa — nunca bloquear el comentario
          4. Postea comentario ADF normalmente
```

### 2.2 Nuevo módulo: `src/core/jira/`

```
src/core/jira/
├── JiraAttachmentUploader.ts   ← Clase principal (ver §3.1)
├── JiraApiClient.ts            ← Cliente HTTP base con auth (ver §3.2)
└── index.ts                    ← Re-exports
```

Este módulo es independiente del MCP. No reemplaza la skill `jira-writer` — la *complementa*.

### 2.3 Integración en el pipeline (archivos a modificar)

| Archivo | Tipo de cambio | Sección afectada |
|---------|---------------|-----------------|
| `src/core/jira/JiraApiClient.ts` | CREAR | Nuevo módulo |
| `src/core/jira/JiraAttachmentUploader.ts` | CREAR | Nuevo módulo |
| `src/core/jira/index.ts` | CREAR | Nuevo módulo |
| `.claude/agents/test-reporter.md` | MODIFICAR | TR-4: agregar campo `attachments[]` en payload |
| `.claude/agents/test-engine.md` | MODIFICAR | TE salida: agregar `screenshots[]` en test_engine_output |
| `.claude/skills/jira-writer/SKILL.md` | MODIFICAR | MODO F: nueva Fase F2.5 |
| `wiki/qa/pipeline-integration-schema.md` | MODIFICAR | Schema v3.1: campos `attachments[]` y `screenshots[]` |
| `.env` | CREAR | Variables de entorno Jira |
| `.gitignore` | MODIFICAR | Agregar `.env` |
| `.claude/references/COMMANDS.md` | MODIFICAR | Agregar comando de test del uploader |

---

## 3. Especificación Técnica

### 3.1 `JiraAttachmentUploader.ts`

```typescript
// src/core/jira/JiraAttachmentUploader.ts
import fs from 'fs';
import path from 'path';
import { JiraApiClient } from './JiraApiClient.js';
import { logger } from '../config/logger.js';

export interface AttachmentResult {
  attachmentId: string;
  filename: string;
  contentUrl: string;
  mimeType: string;
}

const MAX_FILE_BYTES = parseInt(process.env.JIRA_ATTACHMENT_MAX_MB ?? '10') * 1024 * 1024;

export class JiraAttachmentUploader {
  private client: JiraApiClient;

  constructor() {
    this.client = new JiraApiClient();
  }

  /**
   * Sube un archivo local como attachment a un issue de Jira.
   * Solo acepta .png, .jpg, .jpeg, .gif, .webp, .mp4.
   * Cap de tamaño: JIRA_ATTACHMENT_MAX_MB (default 10MB).
   *
   * @param issueKey - Clave del issue (e.g., "NAA-1234")
   * @param filePath - Ruta relativa o absoluta al archivo local
   * @param label - Nombre descriptivo para el log (no afecta el filename en Jira)
   * @returns AttachmentResult con datos del archivo subido
   * @throws Error si el archivo no existe, supera el cap de tamaño, o si la API falla
   */
  async upload(issueKey: string, filePath: string, label?: string): Promise<AttachmentResult> {
    const resolvedPath = path.resolve(filePath);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Attachment file not found: ${resolvedPath}`);
    }

    const stats = fs.statSync(resolvedPath);
    if (stats.size > MAX_FILE_BYTES) {
      const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
      const capMB = process.env.JIRA_ATTACHMENT_MAX_MB ?? '10';
      throw new Error(`Attachment too large: ${sizeMB}MB exceeds cap of ${capMB}MB (${resolvedPath})`);
    }

    const filename = path.basename(resolvedPath);
    const mimeType = this.resolveMimeType(filename);

    if (mimeType === 'application/octet-stream') {
      throw new Error(`Unsupported file type for attachment: ${filename}`);
    }

    const logLabel = label ?? filename;
    logger.debug(`[JiraAttachmentUploader] Uploading "${logLabel}" to ${issueKey} (${(stats.size / 1024).toFixed(0)}KB)`);

    // Node 18+: FormData y Blob nativos — sin dependencia form-data package
    const form = new FormData();
    const fileBuffer = fs.readFileSync(resolvedPath);
    form.append('file', new Blob([fileBuffer], { type: mimeType }), filename);

    const response = await this.client.postFormData(
      `/rest/api/3/issue/${issueKey}/attachments`,
      form
    );

    const attachment = Array.isArray(response) ? response[0] : response;

    logger.debug(`[JiraAttachmentUploader] Uploaded: ${attachment.filename} (id: ${attachment.id})`);

    return {
      attachmentId: String(attachment.id),
      filename: attachment.filename,
      contentUrl: attachment.content,
      mimeType: attachment.mimeType ?? mimeType,
    };
  }

  /**
   * Sube múltiples archivos en secuencia.
   * Fallas individuales son logueadas y devueltas con status "failed" — no bloquean el flujo.
   */
  async uploadMany(
    issueKey: string,
    files: Array<{ path: string; label?: string }>
  ): Promise<Array<AttachmentResult & { status: 'uploaded' | 'failed'; failReason?: string }>> {
    const results = [];

    for (const file of files) {
      try {
        const result = await this.upload(issueKey, file.path, file.label);
        results.push({ ...result, status: 'uploaded' as const });
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        logger.error(`[JiraAttachmentUploader] Failed to upload "${file.path}": ${reason}`);
        results.push({
          attachmentId: '',
          filename: path.basename(file.path),
          contentUrl: '',
          mimeType: '',
          status: 'failed' as const,
          failReason: reason,
        });
      }
    }

    return results;
  }

  private resolveMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
    };
    return mimeMap[ext] ?? 'application/octet-stream';
  }
}
```

### 3.2 `JiraApiClient.ts`

```typescript
// src/core/jira/JiraApiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import 'dotenv/config';
import { logger } from '../config/logger.js';

/**
 * Cliente HTTP para la Jira REST API v3.
 * Lee credenciales desde variables de entorno (cargadas desde .env via dotenv):
 *   JIRA_BASE_URL   — e.g. https://bluestack-cms.atlassian.net
 *   JIRA_USER_EMAIL — e.g. jtcaldera@bluestack.la
 *   JIRA_API_TOKEN  — token de API de Atlassian (nunca se loguea)
 */
export class JiraApiClient {
  private readonly http: AxiosInstance;

  constructor() {
    const baseURL = process.env.JIRA_BASE_URL;
    const email = process.env.JIRA_USER_EMAIL;
    const token = process.env.JIRA_API_TOKEN;

    if (!baseURL || !email || !token) {
      throw new Error(
        'JiraApiClient: JIRA_BASE_URL, JIRA_USER_EMAIL y JIRA_API_TOKEN son requeridos. Verificar .env'
      );
    }

    this.http = axios.create({
      baseURL,
      auth: { username: email, password: token },
      headers: { Accept: 'application/json' },
    });
  }

  async post<T = unknown>(url: string, data: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.http.post<T>(url, data, config);
      return response.data;
    } catch (err) {
      logger.error(`[JiraApiClient] POST ${url} failed: ${err}`);
      throw err;
    }
  }

  /**
   * POST multipart/form-data con el header X-Atlassian-Token obligatorio para upload de attachments.
   * Node 18+: recibe FormData nativo (globalThis.FormData).
   */
  async postFormData<T = unknown>(url: string, form: FormData): Promise<T> {
    try {
      const response = await this.http.post<T>(url, form, {
        headers: { 'X-Atlassian-Token': 'no-check' },
      });
      return response.data;
    } catch (err) {
      logger.error(`[JiraApiClient] POST (multipart) ${url} failed: ${err}`);
      throw err;
    }
  }
}
```

### 3.3 `index.ts`

```typescript
// src/core/jira/index.ts
export { JiraApiClient } from './JiraApiClient.js';
export { JiraAttachmentUploader } from './JiraAttachmentUploader.js';
export type { AttachmentResult } from './JiraAttachmentUploader.js';
```

### 3.4 Variables de entorno — `.env`

```bash
# Jira REST API — no versionar este archivo
JIRA_BASE_URL=https://bluestack-cms.atlassian.net
JIRA_USER_EMAIL=jtcaldera@bluestack.la
JIRA_API_TOKEN=<API_TOKEN>

# Opcional: límite de tamaño en MB por attachment (default: 10)
JIRA_ATTACHMENT_MAX_MB=10
```

El token de API es el mismo que ya está configurado en `.mcp.json`. Centralizar en `.env` y referenciar desde ambos lugares.

### 3.5 Runtime — Node 18, sin `form-data` package

Node 18.19.1 incluye `FormData` y `Blob` nativos en `globalThis`. **No se necesita instalar el package `form-data`**. El código usa `new FormData()` y `new Blob([buffer])` directamente. No modificar `package.json` por este feature.

### 3.6 Renderizado de attachments en comentarios ADF

El nodo ADF a usar es `inlineCard`. Renderiza como una card clickeable en Jira Cloud con preview del attachment:

```json
{
  "type": "inlineCard",
  "attrs": {
    "url": "<contentUrl del AttachmentResult>"
  }
}
```

Construir en la Fase F2.5 de `jira-writer` para cada attachment subido exitosamente.

**Si algún attachment falló el upload**, agregar en el comentario ADF un párrafo de aviso:

```
⚠️ Screenshot no pudo adjuntarse (upload falló). Disponible localmente: allure-results/attachments/<filename>
```

---

## 4. Decisiones del Sistema (todas resueltas)

| ID | Pregunta | Decisión adoptada | Razonamiento |
|----|----------|-------------------|--------------|
| **D-01** | ¿Cómo mostrar attachments en ADF? | Nodo `inlineCard` ADF | Renderiza como card clickeable nativa de Jira. Opción A (texto plano) es inferior en UX. Opción C (Media API) descartada por complejidad: requiere OAuth flow adicional fuera del scope. |
| **D-02** | ¿Dónde van las variables de entorno? | `.env` en raíz del proyecto + `dotenv` en `JiraApiClient` | Token centralizado en un único lugar. `.bashrc` es frágil en WSL2 y no es portable. Leer de `.mcp.json` en runtime es acoplamiento innecesario y un anti-patrón. |
| **D-03** | ¿Qué versión de Node? | Node 18.19.1 — `FormData` y `Blob` nativos | Sin `form-data` package. El código usa `globalThis.FormData` directamente. `package.json` no se modifica. |
| **D-04** | ¿Cuándo se captura el screenshot? | Solo en fallo Jest automático | Los screenshots manuales son responsabilidad del validador. El pipeline solo captura lo que Selenium registra. Mezclar responsabilidades entre capas rompe el contrato del pipeline. |
| **D-05** | ¿Screenshots en comentarios de escalación? | No en esta iteración | En escalaciones el test pasó — no hay screenshot automático disponible. Adjuntar evidencia manual es una feature separada de alcance mayor. |
| **D-06** | ¿Se adjuntan videos? | Sí — solo `.mp4` | El `mimeType` `video/mp4` está soportado por la API y por `resolveMimeType()`. `.webm` excluido: el ecosistema Jira Cloud tiene mejor compatibilidad con `.mp4` y los tamaños son más controlables. El cap de 10MB (D-09) aplica también a videos. |
| **D-07** | ¿Attachments al ticket original o al nuevo bug en Dev_SAAS? | Al ticket nuevo del bug | La evidencia del fallo pertenece al issue de calidad, no al requirement. El bug tiene el ciclo de vida de resolución y es quien ve QA, dev y product. |
| **D-08** | ¿Qué hacer si el upload falla? | Postear comentario sin adjunto + aviso en ADF | El comentario ADF es el artefacto primario. Bloquear el comentario por un fallo de storage/red es un error de prioridades que destruye pipelines en producción. El aviso en el comentario informa al lector sin silenciar el error. |
| **D-09** | ¿Límite de tamaño de archivo? | Cap de 10MB, configurable vía `JIRA_ATTACHMENT_MAX_MB` | Jira Cloud acepta 32MB por default pero hay instancias con límites menores. El cap propio previene 413s silenciosos. 10MB cubre cualquier PNG de screenshot. Para videos, el cap actúa como guardia. Configurable sin tocar código. |
| **D-10** | ¿Upload opt-in o siempre activado? | Siempre activado si hay `screenshots[]` en output | No tiene sentido capturar evidencia y no adjuntarla. Override: agregar `JIRA_ATTACHMENT_ENABLED=false` en `.env` si en el futuro se necesita deshabilitar por entorno (CI sin storage, por ejemplo). |

---

## 5. Flujo Completo Post-Integración

```
[test-engine — MODIFICADO]
│  Al fallo de un test Jest:
│  1. Selenium captura screenshot → allure-results/attachments/<uuid>.png
│  2. test-engine registra en test_engine_output:
│     "screenshots": [{ "testName": "Login_2FA", "path": "allure-results/attachments/abc123.png", "capturedAt": "..." }]
│
▼
[test-reporter — MODIFICADO]
│  En TR-4 (construir payload para jira-writer):
│  1. Lee test_engine_output.screenshots[]
│  2. Para cada test con result "✘" y screenshot disponible:
│     → Agrega al payload: "attachments": [{ "path": "...", "label": "Screenshot_<testName>" }]
│
▼
[jira-writer — SKILL MODIFICADA]
│  NUEVA FASE F2.5 (ejecutar antes de F3 — postear comentario):
│  1. Si payload.attachments[] no está vacío:
│     a. Instanciar JiraAttachmentUploader
│     b. Llamar uploader.uploadMany(ticket_key, payload.attachments)
│     c. Guardar attachment_results[] con { attachmentId, filename, contentUrl, status }
│  2. En F3 (construir nodo ADF del comentario):
│     Para cada attachment con status "uploaded":
│       → Agregar nodo inlineCard con contentUrl
│     Para cada attachment con status "failed":
│       → Agregar párrafo de aviso con filename local
│  3. Postear comentario ADF normalmente
│
▼
[Output en Jira]
│  Ticket tiene:
│  ├─ Sección "Archivos adjuntos": PNG/MP4 visible
│  └─ Comentario ADF con nodos inlineCard clickeables por cada attachment
```

---

## 6. Cambios en el Schema del Pipeline (v3.1)

Modificar `wiki/qa/pipeline-integration-schema.md`.

### En `test_engine_output` (nuevo campo):
```json
{
  "screenshots": [
    {
      "testName": "Login_2FA_MasterValidation",
      "path": "allure-results/attachments/abc123-uuid.png",
      "capturedAt": "2026-04-16T14:32:10Z"
    }
  ]
}
```

### En payload test-reporter → jira-writer (nuevo campo):
```json
{
  "schema_version": "3.1",
  "attachments": [
    {
      "path": "allure-results/attachments/abc123-uuid.png",
      "label": "Screenshot_Login_2FA",
      "linkedTestName": "Login_2FA_MasterValidation"
    }
  ]
}
```

### En output de jira-writer (nuevo campo):
```json
{
  "attachment_results": [
    {
      "label": "Screenshot_Login_2FA",
      "attachmentId": "12345",
      "filename": "abc123-uuid.png",
      "contentUrl": "https://bluestack-cms.atlassian.net/rest/api/3/attachment/content/12345",
      "status": "uploaded"
    }
  ]
}
```

---

## 7. Lista de Archivos a Crear / Modificar

### Nuevos archivos:
| Ruta | Propósito |
|------|-----------|
| `src/core/jira/JiraApiClient.ts` | Cliente HTTP base para Jira REST API |
| `src/core/jira/JiraAttachmentUploader.ts` | Lógica de upload de attachments |
| `src/core/jira/index.ts` | Re-exports del módulo |
| `.env` | Variables de entorno (agregar a `.gitignore`) |

### Archivos a modificar:
| Ruta | Cambio necesario |
|------|-----------------|
| `.gitignore` | Agregar `.env` |
| `.claude/agents/test-engine.md` | Agregar `screenshots[]` en estructura de `test_engine_output` |
| `.claude/agents/test-reporter.md` | TR-4: incluir `attachments[]` en payload si hay screenshots disponibles |
| `.claude/skills/jira-writer/SKILL.md` | MODO F: agregar Fase F2.5 (upload attachments antes del comentario ADF) |
| `wiki/qa/pipeline-integration-schema.md` | v3.1: documentar campos `screenshots[]`, `attachments[]`, `attachment_results[]` |
| `.claude/references/COMMANDS.md` | Agregar comando para probar JiraAttachmentUploader manualmente |

### Archivos que NO cambian:
- `src/core/actions/` — capa de Selenium, no toca Jira
- `.mcp.json` — MCP sigue igual, el uploader es paralelo
- `package.json` — Node 18 tiene FormData nativo, sin dependencia nueva
- `.claude/skills/jira-reader/SKILL.md` — solo lectura, no escribe

---

## 8. Checklist de Implementación (orden recomendado)

Cada paso es atómico — si falla, los pasos anteriores quedan válidos.

- [ ] **PASO 1:** Verificar que `.env` no existe ya en raíz. Crear con las 4 variables de §3.4.
- [ ] **PASO 2:** Agregar `.env` a `.gitignore` (si no está ya).
- [ ] **PASO 3:** Crear `src/core/jira/JiraApiClient.ts` (código en §3.2).
- [ ] **PASO 4:** Crear `src/core/jira/JiraAttachmentUploader.ts` (código en §3.1).
- [ ] **PASO 5:** Crear `src/core/jira/index.ts` (código en §3.3).
- [ ] **PASO 6:** Probar upload manual con un PNG hacia un ticket de prueba (ver COMMANDS.md para el comando).
- [ ] **PASO 7:** Modificar `test-engine.md` — agregar `screenshots[]` en estructura de output.
- [ ] **PASO 8:** Modificar `test-reporter.md` — agregar `attachments[]` en payload TR-4.
- [ ] **PASO 9:** Modificar `jira-writer/SKILL.md` — agregar Fase F2.5 con lógica de §5.
- [ ] **PASO 10:** Actualizar `pipeline-integration-schema.md` a v3.1.
- [ ] **PASO 11:** Agregar comando de test a `COMMANDS.md`.
- [ ] **PASO 12:** Ejecutar pipeline completo con ticket de prueba y verificar que el attachment aparece en Jira.

---

## 9. Consideraciones de Seguridad

1. **El API Token NO debe ir en código fuente.** Usar siempre `.env` + `.gitignore`.
2. **El `.env` ya existe o no**: Si no existe, crear con las 4 variables. Si existe, agregar sin sobrescribir variables existentes.
3. **Logs**: `JiraApiClient` loguea errores pero **nunca loguea el token**. El token está solo en el header de autorización.
4. **Archivos adjuntos**: Leer solo desde rutas dentro del repositorio (`allure-results/`, paths relativos al working directory). No aceptar rutas absolutas arbitrarias.
5. **Tipos de archivo**: `resolveMimeType()` actúa como lista blanca. Cualquier extensión no reconocida lanza error antes del upload.

---

## 10. Gap Preexistente Cerrado

Este documento cierra el gap registrado en `wiki/log.md:273`:

> "Archivos binarios adjuntos (.webm, .mp4) en comentarios de dev no son procesados — Fase 5 pendiente"

La implementación cubre `.mp4` en `resolveMimeType()`. `.webm` queda excluido intencionalmente (D-06): compatibilidad Jira Cloud inferior y tamaños más difíciles de controlar.

---

## 11. Referencias

- [Jira Cloud REST API — Attachments](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-attachments/)
- [ADF — inlineCard node spec](https://developer.atlassian.com/cloud/jira/platform/apis/document/nodes/inlineCard/)
- [mcp-atlassian Issue #618](https://github.com/sooperset/mcp-atlassian/issues/618) — Attachment upload requires server-side file paths
- Pipeline schema actual: `wiki/qa/pipeline-integration-schema.md`
- Flow Dev_SAAS: `wiki/qa/devsaas-flow.md`
- jira-writer skill: `.claude/skills/jira-writer/SKILL.md`
- test-reporter agent: `.claude/agents/test-reporter.md`
- Seguridad y credenciales: `docs/architecture/qa-pipeline/06-seguridad-y-observabilidad.md`
