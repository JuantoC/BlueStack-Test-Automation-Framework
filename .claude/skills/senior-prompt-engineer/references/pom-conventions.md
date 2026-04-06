# POM Conventions — BlueStack QA Automation

> Extraído de los archivos reales del proyecto. Fuente primaria: código en `src/pages/`.

---

## Estructura de dos capas

```
Maestro (Main<X>Page)
├── instancia sub-componentes en constructor
├── expone métodos de workflow de alto nivel
├── NUNCA tiene locators propios
└── es el único importado por tests

Sub-componente (<UIRegion><Element>.ts)
├── posee una región de UI
├── declara TODOS sus locators como private static readonly
├── NUNCA llama a hermanos ni al Maestro
└── puede exponer métodos públicos atómicos
```

---

## Constructor — Maestro con NoteType

```typescript
export class MainEditorPage {
  private driver: WebDriver;
  private config: RetryOptions;
  public readonly noteType: NoteType;
  // sub-componentes como propiedades públicas o privadas
  public readonly header: EditorHeaderActions;
  private readonly text: EditorTextSection;

  constructor(driver: WebDriver, noteType: NoteType, opts: RetryOptions) {
    this.driver = driver;
    this.config = resolveRetryConfig(opts, "MainEditorPage");
    this.noteType = noteType || 'POST';
    this.header = new EditorHeaderActions(driver, this.config);
    this.text = new EditorTextSection(driver, this.config);
    // ... resto de sub-componentes
  }
}
```

Fuente: `src/pages/post_page/note_editor_page/MainEditorPage.ts`

## Constructor — Maestro sin NoteType

```typescript
export class MainVideoPage {
  private driver: WebDriver;
  private config: RetryOptions;
  // sub-componentes
  public readonly table: VideoTable;
  private readonly uploadBtn: UploadVideoBtn;

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = resolveRetryConfig(opts, "MainVideoPage");
    this.table = new VideoTable(this.driver, this.config);
    this.uploadBtn = new UploadVideoBtn(this.driver, this.config);
  }
}
```

Fuente: `src/pages/videos_page/MainVideoPage.ts`

## Constructor — Sub-componente

```typescript
export class EditorLateralSettings {
  private driver: WebDriver;
  private config: RetryOptions;

  // Locators: private static readonly, SCREAMING_SNAKE_CASE
  private static readonly SETTINGS_TOGGLE_BTN: Locator = By.css("a.btn-toggle button.btn-dropdown");
  private static readonly SECTION_COMBO: Locator = By.css('div#general-card mat-select[data-testid="section-options"]');

  constructor(driver: WebDriver, opts: RetryOptions = {}) {
    this.driver = driver;
    this.config = resolveRetryConfig(opts, "EditorLateralSettings");
  }
}
```

Fuente: `src/pages/post_page/note_editor_page/EditorLateralSettings.ts`

---

## Método Maestro — patrón completo

```typescript
async uploadNewVideo(videoData: VideoData): Promise<void> {
  await step(`Subiendo nuevo video con datos dinámicos`, async (stepContext) => {
    attachment(`${videoData.video_type} Data`, JSON.stringify(videoData, null, 2), "application/json");
    videoData.video_type && stepContext.parameter("Video Type", videoData.video_type);
    stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

    try {
      logger.debug(`Mensaje de debug`, { label: this.config.label });
      await this.subComp.doSomething(videoData);
      logger.info(`Descripción del éxito`, { label: this.config.label });
    } catch (error: unknown) {
      logger.error(`Error en uploadNewVideo: ${getErrorMessage(error)}`, {
        label: this.config.label,
        error: getErrorMessage(error)
      });
      throw error;
    }
  });
}
```

Reglas:
- `step()` obligatorio — import desde `allure-js-commons`
- `stepContext.parameter()` para params relevantes
- `attachment()` cuando hay data estructurada (JSON de input)
- `logger.error` + `throw error` — nunca swallow
- `getErrorMessage(error)` en vez de `error.message` directamente

## Método sub-componente — patrón completo

```typescript
public async selectSectionOption(index: number = 0): Promise<void> {
  await step(`Seleccionando opción de sección en index ${index}`, async () => {
    try {
      await this.clickOnSectionOption();
      const element = await this.matchSectionOption(index);
      await clickSafe(this.driver, element, this.config);
    } catch (error: unknown) {
      logger.error(`Error en selectSectionOption con index ${index}: ${getErrorMessage(error)}`, {
        label: this.config.label,
        error: getErrorMessage(error)
      });
      throw error;
    }
  });
}
```

Nota: los sub-componentes SÍ pueden usar `step()` — ver ejemplo arriba. La diferencia con el Maestro es que no tienen `stepContext.parameter()` obligatorio y no hacen `attachment()`.

---

## Locators — reglas de declaración

```typescript
// CORRECTO: private static readonly + By.* + SCREAMING_SNAKE_CASE
private static readonly SAVE_BTN: Locator = By.css('[data-testid="btn-save-post"] button');
private static readonly TITLE_INPUT: Locator = By.css('input[data-testid="title"]');

// Acceso en métodos: siempre via ClassName.LOCATOR_NAME (nunca this.SAVE_BTN)
await clickSafe(this.driver, EditorHeaderActions.SAVE_BTN, this.config);
```

Preferencia: `By.css` con `data-testid` cuando disponible. `By.id` para IDs únicos. `By.xpath` como último recurso.

---

## Tipos derivados de objetos estáticos

```typescript
// Patrón para tipos de parámetro — evita enums, usa keyof typeof
export type NoteExitAction = keyof typeof EditorHeaderActions.LOCATORS;
export type FooterActionType = keyof typeof FooterActions.FOOTER_ACTIONS;
```

Fuente: `src/pages/post_page/note_editor_page/EditorHeaderActions.ts`

---

## Utilidades compartidas de interacción

```typescript
// Imports correctos (siempre .js)
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { waitFind } from "../../../core/actions/waitFind.js";
import { waitVisible } from "../../../core/actions/waitForVisible.js";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import logger from "../../../core/utils/logger.js";
import { getErrorMessage } from "../../../core/utils/errorUtils.js";
import { RetryOptions, resolveRetryConfig } from "../../../core/config/defaultConfig.js";
```

---

## Naming

| Elemento | Patrón | Ejemplo |
|---|---|---|
| Maestro (archivo + clase) | `Main<PageName>Page` | `MainVideoPage`, `MainEditorPage` |
| Sub-componente | `<UIRegion><Element>` | `EditorHeaderActions`, `UploadVideoModal` |
| Locator | `NOUN_ELEMENT_TYPE` en SCREAMING_SNAKE_CASE | `SAVE_BTN`, `TITLE_INPUT`, `SECTION_COMBO` |
| Método | camelCase, verbo primero | `clickExitAction()`, `selectSectionOption()`, `fillFullNote()` |
| Tipo de acción | `SCREAMING_SNAKE_CASE` como clave | `'SAVE_AND_EXIT'`, `'PUBLISH_ONLY'` |

---

## Imports — posición y formato

En Maestros y sub-componentes: **los imports van AL FINAL del archivo** (convención del proyecto, igual que en sessions).

```typescript
// ...código de la clase...

import { WebDriver } from 'selenium-webdriver';
import { RetryOptions, resolveRetryConfig } from "../../../core/config/defaultConfig.js";
import { step } from "allure-js-commons";
import logger from '../../core/utils/logger.js';
// ...
```

---

## Jerarquía de carpetas

```
src/pages/
├── <page_name>_page/
│   ├── Main<PageName>Page.ts     ← Maestro
│   ├── <SubComponent>.ts         ← Sub-componentes de la página
│   └── <sub_section>_page/       ← Subsección si aplica
│       ├── Main<SubName>Page.ts
│       └── <SubComponent>.ts
├── modals/                        ← Modales compartidos entre páginas
├── FooterActions.ts               ← Sub-componente compartido
└── SidebarAndHeaderSection.ts     ← Sub-componente compartido
```
