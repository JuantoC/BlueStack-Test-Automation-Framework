# Evolución de la skill `pom-generator` — Briefing para nueva sesión

**Fecha de análisis:** 2026-04-13  
**Objetivo:** Validar, corregir y mejorar la skill `/pom-generator` usando `/skill-creator`.  
**Estado al momento del documento:** análisis completo, ningún archivo modificado todavía.

---

## Instrucción de arranque para la nueva sesión

Invocar la skill-creator con este contexto:

```
/skill-creator validar, mejorar y evolucionar la skill /pom-generator
```

Leer este documento completo antes de ejecutar cualquier acción. Contiene el diagnóstico completo, los cambios exactos a hacer, los test cases de eval, y el protocolo de ejecución.

---

## Archivos involucrados (rutas absolutas)

```
.claude/skills/pom-generator/
  SKILL.md                   ← skill principal (tiene bugs)
  conventions.md             ← referencia de convenciones (en lugar incorrecto + desactualizada)
  examples.md                ← ejemplos de código (desactualizada)
  pom-scanner.py             ← validador Python (útil, nunca referenciado)

src/pages/README.md          ← inconsistencia menor (VideoActions → VideoInlineActions)
src/pages/videos_page/MainVideoPage.ts   ← fuente de verdad actual del Maestro
src/pages/videos_page/VideoInlineActions.ts  ← gold standard post-refactor
src/pages/tags_page/NewTagModal.ts       ← ejemplo de activeToastMonitor en subcomponente
src/pages/tags_page/TagAlphaFilter.ts   ← ejemplo de writeSafe
src/pages/videos_page/VideoTable.ts     ← ejemplo de writeToStandard + retry
```

---

## Diagnóstico completo — 10 gaps detectados

### BUG 1 — Paths rotos en SKILL.md

**Archivo:** `.claude/skills/pom-generator/SKILL.md`, líneas 87–88 y 93–95

**Código actual (Paso 0):**
```markdown
Leer: [ruta-de-esta-skill]/references/conventions.md   ← INPUT SECUNDARIO
...
Leer: [ruta-de-esta-skill]/references/examples.md      ← INPUT TERCIARIO
```

**Problema:** Los archivos `conventions.md` y `examples.md` viven en la **raíz** del skill directory (`.claude/skills/pom-generator/`), **no** en una subcarpeta `references/`. Las bluestack-conventions dicen que deben estar en `references/`, pero nunca se movieron.

**Solución:**
- Crear `.claude/skills/pom-generator/references/` (directorio)
- Mover `conventions.md` → `references/conventions.md`
- Mover `examples.md` → `references/examples.md`
- Los paths en SKILL.md ya son correctos una vez que los archivos se muevan

**Comando:**
```bash
mkdir -p .claude/skills/pom-generator/references
cp .claude/skills/pom-generator/conventions.md .claude/skills/pom-generator/references/conventions.md
cp .claude/skills/pom-generator/examples.md .claude/skills/pom-generator/references/examples.md
rm .claude/skills/pom-generator/conventions.md
rm .claude/skills/pom-generator/examples.md
```

---

### BUG 2 — `examples.md` referencia una clase que ya no existe

**Archivo:** `.claude/skills/pom-generator/examples.md`, línea 34

**Código actual:**
```typescript
import { ActionType, VideoActions } from "./VideoActions.js";
```

**Problema:** `VideoActions.ts` fue renombrado/reemplazado por `VideoInlineActions.ts` durante el refactor reciente (commits `95ca30b`, `1e48d38`, `1b715dd`). El archivo `VideoActions.ts` ya **no existe** en `src/pages/videos_page/`. El código de `examples.md` es incorrecto como gold standard.

**Solución:** Reemplazar la sección 1 de `examples.md` con el contenido real y actual de `MainVideoPage.ts` (ver sección "Contenido actual de archivos clave" más abajo).

---

### BUG 3 — `src/pages/README.md` desactualizado (menor)

**Archivo:** `src/pages/README.md`, línea 68

**Código actual:**
```
├── VideoActions.ts            # ActionType type
```

**Problema:** Debe decir `VideoInlineActions.ts`.

**Solución:** Edición puntual en ese archivo. **Aplicar según DOC-CHANGE-PROTOCOL:** verificar código primero (el código es correcto), el `.md` es el que está desactualizado.

---

### GAP 4 — Wiki-first protocol ausente en Paso 0

**Archivo:** `.claude/skills/pom-generator/SKILL.md`, sección `## Paso 0`

**Problema:** La skill va directo a abrir `.ts` sin pasar por la wiki. El proyecto tiene un wiki-first protocol obligatorio (`CLAUDE.md` + `bluestack-conventions.md`): antes de abrir cualquier `.ts`, leer `wiki/index.md` y navegar a la página relevante.

**Solución:** Agregar un sub-paso `0.0` antes del actual `Paso 0`, con este contenido:

```markdown
## Paso 0 — Cargar contexto del repositorio

### 0.0 — Wiki-first (obligatorio)

Antes de abrir cualquier `.ts`, leer la wiki del proyecto:

1. Leer `wiki/index.md` — entry point de toda la wiki.
2. Navegar a la página relevante según el módulo target:
   - `wiki/pages/<módulo>.md` → firmas de Maestros existentes, métodos públicos
   - `wiki/patterns/conventions.md` → arquitectura y patrones canónicos
3. Solo abrir el `.ts` fuente si la wiki no cubre lo que necesitás.
4. Si hay un gap en la wiki, registrar `[gap] <tema>` en `wiki/log.md` al finalizar.

### 0.1 — Código TypeScript (input primario)
```
[resto del paso 0 actual sin cambios]

---

### GAP 5 — `pom-scanner.py` nunca referenciado

**Archivo:** `.claude/skills/pom-generator/pom-scanner.py` (existe pero no se menciona en SKILL.md)

**Qué hace el script:**
```
python3 pom-scanner.py scan <ruta_src_pages>   → Escanea y muestra estructura POM existente
python3 pom-scanner.py check <archivo.ts>       → Valida convenciones en un archivo generado
python3 pom-scanner.py todos <archivo.ts>       → Lista TODOs pendientes con número de línea
```

El comando `check` valida: imports obligatorios, constructor correcto, JSDoc, try/catch en async, locators UPPER_SNAKE_CASE, extensión `.js`, tipo `unknown` en catch.

**Solución:** En Paso 5 del SKILL.md (Resumen de entrega), agregar una sub-sección de validación:

```markdown
### Validación post-generación (opcional pero recomendado)

Ejecutar el validador incluido en la skill para verificar cada archivo generado:

```bash
python3 [ruta-skill]/pom-scanner.py check src/pages/[módulo]/[archivo].ts
```

Si hay errores, corregirlos antes de entregar. El script también lista TODOs pendientes:

```bash
python3 [ruta-skill]/pom-scanner.py todos src/pages/[módulo]/[archivo].ts
```
```

---

### GAP 6 — Utilities faltantes en `conventions.md` §12

**Archivo:** `.claude/skills/pom-generator/conventions.md`, sección `## 12. Utilidades core/ disponibles`

**Tabla actual** (solo 8 entradas):
```
clickSafe, waitFind, waitEnabled, waitVisible, clearAndType, resolveRetryConfig, logger, getErrorMessage
```

**Utilities usadas en código real pero ausentes:**

| Utility | Ubicación real | Firma | Ejemplo de uso |
|---------|----------------|-------|----------------|
| `hoverOverParentContainer` | `core/helpers/hoverOverParentContainer.js` | `hoverOverParentContainer(driver, element, config)` | `VideoInlineActions.ts:91` |
| `writeToStandard` | `core/helpers/write.js` | `writeToStandard(element: WebElement, text: string, label: string)` | `VideoTable.ts:288`, `NewTagModal.ts:91` |
| `writeSafe` | `core/actions/writeSafe.js` | `writeSafe(driver, locator, text, config)` | `TagAlphaFilter.ts:67` |
| `retry` | `core/wrappers/retry.js` | `retry(fn: () => Promise<T>, config)` | `VideoTable.ts:57` |
| `sleep` | `core/utils/backOff.js` | `sleep(ms: number)` | `VideoTable.ts:194` |

**Cuándo usar cada write utility:**
- `clearAndType(driver, locator, text, config)` — legacy, documentado pero menos usado
- `writeToStandard(element, text, label)` — **preferido** para inputs complejos donde ya tenés el WebElement
- `writeSafe(driver, locator, text, config)` — **preferido** para inputs simples donde pasás el locator directamente

**Agregar al final de la tabla §12:**
```markdown
| `core/helpers/hoverOverParentContainer` | `hoverOverParentContainer(driver, element, config)` | Hover sobre elemento para activar efectos CSS (dropdown reveals, botones ocultos) |
| `core/helpers/write` | `writeToStandard(element, text, label)` | Escribe en un input ya localizado (WebElement). Preferir sobre `clearAndType` en componentes nuevos |
| `core/actions/writeSafe` | `writeSafe(driver, locator, text, config)` | Escribe en un input pasando el locator. Más simple cuando no se necesita el elemento previamente |
| `core/wrappers/retry` | `retry(fn, config)` | Reintenta una función async con backoff. Útil para operaciones con eventual consistency |
| `core/utils/backOff` | `sleep(ms)` | Pausa explícita. Solo usar con comentario que justifique por qué no funciona una espera explícita |
```

---

### GAP 7 — Patrón `global.activeToastMonitor` no documentado

**Usado en:**
- `src/pages/videos_page/VideoTable.ts`, línea 117
- `src/pages/tags_page/NewTagModal.ts`, línea 74

**Código:**
```typescript
await global.activeToastMonitor?.waitForSuccess(this.config.timeoutMs);
```

**Problema:** Las convenciones documentadas muestran `this.banner.checkBanners(false/true)` en Maestros. El código reciente usa `activeToastMonitor` directamente en subcomponentes. No está documentado, lo que lleva al agente a generar el patrón `Banners` incorrecto para código nuevo.

**Agregar en `conventions.md` como nueva sección §15:**

```markdown
## 15. Verificación de resultado con Toast Monitor

Para verificar el resultado de operaciones que generan toast (crear, guardar, eliminar), usar:

```typescript
await global.activeToastMonitor?.waitForSuccess(this.config.timeoutMs);
```

**Cuándo usarlo:**
- En subcomponentes cuyo método completa una acción terminal (ej: `fillAndCreate()`, `changeVideoTitle()`)
- Cuando la operación genera un toast de éxito/error visible al usuario

**Notas:**
- El `?.` es intencional: el monitor puede no estar activo en todos los contextos.
- Reemplaza `Banners.checkBanners()` en componentes post-refactor.
- `Banners.checkBanners()` sigue siendo válido en Maestros legacy y en flujos donde el monitor no aplica.
```

---

### GAP 8 — Separadores de sección no documentados

**Usado en:** `src/pages/videos_page/VideoInlineActions.ts` (extensamente)

**Patrón:**
```typescript
// =========================================================================
//   HOVER DROPDOWN — mecanismo legacy
// =========================================================================
```

y para helpers:
```typescript
// =========================================================================
//   HELPERS PRIVADOS
// =========================================================================
```

**Agregar en `conventions.md` como nueva sección §14:**

```markdown
## 14. Separadores de sección dentro de una clase

Cuando una clase tiene dos o más bloques conceptualmente distintos (ej: dos mecanismos de UI, zona pública vs privada), usar separadores:

```typescript
// =========================================================================
//   NOMBRE DE LA SECCIÓN — descripción corta
// =========================================================================
```

Reglas:
- Solo en clases con 2+ bloques conceptualmente distintos. En clases simples, no usar separadores.
- Aplicar también para separar la zona de `// HELPERS PRIVADOS` o `// MÉTODOS PRIVADOS`.
- El texto del separador debe describir el concepto, no el tipo de código.
```

---

### GAP 9 — `VideoInlineActions.ts` como nuevo gold standard (no está en examples)

El archivo `VideoInlineActions.ts` (post-refactor reciente) es el ejemplo más rico del repositorio:
- Dos mecanismos de UI en una clase (hover dropdown + menú kebab)
- Métodos atómicos (`hoverActionDropdownToggle`, `openActionDropdown`, `clickDropdownAction`)
- Métodos facade (`clickOnAction` = hover + open + click)
- Helpers privados (`findDropdownAction`, `isDropdownOpen`, etc.)
- Separadores de sección
- Dos `ACTION_TYPE_MAP` con tipos derivados (`ActionType`, `InlineActionType`)

**Agregar como Sección 2** en `references/examples.md` (ver contenido completo en "Archivos: contenido actual" más abajo).

---

### GAP 10 — `import type` no documentado

**Usado en:** `src/pages/tags_page/NewTagModal.ts`, línea 8
```typescript
import type { TagData } from "../../interfaces/data.js";
```

**Agregar en `conventions.md` §2 (Imports):**
```markdown
// Para imports que solo se usan como tipo (no en runtime):
import type { TagData } from "../../interfaces/data.js";
```

---

## Archivos: contenido actual (fuentes de verdad)

### `src/pages/videos_page/MainVideoPage.ts` — contenido real actual

Este es el contenido correcto para reemplazar la Sección 1 de `examples.md`:

```typescript
import { resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { WebDriver, WebElement } from "selenium-webdriver";
import { UploadVideoBtn } from "./UploadVideoBtn.js";
import { UploadVideoModal } from "./UploadVideoModal.js";
import { VideoTable } from "./VideoTable.js";
import { attachment, step } from "allure-js-commons";
import logger from "../../core/utils/logger.js";
import { VideoData } from "../../interfaces/data.js";
import { ActionType, VideoInlineActions, InlineActionType } from "./VideoInlineActions.js";
import { VideoTypeFilter, VideoFilterType } from "./VideoTypeFilter.js";
import { FooterActions } from "../FooterActions.js";
import { CKEditorImageModal } from "../modals/CKEditorImageModal.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";

/**
 * Page Object Maestro para la sección de Videos del CMS.
 * Actúa como Orquestador central que coordina las sub-secciones de videos.
 * Es el punto de entrada para cualquier flujo de pruebas que involucre la creación,
 * edición, publicación o interacción con videos en la tabla multimedia.
 *
 * @example
 * const page = new MainVideoPage(driver, { timeoutMs: 10000 });
 * await page.uploadNewVideo(videoData);
 */
export class MainVideoPage {
  private driver: WebDriver;
  private config: RetryOptions;

  private readonly uploadBtn: UploadVideoBtn
  private readonly uploadModal: UploadVideoModal
  public readonly table: VideoTable
  private readonly actions: VideoInlineActions
  private readonly typeFilter: VideoTypeFilter
  private readonly footer: FooterActions
  private readonly image: CKEditorImageModal;

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = resolveRetryConfig(opts, "MainVideoPage")

    this.uploadBtn = new UploadVideoBtn(this.driver, this.config);
    this.uploadModal = new UploadVideoModal(this.driver, this.config);
    this.table = new VideoTable(this.driver, this.config);
    this.actions = new VideoInlineActions(this.driver, this.config);
    this.typeFilter = new VideoTypeFilter(this.driver, this.config);
    this.footer = new FooterActions(this.driver, this.config)
    this.image = new CKEditorImageModal(this.driver, this.config)
  }

  async uploadNewVideo(videoData: VideoData): Promise<any> {
    await step(`Subiendo nuevo video con datos dinámicos`, async (stepContext) => {
      attachment(`${videoData.video_type} Data`, JSON.stringify(videoData, null, 2), "application/json");
      videoData.video_type && stepContext.parameter("Video Type", videoData.video_type)
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);
      try {
        logger.debug(`Abriendo modal de subida para videos: ${videoData.video_type}`, { label: this.config.label })
        await this.uploadBtn.selectVideoType(videoData.video_type)
        logger.info(`Iniciando llenado dinámico de campos presentes en data`, { label: this.config.label });
        await this.uploadModal.fillAll(videoData);
        logger.info(`Llenado finalizado, comenzando subida...`, { label: this.config.label });
        await this.uploadModal.clickOnUploadBtn();
        if (videoData.video_type === 'NATIVO') {
          await this.uploadModal.checkProgressBar()
        }
        await this.table.waitForNewVideoAtIndex0(videoData.title);
        await this.table.skipInlineTitleEdit();
        logger.info(`Subida finalizada`, { label: this.config.label });
      } catch (error: unknown) {
        logger.error(`Fallo en la subida de nuevo video: ${videoData.video_type} ${getErrorMessage(error)}`, {
          label: this.config.label,
          error: getErrorMessage(error)
        });
        throw error;
      }
    });
  }

  async changeVideoTitle(videoContainer: WebElement): Promise<any> {
    await step(`Cambiando título del video`, async () => {
      try {
        logger.debug("Ejecutando el cambio de titulo.", { label: this.config.label })
        await this.table.changeVideoTitle(videoContainer);
        logger.info('Cambio de titulo del video ejecutado correctamente', { label: this.config.label })
      } catch (error: unknown) {
        logger.error(`Error al cambiar el titulo del video: ${getErrorMessage(error)}`, {
          label: this.config.label,
          error: getErrorMessage(error)
        })
        throw error;
      }
    });
  }

  async clickOnActionVideo(videoContainer: WebElement, action: ActionType): Promise<any> {
    await step(`Clickeando en la acción: "${action}" sobre el video`, async (stepContext) => {
      stepContext.parameter("Acción", action);
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);
      try {
        logger.debug(`Ejecutando el click en el boton de ${action}`, { label: this.config.label })
        await this.actions.clickOnAction(videoContainer, action);
        logger.info(`Click en la accion: "${action}" completado.`, { label: this.config.label })
      } catch (error: unknown) {
        logger.error(`Error al clickear la accion: "${action}" en el video: ${getErrorMessage(error)}`, {
          label: this.config.label, action, error: getErrorMessage(error)
        })
        throw error;
      }
    });
  }

  async selectAndPublishFooter(Videos: WebElement[]): Promise<any> {
    await step("Seleccionar y publicar Videos", async (stepContext) => {
      stepContext.parameter("Cantidad", Videos.length.toString());
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);
      try {
        logger.debug('Seleccionando el/los Videos enviados...', { label: this.config.label })
        for (const video of Videos) {
          await this.table.selectVideo(video);
        }
        logger.debug('Video/s seleccionados correctamente, procediendo a su publicacion...', { label: this.config.label })
        await this.footer.clickFooterAction('PUBLISH_ONLY')
        logger.info('Video/s publicados exitosamente', { label: this.config.label })
      } catch (error: unknown) {
        logger.error(`Error al seleccionar y publicar Videos: ${getErrorMessage(error)}`, {
          label: this.config.label, error: getErrorMessage(error)
        });
        throw error;
      }
    });
  }

  async switchVideoTypeTab(type: VideoFilterType): Promise<void> {
    await step(`Cambiando vista a tipo de video: "${type}"`, async (stepContext) => {
      stepContext.parameter("Tipo", type);
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);
      try {
        logger.debug(`Activando pestaña de tipo "${type}"`, { label: this.config.label });
        await this.typeFilter.clickTab(type);
        logger.info(`Vista cambiada a "${type}" correctamente.`, { label: this.config.label });
      } catch (error: unknown) {
        logger.error(`Error al cambiar la pestaña a "${type}": ${getErrorMessage(error)}`, {
          label: this.config.label, error: getErrorMessage(error),
        });
        throw error;
      }
    });
  }

  async clickOnVideoKebabAction(videoContainer: WebElement, action: InlineActionType): Promise<void> {
    await step(`Ejecutando acción kebab: "${action}" sobre el video`, async (stepContext) => {
      stepContext.parameter("Acción", action);
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);
      try {
        logger.debug(`Ejecutando acción kebab: "${action}"`, { label: this.config.label });
        await this.actions.clickOnKebabAction(videoContainer, action);
        logger.info(`Acción kebab "${action}" ejecutada correctamente.`, { label: this.config.label });
      } catch (error: unknown) {
        logger.error(`Error al ejecutar acción kebab "${action}": ${getErrorMessage(error)}`, {
          label: this.config.label, action, error: getErrorMessage(error),
        });
        throw error;
      }
    });
  }

  async getVideoContainers(NumberOfVideos: number): Promise<WebElement[]> {
    return await step(`Obteniendo ${NumberOfVideos} contenedores de video`, async (stepContext) => {
      stepContext.parameter("Cantidad", NumberOfVideos.toString());
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);
      try {
        let videos = []
        for (let i = 0; i < NumberOfVideos; i++) {
          const video = await this.table.getVideoContainerByIndex(i);
          videos.push(video)
        }
        return videos
      } catch (error: unknown) {
        logger.error(`Error al obtener los ultimos ${NumberOfVideos} videos: ${getErrorMessage(error)}`, {
          label: this.config.label, error: getErrorMessage(error)
        });
        throw error;
      }
    });
  }
}
```

### `src/pages/videos_page/VideoInlineActions.ts` — nuevo ejemplo para `examples.md` (Sección 2)

Ver contenido completo en el archivo fuente. Puntos clave a documentar en examples.md:
- Tipos exportados al nivel módulo: `export type ActionType = keyof typeof VideoInlineActions.ACTION_TYPE_MAP`
- Dos `static readonly` maps (`ACTION_TYPE_MAP` y `INLINE_ACTION_TYPE_MAP`) → dos tipos distintos
- Separadores de sección visuales
- Métodos atómicos + métodos facade sobre los atómicos
- Helpers privados con lógica de búsqueda por texto

---

## Plan de ejecución para la nueva sesión

### Paso A — Snapshot del estado actual (antes de cualquier cambio)

```bash
mkdir -p .claude/skills/pom-generator-workspace/skill-snapshot
cp -r .claude/skills/pom-generator/* .claude/skills/pom-generator-workspace/skill-snapshot/
```

### Paso B — Implementar las mejoras (en este orden)

1. Crear `references/` y mover archivos:
```bash
mkdir -p .claude/skills/pom-generator/references
cp .claude/skills/pom-generator/conventions.md .claude/skills/pom-generator/references/conventions.md
cp .claude/skills/pom-generator/examples.md .claude/skills/pom-generator/references/examples.md
rm .claude/skills/pom-generator/conventions.md
rm .claude/skills/pom-generator/examples.md
```

2. Editar `SKILL.md` — cambios puntuales:
   - Agregar paso `0.0 — Wiki-first` antes del actual Paso 0
   - Agregar sub-sección de validación con `pom-scanner.py` en Paso 5

3. Editar `references/conventions.md` — cambios puntuales:
   - Actualizar tabla §12 con las 5 utilities faltantes
   - Agregar §14 (separadores de sección)
   - Agregar §15 (activeToastMonitor)
   - Actualizar §5 (aclarar clearAndType vs writeToStandard vs writeSafe)
   - Agregar `import type` en §2

4. Reescribir `references/examples.md`:
   - Sección 1: reemplazar `MainVideoPage` con el código actual (de este documento)
   - Sección 2 (NUEVA): `VideoInlineActions` — leer el archivo fuente y usarlo
   - Sección 3: mover `PublishModal` (era sección 2)
   - Sección 4: actualizar patrones clave (era sección 3)

5. Editar puntual en `src/pages/README.md` línea 68: `VideoActions.ts` → `VideoInlineActions.ts`

### Paso C — Configurar y ejecutar evals

**Workspace:** `.claude/skills/pom-generator-workspace/`

**Crear evals.json:**
```json
{
  "skill_name": "pom-generator",
  "evals": [
    {
      "id": 1,
      "prompt": "Quiero crear el POM para la sección de 'Comentarios' del CMS. La UI tiene: una tabla con filas que muestran autor, texto del comentario, fecha y estado (pendiente/aprobado/rechazado). En cada fila hay dos botones que aparecen al hacer hover: 'Aprobar' y 'Rechazar'. Al rechazar aparece un modal de confirmación con un textarea para el motivo del rechazo y dos botones: 'Confirmar rechazo' y 'Cancelar'. También hay un filtro por estado en el header de la tabla.",
      "expected_output": "Archivos POM en src/pages/comment_page/: MainCommentsPage.ts + al menos 2 subcomponentes (CommentTable + RejectModal o similar). Maestro con step(). Subcomponentes sin step(). Locators TODO placeholder. JSDoc en todas las clases y métodos públicos.",
      "files": []
    },
    {
      "id": 2,
      "prompt": "Tengo este fragmento de DOM para el header de la página de Comentarios del CMS y quiero el subcomponente POM:\n\n<div class=\"comments-header\" data-testid=\"comments-header\">\n  <h2>Comentarios</h2>\n  <div class=\"filters\">\n    <select data-testid=\"status-filter\" name=\"statusFilter\">\n      <option value=\"\">Todos</option>\n      <option value=\"pending\">Pendientes</option>\n      <option value=\"approved\">Aprobados</option>\n      <option value=\"rejected\">Rechazados</option>\n    </select>\n    <input type=\"text\" data-testid=\"search-input\" placeholder=\"Buscar por autor...\" />\n    <button data-testid=\"apply-filters-btn\">Aplicar filtros</button>\n  </div>\n</div>",
      "expected_output": "Subcomponente POM con locators REALES extraídos del DOM (data-testid, name). No placeholders TODO para elementos con data-testid. Selectores: By.css('[data-testid=\"status-filter\"]'), By.css('[data-testid=\"search-input\"]'), By.css('[data-testid=\"apply-filters-btn\"]'). Métodos para interactuar con cada elemento.",
      "files": []
    },
    {
      "id": 3,
      "prompt": "La página de tags ya existe. Quiero agregar al POM el soporte para desaprobar un tag. Revisá lo que ya existe en tags_page/ y agregá lo que falta. El botón de 'Desaprobar' tiene selector: button[data-testid='btn-disapprove-tag']. Aparece en el dropdown de acciones de cada tag.",
      "expected_output": "Modo Extensión: inventario del módulo existente + gap analysis en tabla + bloques de inserción marcados con // ═══...═══. NO reproducir código existente. NO modificar métodos existentes. Locator real extraído del prompt. Método en TagActions.ts + orquestador en MainTagsPage.ts si aplica.",
      "files": []
    }
  ]
}
```

**Ejecutar:** Dos subagentes en paralelo por cada eval (with_skill + old_skill como baseline):

Para `with_skill`:
```
Execute this task:
- Skill path: .claude/skills/pom-generator/SKILL.md
- Task: [prompt del eval]
- Input files: none
- Save outputs to: .claude/skills/pom-generator-workspace/iteration-1/eval-<ID>/with_skill/outputs/
- Outputs to save: los archivos TypeScript generados (o bloques de inserción en modo extensión)
```

Para `old_skill` (baseline):
```
Execute this task:
- Skill path: .claude/skills/pom-generator-workspace/skill-snapshot/SKILL.md
- Task: [prompt del eval]
- Input files: none
- Save outputs to: .claude/skills/pom-generator-workspace/iteration-1/eval-<ID>/old_skill/outputs/
```

### Paso D — Assertions para grading

**Eval 1 (Creación textual):**
1. `has_main_page`: Output contiene una clase `Main*Page`
2. `main_uses_step`: La clase Main tiene llamadas a `step(`
3. `subcomponents_no_step`: Subcomponentes no contienen `step(`
4. `has_jsdoc`: Todas las clases tienen bloque JSDoc `/** ... */`
5. `uses_js_extension`: Todos los imports internos terminan en `.js`
6. `no_fake_selectors`: Locators sin DOM usan `TODO_` como placeholder
7. `has_error_handling`: Todo método async tiene try/catch con logger.error + throw
8. `wiki_first`: El agente leyó wiki/index.md antes de abrir TypeScript source

**Eval 2 (DOM HTML):**
1. `extracts_real_selectors`: Usa los `data-testid` del DOM en los locators (no TODO para estos)
2. `no_invented_selectors`: No usa selectores que no existan en el DOM dado
3. `has_main_page` (si generó Main) o `is_subcomponent` (si generó solo sub)
4. `uses_js_extension`
5. `has_jsdoc`

**Eval 3 (Extensión):**
1. `shows_inventory`: Output contiene un inventario del módulo existente
2. `shows_gap_analysis`: Output contiene tabla de gap analysis
3. `uses_insertion_blocks`: Usa el formato `// ═══...═══ AGREGAR EN [archivo]`
4. `no_existing_code_reproduced`: No reproduce métodos o locators que ya existen
5. `uses_real_selector`: Usa `button[data-testid='btn-disapprove-tag']` del prompt

### Paso E — Eval viewer (WSL2: modo estático)

```bash
python .claude/skills/skill-creator/eval-viewer/generate_review.py \
  .claude/skills/pom-generator-workspace/iteration-1 \
  --skill-name "pom-generator" \
  --benchmark .claude/skills/pom-generator-workspace/iteration-1/benchmark.json \
  --static /tmp/pom-generator-review.html

explorer.exe /tmp/pom-generator-review.html
```

---

## Qué evaluar cualitativamente (guía para el review)

Al revisar los outputs en el viewer, prestar atención a:

1. **¿El agente leyó la wiki antes de abrir los .ts?** (GAP 4 — criterio clave de la mejora)
2. **¿Los ejemplos de código en la skill mejoran la calidad del output?** (GAP 9 — VideoInlineActions)
3. **¿Usa las utilities correctas?** (`writeToStandard` vs `clearAndType`, `activeToastMonitor`)
4. **¿Los bloques de inserción (Modo Extensión) son realmente no-destructivos?**
5. **¿El plan de generación (Paso 1.4) es legible y accionable?**

---

## Inconsistencia menor a reportar al usuario (no bloquea la skill)

```
⚠️ INCONSISTENCIA DETECTADA
Código dice: el archivo se llama VideoInlineActions.ts
.md dice:    src/pages/README.md línea 68 lista "VideoActions.ts" (nombre viejo)
Acción recomendada: edición puntual en src/pages/README.md
¿Actualizo el .md para reflejar el código?
```

---

## Notas de contexto adicional

- **Entorno:** WSL2 — siempre usar `--static` para el eval viewer, abrir con `explorer.exe`
- **El skill-creator está en:** `.claude/skills/skill-creator/`
- **Wiki del proyecto:** `wiki/index.md` (entry point)
- **bluestack-conventions:** `.claude/skills/skill-creator/references/bluestack-conventions.md`
- **Commits recientes relevantes:** `95ca30b` (refactor atomización POM), `1e48d38` (docs post-refactor), `1b715dd` (cleanup JSDoc VideoInlineActions)
- **La skill pom-generator es consumida conversacionalmente por humano** — clasificación: `.claude/skills/` (no pipeline)
- **No existe un `evals/` directory** en la skill — crearlo desde cero
- **No existe workspace previo** — todo en `iteration-1/`
