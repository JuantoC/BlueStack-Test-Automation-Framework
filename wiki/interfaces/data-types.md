---
source: src/interfaces/data.ts · src/interfaces/config.ts
last-updated: 2026-04-13
---

# Interfaces: Data Types

## Propósito

Contratos de datos del framework. `config.ts` define la interfaz de configuración de retry. `data.ts` define todos los tipos de entidades del CMS usados por factories y Page Objects.

---

## `RetryOptions` — configuración de retry

```typescript
// src/interfaces/config.ts
interface RetryOptions {
  timeoutMs?: number;       // ms de espera Selenium (default: 3000)
  retries?: number;         // intentos máximos (default: 4)
  initialDelayMs?: number;  // primer delay ms (default: 300)
  maxDelayMs?: number;      // cap del backoff (default: 6000)
  backoffFactor?: number;   // multiplicador (default: 2)
  label?: string;           // trazabilidad — SIEMPRE propagado
  supressRetry?: boolean;   // true = sin reintentos (default: false)
}
```

Los defaults viven en `defaultConfig.ts` → `DefaultConfig`. Esta interfaz es el contrato puro, sin lógica.

---

## Tipos primitivos

```typescript
type AuthorType = 'INTERNAL' | 'ANONYMOUS' | 'MANUAL';
type VideoType  = 'YOUTUBE' | 'NATIVO' | 'EMBEDDED';
```

---

## Jerarquía de notas

```
NoteData (base — todos los campos opcionales)
├── PostData       (extiende NoteData, campos requeridos: title, body, tags, authorName, authorType)
├── ListicleData   (extiende NoteData, requeridos: + listicleItems)
└── LiveBlogData   (extiende NoteData, requeridos: + listicleItems, eventLiveBlog; prohibido: body)
```

### `NoteData` — interfaz base

```typescript
interface NoteData {
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
```

### `PostData`

```typescript
interface PostData extends NoteData {
  title: string;          // requerido
  body: string;           // requerido
  tags: string[];         // requerido
  authorName: string;     // requerido
  authorType: AuthorType; // requerido
  // PROHIBIDOS: secondaryTitle, halfTitle, listicleItems, eventLiveBlog
}
```

### `ListicleData`

```typescript
interface ListicleData extends NoteData {
  title: string;
  body: string;
  tags: string[];
  authorName: string;
  authorType: AuthorType;
  listicleItems: ListicleItem[];  // requerido
  // PROHIBIDOS: secondaryTitle, halfTitle, eventLiveBlog
}
```

### `LiveBlogData`

```typescript
interface LiveBlogData extends NoteData {
  title: string;
  tags: string[];
  authorName: string;
  listicleItems: ListicleItem[];   // requerido
  eventLiveBlog: EventLiveBlog;    // requerido
  // PROHIBIDOS: secondaryTitle, halfTitle, body
}
```

### `ListicleItem`

```typescript
interface ListicleItem {
  title: string;
  body: string;
}
```

### `EventLiveBlog`

```typescript
interface EventLiveBlog {
  eventTitle?: string;
  eventDescription?: string;
  placeOfEvent?: string;
  eventAdress?: string;  // ⚠️ typo "Adress" (sin h) — preservado intencionalmente por compatibilidad con el backend
}
```

---

## Jerarquía de videos

```
VideoData (base)
├── YoutubeVideoData   (video_type: 'YOUTUBE', url: string requerido)
├── NativeVideoData    (video_type: 'NATIVO', path: string requerido)
└── EmbeddedVideoData  (video_type: 'EMBEDDED', iframe: string requerido)
```

```typescript
interface VideoData {
  video_type: VideoType;
  url?: string;
  iframe?: string;
  title: string;
  description?: string;
  path?: string;
}
```

---

## Otros tipos

### `AIDataNote`

```typescript
interface AIDataNote {
  task?: string;       // Prompt de tarea para el asistente IA
  context?: string;    // Perfil periodístico / contexto
  section?: number;    // Índice de sección
  paragraph?: number;  // Número de párrafos
  tone?: number;       // Índice de tono
  language?: number;   // Índice de idioma
}
```

### `TagData`

```typescript
interface TagData {
  title: string;          // requerido
  description?: string;   // CKEditor
  synonyms?: string[];    // chip input, confirmado con Enter
  tipo?: string;          // mat-select "Tipo" — ej: 'tags_gammers'
  estado?: string;        // mat-select "Estado" — ej: 'Aprobados', 'Desaprobados'
}
```

### `ImageData`

```typescript
interface ImageData {
  path: string;          // ruta relativa desde raíz del proyecto — requerido
  title?: string;        // si no se provee, omite verificación post-subida
  description?: string;
}
```

---

## Notas de uso

- `PostData`, `ListicleData`, `LiveBlogData` son los tipos que reciben los métodos `fillFullNote` de los editores. Cada tipo restringe qué campos se procesan.
- `eventAdress` conserva el typo — no corregirlo. El backend y la UI lo usan así.
- `VideoType` es `'NATIVO'` (no `'NATIVE'`) — verificar al crear factories o fixtures.
