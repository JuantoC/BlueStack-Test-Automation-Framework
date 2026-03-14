---
name: create-data-fixture
description: Genera entradas de datos de prueba (fixtures) para los archivos de data_test del framework Bluestack. Usar siempre que el usuario quiera agregar datos de prueba nuevos, cuando diga "necesito datos para un test", "agregá un caso en noteData", "quiero probar con un video nuevo", "creame un liveblog de prueba", "nuevo fixture", o cualquier variante de necesitar datos para cubrir un caso de prueba. Aplica para todos los tipos de contenido: Post, Listicle, LiveBlog, Video Nativo y Video YouTube.
---

# Create Data Fixture Skill

Genera entradas de datos de prueba listas para agregar en los archivos de `src/data_test/`, siguiendo estrictamente las interfaces definidas en `@src/interfaces/data.ts`.

> **Siempre leer `@src/interfaces/data.ts` antes de generar cualquier fixture** para usar los campos actualizados. No asumir campos de memoria.

---

## Archivos de destino y sus arrays

| Tipo de contenido | Archivo destino | Array de exportación |
|---|---|---|
| Post | `src/data_test/noteData.ts` | `PostData` |
| Listicle | `src/data_test/noteData.ts` | `ListicleData` |
| LiveBlog | `src/data_test/noteData.ts` | `LiveBlogData` |
| Video YouTube | `src/data_test/videoData.ts` | `YoutubeVideoData` |
| Video Nativo | `src/data_test/videoData.ts` | `NativeVideoData` |

Cada tipo de contenido va en su array correspondiente. No mezclar tipos en un mismo array.

---

## Reglas por tipo de contenido

### Post
Campos obligatorios: `title`, `body`, `tags`, `authorName`, `authorType`
Campos recomendados: `subTitle`, `hiddenTags`, `authorDescription`
**Campos PROHIBIDOS:** `secondaryTitle`, `halfTitle`, `listicleItems`, `eventLiveBlog`

```typescript
{
  title: "...",
  subTitle: "...",
  body: "...",
  tags: ["...", "..."],
  hiddenTags: ["...", "..."],
  authorName: "...",
  authorDescription: "...",
  authorType: AuthorType.MANUAL
}
```

### Listicle
Campos obligatorios: `title`, `body`, `tags`, `authorName`, `authorType`, `listicleItems`
Campos recomendados: `subTitle`, `hiddenTags`, `authorDescription`
**Campos PROHIBIDOS:** `secondaryTitle`, `halfTitle`, `eventLiveBlog`

`listicleItems`: mínimo 3 items, máximo 10. Cada item con `title` y `body`.
El título del Listicle suele indicar la cantidad de items (ej: "5 estrategias para...").

```typescript
{
  title: "X cosas sobre...",
  subTitle: "...",
  body: "...",
  tags: ["...", "..."],
  hiddenTags: ["...", "..."],
  authorName: "...",
  authorDescription: "...",
  authorType: AuthorType.MANUAL,
  listicleItems: [
    { title: "...", body: "..." },
    { title: "...", body: "..." },
    // mínimo 3
  ]
}
```

### LiveBlog
Campos obligatorios: `title`, `tags`, `authorName`, `listicleItems`, `eventLiveBlog`
Campos recomendados: `subTitle`, `authorDescription`
**Campos PROHIBIDOS:** `secondaryTitle`, `halfTitle`, `body`

`listicleItems`: entradas cronológicas del live. Mínimo 5, idealmente 10+.
El `title` de cada item debe tener formato `"HH:MM - Descripción del momento"`.
`eventLiveBlog.eventTitle` es obligatorio. Los demás campos del evento son opcionales.

```typescript
{
  title: "...",
  subTitle: "...",
  tags: ["...", "..."],
  hiddenTags: ["...", "..."],
  authorName: "...",
  authorDescription: "...",
  listicleItems: [
    { title: "09:00 - Apertura", body: "..." },
    { title: "09:15 - ...", body: "..." },
    // mínimo 5
  ],
  eventLiveBlog: {
    eventTitle: "...",
  }
}
```

### Video YouTube
Campos obligatorios: `video_type`, `url`, `title`
Campo recomendado: `description`
**Campos PROHIBIDOS:** `path`

`video_type` siempre es `VideoType.YOUTUBE`.
`url` debe ser una URL válida de YouTube: `https://www.youtube.com/watch?v=...`

```typescript
{
  video_type: VideoType.YOUTUBE,
  url: "https://www.youtube.com/watch?v=...",
  title: "...",
  description: "..."
}
```

### Video Nativo
Campos obligatorios: `video_type`, `title`, `path`
Campo recomendado: `description`
**Campos PROHIBIDOS:** `url`

`video_type` siempre es `VideoType.NATIVO`.
`path` es la ruta relativa al archivo de video desde la raíz del proyecto. El archivo debe estar en `src/data_test/`.

```typescript
{
  video_type: VideoType.NATIVO,
  title: "...",
  description: "...",
  path: "src/data_test/nombre-del-archivo.mp4"
}
```

---

## Reglas generales de contenido

1. **Datos realistas**: contenido coherente y temáticamente consistente. Nada de "Lorem ipsum" ni "Test título 1".
2. **Títulos únicos**: leer los fixtures existentes y no repetir títulos ya usados.
3. **Tags relevantes**: palabras clave reales relacionadas con el tema.
4. **AuthorType**: siempre `AuthorType.MANUAL` salvo indicación contraria.
5. **Valores dinámicos permitidos**: se pueden usar timestamps o valores generados si el usuario lo pide o si el contexto lo justifica (ej: títulos que necesitan ser únicos por ejecución).
6. **Idioma**: respetar el idioma del contenido existente en el archivo (actualmente español).
7. **Array correcto**: `PostData` solo tiene posts, `ListicleData` solo listicles, `LiveBlogData` solo liveblogs. Nunca mezclar.

---

## Proceso de generación

1. **Leer `@src/interfaces/data.ts`** para confirmar los campos disponibles y actualizados.
2. **Identificar el tipo** de contenido (Post / Listicle / LiveBlog / Video YT / Video Nativo).
3. **Preguntar el tema** si el usuario no lo especificó.
4. **Generar el objeto** completo respetando las reglas del tipo correspondiente.
5. **Indicar el destino**: en qué archivo y en qué array debe agregarse.

---

## Formato de salida esperado

Indicar siempre el destino antes del objeto. Ejemplo:

> Agregá este objeto al array `PostData` en `src/data_test/noteData.ts`:

```typescript
{
  title: "Introducción a los Web Components",
  subTitle: "Componentes nativos del navegador sin frameworks",
  body: "Los Web Components permiten crear elementos HTML reutilizables con encapsulamiento nativo...",
  tags: ["web-components", "frontend", "html"],
  hiddenTags: ["native", "standards"],
  authorName: "Valentina Cruz",
  authorDescription: "Frontend Developer especializada en estándares web",
  authorType: AuthorType.MANUAL
},
```

---

## Imports requeridos por archivo

**src/data_test/noteData.ts:**
```typescript
import { NoteData } from "../interfaces/data.js";
import { AuthorType } from "../pages/post_page/note_editor_page/EditorAuthorSection.js";
```

**src/data_test/videoData.ts:**
```typescript
import { VideoType } from "../pages/videos_page/UploadVideoBtn.js";
import { VideoData } from "../interfaces/data.js";
```