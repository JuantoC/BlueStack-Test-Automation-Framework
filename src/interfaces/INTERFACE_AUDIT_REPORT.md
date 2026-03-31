# BlueStack Interface Audit Report

**Fecha de auditoría:** 2026-03-30
**Auditor:** Claude Code (claude-sonnet-4-6) — sesión de solo lectura y análisis
**Stack auditado:** TypeScript `ES2022` · Selenium WebDriver v3.8 · Jest · Allure JS
**Compilador:** `strict: true` · `isolatedModules: true` · `module: NodeNext` · sin decorators experimentales

---

## Resumen ejecutivo

Se auditaron **4 interfaces** en el scope primario (`/src/interfaces/`) y **6 interfaces/types adicionales** distribuidos en otras capas del proyecto.

| Veredicto | Cantidad | Interfaces |
|-----------|----------|-----------|
| MANTENER | 2 | `VideoData`, `AIDataNote` |
| REFACTORIZAR | 1 | `NoteData` |
| REEMPLAZAR | 1 | `AuthCredentials` → `type` alias co-localizado |
| ELIMINAR | 0 | — |
| DESCOMPONER | 0 | — |

**Hallazgos críticos:**

1. **`NoteData` viola ISP de forma leve**: mezcla cinco dominios conceptuales en una sola interfaz con todos sus campos opcionales. Sus sub-tipos (`PostData`, `ListicleData`, `LiveBlogData`) viven en la capa de factory, no en la de interfaces.
2. **`error: any` en 48+ catch blocks**: el uso de `any` en manejadores de error es el problema de tipado más extendido en todo el proyecto. TypeScript con `strict: true` lo permite explícitamente, pero contradice la intención del flag.
3. **`RetryOptions` es la interfaz más usada del proyecto** (~50 referencias directas) pero vive junto a constantes en `core/config/`, no en `/src/interfaces/`.
4. **Un único tipo de retorno inline sin nombre formal**: `LoginSection.attemptLogin()` en [src/pages/login_page/LoginSection.ts:112](src/pages/login_page/LoginSection.ts#L112).

**Calidad arquitectural general: A (Excelente)**. El framework demuestra disciplina arquitectural sólida. Los problemas encontrados son oportunidades de mejora incremental, no defectos estructurales.

---

## Mapa de dependencias

### Interfaces en `/src/interfaces/` (scope primario)

| Interfaz | Archivo | Consumidores directos | Veredicto |
|----------|---------|----------------------|-----------|
| `AuthCredentials` | `auth.ts` | `MainLoginPage.ts` (1 archivo) | MANTENER |
| `NoteData` | `data.ts` | `NoteDataFactory.ts`, `MainEditorPage.ts`, `EditorAuthorSection.ts`, `EditorTextSection.ts`, `EditorTagsSection.ts`, `BaseListicleSection.ts` (6 archivos) | REFACTORIZAR |
| `VideoData` | `data.ts` | `VideoDataFactory.ts`, `UploadVideoModal.ts`, `MainVideoPage.ts` (3 archivos) | MANTENER |
| `AIDataNote` | `data.ts` | `AINoteDataFactory.ts`, `MainAIPage.ts`, `AIPostModal.ts` (3 archivos) | MANTENER |

### Interfaces fuera de `/src/interfaces/` (scope secundario)

| Interfaz | Archivo fuente | Consumidores | Observación |
|----------|---------------|-------------|-------------|
| `RetryOptions` | `core/config/defaultConfig.ts` | Todos los Page Objects + todas las actions (~50 refs) | Contrato de datos puro, candidato a centralizar |
| `DriverSession` | `core/config/driverManager.ts` | `driverManager.ts`, wrappers de test | Pertenece al core — mantener ubicación |
| `NetworkMonitorHandle` | `core/config/networkMonitor.ts` | `driverManager.ts`, `DriverSession` | Pertenece al core — mantener ubicación |
| `NetworkSummary` | `core/config/networkMonitor.ts` | `NetworkMonitorHandle.stop()` | Pertenece al core — mantener ubicación |
| `ListicleStrategy` | `pages/.../ListicleStrategy.ts` | `BaseListicleSection.ts`, `ListicleSection.ts`, `LiveBlogSection.ts` | Cohesión con sub-dominio — mantener ubicación |

### Type aliases derivados de constantes (`keyof typeof`)

Este patrón es el más extendido en la capa de páginas. Cada type es la fuente única de verdad para el enum correspondiente.

| Type alias | Archivo fuente | Usados en | Patrón |
|-----------|---------------|-----------|--------|
| `AuthorType` | `EditorAuthorSection.ts` | `NoteData`, `NoteDataFactory.ts`, `EditorAuthorSection.ts` | `keyof typeof EditorAuthorSection.AUTHOR_BUTTON_MAP` |
| `VideoType` | `UploadVideoBtn.ts` | `VideoData`, `VideoDataFactory.ts`, `UploadVideoModal.ts` | `keyof typeof UploadVideoBtn.VIDEO_TYPE_MAP` |
| `FooterActionType` | `FooterActions.ts` | `FooterActions.ts` (interno) | `keyof typeof FooterActions.FOOTER_ACTIONS` |
| `NoteType` | `NewNoteBtn.ts` | `MainPostPage.ts`, `NewNoteBtn.ts` | `keyof typeof NewNoteBtn.NOTE_TYPE_MAP` |
| `SidebarOption` | `SidebarAndHeaderSection.ts` | `SidebarAndHeaderSection.ts` (interno) | `keyof typeof ...` |

---

## Análisis detallado por interfaz

---

### 1. `AuthCredentials`
**Archivo:** [src/interfaces/auth.ts](src/interfaces/auth.ts)
**Veredicto: REEMPLAZAR** (interface → type alias co-localizado)

**Código actual:**
```typescript
/**
 * Define la estructura de identidad para procesos de autenticación.
 */
export interface AuthCredentials {
  username: string;
  password: string;
  /** El MFA Token puede ser opcional dependiendo del ambiente */
  otpToken?: string;
}
```

**Evaluación:**
- La interfaz tiene cohesión correcta: un único concepto de dominio, tres campos, comentario JSDoc útil.
- **El problema es arquitectural, no de diseño**: tiene un único consumidor (`MainLoginPage.ts`) y vive en una carpeta `/src/interfaces/` junto a contratos cross-cutting como `NoteData` o `RetryOptions`. Eso crea la apariencia de que es un contrato compartido cuando en realidad es local al flujo de login.
- Una `interface` en TypeScript declara intención de extensibilidad. Para un tipo de datos puro con un solo consumidor, esa intención es ruido.

**¿Cuál es la alternativa más adecuada?**

**`type` alias co-localizado** con su único consumidor:

```typescript
// src/pages/login_page/MainLoginPage.ts — definición local
/**
 * Credenciales de autenticación para el flujo de login del CMS.
 * otpToken es opcional según el ambiente (staging no requiere 2FA).
 */
export type AuthCredentials = {
  username: string;
  password: string;
  otpToken?: string;
};
```

`type` vs `interface` en este contexto:
| | `interface` (actual) | `type` alias (propuesta) |
|---|---|---|
| Extensible con `extends` | ✅ Sí | ❌ No (intencional) |
| Re-abierta con declaration merging | ✅ Sí | ❌ No (intencional) |
| Expresa "contrato de datos puro" | ⚠️ No explícitamente | ✅ Sí |
| Visible desde fuera del módulo | Solo si se exporta | Solo si se exporta |

**Co-localización** (mismo archivo que su consumidor):
- Sigue el principio de menor sorpresa: el tipo vive donde se usa.
- Si en el futuro un segundo consumidor necesita `AuthCredentials`, ese es el momento de moverlo — no antes.

**¿Qué pasa con `auth.ts`?**
Con `LoginAttemptResult` también presente (ver sección "Código sin contrato"), el archivo `auth.ts` tiene ahora dos tipos del dominio login. Dos opciones:
- Renombrar `auth.ts` → `login.types.ts` y moverlo junto a `MainLoginPage.ts` en `src/pages/login_page/`
- Mantenerlo en `src/interfaces/` pero aceptar que es el archivo de contratos del dominio auth (válido si se prevé reuso futuro, por ejemplo para un helper de autenticación en setup de tests)

**Recomendación:** Opción 1 — mover y renombrar a `src/pages/login_page/login.types.ts` como `type` aliases. Si el día de mañana se necesitan en otro lugar, ese es el trigger para promoverlos a `interfaces/`.

---

### 2. `NoteData`
**Archivo:** [src/interfaces/data.ts](src/interfaces/data.ts)
**Veredicto: REFACTORIZAR**

**Código actual:**
```typescript
import { AuthorType } from "../pages/post_page/note_editor_page/EditorAuthorSection.js";
import { VideoType } from "../pages/videos_page/UploadVideoBtn.js";

export interface NoteData {
  // Campos de texto principales
  title?: string;
  secondaryTitle?: string;
  subTitle?: string;
  halfTitle?: string;
  body?: string;
  summary?: string;

  // Tags
  tags?: string[];
  hiddenTags?: string[];

  // Autor
  authorName?: string;
  authorDescription?: string;
  authorType?: AuthorType;

  listicleItems?: Array<{
    title: string;
    body: string;
  }>;

  eventLiveBlog?: {
    eventTitle?: string;
    eventDescription?: string;
    placeOfEvent?: string;
    eventAdress?: string;
  }
}
```

**Problemas detectados:**

1. **ISP suave**: mezcla cinco dominios en una sola interfaz — texto, tags, autor, items de listicle y metadata de evento. En producción esto significa que un `PostData` "tiene" `listicleItems` y `eventLiveBlog` aunque no los use nunca.

2. **Todos los campos opcionales**: elimina la capacidad del compilador de detectar datos incompletos. `PostData extends NoteData` en la factory redefine `title`, `body`, `tags` como requeridos — ese contrato existe, pero vive en la capa de factory.

3. **Sub-tipos en la capa incorrecta**: `PostData`, `ListicleData`, `LiveBlogData` (en `NoteDataFactory.ts`) y `ListicleItem`, `EventLiveBlog` refinan correctamente `NoteData`, pero son contratos de dominio que deberían vivir en `/src/interfaces/`, no en la factory. La factory es la consumidora de los contratos, no su definidora — su responsabilidad es generar datos que satisfagan esas interfaces, no declararlas. Esto se vuelve evidente cuando los Page Objects también consumen `Partial<NoteData>`: actualmente dependen indirectamente de lo que define una factory de fake data.

4. **Inline object types no nombrados**: `listicleItems` usa `Array<{ title: string; body: string }>` y `eventLiveBlog` usa un object literal anónimo. Ambos tienen suficiente identidad para ser interfaces nombradas.

5. **Import circular implícito**: `data.ts` importa `AuthorType` desde `EditorAuthorSection.ts` (capa pages) e implícitamente `VideoType` desde `UploadVideoBtn.ts`. La capa de interfaces dependiendo de la capa de pages es una violación de la jerarquía de dependencias.

**Propuesta concreta:**

```typescript
// src/interfaces/data.ts — versión refactorizada

// ────────────────────────────────────────────────────────────
// NOTA: AuthorType y VideoType deben moverse a src/interfaces/
// o bien los imports inversos deben aceptarse explícitamente.
// Ver sección "Evaluación de alternativas" para opciones.
// ────────────────────────────────────────────────────────────

// Tipos de contenido de nota (actualmente en pages — ver Tarea 2 del Plan)
export type AuthorType = 'INTERNAL' | 'ANONYMOUS' | 'MANUAL';
export type VideoType  = 'YOUTUBE' | 'NATIVO' | 'EMBEDDED';

// ─── Tipos nombrados para sub-estructuras anónimas ───────────
export interface ListicleItem {
  title: string;
  body: string;
}

export interface EventLiveBlog {
  eventTitle?: string;
  eventDescription?: string;
  placeOfEvent?: string;
  /** Typo preservado intencionalmente para compatibilidad con la UI */
  eventAdress?: string;
}

// ─── Base (lo que todos los tipos de nota comparten) ─────────
export interface NoteData {
  title?: string;
  secondaryTitle?: string;
  subTitle?: string;
  halfTitle?: string;
  body?: string;
  summary?: string;
  tags?: string[];
  hiddenTags?: string[];
  authorName?: string;
  authorDescription?: string;
  authorType?: AuthorType;
  listicleItems?: ListicleItem[];
  eventLiveBlog?: EventLiveBlog;
}

// ─── Sub-tipos discriminados (actualmente en NoteDataFactory.ts) ──
export interface PostData extends NoteData {
  title: string;
  body: string;
  tags: string[];
  authorName: string;
  authorType: AuthorType;
  // Campos PROHIBIDOS: secondaryTitle, halfTitle, listicleItems, eventLiveBlog
}

export interface ListicleData extends NoteData {
  title: string;
  body: string;
  tags: string[];
  authorName: string;
  authorType: AuthorType;
  listicleItems: ListicleItem[];
  // Campos PROHIBIDOS: secondaryTitle, halfTitle, eventLiveBlog
}

export interface LiveBlogData extends NoteData {
  title: string;
  tags: string[];
  authorName: string;
  listicleItems: ListicleItem[];
  eventLiveBlog: EventLiveBlog;
  // Campos PROHIBIDOS: secondaryTitle, halfTitle, body
}
```

**Compatibilidad con el stack:**
- `isolatedModules: true` — compatible, no usa `const enum`.
- `module: NodeNext` — compatible, imports con `.js`.
- Si `AuthorType` y `VideoType` se mueven a `interfaces/`, los archivos de pages deben re-exportarlos o actualizar sus imports.

---

### 3. `VideoData`
**Archivo:** [src/interfaces/data.ts](src/interfaces/data.ts) (líneas 35–42)
**Veredicto: MANTENER**

**Código actual:**
```typescript
export interface VideoData {
  video_type: VideoType
  url?: string;
  iframe?: string;
  title: string;
  description?: string;
  path?: string;
}
```

**Evaluación:**
- `video_type` requerido es correcto — es el discriminador de tipo.
- Tres consumidores coherentes con responsabilidades bien definidas: factory (generación), modal (llenado de formulario), page maestro (orquestación).
- Los sub-tipos `YoutubeVideoData`, `NativeVideoData`, `EmbeddedVideoData` en la factory refinan correctamente: cada uno especifica qué campo (`url`, `iframe` o `path`) es requerido para su tipo.

**Problema menor:** Los campos `url`, `iframe` y `path` son mutuamente excluyentes por diseño de negocio, pero el tipo base no lo expresa. El TypeScript compilará sin error si una factory de prueba popula `url` e `iframe` simultáneamente en un `VideoData` base.

**Propuesta (opcional, baja prioridad):**

Opción A — Mover sub-tipos a `/src/interfaces/data.ts` (igual que `NoteData`):
```typescript
export interface YoutubeVideoData extends VideoData {
  video_type: 'YOUTUBE';
  url: string;
  // iframe y path ausentes — TypeScript no los prohibe pero la factory sí
}

export interface NativeVideoData extends VideoData {
  video_type: 'NATIVO';
  path: string;
}

export interface EmbeddedVideoData extends VideoData {
  video_type: 'EMBEDDED';
  iframe: string;
}
```

Opción B — Discriminated union completa (mayor seguridad, mayor costo de migración):
```typescript
export type VideoData =
  | { video_type: 'YOUTUBE';   url: string;   title: string; description?: string }
  | { video_type: 'NATIVO';    path: string;  title: string; description?: string }
  | { video_type: 'EMBEDDED';  iframe: string; title: string; description?: string };
```

> **Advertencia de compatibilidad:** La Opción B es un breaking change. `Partial<VideoData>` sobre un union type discriminado requiere `Partial<VideoData[number]>` o una reescritura de los métodos `fillAll()` en `UploadVideoModal.ts`. Evaluar solo si la seguridad de tipo compensa el costo.

---

### 4. `AIDataNote`
**Archivo:** [src/interfaces/data.ts](src/interfaces/data.ts) (líneas 44–51)
**Veredicto: MANTENER**

**Código actual:**
```typescript
export interface AIDataNote {
  task?: string;
  context?: string;
  section?: number;
  paragraph?: number;
  tone?: number;
  language?: number;
}
```

**Evaluación:**
- Los campos numéricos (`section`, `paragraph`, `tone`, `language`) corresponden a índices de selectores de formulario UI. Son opcionales por diseño — el formulario tiene valores por defecto.
- Tres consumidores coherentes: factory, modal, page maestro.
- Sin problemas estructurales.

**Observación menor:** Los campos `tone` y `language` son índices numéricos de un selector de opciones. Si en el futuro el formulario UI cambia el orden de las opciones, el tipo no detectará el error. Esto es un riesgo de diseño (acoplar índices de UI a un tipo de datos), no un problema TypeScript. Documentar con JSDoc.

---

## Código sin contrato — Oportunidades detectadas

| # | Archivo | Línea | Estructura | Problema | Contrato propuesto | Beneficio |
|---|---------|-------|-----------|----------|-------------------|-----------|
| 1 | [LoginSection.ts:112](src/pages/login_page/LoginSection.ts#L112) | 112 | Tipo de retorno inline `{ success: boolean, errorMessage: string \| null }` | Sin nombre formal, inreutilizable | `LoginAttemptResult` en `auth.ts` | Reusabilidad, legibilidad, navegabilidad en IDE |
| 2 | Todo el proyecto | ~48 | `catch (err: any)` | `any` elimina type safety en error handlers | `catch (err: unknown)` + type guard | Seguridad de tipo consistente con `strict: true` |
| 3 | `NoteDataFactory.ts` (17–62) | 17–62 | `PostData`, `ListicleData`, `LiveBlogData` | Contratos de dominio en capa de factory | Mover a `interfaces/data.ts` | Separación de responsabilidades |
| 4 | `VideoDataFactory.ts` (17–39) | 17–39 | `YoutubeVideoData`, `NativeVideoData`, `EmbeddedVideoData` | Contratos de dominio en capa de factory | Mover a `interfaces/data.ts` (opcional) | Separación de responsabilidades |
| 5 | `NoteDataFactory.ts` (29–31, 47–50) | 29–50 | `ListicleItem`, `EventLiveBlog` | Sub-tipos anónimos inline en `NoteData` y en factory | Interfaces nombradas en `interfaces/data.ts` | Legibilidad, reusabilidad entre factories |

### Detalle — Tarea 1: Extraer `LoginAttemptResult`

```typescript
// Agregar en src/interfaces/auth.ts
/**
 * Resultado de un intento de login sin fallo rápido.
 * Devuelto por `LoginSection.attemptLogin()` para flujos de validación negativa.
 */
export interface LoginAttemptResult {
  success: boolean;
  errorMessage: string | null;
}

// Actualizar en src/pages/login_page/LoginSection.ts
import { LoginAttemptResult } from '../../interfaces/auth.js';

async attemptLogin(username: string, password: string): Promise<LoginAttemptResult> {
  // ... implementación sin cambios
}
```

### Detalle — Tarea 2: Reemplazar `error: any` por `error: unknown`

**Patrón actual (en ~48 archivos):**
```typescript
} catch (error: any) {
  logger.error(`Fallo: ${error.message}`, { label: this.config.label });
  throw error;
}
```

**Patrón propuesto:**
```typescript
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(`Fallo: ${message}`, { label: this.config.label });
  throw error;
}
```

> **Compatibilidad con el stack:** `unknown` en catch blocks es compatible con `strict: true`, `isolatedModules: true` y `module: NodeNext`. No hay restricción de Selenium v3.8 sobre esto.

---

## Evaluación de alternativas TypeScript

### A. Para `NoteData` — ¿Interface base + sub-interfaces vs. Discriminated Union?

| Alternativa | Descripción | Compatibilidad stack | Costo de migración |
|-------------|-------------|---------------------|-------------------|
| Interface base + extensión (actual mejorado) | `NoteData` base + `PostData extends NoteData`, etc. | ✅ Compatible con `isolatedModules`, `NodeNext` | Bajo — mover interfaces, actualizar imports |
| Discriminated union | `type NoteData = PostData \| ListicleData \| LiveBlogData` | ✅ Compatible | Alto — `Partial<NoteData>` ya no funciona igual; hay que reescribir `fillFullNote` |
| Abstract class | `abstract class NoteData` con propiedades concretas | ✅ Compatible con `isolatedModules` | Medio — requiere instanciación, pierde flexibilidad de Partial |

**Recomendación:** Interface base + sub-interfaces. Es el patrón que el proyecto ya usa correctamente en la factory — el refactor consiste en mover esas interfaces al lugar correcto, no en rediseñarlas.

**Por qué no Discriminated Union aquí:** `MainEditorPage.fillFullNote(data: Partial<NoteData>)` y `UploadVideoModal.fillAll(data: Partial<VideoData>)` dependen de `Partial<T>` sobre la base. Un discriminated union rompería esto sin un refactor más amplio.

**Por qué no Abstract Class:** Las interfaces de datos no tienen lógica compartida. Una abstract class requiere instanciación y añadiría complejidad sin beneficio real en este caso de uso.

---

### B. Para `error: any` — ¿`unknown` vs `Error` directamente?

| Alternativa | Descripción | Compatibilidad | Observación |
|-------------|-------------|---------------|-------------|
| `catch (err: unknown)` + `instanceof Error` guard | Estándar TypeScript post-4.0 | ✅ Completo | Recomendado |
| `catch (err: Error)` | Tipado directo, más ergonómico | ⚠️ No válido — TypeScript no permite tipos que no sean `any` o `unknown` en catch | Sintaxis inválida |
| `catch (err: any)` (actual) | Permite acceso sin guard | ✅ Compila, pero unsafe | No recomendado con `strict: true` |

---

### C. Para `RetryOptions` — ¿Existe una alternativa más avanzada en TypeScript?

La respuesta es sí. El problema real no es solo dónde vive `RetryOptions`, sino que el patrón de merge está **duplicado en ~50 constructores**:

```typescript
// Patrón actual — repetido en cada Page Object y acción del core
this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "ClassName") };
```

Esto es verboso, no tipado en su retorno, y cualquier cambio en la lógica de resolución requiere actualizar 50 archivos.

#### Propuesta pro: `resolveRetryConfig()` + operador `satisfies`

TypeScript 5.9.3 (versión instalada en el proyecto) soporta el operador `satisfies` introducido en 4.9.

```typescript
// src/interfaces/config.ts — contrato puro
export interface RetryOptions {
  timeoutMs?: number;
  retries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  label?: string;
  supressRetry?: boolean;
}
```

```typescript
// src/core/config/defaultConfig.ts — implementación + helper

import type { RetryOptions } from '../../interfaces/config.js';
import { stackLabel } from '../utils/stackLabel.js';

// satisfies valida que DefaultConfig cumpla el tipo sin perder la inferencia
// de literales. Si se agrega un campo nuevo a RetryOptions y se omite aquí,
// el compilador falla en este archivo — no en los 50 que lo consumen.
export const DefaultConfig = {
  timeoutMs: 3000,
  retries: 4,
  initialDelayMs: 300,
  maxDelayMs: 6000,
  backoffFactor: 2,
  label: "[RETRY]",
  supressRetry: false
} satisfies Required<RetryOptions>;

/**
 * Resuelve la configuración final de reintentos mezclando defaults con overrides.
 * Centraliza el patrón `{ ...DefaultConfig, ...opts, label: stackLabel(...) }`
 * que actualmente se repite en ~50 constructores del proyecto.
 *
 * @param opts - Opciones parciales del caller (pueden ser vacías).
 * @param contextLabel - Nombre del componente para trazabilidad.
 * @returns Configuración completa con todos los campos resueltos.
 */
export function resolveRetryConfig(
  opts: RetryOptions,
  contextLabel: string
): Required<RetryOptions> {
  return {
    ...DefaultConfig,
    ...opts,
    label: stackLabel(opts.label, contextLabel)
  };
}
```

Resultado en cada constructor, reemplazando el patrón repetido:

```typescript
// Antes (patrón actual en ~50 archivos):
this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "LoginSection") };

// Después:
this.config = resolveRetryConfig(opts, "LoginSection");
```

#### Comparativa de opciones

| Opción | Pros | Contras | Compatibilidad |
|--------|------|---------|----------------|
| Mantener estado actual | Sin migración | Lógica de merge duplicada, sin tipo de retorno explícito | ✅ |
| Solo mover `RetryOptions` a `interfaces/` | Centraliza el contrato | No resuelve la duplicación del spread | ✅ |
| `resolveRetryConfig()` + `satisfies` (propuesta) | DRY, `Required<RetryOptions>` explícito, validación en `DefaultConfig` al compilar | ~50 constructores a actualizar | ✅ `isolatedModules`, `NodeNext`, TS 5.x |

**Beneficio del operador `satisfies` específicamente:** si en el futuro se agrega un campo a `RetryOptions` y se omite en `DefaultConfig`, el error aparece en `defaultConfig.ts` — no silenciosamente en runtime. Con el `as` cast que existía implícitamente antes, ese error no se detectaba hasta ejecución.

---

### D. Para action functions — ¿Agregar generics?

```typescript
// Estado actual — src/core/actions/waitFind.ts
export async function waitFind(
  driver: WebDriver,
  locator: Locator,
  opts: RetryOptions = {}
): Promise<WebElement>

// Propuesta con generic (compatible con el stack)
export async function waitFind<T extends WebElement = WebElement>(
  driver: WebDriver,
  locator: Locator,
  opts: RetryOptions = {}
): Promise<T>
```

**Compatibilidad:** ✅ Compatible con `isolatedModules: true` y `module: NodeNext`. El tipo `WebElement` de `selenium-webdriver` permite extensión.

**Valor real:** Bajo en el contexto actual — Selenium WebDriver v3.8 no ofrece subclasses de `WebElement` que los tests necesiten distinguir. Si el proyecto migra a WebDriver v4 o Playwright, el valor aumenta.

---

## Plan de acción recomendado

Tareas ordenadas por impacto y dependencias.

| # | Tarea | Archivos afectados | Impacto | Prioridad | Depende de |
|---|-------|--------------------|---------|-----------|-----------|
| 1 | Nombrar `ListicleItem` y `EventLiveBlog` como interfaces en `data.ts` | `data.ts`, `NoteDataFactory.ts` | Bajo | Alta | — |
| 2 | Mover `PostData`, `ListicleData`, `LiveBlogData` de `NoteDataFactory.ts` a `data.ts` | `data.ts`, `NoteDataFactory.ts` | Medio | Alta | Tarea 1 |
| 3 | Resolver imports circulares: mover `AuthorType` a `interfaces/` o redireccionar | `data.ts`, `EditorAuthorSection.ts` | Medio | Alta | Tarea 2 |
| 4 | Reemplazar `AuthCredentials` por `type` alias en `src/pages/login_page/login.types.ts` y agregar `LoginAttemptResult` | `auth.ts` (eliminar), `login.types.ts` (nuevo), `LoginSection.ts`, `MainLoginPage.ts` | Bajo | Media | — |
| 5 | Reemplazar `error: any` por `error: unknown` (crear `getErrorMessage()` helper primero) | `src/core/utils/errorUtils.ts` (nuevo) + ~50 archivos | Medio | Media | — |
| 6 | Mover `YoutubeVideoData`, `NativeVideoData`, `EmbeddedVideoData` a `data.ts` | `data.ts`, `VideoDataFactory.ts` | Bajo | Baja | — |
| 7 | Crear `src/interfaces/config.ts` con `RetryOptions` | `interfaces/config.ts` (nuevo), `defaultConfig.ts` | Bajo | Baja | — |
| 8 | Agregar `resolveRetryConfig()` + `satisfies` en `defaultConfig.ts` y actualizar ~50 constructores | `defaultConfig.ts` + ~50 archivos | Alto | Baja | Tarea 7 |
| 9 | Agregar generics a action functions (`waitFind`, `clickSafe`, etc.) | `src/core/actions/*.ts` | Bajo | Muy baja | — |

---

## Notas para sesión de implementación

### Riesgos identificados

**Riesgo 1 — Import circular en `data.ts`:**
`data.ts` importa `AuthorType` desde `EditorAuthorSection.ts` (capa pages) y `VideoType` desde `UploadVideoBtn.ts`. Esto invierte la jerarquía natural `interfaces → pages`. Antes de mover sub-tipos a `interfaces/`, resolver esta dependencia. Opciones:
- Mover `AuthorType` y `VideoType` a `interfaces/data.ts` (o un nuevo `interfaces/types.ts`) y que las pages re-exporten desde allí.
- Aceptar la dependencia inversa explícitamente y documentarla.

> ⚠️ No iniciar Tarea 3 sin resolver este punto primero.

**Riesgo 2 — `Partial<NoteData>` en múltiples consumidores:**
`fillFullNote(data: Partial<NoteData>)` en `MainEditorPage.ts` y métodos similares dependen de `Partial<T>` sobre la base. Al mover sub-tipos, verificar que ningún consumidor esté recibiendo un sub-tipo donde espera `Partial<NoteData>` — si ocurre, TypeScript lo detectará como error en compilación.

**Riesgo 3 — `error: any` en catch con `.message` acceso directo:**
La mayoría de los catch blocks hacen `error.message`. Cambiar a `unknown` requiere agregar el type guard `error instanceof Error ? error.message : String(error)` en cada uno. El riesgo es omitir alguno. Recomendación: hacer el cambio en una sola PR con un helper:

```typescript
// src/core/utils/errorUtils.ts (nuevo archivo utilitario)
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
```

Luego reemplazar todos los `error.message` por `getErrorMessage(error)`.

**Riesgo 4 — Mover `RetryOptions` (Tarea 8):**
Esta es la tarea de mayor blast radius (~50 archivos). Ejecutar solo con un IDE que soporte rename-symbol automático o con un script de sed controlado. No es urgente y puede quedar para una sesión dedicada.

---

### Archivos de alta criticidad

| Archivo | Por qué es crítico |
|---------|-------------------|
| [src/interfaces/data.ts](src/interfaces/data.ts) | Punto central del refactor — todos los cambios de Tareas 2-4 ocurren aquí o parten de aquí |
| [src/data_test/factories/NoteDataFactory.ts](src/data_test/factories/NoteDataFactory.ts) | Define sub-tipos que deben moverse; 3 interfaces + 2 sub-tipos anónimos |
| [src/pages/post_page/note_editor_page/MainEditorPage.ts](src/pages/post_page/note_editor_page/MainEditorPage.ts) | Consumidor primario de `Partial<NoteData>` — verificar compatibilidad post-refactor |
| [src/core/config/defaultConfig.ts](src/core/config/defaultConfig.ts) | Contiene `RetryOptions` — fuente de ~50 imports si se ejecuta Tarea 8 |
| [src/pages/login_page/LoginSection.ts](src/pages/login_page/LoginSection.ts) | Único gap de contrato en la capa pages (Tarea 1) |

---

### Orden de refactoring sugerido

```
Sesión 1 (bajo riesgo, alto valor inmediato)
  → Tarea 1: ListicleItem + EventLiveBlog como interfaces nombradas en data.ts

Sesión 2 (medio riesgo, requiere decisión previa sobre imports circulares)
  → Decidir destino de AuthorType/VideoType (interfaces/ o re-export desde pages)
  → Tarea 2: Mover PostData, ListicleData, LiveBlogData a interfaces/data.ts
  → Tarea 3: Actualizar imports en EditorAuthorSection y NoteDataFactory

Sesión 3 (independiente, amplio pero mecánico)
  → Crear getErrorMessage() helper en core/utils/
  → Tarea 5: Reemplazar error: any por error: unknown en core/ + pages/

Sesión 4 (independiente, bajo riesgo)
  → Tarea 4: Reemplazar AuthCredentials por type alias + LoginAttemptResult
    (crear login.types.ts, actualizar LoginSection + MainLoginPage, eliminar auth.ts)

Sesión futura (opcional, mayor blast radius)
  → Tarea 7: Crear interfaces/config.ts con RetryOptions
  → Tarea 8: resolveRetryConfig() + satisfies en defaultConfig.ts + ~50 constructores
  → Tarea 6: Mover sub-tipos VideoData (bajo impacto)
  → Tarea 9: Generics en action functions (muy bajo valor actual)
```

---

### Verificación post-refactor

Después de cada sesión de implementación, ejecutar:

```bash
# Compilación TypeScript sin errores
npx tsc --noEmit

# Tests de regresión completos
npx jest --runInBand

# Verificar que no hay imports rotos
npx ts-node --esm -e "import './src/interfaces/data.js'"
```

---

*Informe generado en sesión de solo lectura. Ningún archivo existente fue modificado durante la auditoría.*
