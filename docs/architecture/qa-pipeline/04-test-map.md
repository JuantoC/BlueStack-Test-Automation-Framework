# Mapeo Módulo → Sessions (test-map.json) — QA Automation Pipeline
> Parte de: [docs/architecture/qa-pipeline/INDEX.md](INDEX.md)

## 6. Mapeo Módulo → Sessions (test-map.json)

### 6.1 test-map.json (con sessions reales del repo)

```json
{
  "version": "1.0",
  "last_updated": "2026-04-13",
  "modules": {
    "post": {
      "sessions": ["NewPost", "NewListicle", "NewLiveBlog", "MassPublishNotes"],
      "paths": [
        "sessions/post/NewPost.test.ts",
        "sessions/post/NewListicle.test.ts",
        "sessions/post/NewLiveBlog.test.ts",
        "sessions/post/MassPublishNotes.test.ts"
      ],
      "page_objects": ["src/pages/post_page/"],
      "keywords": ["nota", "post", "listicle", "liveblog", "editor", "publicar", "borrador", "contenido", "imagen de portada", "imagen destacada"],
      "component_jira": "Post",
      "validated": true
    },
    "ai-post": {
      "sessions": ["NewAIPost"],
      "paths": ["sessions/post/NewAIPost.test.ts"],
      "page_objects": ["src/pages/post_page/AIPost/"],
      "keywords": ["nota IA", "AI", "prompt", "generación IA", "AI_POST", "inteligencia artificial", "IA genera"],
      "component_jira": "AI",
      "validated": true
    },
    "video": {
      "sessions": ["NewYoutubeVideo", "NewEmbeddedVideo", "MassPublishVideos"],
      "paths": [
        "sessions/video/NewYoutubeVideo.test.ts",
        "sessions/video/NewEmbeddedVideo.test.ts",
        "sessions/video/MassPublishVideos.test.ts"
      ],
      "page_objects": ["src/pages/videos_page/"],
      "keywords": ["video", "youtube", "embedded", "subir video", "iframe", "reproductor", "upload video"],
      "component_jira": "Video",
      "validated": true
    },
    "images": {
      "sessions": ["MassPublishImages"],
      "paths": ["sessions/images/MassPublishImages.test.ts"],
      "page_objects": ["src/pages/images_pages/"],
      "keywords": ["imagen", "image", "subir imagen", "imágenes", "gallery", "foto"],
      "component_jira": "Images",
      "validated": true
    },
    "auth": {
      "sessions": ["FailedLogin"],
      "paths": ["sessions/auth/FailedLogin.test.ts"],
      "page_objects": ["src/pages/login_page/"],
      "keywords": ["login", "auth", "autenticación", "credenciales", "two-factor", "2FA"],
      "component_jira": "Auth",
      "validated": true
    },
    "cross": {
      "sessions": ["PostAndVideo"],
      "paths": ["sessions/cross/PostAndVideo.test.ts"],
      "page_objects": ["src/pages/post_page/", "src/pages/videos_page/"],
      "keywords": ["cross-component", "post y video", "flujo completo", "integración"],
      "component_jira": null,
      "validated": true
    }
  }
}
```

> **Campo `validated`:** `true` = session revisada manualmente y confiable para el pipeline. `false` (o ausente) = session auto-generada pendiente de validación → dry_run only.

**Ubicación:** `.claude/pipelines/test-engine/references/test-map.json`

### 6.2 Estrategia de matching del Test Discoverer

```
Input: classification.module = "ai-post"
       classification.domain  = "post"
       component_jira         = "AI"
       summary keywords       = ["nota", "IA", "prompt"]

Paso 1: Lookup por component_jira en component-to-module.json
        → "AI" → "ai-post"  [PRECEDENCIA MÁXIMA]
        → confidence = "high"

Paso 2: Si no hay match por component → exact module match en test-map.json
        → Hit en "ai-post"
        → confidence = "high"

Paso 3: Si no hay exact match → fuzzy match por keywords
        → Buscar módulos donde keywords ∩ summary_keywords ≥ 2
        → Si score ≥ 2: confidence = "medium"
        → Si score = 1: confidence = "low" → NO ejecutar → escalar

Paso 4: Verificar que los paths existen en disco
        → sessions/post/NewAIPost.test.ts ✔

Paso 5: Verificar que el módulo tiene validated = true en test-map.json
        → Si validated = false → dry_run only

Paso 6: Si no hay match con confidence ≥ "medium" → sessions_found = false
        → Orchestrator invoca test-generator
```

**Regla de desempate:** Si keyword intersection matchea múltiples módulos con el mismo score, el desempate es el módulo cuyo `component_jira` es más específico (menos genérico). Ejemplo: match en `video` y `ai-post` → gana `ai-post` porque AI es más específico que Video.

### 6.3 Mapeo Componente Jira → Módulo interno

```json
{
  "AI":       "ai-post",
  "Post":     "post",
  "Video":    "video",
  "Images":   "images",
  "Auth":     "auth",
  "Editor":   "post",
  "Tags":     null,
  "Planning": null,
  "Admin":    null
}
```

Los módulos con `null` → siempre `sessions_found = false` → test-generator (Fase 5).

**Ubicación:** `.claude/pipelines/ticket-analyst/references/component-to-module.json`

### 6.4 Mantenimiento: sync-test-map.ts

El archivo `test-map.json` es una fuente de verdad manual con riesgo de desactualización. El script `scripts/sync-test-map.ts` mitiga esto:

```bash
# Detectar drift entre sessions/ en disco y test-map.json
./node_modules/.bin/tsx scripts/sync-test-map.ts
```

**Qué hace:**
1. Corre `node node_modules/.bin/jest --listTests` para obtener todos los archivos de test del repo.
2. Compara contra los `paths` registrados en `test-map.json`.
3. Imprime:
   - Tests en `sessions/` que NO están en `test-map.json` (drift detectado → agregar manualmente)
   - Paths en `test-map.json` que NO existen en disco (tests eliminados → limpiar)

**Cuándo correrlo:** Al agregar o eliminar cualquier session. Parte del checklist de Fase 0 y de cada review antes de un release del pipeline.
