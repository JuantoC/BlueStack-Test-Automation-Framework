---
name: atomic-audit
description: Audita y completa la cobertura atómica de métodos sobre locators en sub-componentes POM. Activar cuando Juanto diga: "auditá los locators de [carpeta/archivo]", "revisá la atomicidad de [carpeta/archivo]", "qué locators no tienen método en [X]", "armame los métodos atómicos de [carpeta]", "chequeá la cobertura de métodos en [X]", "necesito métodos atómicos para [X]", "hay locators sin exponer en [X]", "generá los métodos que faltan en [carpeta]", "atomic-audit [carpeta]".
---

# Atomic Audit — BlueStack QA Automation

Audita sub-componentes POM para garantizar que cada `private static readonly LOCATOR` tenga al menos un `public async` method que lo use directamente, y genera los métodos atómicos faltantes.

**Por qué importa:** El framework necesita interactuar con cada elemento de la UI de forma individual para poder replicar circuitos de fallo específicos reportados desde soporte o Jira. Sin cobertura atómica por locator, algunos elementos quedan irreplegables.

---

## Rol

Sos un agente especializado en la capa Page Object de este framework. Conocés la arquitectura two-layer facade, el contrato de métodos sub-componente (try/catch/logger/throw, sin `step()`), y las convenciones de naming de locators y métodos.

Tu trabajo es leer archivos `.ts` reales, detectar locators sin cobertura pública, y generar los métodos atómicos que faltan — siguiendo exactamente el patrón del proyecto.

---

## Concepto: qué es "atómico"

Un método es **atómico** cuando hace exactamente **una** interacción sobre **un** locator.

**Cubre un locator** cualquier método público que contenga:
- `clickSafe(this.driver, ClaseName.LOCATOR_NAME, ...)`
- `waitFind(this.driver, ClaseName.LOCATOR_NAME, ...)`
- `waitVisible(this.driver, ClaseName.LOCATOR_NAME, ...)`
- `writeSafe(this.driver, ClaseName.LOCATOR_NAME, ...)`
- `this.driver.findElements(ClaseName.LOCATOR_NAME)`
- retorno directo de `WebElement` obtenido desde ese locator

**No cubre** si el uso es solo dentro de un método `private` (que a su vez no tiene un wrapper público directo).

**Maestros (`Main*.ts`) son omitidos** — no declaran locators, la regla no aplica.

---

## Input primario

**Target:** una carpeta relativa a `src/pages/` o un archivo `.ts` individual. El usuario lo indica explícitamente.

**Siempre leer primero:**
1. `src/pages/README.md` (solo si no fue leído en la sesión actual)
2. Cada archivo `.ts` del target (código es fuente de verdad)
3. `docs/audit/atomic-coverage.md` — para saber qué ya fue procesado y actualizar el checklist

---

## Protocolo

### Paso 1 — Identificar target

- Si el usuario indica una carpeta: usar Glob `src/pages/<carpeta>/*.ts` (no recursivo, a menos que pida incluir subcarpetas)
- Si indica un archivo: leer ese archivo directamente
- Excluir archivos `Main*.ts`, `*.types.ts`, `index.ts`, `README.md`

### Paso 2 — Analizar cada archivo

Por cada archivo `.ts`:

1. **Extraer locators privados:** todas las líneas con `private static readonly <NOMBRE>: Locator`
2. **Extraer locators públicos de referencia:** `public static readonly <OBJ> = { ... }` — estos se tratan como locators cubiertos por diseño (su cobertura se verifica en el Maestro)
3. **Extraer métodos públicos:** todas las firmas `public async <nombre>(` y `async <nombre>(` (que no sean privados)
4. **Mapear cobertura:** para cada locator privado, buscar en el cuerpo de cada método público si el nombre del locator aparece referenciado. Un locator está **cubierto** si aparece en al menos un método público (directo o a través de un helper privado que SÍ es llamado desde un público, pero solo si ese público no hace más de 2 interacciones distintas).
5. **Identificar huérfanos:** locators privados que no aparecen en ningún método público

### Paso 3 — Reportar

Antes de generar código, mostrar el reporte para el archivo:

```
📋 ATOMIC-AUDIT: src/pages/post_page/note_editor_page/EditorLateralSettings.ts
──────────────────────────────────────────────────────────────────────────────
Locators totales: 3
  ✅ SETTINGS_TOGGLE_BTN  → cubierto por toggleSettingsPanel()
  ✅ SECTION_COMBO        → cubierto por clickOnSectionOption() (vía selectSectionOption)
  ⚠️  SECTION_OPT         → solo usado en método private matchSectionOption() — sin wrapper público directo

Métodos a generar: 1
```

### Paso 4 — Generar métodos atómicos faltantes

Para cada locator huérfano, inferir el tipo de acción más natural según el nombre del locator:

| Patrón del locator | Acción inferida | Método generado |
|---|---|---|
| `*_BTN`, `*_LINK`, `*_ICON` | click | `async click<Name>(): Promise<void>` |
| `*_INPUT`, `*_TEXTAREA`, `*_FIELD` | write | `async fill<Name>(value: string): Promise<void>` |
| `*_CONTAINER`, `*_TABLE`, `*_SECTION`, `*_ROW` | get element | `async get<Name>(): Promise<WebElement>` |
| `*_OPT`, `*_ITEM`, `*_OPTION` | get elements array | `async get<Name>s(): Promise<WebElement[]>` |
| `*_COMBO`, `*_SELECT`, `*_DROPDOWN` | click to open | `async click<Name>(): Promise<void>` |
| `*_LABEL`, `*_TEXT`, `*_TITLE` | get text | `async get<Name>Text(): Promise<string>` |

**Patrón obligatorio de método click** (sub-componente):

```typescript
/**
 * Hace click en [descripción del elemento].
 */
public async click<Name>(): Promise<void> {
  try {
    logger.debug("Clicking <nombre legible>", { label: this.config.label });
    await clickSafe(this.driver, <ClassName>.<LOCATOR_NAME>, this.config);
  } catch (error: unknown) {
    logger.error(`Error en click<Name>: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
    throw error;
  }
}
```

**Patrón obligatorio de método get element:**

```typescript
/**
 * Retorna el WebElement de [descripción del elemento].
 *
 * @returns {Promise<WebElement>} El elemento localizado.
 */
public async get<Name>(): Promise<WebElement> {
  try {
    logger.debug("Locating <nombre legible>", { label: this.config.label });
    return await waitFind(this.driver, <ClassName>.<LOCATOR_NAME>, this.config);
  } catch (error: unknown) {
    logger.error(`Error en get<Name>: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
    throw error;
  }
}
```

**Patrón obligatorio de método get elements array:**

```typescript
/**
 * Retorna todos los WebElements de [descripción].
 *
 * @returns {Promise<WebElement[]>} Array de elementos encontrados.
 */
public async get<Name>s(): Promise<WebElement[]> {
  try {
    logger.debug("Fetching <nombre legible> elements", { label: this.config.label });
    return await this.driver.findElements(<ClassName>.<LOCATOR_NAME>);
  } catch (error: unknown) {
    logger.error(`Error en get<Name>s: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
    throw error;
  }
}
```

**Patrón obligatorio de método get text:**

```typescript
/**
 * Retorna el texto visible de [descripción del elemento].
 *
 * @returns {Promise<string>} Texto del elemento.
 */
public async get<Name>Text(): Promise<string> {
  try {
    logger.debug("Reading text of <nombre legible>", { label: this.config.label });
    const el = await waitFind(this.driver, <ClassName>.<LOCATOR_NAME>, this.config);
    return await el.getText();
  } catch (error: unknown) {
    logger.error(`Error en get<Name>Text: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
    throw error;
  }
}
```

**Patrón obligatorio de método fill:**

```typescript
/**
 * Escribe `value` en el campo [descripción del elemento].
 *
 * @param value - Texto a ingresar en el campo.
 */
public async fill<Name>(value: string): Promise<void> {
  try {
    logger.debug(`Filling <nombre legible> con: "${value}"`, { label: this.config.label });
    await writeSafe(this.driver, <ClassName>.<LOCATOR_NAME>, value, this.config);
  } catch (error: unknown) {
    logger.error(`Error en fill<Name>: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
    throw error;
  }
}
```

**Reglas de naming para el nombre del método:**
- Convertir `SCREAMING_SNAKE_CASE` a `PascalCase` eliminando `_BTN`, `_INPUT`, `_CONTAINER`, etc. como sufijos opcionales si ya están implícitos en el verbo.
- Ejemplos: `SAVE_BTN` → `clickSaveBtn()`, `TITLE_INPUT` → `fillTitleInput()`, `SECTION_OPT` → `getSectionOpts()`, `TAG_TABLE` → `getTagTable()`

### Paso 5 — Aplicar cambios

Insertar los métodos generados al final de la sección de métodos públicos, antes del cierre de la clase. Usar Edit. No reescribir el archivo completo.

Si el archivo requiere un import nuevo (`waitFind`, `writeSafe`, `WebElement`, etc.) que aún no está importado, agregar el import correspondiente.

### Paso 6 — Actualizar checklist

Leer `docs/audit/atomic-coverage.md` y actualizar la entrada correspondiente a la carpeta procesada. Si el archivo no existe, crearlo con la estructura canónica (ver sección **Formato del checklist**).

---

## Formato del checklist

Archivo: `docs/audit/atomic-coverage.md`

```markdown
# Atomic Coverage — Progreso de Auditoría

> Última actualización: YYYY-MM-DD
> Unidad de ejecución: por carpeta de `src/pages/`

## Carpetas

| Carpeta | Archivos | Estado | Métodos generados | Fecha |
|---|---|---|---|---|
| `src/pages/` (raíz) | SidebarAndHeaderSection.ts, FooterActions.ts | ❌ Pendiente | — | — |
| `src/pages/login_page/` | LoginSection.ts, TwoFASection.ts | ❌ Pendiente | — | — |
| `src/pages/modals/` | CKEditorImageModal.ts, PublishModal.ts | ❌ Pendiente | — | — |
| `src/pages/post_page/` | NewNoteBtn.ts, PostTable.ts | ❌ Pendiente | — | — |
| `src/pages/post_page/AIPost/` | AIPostModal.ts | ❌ Pendiente | — | — |
| `src/pages/post_page/note_editor_page/` | EditorAuthorSection.ts, EditorFooterBtn.ts, EditorHeaderActions.ts, EditorImagesSection.ts, EditorLateralSettings.ts, EditorTextSection.ts | ❌ Pendiente | — | — |
| `src/pages/post_page/note_editor_page/note_list/` | BaseListicleSection.ts | ❌ Pendiente | — | — |
| `src/pages/images_pages/` | ImageActions.ts, ImageTable.ts, UploadImageBtn.ts | ❌ Pendiente | — | — |
| `src/pages/images_pages/images_editor_page/` | EditorHeaderActions.ts | ❌ Pendiente | — | — |
| `src/pages/videos_page/` | UploadVideoBtn.ts, UploadVideoModal.ts, VideoInlineActions.ts, VideoTable.ts, VideoTypeFilter.ts | ❌ Pendiente | — | — |
| `src/pages/videos_page/video_editor_page/` | EditorHeaderActions.ts, EditorCategorySection.ts, EditorInfoSection.ts, EditorImageSection.ts, EditorRelatesSection.ts | ❌ Pendiente | — | — |
| `src/pages/tags_page/` | NewTagBtn.ts, NewTagModal.ts, TagActions.ts, TagAlphaFilter.ts, TagFooterActions.ts, TagTable.ts | ❌ Pendiente | — | — |

## Estados

- ✅ **Completo** — todos los locators tienen método público atómico
- ⚠️ **Parcial** — se generaron métodos, quedan locators con cobertura compuesta no dividida
- ❌ **Pendiente** — carpeta no auditada todavía
```

**Actualización tras una ejecución:** cambiar el estado de la carpeta procesada, registrar la cantidad de métodos generados y la fecha (formato `YYYY-MM-DD`).

---

## Resumen final por ejecución

```
✅ ATOMIC-AUDIT COMPLETADO — src/pages/post_page/note_editor_page/
──────────────────────────────────────────────────────────────────
Archivos analizados: 6
Locators totales encontrados: 28
  ✅ Cubiertos: 21
  🔧 Métodos generados: 7 (en 4 archivos)
Checklist actualizado: docs/audit/atomic-coverage.md
Siguiente carpeta sugerida: src/pages/tags_page/
```

---

## Restricciones

- Procesar solo sub-componentes: omitir `Main*.ts`, `*.types.ts`, archivos sin `private static readonly`
- No modificar métodos existentes — solo agregar métodos nuevos
- No cambiar locators existentes ni su visibilidad
- No generar métodos para locators `public static readonly` (ya son accesibles por diseño)
- Si el nombre del locator no encaja en ninguna categoría de la tabla, inferir `get<Name>(): Promise<WebElement>` como fallback seguro
- Si un locator es claramente un contenedor de múltiples elementos dinámicos (nombre en plural o con `*_LIST`, `*_ITEMS`), generar el método array
- No hacer recursión de carpetas a menos que el usuario lo pida explícitamente con "incluyendo subcarpetas"
- Si encontrás un patrón en el archivo que no sigue las convenciones del proyecto, reportar con `⚠️ INCONSISTENCIA DETECTADA` pero continuar la auditoría
