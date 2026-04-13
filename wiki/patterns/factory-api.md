---
source: src/data_test/factories/ (NoteDataFactory.ts · VideoDataFactory.ts · AINoteDataFactory.ts · ImageDataFactory.ts · index.ts)
last-updated: 2026-04-13
---

# Patterns: Factory API

## Propósito

Factories que generan datos de prueba realistas en español usando faker-js. Cada factory produce objetos tipados compatibles con las interfaces de `src/interfaces/data.ts`.

---

## API pública / Métodos principales

| Factory | Método | Retorna |
|---------|--------|---------|
| `PostDataFactory` | `.create()` | `PostData` |
| `PostDataFactory` | `.createMany(count)` | `PostData[]` |
| `ListicleDataFactory` | `.create({ itemCount?: number })` | `ListicleData` |
| `ListicleDataFactory` | `.createMany(count)` | `ListicleData[]` |
| `LiveBlogDataFactory` | `.create({ entryCount?: number })` | `LiveBlogData` |
| `LiveBlogDataFactory` | `.createMany(count)` | `LiveBlogData[]` |
| `YoutubeVideoDataFactory` | `.create()` | `YoutubeVideoData` |
| `YoutubeVideoDataFactory` | `.createMany(count)` | `YoutubeVideoData[]` |
| `NativeVideoDataFactory` | `.create()` | `NativeVideoData` |
| `EmbeddedVideoDataFactory` | `.create()` | `EmbeddedVideoData` |
| `EmbeddedVideoDataFactory` | `.createMany(count)` | `EmbeddedVideoData[]` |
| `AINoteDataFactory` | `.create()` | `AIDataNote` |
| `AINoteDataFactory` | `.createFromGroup(group)` | `AIDataNote` |
| `AINoteDataFactory` | `.createMany(count)` | `AIDataNote[]` |
| `AINoteDataFactory` | `.createManyFromGroup(group, count)` | `AIDataNote[]` |
| `ImageDataFactory` | `.create()` | `ImageData` |
| `ImageDataFactory` | `.createMany(count)` | `ImageData[]` |

---

## Importación recomendada

```typescript
// Desde index — punto de entrada único
import { PostDataFactory, ListicleDataFactory, YoutubeVideoDataFactory } from "../../src/data_test/factories/index.js";
```

---

## `NoteDataFactory` — notas

**Pools internos:**
- `TEMAS_TECNOLOGIA`, `TEMAS_CULTURA`, `TEMAS_NEGOCIOS` — temas para títulos
- `AUTORES` — objetos `{ name, description }` de autores ficticios en español

```typescript
const post = PostDataFactory.create();
// → { title, body, tags: string[], authorName, authorType: 'INTERNAL' | 'ANONYMOUS' | 'MANUAL', ... }

const listicle = ListicleDataFactory.create({ itemCount: 3 });
// → { ...PostData, listicleItems: [{ title, body }, ...] }

const liveblog = LiveBlogDataFactory.create({ entryCount: 2 });
// → { title, tags, authorName, listicleItems, eventLiveBlog: { eventTitle, ... } }
// Nota: LiveBlogData no tiene campo body
```

---

## `VideoDataFactory` — videos

**Pools internos:**
- `YOUTUBE_VIDEO_IDS` — 13 IDs reales de YouTube
- `EMBEDDED_IFRAME_URLS` — iframes de YouTube, Vimeo, Dailymotion
- `NATIVE_VIDEO_PATHS` — rutas de archivos de video en `src/data_test/videos/`
- `CATEGORIAS_VIDEO`, `TEMAS_VIDEO` — metadata de categorías

```typescript
const youtube = YoutubeVideoDataFactory.create();
// → { video_type: 'YOUTUBE', url: 'https://youtube.com/watch?v=...', title, description? }

const native = NativeVideoDataFactory.create();
// → { video_type: 'NATIVO', path: 'src/data_test/videos/...', title, description? }

const embedded = EmbeddedVideoDataFactory.create();
// → { video_type: 'EMBEDDED', iframe: '<iframe ...>', title, description? }
```

---

## `AINoteDataFactory` — posts generados por IA

**`ThematicGroup`** — grupos temáticos disponibles:
- `'politica'` | `'gastronomia'` | `'tecnologia'` | `'deportes'`
- `'cultura'` | `'economia'` | `'ciencia'` | `'entretenimiento'`

```typescript
const aiData = AINoteDataFactory.create();
// → picks un grupo aleatorio
// → { task, context, section, paragraph, tone, language }

const aiData = AINoteDataFactory.createFromGroup('tecnologia');
// → AIDataNote del pool temático específico
```

Cada grupo tiene `contexts` (perfiles de periodista) y `tasks` (prompts de artículo) específicos.

---

## `ImageDataFactory` — imágenes

**`IMAGE_PATHS` constant** — 4 imágenes de prueba en `src/data_test/images/`:
- Formatos: JPG, WEBP, PNG

```typescript
const image = ImageDataFactory.create();
// → { path: 'src/data_test/images/sample.jpg', title: 'sample', description? }
// title derivado del nombre de archivo sin extensión
```

---

## Notas de uso

- Todos los factories usan faker-js con pools **en español** — los datos generados son texto en castellano.
- `createMany(count)` retorna array de N objetos independientes (datos únicos por objeto).
- Los factories no tienen estado — cada llamada a `create()` es idempotente a efectos del test.
- Las imágenes y videos de prueba están en `src/data_test/images/` y `src/data_test/videos/` respectivamente.
- `ImageData.path` es ruta relativa desde la raíz del proyecto. El PO de imágenes la usa con `path.resolve()`.
