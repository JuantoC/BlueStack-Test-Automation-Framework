---
name: create-data-fixture
description: Genera entradas de datos de prueba (fixtures) para los archivos de dataTest del framework Bluestack. Usar siempre que el usuario quiera agregar datos de prueba nuevos, cuando diga "necesito datos para un test", "agregá un caso en noteData", "quiero probar con un video nuevo", "creame un liveblog de prueba", "nuevo fixture", o cualquier variante de necesitar datos para cubrir un caso de prueba. Aplica para todos los tipos de contenido: Post, Listicle, LiveBlog, Video Nativo y Video YouTube.
---

# Create Data Fixture Skill

Genera entradas de datos de prueba listas para copiar en los archivos `dataTest/`, siguiendo estrictamente las interfaces TypeScript definidas en `src/interfaces/data.ts`.

---

## Archivos de destino y sus arrays

| Tipo de contenido | Archivo destino | Array de exportación |
|---|---|---|
| Post | `dataTest/noteData.ts` | `PostData` |
| Listicle | `dataTest/noteData.ts` | `ListicleData` |
| LiveBlog | `dataTest/noteData.ts` | `LiveBlogData` |
| Video YouTube | `dataTest/videoData.ts` | `YoutubeVideoData` |
| Video Nativo | `dataTest/videoData.ts` | `NativeVideoData` |

---

## Interfaces de referencia

### `NoteData` (Post, Listicle, LiveBlog)

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
  listicleItems?: Array<{ title: string; body: string; }>;
  eventLiveBlog?: {
    eventTitle?: string;
    eventDescription?: string;
    placeOfEvent?: string;
    eventAdress?: string;
  }
}
```

### `VideoData`

```typescript
interface VideoData {
  video_type: VideoType;
  url?: string;       // Solo YouTube
  title: string;
  description?: string;
  path?: string;      // Solo Nativo (ruta al archivo local)
}
```

---

## Reglas por tipo de contenido

### Post
Campos obligatorios: `title`, `body`, `tags`, `authorName`, `authorType`
Campos recomendados: `subTitle`, `halfTitle`, `hiddenTags`, `authorDescription`
**No incluir:** `listicleItems`, `eventLiveBlog`

```typescript
{
  title: "...",
  subTitle: "...",
  halfTitle: "...",
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
**No incluir:** `halfTitle`, `eventLiveBlog`
`listicleItems` debe tener mínimo 3 items y máximo 10. Cada item con `title` y `body`.

```typescript
{
  title: "X cosas sobre...",   // El título suele indicar la cantidad de items
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
    // ...
  ]
}
```

### LiveBlog
Campos obligatorios: `title`, `tags`, `authorName`, `listicleItems`, `eventLiveBlog`
Campos recomendados: `subTitle`, `halfTitle`, `authorDescription`
**No incluir:** `body` (el contenido va en los items del live)
`listicleItems` representan las entradas cronológicas del live. Mínimo 5 entradas, idealmente 10+. El `title` de cada item debe incluir la hora: `"HH:MM - Descripción"`.
`eventLiveBlog.eventTitle` es obligatorio. Los otros campos del evento son opcionales.

```typescript
{
  title: "...",
  subTitle: "...",
  halfTitle: "...",
  tags: ["...", "..."],
  hiddenTags: ["...", "..."],
  authorName: "...",
  authorDescription: "...",
  listicleItems: [
    { title: "09:00 - Apertura", body: "..." },
    { title: "09:15 - ...", body: "..." },
    // ...
  ],
  eventLiveBlog: {
    eventTitle: "...",
  }
}
```

### Video YouTube
Campos obligatorios: `video_type`, `url`, `title`
Campo recomendado: `description`
**No incluir:** `path`
`video_type` siempre es `VideoType.YOUTUBE`.
`url` debe ser una URL válida de YouTube (`https://www.youtube.com/watch?v=...`).

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
**No incluir:** `url`
`video_type` siempre es `VideoType.NATIVO`.
`path` es la ruta relativa al archivo de video local, desde la raíz del proyecto. Siempre dentro de `dataTest/`.

```typescript
{
  video_type: VideoType.NATIVO,
  title: "...",
  description: "...",
  path: "dataTest/nombre-del-archivo.mp4"
}
```

---

## Reglas generales de contenido

1. **Datos realistas**: Generar contenido coherente y temáticamente consistente. No usar placeholders como "Lorem ipsum" ni "Test título 1".
2. **Títulos únicos**: Cada fixture debe tener un título que no repita los ya existentes en el array.
3. **Tags relevantes**: Los tags deben ser palabras clave reales relacionadas con el tema del contenido.
4. **AuthorType**: Siempre usar `AuthorType.MANUAL` salvo que el usuario indique lo contrario.
5. **Datos estáticos**: No generar timestamps ni valores dinámicos. Todo hardcodeado.
6. **Idioma**: Respetar el idioma del contenido existente en el archivo (actualmente español).

---

## Proceso de generación

1. **Identificar el tipo** de contenido que el usuario necesita (Post / Listicle / LiveBlog / Video YT / Video Nativo).
2. **Preguntar el tema** si el usuario no lo especificó.
3. **Generar el objeto** completo respetando las reglas del tipo correspondiente.
4. **Indicar dónde agregarlo**: decirle al usuario en qué archivo y en qué array debe pegar la entrada.
5. **Si hay múltiples fixtures**, generarlos todos juntos listos para copiar.

---

## Salida esperada

La salida debe ser **solo el objeto o los objetos** listos para pegar dentro del array correspondiente, con una indicación clara de destino. Ejemplo:

> Agregá este objeto al array `PostData` en `dataTest/noteData.ts`:

```typescript
{
  title: "Introducción a los Web Components",
  subTitle: "Componentes nativos del navegador sin frameworks",
  halfTitle: "Web Components",
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

Si el usuario necesita crear el archivo desde cero, recordarle los imports necesarios:

**noteData.ts:**
```typescript
import { NoteData } from "../src/interfaces/data.js";
import { AuthorType } from "../src/pages/post_page/note_editor_page/EditorAuthorSection.js";
```

**videoData.ts:**
```typescript
import { VideoType } from "../src/pages/videos_page/UploadVideoBtn.js";
import { VideoData } from "../src/interfaces/data.js";
```