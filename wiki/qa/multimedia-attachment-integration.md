# Integración Multimedia en el Pipeline QA → Jira

> **Estado del documento:** BORRADOR FUNCIONAL — pendiente decisiones humanas (marcadas con `[DECISIÓN]`)  
> **Autor:** Claude + jtcaldera-bluestack  
> **Fecha:** 2026-04-16  
> **Propósito:** Especificación técnica completa para integrar upload de imágenes/videos desde el repositorio local hacia tickets Jira dentro del pipeline automatizado de feedback QA.

---

## 0. TL;DR para el agente que retome este documento

Este documento define **cómo agregar capacidad de adjuntar multimedia** (screenshots PNG, videos `.webm`/`.mp4`) a los comentarios y tickets que genera el pipeline QA en Jira.

**El MCP Atlassian (`@sooperset/mcp-atlassian`) NO soporta upload de attachments** para este entorno. La solución es una **utility module en TypeScript (`src/core/jira/`)** que llama directamente a la Jira REST API usando `axios` (ya presente en `package.json`).

Antes de implementar, el agente debe leer la sección §4 (Decisiones del Humano) y preguntar por cada `[DECISIÓN]` no resuelta.

---

## 1. Diagnóstico del Estado Actual

### 1.1 ¿Qué tiene el pipeline hoy?

El pipeline QA automatizado (orchestrator → ticket-analyst → test-engine → test-reporter → jira-writer) ya maneja:

| Capacidad | Estado | Dónde |
|-----------|--------|-------|
| Leer attachments de tickets Jira | ✔ Funcional | `ticket-analyst` TA-3B via OP-1-FULL |
| Descargar imágenes (curl) | ✔ Funcional | `update-testids` SKILL.md Fase 1 |
| Usar visión en PNGs descargados | ✔ Funcional | Read tool + visión IA |
| Capturar screenshots en fallos Jest | ✔ Funcional | Allure attachment en test-engine |
| Subir attachments a Jira | ✘ NO EXISTE | Gap — ver §1.2 |
| Adjuntar multimedia en comentarios ADF | ✘ NO EXISTE | Gap — ADF no embebe binarios |
| Procesar `.webm`/`.mp4` adjuntos en dev | ✘ NO EXISTE | GAP abierto en `wiki/log.md:273` |

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
- El `content` URL se puede referenciar en ADF como `mediaType: "file"` (no embebe la imagen inline en el comentario — solo crea un enlace)
- Para mostrar imágenes *inline* en comentarios ADF se necesita el Atlassian Media API (más complejo — ver §3.3)

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
             → Opcionalmente: agrega nodo ADF con link al attachment
          3. Si upload falla:
             → Log de error, continúa sin attachment (nunca bloquear el comentario)
          4. Postea comentario ADF (con o sin referencias a attachments)
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
| `.claude/references/COMMANDS.md` | MODIFICAR | Agregar comando de test del uploader |

---

## 3. Especificación Técnica

### 3.1 `JiraAttachmentUploader.ts`

```typescript
// src/core/jira/JiraAttachmentUploader.ts
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { JiraApiClient } from './JiraApiClient.js';
import { logger } from '../config/logger.js';

export interface AttachmentResult {
  attachmentId: string;
  filename: string;
  contentUrl: string;
  mimeType: string;
}

export class JiraAttachmentUploader {
  private client: JiraApiClient;

  constructor() {
    this.client = new JiraApiClient();
  }

  /**
   * Sube un archivo local como attachment a un issue de Jira.
   * @param issueKey - Clave del issue (e.g., "NAA-1234")
   * @param filePath - Ruta absoluta al archivo local
   * @param label - Nombre descriptivo para el log (no afecta el filename en Jira)
   * @returns AttachmentResult con datos del archivo subido
   * @throws Error si el archivo no existe o si la API devuelve error
   */
  async upload(issueKey: string, filePath: string, label?: string): Promise<AttachmentResult> {
    const resolvedPath = path.resolve(filePath);
    
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Attachment file not found: ${resolvedPath}`);
    }

    const filename = path.basename(resolvedPath);
    const logLabel = label ?? filename;

    logger.debug(`[JiraAttachmentUploader] Uploading "${logLabel}" to ${issueKey}`);

    const form = new FormData();
    form.append('file', fs.createReadStream(resolvedPath), {
      filename,
      contentType: this.resolveMimeType(filename),
    });

    const response = await this.client.post(
      `/rest/api/3/issue/${issueKey}/attachments`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'X-Atlassian-Token': 'no-check',
        },
      }
    );

    const attachment = Array.isArray(response) ? response[0] : response;

    logger.debug(`[JiraAttachmentUploader] Uploaded successfully: ${attachment.id}`);

    return {
      attachmentId: String(attachment.id),
      filename: attachment.filename,
      contentUrl: attachment.content,
      mimeType: attachment.mimeType ?? this.resolveMimeType(filename),
    };
  }

  /**
   * Sube múltiples archivos en secuencia. Fallas individuales son logueadas y skipeadas.
   */
  async uploadMany(
    issueKey: string,
    files: Array<{ path: string; label?: string }>
  ): Promise<AttachmentResult[]> {
    const results: AttachmentResult[] = [];

    for (const file of files) {
      try {
        const result = await this.upload(issueKey, file.path, file.label);
        results.push(result);
      } catch (err) {
        logger.error(`[JiraAttachmentUploader] Failed to upload "${file.path}": ${err}`);
        // No re-throw: un fallo de attachment no debe bloquear el comentario
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
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
      '.pdf': 'application/pdf',
    };
    return mimeMap[ext] ?? 'application/octet-stream';
  }
}
```

### 3.2 `JiraApiClient.ts`

```typescript
// src/core/jira/JiraApiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { logger } from '../config/logger.js';

/**
 * Cliente HTTP para la Jira REST API v3.
 * Lee credenciales desde variables de entorno:
 *   JIRA_BASE_URL, JIRA_USER_EMAIL, JIRA_API_TOKEN
 */
export class JiraApiClient {
  private readonly http: AxiosInstance;

  constructor() {
    const baseURL = process.env.JIRA_BASE_URL;
    const email = process.env.JIRA_USER_EMAIL;
    const token = process.env.JIRA_API_TOKEN;

    if (!baseURL || !email || !token) {
      throw new Error(
        'JiraApiClient: JIRA_BASE_URL, JIRA_USER_EMAIL y JIRA_API_TOKEN son requeridos'
      );
    }

    this.http = axios.create({
      baseURL,
      auth: { username: email, password: token },
      headers: { Accept: 'application/json' },
    });
  }

  async post<T = unknown>(
    url: string,
    data: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.http.post<T>(url, data, config);
      return response.data;
    } catch (err) {
      logger.error(`[JiraApiClient] POST ${url} failed: ${err}`);
      throw err;
    }
  }
}
```

### 3.3 Sobre imágenes inline en ADF (limitación importante)

La API REST de Jira `/attachments` sube el archivo y devuelve una URL pública del attachment. **Sin embargo:**

- Los comentarios en formato ADF **no soportan `<img>` embebido directamente**.
- Para mostrar una imagen inline en Jira Cloud ADF se requiere el **Atlassian Media API** (obtener un `mediaId` via `/gateway/api/media/...`), que es una API adicional y más compleja.
- **Lo que SÍ funciona**: agregar en el comentario ADF un nodo de tipo `inlineCard` o `text` con el link al attachment. El attachment aparece en la sección "Archivos adjuntos" del ticket y el link es clickeable en el comentario.

**[DECISIÓN-01]** ¿Querés que las referencias a attachments en el comentario ADF sean:
- **Opción A** (recomendada): Solo texto con link — `"Ver screenshot: [Fallo_Login_NAA-1234.png](https://...)"` — Implementación simple.
- **Opción B**: Nodo ADF `inlineCard` con la URL del attachment — Renderiza como card clickeable en Jira.
- **Opción C**: Investigar Atlassian Media API para imágenes realmente inline — Implementación compleja, +2-3 días.

### 3.4 Variables de entorno requeridas

El módulo requiere estas variables de entorno. **[DECISIÓN-02]** ¿Dónde van estas variables?

```bash
JIRA_BASE_URL=https://bluestack-cms.atlassian.net
JIRA_USER_EMAIL=jtcaldera@bluestack.la
JIRA_API_TOKEN=<API_TOKEN>     # mismo token ya en .mcp.json
```

Opciones:
- **Opción A** (recomendada): Archivo `.env` en raíz del proyecto (agregar a `.gitignore`).
- **Opción B**: Variables de sistema en WSL2 (`~/.bashrc` o `~/.zshrc`).
- **Opción C**: Leer directamente de `.mcp.json` en runtime (acoplamiento — no recomendado).

### 3.5 Dependencia nueva: `form-data`

`axios` no incluye `FormData` para Node.js nativamente en versiones < 18. Hay dos opciones:

**[DECISIÓN-03]** ¿Qué versión de Node estás usando?
- Si Node ≥ 18: usar `globalThis.FormData` nativo — no necesita package adicional.
- Si Node < 18: agregar `form-data` package: `npm install form-data`.

Verificar con: `node --version`

---

## 4. Decisiones del Humano (Todas las `[DECISIÓN]`)

> **Instrucción para el agente que retome:** Preguntar estas decisiones al usuario antes de escribir código. No asumir. Listarlas todas juntas al inicio de la conversación.

| ID | Pregunta | Opciones | Default recomendado |
|----|----------|----------|-------------------|
| **DECISIÓN-01** | ¿Cómo mostrar attachments en comentarios ADF? | A: texto+link / B: inlineCard / C: Media API | **A — texto+link** |
| **DECISIÓN-02** | ¿Dónde van las variables de entorno? | A: .env / B: ~/.bashrc / C: .mcp.json | **A — .env** |
| **DECISIÓN-03** | ¿Qué versión de Node? | ≥18 (nativo) / <18 (form-data package) | Verificar runtime |
| **DECISIÓN-04** | ¿En qué momento del flujo se captura el screenshot? | A: solo en fallo Jest (automático) / B: también en casos de escalación manual / C: solo cuando el usuario lo pide explícitamente | **A — solo fallo automático** |
| **DECISIÓN-05** | ¿Se adjuntan screenshots a comentarios de escalación? | Sí (adjunta el screenshot al ticket + menciona en comentario) / No (solo al crear bug nuevo) | **Sin definir** |
| **DECISIÓN-06** | ¿Se adjuntan videos (`.webm`/`.mp4`) de Allure? | Sí (el test-engine ya los captura) / No (demasiado pesados, solo imágenes) | **Sin definir** |
| **DECISIÓN-07** | ¿Se adjuntan evidencias al ticket ORIGINAL en Dev_SAAS o al ticket NUEVO creado por el bug? | Original / Nuevo / Ambos | **Al ticket nuevo — es donde vive el bug** |
| **DECISIÓN-08** | ¿Qué hacer si el upload falla? | A: bloquear el comentario / B: postear comentario sin adjuntos + log de error (recomendado) / C: reintentar 1 vez | **B — no bloquear** |
| **DECISIÓN-09** | ¿Límite de tamaño de archivo para adjuntar? | Sin límite (Jira acepta hasta 32MB por default) / Cap en MB configurable | **Sin límite explícito inicialmente** |
| **DECISIÓN-10** | ¿El upload de multimedia es opt-in o siempre activado? | Siempre activado si hay screenshots / Solo si hay flag en el payload / Solo manual | **Siempre activado si hay screenshots** |

---

## 5. Flujo Completo Propuesto (Post-Integración)

```
[test-engine — MODIFICADO]
│  Al fallo de un test Jest:
│  1. Selenium ya captura screenshot → allure-results/attachments/<uuid>.png
│  2. test-engine registra en test_engine_output:
│     "screenshots": [{ "testName": "Login_2FA", "path": "allure-results/attachments/abc123.png" }]
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
│     c. Guardar attachment_results[] con { attachmentId, filename, contentUrl }
│  2. En F3 (construir nodo ADF del comentario):
│     Para cada attachment subido:
│     → Agregar párrafo en doc.content[]:
│        "📎 [<filename>](<contentUrl>)"   ← si DECISIÓN-01 = Opción A
│  3. Si upload falla: log, continuar sin nodo de attachment
│  4. Postear comentario ADF normalmente
│
▼
[Output en Jira]
│  Ticket tiene:
│  ├─ Sección "Archivos adjuntos": screenshot PNG visible
│  └─ Comentario ADF con texto/link al screenshot
```

---

## 6. Cambios en el Schema del Pipeline (v3.1)

Modificar `wiki/qa/pipeline-integration-schema.md` y `.claude/skills/jira-writer/references/` para agregar:

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
      "status": "uploaded" | "failed"
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
| `.claude/agents/test-engine.md` | Agregar `screenshots[]` en estructura de `test_engine_output` |
| `.claude/agents/test-reporter.md` | TR-4: incluir `attachments[]` en payload si hay screenshots disponibles |
| `.claude/skills/jira-writer/SKILL.md` | MODO F: agregar Fase F2.5 (upload attachments antes del comentario ADF) |
| `wiki/qa/pipeline-integration-schema.md` | v3.1: documentar campos `screenshots[]`, `attachments[]`, `attachment_results[]` |
| `.gitignore` | Agregar `.env` |
| `.claude/references/COMMANDS.md` | Agregar comando para probar JiraAttachmentUploader manualmente |

### Archivos que NO cambian:
- `src/core/actions/` — capa de Selenium, no toca Jira
- `.mcp.json` — MCP sigue igual, el uploader es paralelo
- `.claude/skills/jira-reader/SKILL.md` — solo lectura, no escribe
- `package.json` — solo si Node < 18 (DECISIÓN-03)

---

## 8. Checklist de Implementación (orden recomendado)

> El agente puede seguir este orden. Cada paso es atómico — si falla, los pasos anteriores quedan válidos.

- [ ] **PASO 0:** Resolver las 10 decisiones con el usuario (§4)
- [ ] **PASO 1:** Crear `.env` con las 3 variables de entorno
- [ ] **PASO 2:** Agregar `.env` a `.gitignore`
- [ ] **PASO 3:** Crear `src/core/jira/JiraApiClient.ts`
- [ ] **PASO 4:** Crear `src/core/jira/JiraAttachmentUploader.ts`
- [ ] **PASO 5:** Crear `src/core/jira/index.ts`
- [ ] **PASO 6:** Probar upload manual con un PNG de test hacia un ticket real (NAA-XXXX de prueba)
- [ ] **PASO 7:** Modificar `test-engine.md` — agregar `screenshots[]` en output
- [ ] **PASO 8:** Modificar `test-reporter.md` — agregar `attachments[]` en payload
- [ ] **PASO 9:** Modificar `jira-writer/SKILL.md` — agregar Fase F2.5
- [ ] **PASO 10:** Actualizar `pipeline-integration-schema.md` a v3.1
- [ ] **PASO 11:** Agregar comando de test a `COMMANDS.md`
- [ ] **PASO 12:** Ejecutar un pipeline completo con un ticket de prueba y verificar que el attachment aparece en Jira

---

## 9. Consideraciones de Seguridad

1. **El API Token NO debe ir en código fuente.** Usar siempre `.env` + `.gitignore`.
2. **El `.env` ya existe o no**: Si no existe, crear con las 3 variables. Si existe, agregar las variables sin sobrescribir las existentes.
3. **Logs**: `JiraApiClient` loguea errores pero **nunca loguea el token**. El token está solo en el header de autorización.
4. **Archivos adjuntos**: Leer solo desde rutas dentro del repositorio (`allure-results/`, paths relativos). No aceptar rutas absolutas arbitrarias del usuario.

---

## 10. Gap Preexistente Documentado

Este documento cierra el gap registrado en `wiki/log.md:273`:

> "Archivos binarios adjuntos (.webm, .mp4) en comentarios de dev no son procesados — Fase 5 pendiente"

La implementación cubre `.webm` y `.mp4` en `resolveMimeType()`. Sin embargo, la **DECISIÓN-06** debe confirmar si se quieren adjuntar videos automáticamente (pueden ser pesados).

---

## 11. Referencias

- [Jira Cloud REST API — Attachments](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-attachments/)
- [mcp-atlassian Issue #618 — Attachment upload requires server-side file paths](https://github.com/sooperset/mcp-atlassian/issues/618)
- [ADF — Atlassian Document Format spec](https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/)
- Pipeline schema actual: `wiki/qa/pipeline-integration-schema.md`
- Flow Dev_SAAS: `wiki/qa/devsaas-flow.md`
- jira-writer skill: `.claude/skills/jira-writer/SKILL.md`
- test-reporter agent: `.claude/agents/test-reporter.md`
